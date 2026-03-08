/**
 * Widget Data Manager
 * 
 * Writes data to shared App Group container for iOS widgets to read.
 * This enables the home screen widget to display FocusFlow stats.
 * 
 * App Group: group.com.focusflow.app
 */

import { Platform } from 'react-native';

// Widget data structure
export interface WidgetData {
  currentStreak: number;
  totalFocusMinutes: number;
  level: number;
  gems: number;
  lastUpdated: string;
}

/**
 * Get the widget data from shared storage
 * For now, returns placeholder data since native module needs to be set up
 * The actual implementation requires a native iOS module using App Groups
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }
  
  // TODO: Implement native module for reading widget data
  // For now, we'll write data that can be read when the native module is added
  return null;
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
    // Store in AsyncStorage as backup - native module handles App Group
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('widget_data', JSON.stringify(data));
    
    // TODO: Call native module to write to App Group container
    // NativeMethodChannel.callMethod('writeWidgetData', data);
    
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
