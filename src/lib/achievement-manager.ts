/**
 * Achievement Management System
 * Handles achievement unlocking, queuing, and notifications
 */

import { Achievement } from '@/components/AchievementNotification';

type AchievementListener = (achievement: Achievement) => void;

class AchievementManager {
  private listeners: Set<AchievementListener> = new Set();
  private queue: Achievement[] = [];
  private isDisplaying = false;
  private unlockedAchievements: Set<string> = new Set();

  /**
   * Register a listener for achievement unlocks
   */
  addListener(listener: AchievementListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Check if achievement is already unlocked
   */
  isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  /**
   * Mark achievement as unlocked
   */
  markUnlocked(achievementId: string) {
    this.unlockedAchievements.add(achievementId);
  }

  /**
   * Unlock an achievement
   */
  unlock(achievement: Achievement, force = false) {
    // Prevent duplicate unlocks unless forced
    if (!force && this.isUnlocked(achievement.id)) {
      console.log(`Achievement ${achievement.id} already unlocked`);
      return;
    }

    // Mark as unlocked
    this.markUnlocked(achievement.id);

    // Add to queue
    this.queue.push(achievement);

    // Process queue if not already displaying
    if (!this.isDisplaying) {
      this.processQueue();
    }
  }

  /**
   * Process achievement queue
   */
  private processQueue() {
    if (this.queue.length === 0) {
      this.isDisplaying = false;
      return;
    }

    this.isDisplaying = true;
    const achievement = this.queue.shift()!;

    // Notify all listeners
    this.listeners.forEach(listener => listener(achievement));

    // Wait before processing next (achievement display duration + gap)
    setTimeout(() => {
      this.processQueue();
    }, 4500); // 4s display + 0.5s gap
  }

  /**
   * Clear all unlocked achievements (for testing)
   */
  resetUnlocked() {
    this.unlockedAchievements.clear();
  }

  /**
   * Get all unlocked achievement IDs
   */
  getUnlockedIds(): string[] {
    return Array.from(this.unlockedAchievements);
  }
}

// Singleton instance
export const achievementManager = new AchievementManager();

/**
 * Predefined achievements
 */
export const ACHIEVEMENTS: Record<string, Achievement> = {
  // Streak achievements
  first_session: {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first training session',
    icon: '🎯',
    rarity: 'common',
    xpReward: 50,
  },
  streak_3: {
    id: 'streak_3',
    title: 'Building Momentum',
    description: '3-day training streak',
    icon: '🔥',
    rarity: 'common',
    xpReward: 100,
  },
  streak_7: {
    id: 'streak_7',
    title: 'Week Warrior',
    description: '7-day training streak',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 250,
    gemReward: 5,
  },
  streak_30: {
    id: 'streak_30',
    title: 'Focus Master',
    description: '30-day training streak',
    icon: '👑',
    rarity: 'epic',
    xpReward: 1000,
    gemReward: 25,
  },
  streak_100: {
    id: 'streak_100',
    title: 'Attention Legend',
    description: '100-day training streak',
    icon: '🏆',
    rarity: 'legendary',
    xpReward: 5000,
    gemReward: 100,
  },

  // Level achievements
  level_10: {
    id: 'level_10',
    title: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    rarity: 'common',
    xpReward: 200,
  },
  level_25: {
    id: 'level_25',
    title: 'Skilled Trainer',
    description: 'Reach level 25',
    icon: '🌟',
    rarity: 'rare',
    xpReward: 500,
    gemReward: 10,
  },
  level_50: {
    id: 'level_50',
    title: 'Focus Expert',
    description: 'Reach level 50',
    icon: '💫',
    rarity: 'epic',
    xpReward: 1500,
    gemReward: 30,
  },
  level_100: {
    id: 'level_100',
    title: 'Centurion',
    description: 'Reach level 100',
    icon: '🎖️',
    rarity: 'legendary',
    xpReward: 5000,
    gemReward: 100,
  },

  // Perfect score achievements
  perfect_10: {
    id: 'perfect_10',
    title: 'Perfectionist',
    description: '10 perfect scores',
    icon: '💯',
    rarity: 'rare',
    xpReward: 300,
  },
  perfect_50: {
    id: 'perfect_50',
    title: 'Flawless',
    description: '50 perfect scores',
    icon: '✨',
    rarity: 'epic',
    xpReward: 1000,
    gemReward: 20,
  },

  // Challenge achievements
  complete_all_challenges: {
    id: 'complete_all_challenges',
    title: 'Jack of All Trades',
    description: 'Complete all challenge types',
    icon: '🎨',
    rarity: 'rare',
    xpReward: 500,
    gemReward: 15,
  },
  master_focus: {
    id: 'master_focus',
    title: 'Laser Focus',
    description: 'Master all Focus challenges',
    icon: '🎯',
    rarity: 'epic',
    xpReward: 750,
    gemReward: 20,
  },

  // Speed achievements
  reaction_master: {
    id: 'reaction_master',
    title: 'Lightning Fast',
    description: 'Reaction time under 200ms',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 400,
  },

  // Special achievements
  night_owl: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Train after midnight',
    icon: '🦉',
    rarity: 'common',
    xpReward: 150,
  },
  early_bird: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Train before 6 AM',
    icon: '🌅',
    rarity: 'common',
    xpReward: 150,
  },
  realm_complete: {
    id: 'realm_complete',
    title: 'Realm Conqueror',
    description: 'Complete all challenges in a realm',
    icon: '🗺️',
    rarity: 'epic',
    xpReward: 1000,
    gemReward: 25,
  },
};

