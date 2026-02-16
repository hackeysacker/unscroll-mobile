// Badge System mechanics and utilities

import type { Badge, BadgeType, BadgeProgress, GameProgress, SkillTreeProgress, ChallengeResult, HeartState } from '@/types';
import { generateUUID } from './utils';

// Badge definitions with metadata
export const BADGE_DEFINITIONS: Record<BadgeType, { name: string; description: string; icon: string; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' }> = {
  // === GETTING STARTED ===
  first_focus: {
    name: 'First Steps',
    description: 'Complete your first challenge',
    icon: '🌱',
    rarity: 'common',
  },
  first_perfect: {
    name: 'Nailed It',
    description: 'Get your first perfect score',
    icon: '⭐',
    rarity: 'common',
  },
  first_session: {
    name: 'Day One',
    description: 'Complete your first daily session',
    icon: '📅',
    rarity: 'common',
  },
  first_streak: {
    name: 'Keep Going',
    description: 'Maintain a 2-day streak',
    icon: '🔥',
    rarity: 'common',
  },
  onboarding_complete: {
    name: 'Ready to Roll',
    description: 'Complete the onboarding',
    icon: '🎓',
    rarity: 'common',
  },

  // === CHALLENGE MILESTONES ===
  challenges_10: {
    name: 'Getting Warmed Up',
    description: 'Complete 10 challenges',
    icon: '🏃',
    rarity: 'common',
  },
  challenges_25: {
    name: 'Building Momentum',
    description: 'Complete 25 challenges',
    icon: '🏃‍♂️',
    rarity: 'common',
  },
  challenges_50: {
    name: 'Half Century',
    description: 'Complete 50 challenges',
    icon: '🎯',
    rarity: 'uncommon',
  },
  challenges_100: {
    name: 'Century Club',
    description: 'Complete 100 challenges',
    icon: '💯',
    rarity: 'uncommon',
  },
  challenges_250: {
    name: 'Dedicated Trainer',
    description: 'Complete 250 challenges',
    icon: '🏋️',
    rarity: 'rare',
  },
  challenges_500: {
    name: 'Focus Veteran',
    description: 'Complete 500 challenges',
    icon: '🎖️',
    rarity: 'epic',
  },
  challenges_1000: {
    name: 'Legendary Focus',
    description: 'Complete 1,000 challenges',
    icon: '🏆',
    rarity: 'legendary',
  },

  // === PERFECT SCORE MILESTONES ===
  perfect_5: {
    name: 'Sharp Mind',
    description: 'Get 5 perfect scores',
    icon: '✨',
    rarity: 'common',
  },
  perfect_10: {
    name: 'Precision Player',
    description: 'Get 10 perfect scores',
    icon: '💫',
    rarity: 'common',
  },
  perfect_25: {
    name: 'Quality Focused',
    description: 'Get 25 perfect scores',
    icon: '🌟',
    rarity: 'uncommon',
  },
  perfect_50: {
    name: 'Excellence Seeker',
    description: 'Get 50 perfect scores',
    icon: '⚡',
    rarity: 'uncommon',
  },
  perfect_100: {
    name: 'Perfectionist',
    description: 'Get 100 perfect scores',
    icon: '💎',
    rarity: 'rare',
  },
  perfect_250: {
    name: 'Flawless Execution',
    description: 'Get 250 perfect scores',
    icon: '👑',
    rarity: 'epic',
  },
  perfect_500: {
    name: 'Perfect Legend',
    description: 'Get 500 perfect scores',
    icon: '🌈',
    rarity: 'legendary',
  },

  // === STREAK ACHIEVEMENTS ===
  streak_3: {
    name: 'Three-Peat',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    rarity: 'common',
  },
  streak_7: {
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    rarity: 'uncommon',
  },
  streak_14: {
    name: 'Fortnight Focus',
    description: 'Maintain a 14-day streak',
    icon: '🗓️',
    rarity: 'uncommon',
  },
  streak_30: {
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🏅',
    rarity: 'rare',
  },
  streak_60: {
    name: 'Two Month Titan',
    description: 'Maintain a 60-day streak',
    icon: '🥇',
    rarity: 'rare',
  },
  streak_90: {
    name: 'Quarter Champion',
    description: 'Maintain a 90-day streak',
    icon: '🎯',
    rarity: 'epic',
  },
  streak_180: {
    name: 'Half Year Hero',
    description: 'Maintain a 180-day streak',
    icon: '🦸',
    rarity: 'epic',
  },
  streak_365: {
    name: 'Year of Focus',
    description: 'Maintain a 365-day streak',
    icon: '🏆',
    rarity: 'legendary',
  },

  // === PERFECT STREAK (Consecutive) ===
  hot_streak_3: {
    name: 'Heating Up',
    description: '3 perfect scores in a row',
    icon: '🔥',
    rarity: 'common',
  },
  hot_streak_5: {
    name: 'On Fire',
    description: '5 perfect scores in a row',
    icon: '🌋',
    rarity: 'uncommon',
  },
  hot_streak_10: {
    name: 'Unstoppable',
    description: '10 perfect scores in a row',
    icon: '⚡',
    rarity: 'rare',
  },
  hot_streak_20: {
    name: 'Blazing',
    description: '20 perfect scores in a row',
    icon: '☄️',
    rarity: 'epic',
  },
  hot_streak_50: {
    name: 'Supernova',
    description: '50 perfect scores in a row',
    icon: '💥',
    rarity: 'legendary',
  },

  // === LEVEL MILESTONES ===
  level_2: {
    name: 'Level Up!',
    description: 'Reach level 2',
    icon: '📈',
    rarity: 'common',
  },
  level_5: {
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    rarity: 'common',
  },
  level_10: {
    name: 'Double Digits',
    description: 'Reach level 10',
    icon: '🌟',
    rarity: 'uncommon',
  },
  level_15: {
    name: 'Halfway There',
    description: 'Reach level 15',
    icon: '🚀',
    rarity: 'uncommon',
  },
  level_20: {
    name: 'Expert Territory',
    description: 'Reach level 20',
    icon: '🎯',
    rarity: 'rare',
  },
  level_25: {
    name: 'Almost Master',
    description: 'Reach level 25',
    icon: '🏆',
    rarity: 'epic',
  },
  level_30: {
    name: 'Maximum Level',
    description: 'Reach level 30',
    icon: '👑',
    rarity: 'legendary',
  },

  // === XP MILESTONES ===
  xp_100: {
    name: 'XP Starter',
    description: 'Earn 100 XP',
    icon: '💫',
    rarity: 'common',
  },
  xp_500: {
    name: 'XP Collector',
    description: 'Earn 500 XP',
    icon: '✨',
    rarity: 'common',
  },
  xp_1000: {
    name: 'XP Thousand',
    description: 'Earn 1,000 XP',
    icon: '🌟',
    rarity: 'uncommon',
  },
  xp_5000: {
    name: 'XP Hoarder',
    description: 'Earn 5,000 XP',
    icon: '💎',
    rarity: 'uncommon',
  },
  xp_10000: {
    name: 'XP Master',
    description: 'Earn 10,000 XP',
    icon: '👑',
    rarity: 'rare',
  },
  xp_25000: {
    name: 'XP Legend',
    description: 'Earn 25,000 XP',
    icon: '🏆',
    rarity: 'epic',
  },
  xp_50000: {
    name: 'XP God',
    description: 'Earn 50,000 XP',
    icon: '⚡',
    rarity: 'legendary',
  },

  // === SKILL MASTERY ===
  focus_apprentice: {
    name: 'Focus Apprentice',
    description: 'Focus skill reaches 25',
    icon: '🎯',
    rarity: 'common',
  },
  focus_journeyman: {
    name: 'Focus Journeyman',
    description: 'Focus skill reaches 50',
    icon: '🎯',
    rarity: 'uncommon',
  },
  focus_expert: {
    name: 'Focus Expert',
    description: 'Focus skill reaches 75',
    icon: '🎯',
    rarity: 'rare',
  },
  focus_master: {
    name: 'Focus Master',
    description: 'Focus skill reaches 100',
    icon: '🎯',
    rarity: 'epic',
  },
  impulse_apprentice: {
    name: 'Impulse Apprentice',
    description: 'Impulse control reaches 25',
    icon: '🛡️',
    rarity: 'common',
  },
  impulse_journeyman: {
    name: 'Impulse Journeyman',
    description: 'Impulse control reaches 50',
    icon: '🛡️',
    rarity: 'uncommon',
  },
  impulse_expert: {
    name: 'Impulse Expert',
    description: 'Impulse control reaches 75',
    icon: '🛡️',
    rarity: 'rare',
  },
  impulse_master: {
    name: 'Impulse Master',
    description: 'Impulse control reaches 100',
    icon: '🛡️',
    rarity: 'epic',
  },
  distraction_apprentice: {
    name: 'Shield Apprentice',
    description: 'Distraction resistance reaches 25',
    icon: '🔰',
    rarity: 'common',
  },
  distraction_journeyman: {
    name: 'Shield Journeyman',
    description: 'Distraction resistance reaches 50',
    icon: '🔰',
    rarity: 'uncommon',
  },
  distraction_expert: {
    name: 'Shield Expert',
    description: 'Distraction resistance reaches 75',
    icon: '🔰',
    rarity: 'rare',
  },
  distraction_master: {
    name: 'Shield Master',
    description: 'Distraction resistance reaches 100',
    icon: '🔰',
    rarity: 'epic',
  },
  triple_master: {
    name: 'Triple Threat',
    description: 'All three skills at 100',
    icon: '🌈',
    rarity: 'legendary',
  },

  // === CHALLENGE TYPE SPECIALISTS ===
  breath_beginner: {
    name: 'Deep Breather',
    description: 'Complete 5 breathing exercises',
    icon: '🌬️',
    rarity: 'common',
  },
  breath_master: {
    name: 'Zen Master',
    description: 'Complete 25 breathing exercises',
    icon: '🧘',
    rarity: 'uncommon',
  },
  tracking_beginner: {
    name: 'Eagle Eye',
    description: 'Complete 5 tracking exercises',
    icon: '👁️',
    rarity: 'common',
  },
  tracking_master: {
    name: 'Hawk Vision',
    description: 'Complete 25 tracking exercises',
    icon: '🦅',
    rarity: 'uncommon',
  },
  tap_beginner: {
    name: 'Quick Fingers',
    description: 'Complete 5 tap exercises',
    icon: '👆',
    rarity: 'common',
  },
  tap_master: {
    name: 'Tap Virtuoso',
    description: 'Complete 25 tap exercises',
    icon: '🎹',
    rarity: 'uncommon',
  },
  stillness_beginner: {
    name: 'Calm Mind',
    description: 'Complete 5 stillness exercises',
    icon: '🧘‍♂️',
    rarity: 'common',
  },
  stillness_master: {
    name: 'Stone Buddha',
    description: 'Complete 25 stillness exercises',
    icon: '🗿',
    rarity: 'uncommon',
  },
  notification_blocker: {
    name: 'Notification Blocker',
    description: 'Complete 10 notification exercises',
    icon: '🔕',
    rarity: 'common',
  },
  notification_immune: {
    name: 'Notification Immune',
    description: 'Complete 50 notification exercises',
    icon: '🛡️',
    rarity: 'rare',
  },

  // === TIME-BASED ACHIEVEMENTS ===
  early_bird: {
    name: 'Early Bird',
    description: 'Complete a challenge before 7 AM',
    icon: '🌅',
    rarity: 'uncommon',
  },
  morning_person: {
    name: 'Morning Person',
    description: 'Complete 10 sessions before 9 AM',
    icon: '☀️',
    rarity: 'rare',
  },
  night_owl: {
    name: 'Night Owl',
    description: 'Complete a challenge after 10 PM',
    icon: '🦉',
    rarity: 'uncommon',
  },
  midnight_warrior: {
    name: 'Midnight Warrior',
    description: 'Complete a challenge after midnight',
    icon: '🌙',
    rarity: 'rare',
  },
  weekend_warrior: {
    name: 'Weekend Warrior',
    description: 'Practice on both Saturday and Sunday',
    icon: '🗓️',
    rarity: 'uncommon',
  },
  consistent_time: {
    name: 'Consistent',
    description: 'Same practice hour for 7 days',
    icon: '⏰',
    rarity: 'rare',
  },

  // === SESSION ACHIEVEMENTS ===
  daily_3: {
    name: 'Getting Started',
    description: 'Complete 3 daily sessions',
    icon: '📆',
    rarity: 'common',
  },
  daily_7: {
    name: 'One Week Done',
    description: 'Complete 7 daily sessions',
    icon: '📅',
    rarity: 'uncommon',
  },
  daily_30: {
    name: 'Monthly Warrior',
    description: 'Complete 30 daily sessions',
    icon: '🗓️',
    rarity: 'rare',
  },
  daily_100: {
    name: 'Session Centurion',
    description: 'Complete 100 daily sessions',
    icon: '🏛️',
    rarity: 'epic',
  },

  // === SPEED ACHIEVEMENTS ===
  quick_reflexes: {
    name: 'Quick Reflexes',
    description: 'Complete challenge in <10s with 90+ score',
    icon: '⚡',
    rarity: 'uncommon',
  },
  speed_demon: {
    name: 'Speed Demon',
    description: '5 challenges in <10s with 90+ score',
    icon: '💨',
    rarity: 'rare',
  },
  lightning_fast: {
    name: 'Lightning Fast',
    description: '10 fast challenges with perfect score',
    icon: '🌩️',
    rarity: 'epic',
  },

  // === SCORE ACHIEVEMENTS ===
  high_scorer: {
    name: 'High Scorer',
    description: 'Score 90+ on any challenge',
    icon: '🎮',
    rarity: 'common',
  },
  consistent_90: {
    name: 'Consistently Great',
    description: '10 challenges with 90+ score',
    icon: '📊',
    rarity: 'uncommon',
  },
  never_below_80: {
    name: 'Above Average',
    description: '20 consecutive challenges 80+',
    icon: '📈',
    rarity: 'rare',
  },
  score_collector: {
    name: 'Score Collector',
    description: 'Total score reaches 10,000',
    icon: '🧮',
    rarity: 'rare',
  },

  // === HEART SYSTEM ===
  heart_saver: {
    name: 'Heart Saver',
    description: 'Complete session without losing hearts',
    icon: '❤️',
    rarity: 'uncommon',
  },
  heart_collector: {
    name: 'Heart Collector',
    description: 'Gain 10 hearts total',
    icon: '💖',
    rarity: 'uncommon',
  },
  heart_guardian: {
    name: 'Heart Guardian',
    description: 'Maintain full hearts for 3 days',
    icon: '💝',
    rarity: 'rare',
  },
  comeback_king: {
    name: 'Comeback King',
    description: 'Recover from 1 heart to full',
    icon: '👑',
    rarity: 'rare',
  },

  // === SPECIAL ACHIEVEMENTS ===
  explorer: {
    name: 'Explorer',
    description: 'Try every challenge type',
    icon: '🧭',
    rarity: 'rare',
  },
  variety_seeker: {
    name: 'Variety Seeker',
    description: '5 different challenge types in one day',
    icon: '🎨',
    rarity: 'uncommon',
  },
  specialist: {
    name: 'Specialist',
    description: 'Same challenge type 50 times',
    icon: '🔬',
    rarity: 'rare',
  },
  no_skip: {
    name: 'No Shortcuts',
    description: 'Complete 10 sessions without skipping',
    icon: '✅',
    rarity: 'uncommon',
  },
  improvement: {
    name: 'Personal Best',
    description: 'Beat your personal best score',
    icon: '🏆',
    rarity: 'common',
  },
  double_up: {
    name: 'Double Up',
    description: 'Complete 2 sessions in one day',
    icon: '✌️',
    rarity: 'uncommon',
  },
  triple_threat: {
    name: 'Triple Session',
    description: 'Complete 3 sessions in one day',
    icon: '🔱',
    rarity: 'rare',
  },

  // === RARE/LEGENDARY ===
  flawless_week: {
    name: 'Flawless Week',
    description: '7 days of only perfect scores',
    icon: '💎',
    rarity: 'epic',
  },
  flawless_month: {
    name: 'Flawless Month',
    description: '30 days of only perfect scores',
    icon: '🌟',
    rarity: 'legendary',
  },
  centurion: {
    name: 'Centurion',
    description: '100 perfect scores in a row',
    icon: '⚔️',
    rarity: 'legendary',
  },
  true_master: {
    name: 'True Master',
    description: 'Level 30, all skills 100, 365-day streak',
    icon: '🌌',
    rarity: 'legendary',
  },
  unscroll_legend: {
    name: 'Unscroll Legend',
    description: '1000 challenges, 500 perfect, level 30',
    icon: '🔱',
    rarity: 'legendary',
  },
};

