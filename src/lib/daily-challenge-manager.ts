/**
 * Daily Challenge System
 * Rotates daily challenges with special rewards and bonuses
 */

import type { ChallengeType } from '@/types';

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD format
  challengeType: ChallengeType;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetScore: number; // Minimum score to complete
  rewards: {
    xp: number;
    gems?: number;
    hearts?: number;
  };
  bonusRewards?: {
    perfectBonus?: { xp: number; gems?: number };
    speedBonus?: { xp: number; gems?: number; threshold: number }; // Complete under X seconds
  };
}

export interface DailyChallengeProgress {
  userId: string;
  currentChallenge: DailyChallenge | null;
  completedChallenges: {
    date: string;
    challengeId: string;
    completed: boolean;
    score: number;
    earnedBonuses: string[]; // ['perfect', 'speed']
  }[];
  currentStreak: number; // Days in a row completing daily challenges
  longestStreak: number;
}

/**
 * Challenge pool for daily rotation
 */
const DAILY_CHALLENGE_POOL: Omit<DailyChallenge, 'id' | 'date'>[] = [
  // Easy challenges
  {
    challengeType: 'focus_hold',
    title: 'Steady Focus',
    description: 'Hold your focus without breaking for 30 seconds',
    difficulty: 'easy',
    targetScore: 80,
    rewards: { xp: 50, gems: 2 },
    bonusRewards: {
      perfectBonus: { xp: 25, gems: 1 },
      speedBonus: { xp: 15, threshold: 25 },
    },
  },
  {
    challengeType: 'finger_hold',
    title: 'Finger Discipline',
    description: 'Keep your finger steady without lifting for 45 seconds',
    difficulty: 'easy',
    targetScore: 80,
    rewards: { xp: 50, gems: 2 },
    bonusRewards: {
      perfectBonus: { xp: 25, gems: 1 },
    },
  },
  {
    challengeType: 'tap_only_correct',
    title: 'Precision Tapping',
    description: 'Tap only the correct targets with 85% accuracy',
    difficulty: 'easy',
    targetScore: 85,
    rewards: { xp: 60, gems: 2 },
    bonusRewards: {
      perfectBonus: { xp: 30, gems: 2 },
    },
  },

  // Medium challenges
  {
    challengeType: 'anti_scroll_swipe',
    title: 'Scroll Resistance Master',
    description: 'Resist the urge to scroll - achieve 90% accuracy',
    difficulty: 'medium',
    targetScore: 90,
    rewards: { xp: 80, gems: 4, hearts: 1 },
    bonusRewards: {
      perfectBonus: { xp: 40, gems: 2 },
      speedBonus: { xp: 20, threshold: 50 },
    },
  },
  {
    challengeType: 'look_away',
    title: 'Distraction Champion',
    description: 'Look away on cue with perfect timing',
    difficulty: 'medium',
    targetScore: 85,
    rewards: { xp: 80, gems: 4 },
    bonusRewards: {
      perfectBonus: { xp: 40, gems: 2 },
    },
  },
  {
    challengeType: 'memory_puzzle',
    title: 'Memory Marathon',
    description: 'Remember and recall 8+ patterns correctly',
    difficulty: 'medium',
    targetScore: 85,
    rewards: { xp: 90, gems: 4 },
    bonusRewards: {
      perfectBonus: { xp: 45, gems: 2 },
      speedBonus: { xp: 25, gems: 1, threshold: 40 },
    },
  },
  {
    challengeType: 'pattern_matching',
    title: 'Pattern Pro',
    description: 'Match 10 complex patterns with high accuracy',
    difficulty: 'medium',
    targetScore: 88,
    rewards: { xp: 85, gems: 4 },
    bonusRewards: {
      perfectBonus: { xp: 40, gems: 2 },
    },
  },

  // Hard challenges
  {
    challengeType: 'logic_puzzle',
    title: 'Logic Legend',
    description: 'Solve 5 challenging logic puzzles perfectly',
    difficulty: 'hard',
    targetScore: 95,
    rewards: { xp: 120, gems: 6, hearts: 1 },
    bonusRewards: {
      perfectBonus: { xp: 60, gems: 3 },
      speedBonus: { xp: 40, gems: 2, threshold: 60 },
    },
  },
  {
    challengeType: 'spatial_puzzle',
    title: 'Spatial Savant',
    description: 'Master spatial reasoning with 95%+ accuracy',
    difficulty: 'hard',
    targetScore: 95,
    rewards: { xp: 120, gems: 6, hearts: 1 },
    bonusRewards: {
      perfectBonus: { xp: 60, gems: 3 },
    },
  },
  {
    challengeType: 'multi_object_tracking',
    title: 'Supreme Tracker',
    description: 'Track 4 objects simultaneously with perfect accuracy',
    difficulty: 'hard',
    targetScore: 92,
    rewards: { xp: 110, gems: 5, hearts: 1 },
    bonusRewards: {
      perfectBonus: { xp: 55, gems: 3 },
      speedBonus: { xp: 35, gems: 1, threshold: 45 },
    },
  },
];