/**
 * Check and unlock achievements based on user progress
 */
export function checkAchievements(progress: {
  streak?: number;
  level?: number;
  perfectCount?: number;
  reactionTime?: number;
  challengesCompleted?: string[];
  currentTime?: Date;
}) {
  // Streak achievements
  if (progress.streak === 1) {
    achievementManager.unlock(ACHIEVEMENTS.first_session);
  }
  if (progress.streak === 3) {
    achievementManager.unlock(ACHIEVEMENTS.streak_3);
  }
  if (progress.streak === 7) {
    achievementManager.unlock(ACHIEVEMENTS.streak_7);
  }
  if (progress.streak === 30) {
    achievementManager.unlock(ACHIEVEMENTS.streak_30);
  }
  if (progress.streak === 100) {
    achievementManager.unlock(ACHIEVEMENTS.streak_100);
  }

  // Level achievements
  if (progress.level === 10) {
    achievementManager.unlock(ACHIEVEMENTS.level_10);
  }
  if (progress.level === 25) {
    achievementManager.unlock(ACHIEVEMENTS.level_25);
  }
  if (progress.level === 50) {
    achievementManager.unlock(ACHIEVEMENTS.level_50);
  }
  if (progress.level === 100) {
    achievementManager.unlock(ACHIEVEMENTS.level_100);
  }

  // Perfect score achievements
  if (progress.perfectCount === 10) {
    achievementManager.unlock(ACHIEVEMENTS.perfect_10);
  }
  if (progress.perfectCount === 50) {
    achievementManager.unlock(ACHIEVEMENTS.perfect_50);
  }

  // Reaction time
  if (progress.reactionTime && progress.reactionTime < 200) {
    achievementManager.unlock(ACHIEVEMENTS.reaction_master);
  }

  // Time-based achievements
  if (progress.currentTime) {
    const hour = progress.currentTime.getHours();
    if (hour >= 0 && hour < 6) {
      achievementManager.unlock(ACHIEVEMENTS.night_owl);
    }
    if (hour >= 4 && hour < 6) {
      achievementManager.unlock(ACHIEVEMENTS.early_bird);
    }
  }
}