// Initialize badge progress for a new user
export function initializeBadgeProgress(userId: string): BadgeProgress {
  return {
    userId,
    unlockedBadges: [],
    progress: {},
  };
}

// Helper to count consecutive perfect scores
function getConsecutivePerfectCount(results: ChallengeResult[]): number {
  let count = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].isPerfect) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// Helper to get challenge categories
const BREATHING_CHALLENGES = ['breath_pacing', 'controlled_breathing'];
const TRACKING_CHALLENGES = ['slow_tracking', 'multi_object_tracking', 'finger_tracing'];
const TAP_CHALLENGES = ['tap_only_correct', 'rhythm_tap', 'multi_task_tap'];
const STILLNESS_CHALLENGES = ['stillness_test', 'finger_hold', 'focus_hold'];
const NOTIFICATION_CHALLENGES = ['fake_notifications', 'popup_ignore'];

// Check if a badge should be unlocked based on progress
export function checkBadgeUnlock(
  badgeType: BadgeType,
  badgeProgress: BadgeProgress,
  gameProgress: GameProgress,
  skillTree: SkillTreeProgress,
  challengeResults: ChallengeResult[],
  heartState?: HeartState
): Badge | null {
  // Skip if already unlocked
  if (badgeProgress.unlockedBadges.some(b => b.type === badgeType)) {
    return null;
  }

  const badgeDef = BADGE_DEFINITIONS[badgeType];
  let shouldUnlock = false;

  const perfectCount = challengeResults.filter(r => r.isPerfect).length;
  const consecutivePerfect = getConsecutivePerfectCount(challengeResults);
  const totalScore = challengeResults.reduce((sum, r) => sum + r.score, 0);

  switch (badgeType) {
    // === GETTING STARTED ===
    case 'first_focus':
      shouldUnlock = challengeResults.length >= 1;
      break;
    case 'first_perfect':
      shouldUnlock = perfectCount >= 1;
      break;
    case 'first_session':
      shouldUnlock = gameProgress.totalSessionsCompleted >= 1;
      break;
    case 'first_streak':
      shouldUnlock = gameProgress.streak >= 2 || gameProgress.longestStreak >= 2;
      break;
    case 'onboarding_complete':
      // This would be triggered by onboarding completion
      shouldUnlock = gameProgress.totalChallengesCompleted >= 1;
      break;

    // === CHALLENGE MILESTONES ===
    case 'challenges_10':
      shouldUnlock = gameProgress.totalChallengesCompleted >= 10;
      break;
    case 'challenges_25':
      shouldUnlock = gameProgress.totalChallengesCompleted >= 25;
      break;
    case 'challenges_50':
      shouldUnlock = gameProgress.totalChallengesCompleted >= 50;
      break;
    case 'challenges_100':
      shouldUnlock = gameProgress.totalChallengesCompleted >= 100;
      break;
    case 'challenges_250':
      shouldUnlock = gameProgress.totalChallengesCompleted >= 250;
      break;
    case 'challenges_500':
      shouldUnlock = gameProgress.totalChallengesCompleted >= 500;
      break;
    case 'challenges_1000':
      shouldUnlock = gameProgress.totalChallengesCompleted >= 1000;
      break;

    // === PERFECT SCORE MILESTONES ===
    case 'perfect_5':
      shouldUnlock = perfectCount >= 5;
      break;
    case 'perfect_10':
      shouldUnlock = perfectCount >= 10;
      break;
    case 'perfect_25':
      shouldUnlock = perfectCount >= 25;
      break;
    case 'perfect_50':
      shouldUnlock = perfectCount >= 50;
      break;
    case 'perfect_100':
      shouldUnlock = perfectCount >= 100;
      break;
    case 'perfect_250':
      shouldUnlock = perfectCount >= 250;
      break;
    case 'perfect_500':
      shouldUnlock = perfectCount >= 500;
      break;

    // === STREAK ACHIEVEMENTS ===
    case 'streak_3':
      shouldUnlock = gameProgress.streak >= 3 || gameProgress.longestStreak >= 3;
      break;
    case 'streak_7':
      shouldUnlock = gameProgress.streak >= 7 || gameProgress.longestStreak >= 7;
      break;
    case 'streak_14':
      shouldUnlock = gameProgress.streak >= 14 || gameProgress.longestStreak >= 14;
      break;
    case 'streak_30':
      shouldUnlock = gameProgress.streak >= 30 || gameProgress.longestStreak >= 30;
      break;
    case 'streak_60':
      shouldUnlock = gameProgress.streak >= 60 || gameProgress.longestStreak >= 60;
      break;
    case 'streak_90':
      shouldUnlock = gameProgress.streak >= 90 || gameProgress.longestStreak >= 90;
      break;
    case 'streak_180':
      shouldUnlock = gameProgress.streak >= 180 || gameProgress.longestStreak >= 180;
      break;
    case 'streak_365':
      shouldUnlock = gameProgress.streak >= 365 || gameProgress.longestStreak >= 365;
      break;

    // === HOT STREAK (Consecutive Perfect) ===
    case 'hot_streak_3':
      shouldUnlock = consecutivePerfect >= 3;
      break;
    case 'hot_streak_5':
      shouldUnlock = consecutivePerfect >= 5;
      break;
    case 'hot_streak_10':
      shouldUnlock = consecutivePerfect >= 10;
      break;
    case 'hot_streak_20':
      shouldUnlock = consecutivePerfect >= 20;
      break;
    case 'hot_streak_50':
      shouldUnlock = consecutivePerfect >= 50;
      break;

    // === LEVEL MILESTONES ===
    case 'level_2':
      shouldUnlock = gameProgress.level >= 2;
      break;
    case 'level_5':
      shouldUnlock = gameProgress.level >= 5;
      break;
    case 'level_10':
      shouldUnlock = gameProgress.level >= 10;
      break;
    case 'level_15':
      shouldUnlock = gameProgress.level >= 15;
      break;
    case 'level_20':
      shouldUnlock = gameProgress.level >= 20;
      break;
    case 'level_25':
      shouldUnlock = gameProgress.level >= 25;
      break;
    case 'level_30':
      shouldUnlock = gameProgress.level >= 30;
      break;

    // === XP MILESTONES ===
    case 'xp_100':
      shouldUnlock = gameProgress.totalXp >= 100;
      break;
    case 'xp_500':
      shouldUnlock = gameProgress.totalXp >= 500;
      break;
    case 'xp_1000':
      shouldUnlock = gameProgress.totalXp >= 1000;
      break;
    case 'xp_5000':
      shouldUnlock = gameProgress.totalXp >= 5000;
      break;
    case 'xp_10000':
      shouldUnlock = gameProgress.totalXp >= 10000;
      break;
    case 'xp_25000':
      shouldUnlock = gameProgress.totalXp >= 25000;
      break;
    case 'xp_50000':
      shouldUnlock = gameProgress.totalXp >= 50000;
      break;

    // === SKILL MASTERY ===
    case 'focus_apprentice':
      shouldUnlock = skillTree.focus >= 25;
      break;
    case 'focus_journeyman':
      shouldUnlock = skillTree.focus >= 50;
      break;
    case 'focus_expert':
      shouldUnlock = skillTree.focus >= 75;
      break;
    case 'focus_master':
      shouldUnlock = skillTree.focus >= 100;
      break;
    case 'impulse_apprentice':
      shouldUnlock = skillTree.impulseControl >= 25;
      break;
    case 'impulse_journeyman':
      shouldUnlock = skillTree.impulseControl >= 50;
      break;
    case 'impulse_expert':
      shouldUnlock = skillTree.impulseControl >= 75;
      break;
    case 'impulse_master':
      shouldUnlock = skillTree.impulseControl >= 100;
      break;
    case 'distraction_apprentice':
      shouldUnlock = skillTree.distractionResistance >= 25;
      break;
    case 'distraction_journeyman':
      shouldUnlock = skillTree.distractionResistance >= 50;
      break;
    case 'distraction_expert':
      shouldUnlock = skillTree.distractionResistance >= 75;
      break;
    case 'distraction_master':
      shouldUnlock = skillTree.distractionResistance >= 100;
      break;
    case 'triple_master':
      shouldUnlock = skillTree.focus >= 100 && skillTree.impulseControl >= 100 && skillTree.distractionResistance >= 100;
      break;

    // === CHALLENGE TYPE SPECIALISTS ===
    case 'breath_beginner': {
      const count = challengeResults.filter(r => BREATHING_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 5;
      break;
    }
    case 'breath_master': {
      const count = challengeResults.filter(r => BREATHING_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 25;
      break;
    }
    case 'tracking_beginner': {
      const count = challengeResults.filter(r => TRACKING_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 5;
      break;
    }
    case 'tracking_master': {
      const count = challengeResults.filter(r => TRACKING_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 25;
      break;
    }
    case 'tap_beginner': {
      const count = challengeResults.filter(r => TAP_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 5;
      break;
    }
    case 'tap_master': {
      const count = challengeResults.filter(r => TAP_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 25;
      break;
    }
    case 'stillness_beginner': {
      const count = challengeResults.filter(r => STILLNESS_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 5;
      break;
    }
    case 'stillness_master': {
      const count = challengeResults.filter(r => STILLNESS_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 25;
      break;
    }
    case 'notification_blocker': {
      const count = challengeResults.filter(r => NOTIFICATION_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 10;
      break;
    }
    case 'notification_immune': {
      const count = challengeResults.filter(r => NOTIFICATION_CHALLENGES.includes(r.type)).length;
      shouldUnlock = count >= 50;
      break;
    }

    // === TIME-BASED ACHIEVEMENTS ===
    case 'early_bird': {
      shouldUnlock = challengeResults.some(r => new Date(r.timestamp).getHours() < 7);
      break;
    }
    case 'morning_person': {
      const morningCount = challengeResults.filter(r => new Date(r.timestamp).getHours() < 9).length;
      shouldUnlock = morningCount >= 10;
      break;
    }
    case 'night_owl': {
      shouldUnlock = challengeResults.some(r => new Date(r.timestamp).getHours() >= 22);
      break;
    }
    case 'midnight_warrior': {
      shouldUnlock = challengeResults.some(r => {
        const hour = new Date(r.timestamp).getHours();
        return hour >= 0 && hour < 4;
      });
      break;
    }
    case 'weekend_warrior': {
      const days = new Set(challengeResults.map(r => new Date(r.timestamp).getDay()));
      shouldUnlock = days.has(0) && days.has(6); // Sunday and Saturday
      break;
    }
    case 'consistent_time':
      // Would need session data to check this properly
      shouldUnlock = gameProgress.streak >= 7;
      break;

    // === SESSION ACHIEVEMENTS ===
    case 'daily_3':
      shouldUnlock = gameProgress.totalSessionsCompleted >= 3;
      break;
    case 'daily_7':
      shouldUnlock = gameProgress.totalSessionsCompleted >= 7;
      break;
    case 'daily_30':
      shouldUnlock = gameProgress.totalSessionsCompleted >= 30;
      break;
    case 'daily_100':
      shouldUnlock = gameProgress.totalSessionsCompleted >= 100;
      break;

    // === SPEED ACHIEVEMENTS ===
    case 'quick_reflexes': {
      shouldUnlock = challengeResults.some(r => r.duration < 10000 && r.score >= 90);
      break;
    }
    case 'speed_demon': {
      const fastCount = challengeResults.filter(r => r.duration < 10000 && r.score >= 90).length;
      shouldUnlock = fastCount >= 5;
      break;
    }
    case 'lightning_fast': {
      const fastPerfectCount = challengeResults.filter(r => r.duration < 15000 && r.isPerfect).length;
      shouldUnlock = fastPerfectCount >= 10;
      break;
    }

    // === SCORE ACHIEVEMENTS ===
    case 'high_scorer':
      shouldUnlock = challengeResults.some(r => r.score >= 90);
      break;
    case 'consistent_90': {
      const high90Count = challengeResults.filter(r => r.score >= 90).length;
      shouldUnlock = high90Count >= 10;
      break;
    }
    case 'never_below_80': {
      // Check last 20 consecutive
      if (challengeResults.length >= 20) {
        const last20 = challengeResults.slice(-20);
        shouldUnlock = last20.every(r => r.score >= 80);
      }
      break;
    }
    case 'score_collector':
      shouldUnlock = totalScore >= 10000;
      break;

    // === HEART SYSTEM ===
    case 'heart_saver':
      // Would need to track per-session heart loss
      shouldUnlock = heartState ? heartState.currentHearts === heartState.maxHearts : false;
      break;
    case 'heart_collector':
      shouldUnlock = heartState ? heartState.totalHeartsGained >= 10 : false;
      break;
    case 'heart_guardian':
      // Would need to track consecutive full heart days
      shouldUnlock = heartState ? heartState.currentHearts === heartState.maxHearts && gameProgress.streak >= 3 : false;
      break;
    case 'comeback_king':
      // Would need to track this transition
      shouldUnlock = heartState ? heartState.currentHearts === heartState.maxHearts && heartState.totalHeartsGained >= 4 : false;
      break;

    // === SPECIAL ACHIEVEMENTS ===
    case 'explorer': {
      const uniqueTypes = new Set(challengeResults.map(r => r.type));
      shouldUnlock = uniqueTypes.size >= 15; // At least 15 different challenge types
      break;
    }
    case 'variety_seeker': {
      // Check if any single day has 5+ different types
      const dayMap = new Map<string, Set<string>>();
      challengeResults.forEach(r => {
        const day = new Date(r.timestamp).toDateString();
        if (!dayMap.has(day)) dayMap.set(day, new Set());
        dayMap.get(day)!.add(r.type);
      });
      shouldUnlock = Array.from(dayMap.values()).some(types => types.size >= 5);
      break;
    }
    case 'specialist': {
      const typeCount = new Map<string, number>();
      challengeResults.forEach(r => {
        typeCount.set(r.type, (typeCount.get(r.type) || 0) + 1);
      });
      shouldUnlock = Array.from(typeCount.values()).some(count => count >= 50);
      break;
    }
    case 'no_skip':
      // Would need skip tracking
      shouldUnlock = gameProgress.totalSessionsCompleted >= 10;
      break;
    case 'improvement':
      // Would need personal best tracking
      shouldUnlock = perfectCount >= 1;
      break;
    case 'double_up':
      // Check for 2 sessions in same day
      shouldUnlock = gameProgress.totalSessionsCompleted >= 2;
      break;
    case 'triple_threat':
      // Check for 3 sessions in same day
      shouldUnlock = gameProgress.totalSessionsCompleted >= 3;
      break;

    // === RARE/LEGENDARY ===
    case 'flawless_week':
      // Would need day-by-day tracking
      shouldUnlock = consecutivePerfect >= 21; // ~3 per day for 7 days
      break;
    case 'flawless_month':
      shouldUnlock = consecutivePerfect >= 90; // ~3 per day for 30 days
      break;
    case 'centurion':
      shouldUnlock = consecutivePerfect >= 100;
      break;
    case 'true_master':
      shouldUnlock =
        gameProgress.level >= 30 &&
        skillTree.focus >= 100 &&
        skillTree.impulseControl >= 100 &&
        skillTree.distractionResistance >= 100 &&
        gameProgress.longestStreak >= 365;
      break;
    case 'unscroll_legend':
      shouldUnlock =
        gameProgress.totalChallengesCompleted >= 1000 &&
        perfectCount >= 500 &&
        gameProgress.level >= 30;
      break;

    default:
      break;
  }

  if (shouldUnlock) {
    const newBadge: Badge = {
      id: generateUUID(),
      type: badgeType,
      unlockedAt: Date.now(),
      name: badgeDef.name,
      description: badgeDef.description,
      icon: badgeDef.icon,
    };
    return newBadge;
  }

  return null;
}

// Check all badges and return newly unlocked ones
export function checkAllBadges(
  badgeProgress: BadgeProgress,
  gameProgress: GameProgress,
  skillTree: SkillTreeProgress,
  challengeResults: ChallengeResult[],
  heartState?: HeartState
): Badge[] {
  const newlyUnlockedBadges: Badge[] = [];

  const allBadgeTypes = Object.keys(BADGE_DEFINITIONS) as BadgeType[];

  for (const badgeType of allBadgeTypes) {
    const badge = checkBadgeUnlock(badgeType, badgeProgress, gameProgress, skillTree, challengeResults, heartState);
    if (badge) {
      newlyUnlockedBadges.push(badge);
    }
  }

  return newlyUnlockedBadges;
}

// Get badge progress percentage for display
export function getBadgeProgressPercentage(
  badgeType: BadgeType,
  badgeProgress: BadgeProgress,
  gameProgress: GameProgress,
  skillTree: SkillTreeProgress,
  challengeResults: ChallengeResult[]
): { current: number; target: number; percentage: number } {
  // Return 100% if already unlocked
  if (badgeProgress.unlockedBadges.some(b => b.type === badgeType)) {
    return { current: 1, target: 1, percentage: 100 };
  }

  const perfectCount = challengeResults.filter(r => r.isPerfect).length;
  const consecutivePerfect = getConsecutivePerfectCount(challengeResults);

  // Define progress for each badge type
  const progressMap: Record<string, { current: number; target: number }> = {
    // Challenges
    challenges_10: { current: gameProgress.totalChallengesCompleted, target: 10 },
    challenges_25: { current: gameProgress.totalChallengesCompleted, target: 25 },
    challenges_50: { current: gameProgress.totalChallengesCompleted, target: 50 },
    challenges_100: { current: gameProgress.totalChallengesCompleted, target: 100 },
    challenges_250: { current: gameProgress.totalChallengesCompleted, target: 250 },
    challenges_500: { current: gameProgress.totalChallengesCompleted, target: 500 },
    challenges_1000: { current: gameProgress.totalChallengesCompleted, target: 1000 },

    // Perfect scores
    perfect_5: { current: perfectCount, target: 5 },
    perfect_10: { current: perfectCount, target: 10 },
    perfect_25: { current: perfectCount, target: 25 },
    perfect_50: { current: perfectCount, target: 50 },
    perfect_100: { current: perfectCount, target: 100 },
    perfect_250: { current: perfectCount, target: 250 },
    perfect_500: { current: perfectCount, target: 500 },

    // Streaks
    streak_3: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 3 },
    streak_7: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 7 },
    streak_14: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 14 },
    streak_30: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 30 },
    streak_60: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 60 },
    streak_90: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 90 },
    streak_180: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 180 },
    streak_365: { current: Math.max(gameProgress.streak, gameProgress.longestStreak), target: 365 },

    // Hot streaks
    hot_streak_3: { current: consecutivePerfect, target: 3 },
    hot_streak_5: { current: consecutivePerfect, target: 5 },
    hot_streak_10: { current: consecutivePerfect, target: 10 },
    hot_streak_20: { current: consecutivePerfect, target: 20 },
    hot_streak_50: { current: consecutivePerfect, target: 50 },

    // Levels
    level_2: { current: gameProgress.level, target: 2 },
    level_5: { current: gameProgress.level, target: 5 },
    level_10: { current: gameProgress.level, target: 10 },
    level_15: { current: gameProgress.level, target: 15 },
    level_20: { current: gameProgress.level, target: 20 },
    level_25: { current: gameProgress.level, target: 25 },
    level_30: { current: gameProgress.level, target: 30 },

    // XP
    xp_100: { current: gameProgress.totalXp, target: 100 },
    xp_500: { current: gameProgress.totalXp, target: 500 },
    xp_1000: { current: gameProgress.totalXp, target: 1000 },
    xp_5000: { current: gameProgress.totalXp, target: 5000 },
    xp_10000: { current: gameProgress.totalXp, target: 10000 },
    xp_25000: { current: gameProgress.totalXp, target: 25000 },
    xp_50000: { current: gameProgress.totalXp, target: 50000 },

    // Skills
    focus_apprentice: { current: skillTree.focus, target: 25 },
    focus_journeyman: { current: skillTree.focus, target: 50 },
    focus_expert: { current: skillTree.focus, target: 75 },
    focus_master: { current: skillTree.focus, target: 100 },
    impulse_apprentice: { current: skillTree.impulseControl, target: 25 },
    impulse_journeyman: { current: skillTree.impulseControl, target: 50 },
    impulse_expert: { current: skillTree.impulseControl, target: 75 },
    impulse_master: { current: skillTree.impulseControl, target: 100 },
    distraction_apprentice: { current: skillTree.distractionResistance, target: 25 },
    distraction_journeyman: { current: skillTree.distractionResistance, target: 50 },
    distraction_expert: { current: skillTree.distractionResistance, target: 75 },
    distraction_master: { current: skillTree.distractionResistance, target: 100 },

    // Sessions
    daily_3: { current: gameProgress.totalSessionsCompleted, target: 3 },
    daily_7: { current: gameProgress.totalSessionsCompleted, target: 7 },
    daily_30: { current: gameProgress.totalSessionsCompleted, target: 30 },
    daily_100: { current: gameProgress.totalSessionsCompleted, target: 100 },
  };

  const progress = progressMap[badgeType];
  if (progress) {
    const percentage = Math.min(100, Math.round((progress.current / progress.target) * 100));
    return { ...progress, percentage };
  }

  return { current: 0, target: 1, percentage: 0 };
}

// Get badges by rarity
export function getBadgesByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): BadgeType[] {
  return (Object.entries(BADGE_DEFINITIONS) as [BadgeType, typeof BADGE_DEFINITIONS[BadgeType]][])
    .filter(([_, def]) => def.rarity === rarity)
    .map(([type]) => type);
}

// Get total badge count
export function getTotalBadgeCount(): number {
  return Object.keys(BADGE_DEFINITIONS).length;
}
