/**
 * Daily Challenge Context
 * Manages daily challenge state and completion
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  type DailyChallenge,
  type DailyChallengeProgress,
  getTodaysDailyChallenge,
  initializeDailyChallengeProgress,
  completeDailyChallenge,
  isDailyChallengeCompleted,
} from '@/lib/daily-challenge-manager';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { useGame } from './GameContext';

interface DailyChallengeContextValue {
  dailyChallenge: DailyChallenge;
  progress: DailyChallengeProgress | null;
  isCompleted: boolean;
  completeDailyChallenge: (score: number, duration: number) => Promise<{
    xp: number;
    gems: number;
    hearts: number;
    bonuses: string[];
  } | null>;
  refreshDailyChallenge: () => void;
}

const DailyChallengeContext = createContext<DailyChallengeContextValue | undefined>(undefined);

export function DailyChallengeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { progress: gameProgress } = useGame();
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(getTodaysDailyChallenge());
  const [progress, setProgress] = useState<DailyChallengeProgress | null>(null);

  // Load daily challenge progress
  useEffect(() => {
    async function loadProgress() {
      if (!user) {
        setProgress(null);
        return;
      }

      const savedProgress = await loadFromStorage<DailyChallengeProgress>(
        STORAGE_KEYS.DAILY_CHALLENGE
      );

      if (savedProgress && savedProgress.userId === user.id) {
        setProgress(savedProgress);
      } else {
        // Initialize new progress
        const newProgress = initializeDailyChallengeProgress(user.id);
        setProgress(newProgress);
        await saveToStorage(STORAGE_KEYS.DAILY_CHALLENGE, newProgress);
      }
    }

    loadProgress();
  }, [user]);

  // Check if today's challenge is completed
  const isCompleted =
    progress !== null && isDailyChallengeCompleted(progress, new Date());

  // Refresh daily challenge (check for new day)
  const refreshDailyChallenge = () => {
    const todaysChallenge = getTodaysDailyChallenge();
    setDailyChallenge(todaysChallenge);
  };

  // Complete daily challenge
  const handleCompleteDailyChallenge = async (
    score: number,
    duration: number
  ): Promise<{
    xp: number;
    gems: number;
    hearts: number;
    bonuses: string[];
  } | null> => {
    if (!user || !progress) return null;

    // Complete the challenge and get rewards
    const { updatedProgress, totalRewards } = completeDailyChallenge(
      progress,
      dailyChallenge,
      score,
      duration
    );

    // Save updated progress
    setProgress(updatedProgress);
    await saveToStorage(STORAGE_KEYS.DAILY_CHALLENGE, updatedProgress);

    // Return rewards for the game to apply
    return totalRewards;
  };

  return (
    <DailyChallengeContext.Provider
      value={{
        dailyChallenge,
        progress,
        isCompleted,
        completeDailyChallenge: handleCompleteDailyChallenge,
        refreshDailyChallenge,
      }}
    >
      {children}
    </DailyChallengeContext.Provider>
  );
}

export function useDailyChallenge() {
  const context = useContext(DailyChallengeContext);
  if (!context) {
    throw new Error('useDailyChallenge must be used within DailyChallengeProvider');
  }
  return context;
}
