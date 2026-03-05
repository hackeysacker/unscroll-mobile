import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { AppSettings } from '@/types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/lib/storage';
import { useAuth } from './AuthContext';
import * as db from '@/lib/database';
import {
  initializeNotifications,
  setupNotificationsFromSettings,
  type NotificationSettings,
} from '@/lib/notification-manager';

interface SettingsContextType {
  settings: AppSettings | null;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage
  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        setSettings(null);
        setIsLoading(false);
        return;
      }

      try {
        // Try to load from Supabase first if authenticated
        if (session) {
          const supabaseSettings = await db.getUserSettings(user.id);
          if (supabaseSettings) {
            const appSettings: AppSettings = {
              userId: user.id,
              vibrationEnabled: supabaseSettings.vibration_enabled,
              soundEnabled: supabaseSettings.sound_enabled,
              darkMode: supabaseSettings.dark_mode,
              notificationsEnabled: supabaseSettings.notifications_enabled,
              autoProgress: true, // Default for existing users
              reducedMotion: false, // Default for existing users
              // Load detailed notification settings
              breakReminders: supabaseSettings.break_reminders ?? true,
              breakIntervalMinutes: supabaseSettings.break_interval_minutes ?? 25,
              dailyCheckIn: supabaseSettings.daily_check_in ?? true,
              dailyCheckInTime: supabaseSettings.daily_check_in_time ?? '09:00',
              focusSessionReminders: supabaseSettings.focus_session_reminders ?? true,
            };
            setSettings(appSettings);
            await saveToStorage(STORAGE_KEYS.SETTINGS, appSettings);
            
            // Initialize notifications with loaded settings
            await initializeNotifications();
            const notificationSettings: NotificationSettings = {
              breakReminders: appSettings.breakReminders ?? true,
              breakIntervalMinutes: appSettings.breakIntervalMinutes ?? 25,
              dailyCheckIn: appSettings.dailyCheckIn ?? true,
              dailyCheckInTime: appSettings.dailyCheckInTime ?? '09:00',
              focusSessionReminders: appSettings.focusSessionReminders ?? true,
            };
            if (appSettings.notificationsEnabled) {
              await setupNotificationsFromSettings(notificationSettings);
            }
            
            setIsLoading(false);
            return;
          }
        }

        // Fall back to local storage
        const savedSettings = await loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS);
        if (savedSettings && savedSettings.userId === user.id) {
          setSettings(savedSettings);
        } else {
          // Initialize default settings with dark mode based on system preference
          const defaultSettings: AppSettings = {
            userId: user.id,
            vibrationEnabled: true,
            soundEnabled: true,
            darkMode: systemColorScheme === 'dark',
            notificationsEnabled: true,
            autoProgress: true,
            reducedMotion: false,
            // Default notification settings
            breakReminders: true,
            breakIntervalMinutes: 25,
            dailyCheckIn: true,
            dailyCheckInTime: '09:00',
            focusSessionReminders: true,
          };
          setSettings(defaultSettings);
          await saveToStorage(STORAGE_KEYS.SETTINGS, defaultSettings);

          // Sync to Supabase
          if (session) {
            db.updateUserSettings(user.id, {
              vibration_enabled: defaultSettings.vibrationEnabled,
              sound_enabled: defaultSettings.soundEnabled,
              dark_mode: defaultSettings.darkMode,
              notifications_enabled: defaultSettings.notificationsEnabled,
              break_reminders: defaultSettings.breakReminders,
              break_interval_minutes: defaultSettings.breakIntervalMinutes,
              daily_check_in: defaultSettings.dailyCheckIn,
              daily_check_in_time: defaultSettings.dailyCheckInTime,
              focus_session_reminders: defaultSettings.focusSessionReminders,
            });
          }
          
          // Initialize and setup notifications
          await initializeNotifications();
          const notificationSettings: NotificationSettings = {
            breakReminders: defaultSettings.breakReminders ?? true,
            breakIntervalMinutes: defaultSettings.breakIntervalMinutes ?? 25,
            dailyCheckIn: defaultSettings.dailyCheckIn ?? true,
            dailyCheckInTime: defaultSettings.dailyCheckInTime ?? '09:00',
            focusSessionReminders: defaultSettings.focusSessionReminders ?? true,
          };
          await setupNotificationsFromSettings(notificationSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user, session, systemColorScheme]);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!settings || !user) return;

    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    await saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);

    // Sync to Supabase
    if (session) {
      const dbUpdates: Record<string, any> = {};
      if (updates.vibrationEnabled !== undefined) dbUpdates.vibration_enabled = updates.vibrationEnabled;
      if (updates.soundEnabled !== undefined) dbUpdates.sound_enabled = updates.soundEnabled;
      if (updates.darkMode !== undefined) dbUpdates.dark_mode = updates.darkMode;
      if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;
      // New notification settings
      if (updates.breakReminders !== undefined) dbUpdates.break_reminders = updates.breakReminders;
      if (updates.breakIntervalMinutes !== undefined) dbUpdates.break_interval_minutes = updates.breakIntervalMinutes;
      if (updates.dailyCheckIn !== undefined) dbUpdates.daily_check_in = updates.dailyCheckIn;
      if (updates.dailyCheckInTime !== undefined) dbUpdates.daily_check_in_time = updates.dailyCheckInTime;
      if (updates.focusSessionReminders !== undefined) dbUpdates.focus_session_reminders = updates.focusSessionReminders;

      if (Object.keys(dbUpdates).length > 0) {
        db.updateUserSettings(user.id, dbUpdates);
      }
    }
    
    // Update notifications if notification settings changed
    if (
      updates.notificationsEnabled !== undefined ||
      updates.breakReminders !== undefined ||
      updates.breakIntervalMinutes !== undefined ||
      updates.dailyCheckIn !== undefined ||
      updates.dailyCheckInTime !== undefined ||
      updates.focusSessionReminders !== undefined
    ) {
      const notificationSettings: NotificationSettings = {
        breakReminders: updatedSettings.breakReminders ?? true,
        breakIntervalMinutes: updatedSettings.breakIntervalMinutes ?? 25,
        dailyCheckIn: updatedSettings.dailyCheckIn ?? true,
        dailyCheckInTime: updatedSettings.dailyCheckInTime ?? '09:00',
        focusSessionReminders: updatedSettings.focusSessionReminders ?? true,
      };
      // Only setup notifications if main notifications are enabled
      if (updatedSettings.notificationsEnabled) {
        await setupNotificationsFromSettings(notificationSettings);
      }
    }
  };

  const toggleDarkMode = async () => {
    if (!settings) return;
    await updateSettings({ darkMode: !settings.darkMode });
  };

  // Show loading state while initializing
  if (isLoading) {
    return null; // Or return a loading component
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