/**
 * Get challenge for a specific date (deterministic based on date)
 */
export function getDailyChallengeForDate(date: Date): DailyChallenge {
  const dateString = formatDate(date);

  // Use date as seed for deterministic selection
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % DAILY_CHALLENGE_POOL.length;

  const template = DAILY_CHALLENGE_POOL[index];

  return {
    id: `daily_${dateString}`,
    date: dateString,
    ...template,
  };
}

/**
 * Get today's daily challenge
 */
export function getTodaysDailyChallenge(): DailyChallenge {
  const today = new Date();
  return getDailyChallengeForDate(today);
}

/**
 * Check if daily challenge is completed for a date
 */
export function isDailyChallengeCompleted(
  progress: DailyChallengeProgress,
  date: Date
): boolean {
  const dateString = formatDate(date);
  const completion = progress.completedChallenges.find(c => c.date === dateString);
  return completion?.completed || false;
}

/**
 * Complete daily challenge and calculate rewards
 */
export function completeDailyChallenge(
  progress: DailyChallengeProgress,
  challenge: DailyChallenge,
  score: number,
  duration: number
): {
  updatedProgress: DailyChallengeProgress;
  totalRewards: {
    xp: number;
    gems: number;
    hearts: number;
    bonuses: string[];
  };
} {
  const bonuses: string[] = [];
  let totalXP = challenge.rewards.xp;
  let totalGems = challenge.rewards.gems || 0;
  let totalHearts = challenge.rewards.hearts || 0;

  // Check if target score met
  if (score < challenge.targetScore) {
    // Challenge failed - no rewards
    return {
      updatedProgress: progress,
      totalRewards: { xp: 0, gems: 0, hearts: 0, bonuses: [] },
    };
  }

  // Check for perfect bonus
  if (challenge.bonusRewards?.perfectBonus && score >= 95) {
    totalXP += challenge.bonusRewards.perfectBonus.xp;
    totalGems += challenge.bonusRewards.perfectBonus.gems || 0;
    bonuses.push('perfect');
  }

  // Check for speed bonus
  if (challenge.bonusRewards?.speedBonus && duration <= challenge.bonusRewards.speedBonus.threshold) {
    totalXP += challenge.bonusRewards.speedBonus.xp;
    totalGems += challenge.bonusRewards.speedBonus.gems || 0;
    bonuses.push('speed');
  }

  // Check if this continues the streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayCompleted = isDailyChallengeCompleted(progress, yesterday);

  const today = new Date();
  const todayCompleted = isDailyChallengeCompleted(progress, today);

  let newStreak = progress.currentStreak;
  if (!todayCompleted) {
    // First completion today
    if (yesterdayCompleted || progress.currentStreak === 0) {
      newStreak = progress.currentStreak + 1;
    } else {
      // Streak broken - restart at 1
      newStreak = 1;
    }
  }

  // Streak milestone bonuses
  if (newStreak > 0 && newStreak % 7 === 0) {
    totalXP += 100; // Weekly streak bonus
    totalGems += 5;
    bonuses.push('weekly_streak');
  }

  // Update progress
  const updatedProgress: DailyChallengeProgress = {
    ...progress,
    currentChallenge: challenge,
    completedChallenges: [
      ...progress.completedChallenges.filter(c => c.date !== challenge.date),
      {
        date: challenge.date,
        challengeId: challenge.id,
        completed: true,
        score,
        earnedBonuses: bonuses,
      },
    ],
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, progress.longestStreak),
  };

  return {
    updatedProgress,
    totalRewards: {
      xp: totalXP,
      gems: totalGems,
      hearts: totalHearts,
      bonuses,
    },
  };
}

/**
 * Initialize daily challenge progress for new user
 */
export function initializeDailyChallengeProgress(userId: string): DailyChallengeProgress {
  return {
    userId,
    currentChallenge: getTodaysDailyChallenge(),
    completedChallenges: [],
    currentStreak: 0,
    longestStreak: 0,
  };
}

/**
 * Get upcoming daily challenges (for preview)
 */
export function getUpcomingChallenges(days: number = 7): DailyChallenge[] {
  const challenges: DailyChallenge[] = [];
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    challenges.push(getDailyChallengeForDate(futureDate));
  }

  return challenges;
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get time until next daily challenge (midnight)
 */
export function getTimeUntilNextChallenge(): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}
