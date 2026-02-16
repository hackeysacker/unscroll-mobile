import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { AppSettings } from '@/types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/lib/storage';
import { useAuth } from './AuthContext';
import * as db from '@/lib/database';

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
            };
            setSettings(appSettings);
            await saveToStorage(STORAGE_KEYS.SETTINGS, appSettings);
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
            });
          }
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

      if (Object.keys(dbUpdates).length > 0) {
        db.updateUserSettings(user.id, dbUpdates);
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
