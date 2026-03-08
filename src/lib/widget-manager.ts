/**
 * Widget Data Manager
 * 
 * Writes data to shared App Group container for iOS widgets to read.
 * This enables the home screen widget to display FocusFlow stats.
 * 
 * App Group: group.com.focusflow.app
 */

import { NativeModules, Platform } from 'react-native';

// Widget data structure
export interface WidgetData {
  currentStreak: number;
  totalFocusMinutes: number;
  level: number;
  gems: number;
  lastUpdated: string;
}

// Native module for widget data bridge
const { FocusFlowWidgetsBridge } = NativeModules;

/**
 * Get the widget data from shared storage
 * Reads from App Group container via native module
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }
  
  try {
    if (FocusFlowWidgetsBridge) {
      const data = await FocusFlowWidgetsBridge.readWidgetData();
      if (data) {
        return {
          currentStreak: data.currentStreak || 0,
          totalFocusMinutes: data.totalFocusMinutes || 0,
          level: data.level || 1,
          gems: data.gems || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to read widget data:', error);
    return null;
  }
}

/**
 * Save widget data to shared storage
 * This should be called whenever game state changes (streak, level, gems, etc.)
 * 
 * The data is written in a format that iOS widgets can read via App Groups
 */
export async function saveWidgetData(data: WidgetData): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  
  try {
    // Write to App Group via native module
    if (FocusFlowWidgetsBridge) {
      await FocusFlowWidgetsBridge.writeWidgetData({
        currentStreak: data.currentStreak,
        totalFocusMinutes: data.totalFocusMinutes,
        level: data.level,
        gems: data.gems,
        lastUpdated: data.lastUpdated,
      });
    }
    
    // Also store in AsyncStorage as backup
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('widget_data', JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.error('Failed to save widget data:', error);
    return false;
  }
}

/**
 * Update widget with current game state
 * Call this from GameContext when state changes
 */
export async function updateWidgetFromGameState(gameState: {
  streak: number;
  totalFocusMinutes: number;
  level: number;
  gems: number;
}): Promise<boolean> {
  const widgetData: WidgetData = {
    currentStreak: gameState.streak,
    totalFocusMinutes: gameState.totalFocusMinutes,
    level: gameState.level,
    gems: gameState.gems,
    lastUpdated: new Date().toISOString(),
  };
  
  return saveWidgetData(widgetData);
}
