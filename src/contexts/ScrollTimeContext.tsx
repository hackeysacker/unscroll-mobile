/**
 * Scroll Time Context
 *
 * Manages earned scroll time from completing challenges.
 * Structured to easily integrate with Screen Time API later.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScrollTimeState {
  earnedMinutes: number; // Total minutes earned from challenges
  usedMinutes: number; // Minutes already used
  remainingMinutes: number; // Minutes left to use
  lastUpdated: string; // ISO timestamp
  dailyLimit: number; // Max scroll time per day (for future Screen Time API)
}

interface ScrollTimeContextType {
  scrollTime: ScrollTimeState;
  earnScrollTime: (minutes: number) => Promise<void>;
  useScrollTime: (minutes: number) => Promise<void>;
  resetDaily: () => Promise<void>;

  // Future Screen Time API integration points
  syncWithScreenTime: () => Promise<void>; // Will connect to iOS/Android Screen Time API
  setDailyLimit: (minutes: number) => Promise<void>;
}

const STORAGE_KEY = '@scroll_time_state';
const DEFAULT_DAILY_LIMIT = 180; // 3 hours default

const defaultState: ScrollTimeState = {
  earnedMinutes: 0,
  usedMinutes: 0,
  remainingMinutes: 0,
  lastUpdated: new Date().toISOString(),
  dailyLimit: DEFAULT_DAILY_LIMIT,
};

const ScrollTimeContext = createContext<ScrollTimeContextType | null>(null);

export function ScrollTimeProvider({ children }: { children: React.ReactNode }) {
  const [scrollTime, setScrollTime] = useState<ScrollTimeState>(defaultState);

  // Load saved state on mount
  useEffect(() => {
    loadState();
  }, []);

  // Check daily reset whenever scrollTime changes (after load completes)
  useEffect(() => {
    if (scrollTime.lastUpdated === defaultState.lastUpdated) return; // still at default, not loaded
    checkDailyResetInternal(scrollTime.lastUpdated);
  }, [scrollTime.lastUpdated]);

  // Load from AsyncStorage
  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setScrollTime(parsed);
      }
    } catch (error) {
      console.error('Failed to load scroll time state:', error);
    }
  };

  // Save to AsyncStorage
  const saveState = async (newState: ScrollTimeState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setScrollTime(newState);
    } catch (error) {
      console.error('Failed to save scroll time state:', error);
    }
  };

  // Check if we need to reset for new day (uses passed timestamp to avoid stale closure)
  const checkDailyResetInternal = (lastUpdated: string) => {
    const lastDate = new Date(lastUpdated);
    const now = new Date();

    // If it's a new day, reset used minutes
    if (
      lastDate.getDate() !== now.getDate() ||
      lastDate.getMonth() !== now.getMonth() ||
      lastDate.getFullYear() !== now.getFullYear()
    ) {
      resetDaily();
    }
  };

  // Earn scroll time from completing a challenge
  const earnScrollTime = async (minutes: number) => {
    const newState: ScrollTimeState = {
      ...scrollTime,
      earnedMinutes: scrollTime.earnedMinutes + minutes,
      remainingMinutes: scrollTime.remainingMinutes + minutes,
      lastUpdated: new Date().toISOString(),
    };

    await saveState(newState);
  };

  // Use scroll time (deduct from remaining)
  const useScrollTime = async (minutes: number) => {
    const minutesToUse = Math.min(minutes, scrollTime.remainingMinutes);

    const newState: ScrollTimeState = {
      ...scrollTime,
      usedMinutes: scrollTime.usedMinutes + minutesToUse,
      remainingMinutes: scrollTime.remainingMinutes - minutesToUse,
      lastUpdated: new Date().toISOString(),
    };

    await saveState(newState);
  };

  // Reset daily counters (used minutes reset, earned carries over)
  const resetDaily = async () => {
    const newState: ScrollTimeState = {
      ...scrollTime,
      usedMinutes: 0,
      remainingMinutes: scrollTime.earnedMinutes, // Reset remaining to total earned
      lastUpdated: new Date().toISOString(),
    };

    await saveState(newState);
  };

  // Backward-compatible alias (calls internal version without await)
  const checkDailyReset = async () => {
    checkDailyResetInternal(scrollTime.lastUpdated);
  };

  // Set daily limit (for future Screen Time API integration)
  const setDailyLimit = async (minutes: number) => {
    const newState: ScrollTimeState = {
      ...scrollTime,
      dailyLimit: minutes,
      lastUpdated: new Date().toISOString(),
    };

    await saveState(newState);
  };

  // Placeholder for future Screen Time API integration
  const syncWithScreenTime = async () => {
    // TODO: Integrate with iOS Screen Time API
    // - Get actual screen time usage from device
    // - Sync with earned minutes
    // - Set app limits based on remaining time

    console.log('Screen Time API sync placeholder - ready for integration');

    // Example structure for future implementation:
    /*
    if (Platform.OS === 'ios') {
      const ScreenTime = NativeModules.ScreenTime;
      const actualUsage = await ScreenTime.getTodayUsage();
      const allowedTime = scrollTime.remainingMinutes;
      await ScreenTime.setAppLimit(allowedTime);
    }
    */
  };

  return (
    <ScrollTimeContext.Provider
      value={{
        scrollTime,
        earnScrollTime,
        useScrollTime,
        resetDaily,
        syncWithScreenTime,
        setDailyLimit,
      }}
    >
      {children}
    </ScrollTimeContext.Provider>
  );
}

export function useScrollTime() {
  const context = useContext(ScrollTimeContext);
  if (!context) {
    throw new Error('useScrollTime must be used within ScrollTimeProvider');
  }
  return context;
}
