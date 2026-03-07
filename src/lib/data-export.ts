// Data Export Module
// Allows users to export their data as JSON for backup or GDPR compliance

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';

export interface ExportedData {
  exportDate: string;
  appVersion: string;
  data: {
    gameProgress?: any;
    challengeResults?: any;
    dailySessions?: any;
    skillTree?: any;
    userStats?: any;
    settings?: any;
    baselineTest?: any;
    progressTree?: any;
    trainingPlan?: any;
    deepAnalytics?: any;
    windDownSessions?: any;
    windDownSettings?: any;
    heartState?: any;
    heartTransactions?: any;
    gemsState?: any;
    gemTransactions?: any;
    badgeProgress?: any;
    avatarState?: any;
  };
}

/**
 * Export all user data from local storage
 * Returns a JSON string that users can save
 */
export async function exportAllUserData(): Promise<string> {
  const exportedData: ExportedData = {
    exportDate: new Date().toISOString(),
    appVersion: '1.2.0',
    data: {},
  };

  const keysToExport = [
    STORAGE_KEYS.GAME_PROGRESS,
    STORAGE_KEYS.CHALLENGE_RESULTS,
    STORAGE_KEYS.DAILY_SESSIONS,
    STORAGE_KEYS.SKILL_TREE,
    STORAGE_KEYS.USER_STATS,
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.BASELINE_TEST,
    STORAGE_KEYS.PROGRESS_TREE,
    STORAGE_KEYS.TRAINING_PLAN,
    STORAGE_KEYS.DEEP_ANALYTICS,
    STORAGE_KEYS.WIND_DOWN_SESSIONS,
    STORAGE_KEYS.WIND_DOWN_SETTINGS,
    STORAGE_KEYS.HEART_STATE,
    STORAGE_KEYS.HEART_TRANSACTIONS,
    STORAGE_KEYS.GEMS_STATE,
    STORAGE_KEYS.GEM_TRANSACTIONS,
    STORAGE_KEYS.BADGE_PROGRESS,
    STORAGE_KEYS.AVATAR_STATE,
  ];

  for (const key of keysToExport) {
    try {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        // Map storage key to export key
        const exportKey = key.replace('focusflow_', '') as keyof ExportedData['data'];
        exportedData.data[exportKey] = JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error exporting ${key}:`, error);
    }
  }

  return JSON.stringify(exportedData, null, 2);
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{ keys: string[]; totalSize: number }> {
  const allKeys = await AsyncStorage.getAllKeys();
  const focusFlowKeys = allKeys.filter(key => key.startsWith('focusflow_'));
  
  let totalSize = 0;
  for (const key of focusFlowKeys) {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      totalSize += value.length;
    }
  }

  return {
    keys: focusFlowKeys,
    totalSize,
  };
}

/**
 * Clear all user data (for account reset)
 */
export async function clearAllUserData(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const focusFlowKeys = allKeys.filter(key => key.startsWith('focusflow_'));
  await AsyncStorage.multiRemove(focusFlowKeys);
}
