/**
 * Achievement Context
 * Manages achievement notifications and integrates with game progress
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { achievementManager, checkAchievements, type Achievement } from '@/lib/achievement-manager';
import { AchievementNotification } from '@/components/AchievementNotification';
import { useGame } from './GameContext';
import { STORAGE_KEYS, saveToStorage } from '@/lib/storage';

interface AchievementContextValue {
  currentAchievement: Achievement | null;
  unlockAchievement: (achievement: Achievement, force?: boolean) => void;
  checkProgress: () => void;
}

const AchievementContext = createContext<AchievementContextValue | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const { progress } = useGame();

  // Register achievement listener
  useEffect(() => {
    const unsubscribe = achievementManager.addListener((achievement) => {
      setCurrentAchievement(achievement);
    });

    return unsubscribe;
  }, []);

  // Check achievements when progress changes
  useEffect(() => {
    if (!progress) return;

    checkAchievements({
      streak: progress.streak,
      level: progress.level,
      currentTime: new Date(),
    });
  }, [
    progress?.streak,
    progress?.level,
  ]);

  const unlockAchievement = (achievement: Achievement, force = false) => {
    achievementManager.unlock(achievement, force);
    // Track achievement time for avatar effects
    saveToStorage(STORAGE_KEYS.LAST_ACHIEVEMENT_TIME, Date.now());
  };

  const checkProgress = () => {
    if (!progress) return;

    checkAchievements({
      streak: progress.streak,
      level: progress.level,
      currentTime: new Date(),
    });
  };

  return (
    <AchievementContext.Provider
      value={{
        currentAchievement,
        unlockAchievement,
        checkProgress,
      }}
    >
      {children}
      {/* Global achievement notification overlay */}
      {currentAchievement && (
        <View style={styles.notificationContainer} pointerEvents="box-none">
          <AchievementNotification
            achievement={currentAchievement}
            onDismiss={() => setCurrentAchievement(null)}
          />
        </View>
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
  },
});
