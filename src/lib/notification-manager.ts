import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  breakReminders: boolean;
  breakIntervalMinutes: number;
  dailyCheckIn: boolean;
  dailyCheckInTime: string; // "HH:MM" format
  focusSessionReminders: boolean;
}

const SETTINGS_KEY = 'focusflow_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  breakReminders: true,
  breakIntervalMinutes: 25,
  dailyCheckIn: true,
  dailyCheckInTime: '09:00',
  focusSessionReminders: true,
};

// Notification channel ID for Android
const NOTIFICATION_CHANNEL_ID = 'focusflow-reminders';

export async function initializeNotifications(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Focus Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#9d4edd',
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Schedule a break reminder
export async function scheduleBreakReminder(minutes: number = 25): Promise<string | null> {
  try {
    const [hours, mins] = new Date().toTimeString().split(':').map(Number);
    const triggerTime = new Date();
    triggerTime.setHours(hours, mins + minutes, 0, 0);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧠 Time for a Break!',
        body: 'Your brain deserves a rest. Step away from the screen for a moment.',
        data: { type: 'break_reminder' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerTime,
      },
    });
    return id;
  } catch (error) {
    console.error('Error scheduling break reminder:', error);
    return null;
  }
}

// Schedule daily check-in reminder
export async function scheduleDailyCheckIn(time: string = '09:00'): Promise<string | null> {
  try {
    const [hours, minutes] = time.split(':').map(Number);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Daily Focus Check-In',
        body: "Ready to train your focus today? Let's check in!",
        data: { type: 'daily_checkin' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
    return id;
  } catch (error) {
    console.error('Error scheduling daily check-in:', error);
    return null;
  }
}

// Schedule focus session reminder
export async function scheduleFocusSessionReminder(): Promise<string | null> {
  try {
    // Default to 8 AM next day
    const now = new Date();
    const triggerDate = new Date(now);
    triggerDate.setDate(triggerDate.getDate() + 1);
    triggerDate.setHours(8, 0, 0, 0);

    const id = await Notifications.scheduleNotificationAsync({
      title: '🎯 Ready to Focus?',
      body: 'Start a focus session and level up your attention!',
      data: { type: 'focus_session' },
      sound: 'default',
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
    return id;
  } catch (error) {
    console.error('Error scheduling focus session reminder:', error);
    return null;
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

// Cancel specific notification by ID
export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Send immediate notification (for testing)
export async function sendTestNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 FocusFlow Test',
        body: 'Notifications are working correctly!',
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

// Setup all notifications based on settings
export async function setupNotificationsFromSettings(settings: NotificationSettings): Promise<void> {
  // Cancel existing first
  await cancelAllNotifications();

  if (settings.dailyCheckIn) {
    await scheduleDailyCheckIn(settings.dailyCheckInTime);
  }

  if (settings.focusSessionReminders) {
    await scheduleFocusSessionReminder();
  }

  // Break reminders are scheduled dynamically when focus session starts
  // Not pre-scheduled as they're session-specific
}

// Schedule break reminder for active focus session
export async function startFocusSessionWithReminders(intervalMinutes: number = 25): Promise<string | null> {
  return scheduleBreakReminder(intervalMinutes);
}

// Cancel break reminders when session ends
export async function endFocusSession(): Promise<void> {
  try {
    const scheduled = await getScheduledNotifications();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'break_reminder') {
        await cancelNotification(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error ending focus session:', error);
  }
}

// Listen for notification responses
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// Listen for incoming notifications
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}
