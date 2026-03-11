// AsyncStorage utilities for data persistence (React Native)

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: 'focusflow_user',
  GAME_PROGRESS: 'focusflow_game_progress',
  CHALLENGE_RESULTS: 'focusflow_challenge_results',
  DAILY_SESSIONS: 'focusflow_daily_sessions',
  SKILL_TREE: 'focusflow_skill_tree',
  USER_STATS: 'focusflow_user_stats',
  SETTINGS: 'focusflow_settings',
  BASELINE_TEST: 'focusflow_baseline_test',
  NOTIFICATIONS: 'focusflow_notifications',
  PROGRESS_TREE: 'focusflow_progress_tree',
  TRAINING_PLAN: 'focusflow_training_plan',
  DEEP_ANALYTICS: 'focusflow_deep_analytics',
  WIND_DOWN_SESSIONS: 'focusflow_wind_down_sessions',
  WIND_DOWN_SETTINGS: 'focusflow_wind_down_settings',
  USER_THEME: 'focusflow_user_theme',
  HEART_STATE: 'focusflow_heart_state',
  HEART_TRANSACTIONS: 'focusflow_heart_transactions',
  BADGE_PROGRESS: 'focusflow_badge_progress',
  AVATAR_STATE: 'focusflow_avatar_state',
} as const;

export async function saveToStorage<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

export async function loadFromStorage<T>(key: string): Promise<T | null> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return null;
  }
}

export async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
}

export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

export { STORAGE_KEYS };

