/**
 * Achievement Hook - Singular alias for useAchievements
 *
 * Usage:
 *   const { isUnlocked, getUnlocked } = useAchievement();
 *
 *   if (isUnlocked('first_challenge')) { ... }
 *   const allIds = getUnlocked();
 */

import { useAchievements } from '@/contexts/AchievementContext';
import { achievementManager } from '@/lib/achievement-manager';

/**
 * Singular achievement hook - wraps useAchievements and adds ID-level helpers
 */
export function useAchievement() {
  // Use the existing plural hook
  const achievementsContext = useAchievements();

  /**
   * Check if a specific achievement is unlocked by ID
   */
  const isUnlocked = (achievementId: string): boolean => {
    return achievementManager.isUnlocked(achievementId);
  };

  /**
   * Get all currently unlocked achievement IDs
   */
  const getUnlocked = (): string[] => {
    return achievementManager.getUnlockedIds();
  };

  return {
    // Forward all methods from useAchievements
    currentAchievement: achievementsContext.currentAchievement,
    checkProgress: achievementsContext.checkProgress,
    unlockAchievement: achievementsContext.unlockAchievement,
    // Add singular helpers
    isUnlocked,
    getUnlocked,
  };
}

// Re-export types and manager for consumers
export type { Achievement } from '@/components/AchievementNotification';
export { achievementManager } from '@/lib/achievement-manager';