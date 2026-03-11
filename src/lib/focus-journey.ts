/**
 * Focus Journey System
 *
 * Integrates all 19 challenges and 25 exercises into the 250-level progress path
 * with proper difficulty scaling and themed progression
 */

import type { ChallengeType } from '@/types';
import type { ExerciseType } from './exercise-types';

export type ActivityType = ChallengeType | ExerciseType;

export interface JourneyLevel {
  level: number;
  realmId: number;
  realmName: string;

  // Activities for this level
  activities: JourneyActivity[];

  // XP requirements
  xpRequired: number;
  totalXpToReach: number;

  // Unlock status
  isUnlocked: boolean;
}

export interface JourneyActivity {
  type: ActivityType;
  category: 'challenge' | 'exercise';
  name: string;
  description: string;
  icon: string;

  // Difficulty scaling
  baseDuration: number; // Base duration in seconds
  scaledDuration: number; // Actual duration for this level
  difficultyLevel: number; // 1-10 scale

  // XP rewards
  baseXP: number;
  scaledXP: number;

  // Requirements
  requiredForProgression: boolean;
  isBonus?: boolean;
}

export interface JourneyTest {
  level: number;
  name: string;
  description: string;
  activities: ActivityType[];
  passingScore: number; // Minimum average score to pass
  xpReward: number;
  isComplete: boolean;
}

/**
 * Challenge & Exercise Pool with Metadata
 */
const ACTIVITY_POOL = {
  // BEGINNER CHALLENGES (Levels 1-50)
  beginner_challenges: [
    { type: 'gaze_hold', name: 'Gaze Hold', icon: '👁️', baseDuration: 20, baseXP: 10, category: 'challenge' as const },
    { type: 'focus_hold', name: 'Focus Hold', icon: '🎯', baseDuration: 20, baseXP: 10, category: 'challenge' as const },
    { type: 'finger_hold', name: 'Finger Hold', icon: '👆', baseDuration: 20, baseXP: 10, category: 'challenge' as const },
    { type: 'slow_tracking', name: 'Slow Tracking', icon: '🐌', baseDuration: 25, baseXP: 12, category: 'challenge' as const },
    { type: 'stillness_test', name: 'Stillness Test', icon: '🗿', baseDuration: 20, baseXP: 15, category: 'challenge' as const },
  ],

  // INTERMEDIATE CHALLENGES (Levels 51-150)
  intermediate_challenges: [
    { type: 'tap_only_correct', name: 'Tap Only Correct', icon: '✅', baseDuration: 30, baseXP: 15, category: 'challenge' as const },
    { type: 'reaction_inhibition', name: 'Reaction Inhibition', icon: '🛑', baseDuration: 30, baseXP: 15, category: 'challenge' as const },
    { type: 'multi_task_tap', name: 'Multi Task Tap', icon: '🔀', baseDuration: 30, baseXP: 20, category: 'challenge' as const },
    { type: 'memory_flash', name: 'Memory Flash', icon: '🧠', baseDuration: 30, baseXP: 18, category: 'challenge' as const },
    { type: 'rhythm_tap', name: 'Rhythm Tap', icon: '🥁', baseDuration: 30, baseXP: 15, category: 'challenge' as const },
    { type: 'finger_tracing', name: 'Finger Tracing', icon: '✍️', baseDuration: 35, baseXP: 18, category: 'challenge' as const },
  ],

  // ADVANCED CHALLENGES (Levels 151-250)
  advanced_challenges: [
    { type: 'impulse_spike_test', name: 'Impulse Spike Test', icon: '⚡', baseDuration: 40, baseXP: 25, category: 'challenge' as const },
    { type: 'delay_unlock', name: 'Delay Unlock', icon: '🔐', baseDuration: 35, baseXP: 22, category: 'challenge' as const },
    { type: 'popup_ignore', name: 'Popup Ignore', icon: '🪟', baseDuration: 40, baseXP: 25, category: 'challenge' as const },
    { type: 'multi_object_tracking', name: 'Multi Object Tracking', icon: '🎱', baseDuration: 40, baseXP: 22, category: 'challenge' as const },
    { type: 'fake_notifications', name: 'Fake Notifications', icon: '🔔', baseDuration: 35, baseXP: 20, category: 'challenge' as const },
    { type: 'look_away', name: 'Look Away', icon: '👀', baseDuration: 30, baseXP: 18, category: 'challenge' as const },
    { type: 'anti_scroll_swipe', name: 'Anti Scroll Swipe', icon: '📜', baseDuration: 40, baseXP: 22, category: 'challenge' as const },
  ],

  // BREATHING EXERCISES (All levels)
  breathing_exercises: [
    { type: 'slow_breathing', name: 'Slow Breathing', icon: '🫁', baseDuration: 120, baseXP: 15, category: 'exercise' as const },
    { type: 'box_breathing', name: 'Box Breathing', icon: '⬜', baseDuration: 180, baseXP: 20, category: 'exercise' as const },
    { type: 'breath_pacing', name: 'Breath Pacing', icon: '🌬️', baseDuration: 150, baseXP: 18, category: 'exercise' as const },
    { type: 'controlled_breathing', name: 'Controlled Breathing', icon: '🧘', baseDuration: 180, baseXP: 20, category: 'exercise' as const },
  ],

  // GROUNDING EXERCISES (Beginner-Intermediate)
  grounding_exercises: [
    { type: 'five_senses', name: 'Five Senses', icon: '👃', baseDuration: 180, baseXP: 18, category: 'exercise' as const },
    { type: 'body_scan', name: 'Body Scan', icon: '🧘‍♂️', baseDuration: 60, baseXP: 12, category: 'exercise' as const },
    { type: 'calm_visual', name: 'Calm Visual', icon: '🌊', baseDuration: 120, baseXP: 15, category: 'exercise' as const },
    { type: 'mental_reset', name: 'Mental Reset', icon: '🔄', baseDuration: 90, baseXP: 12, category: 'exercise' as const },
    { type: 'ten_second_reflection', name: 'Ten Second Reflection', icon: '⏱️', baseDuration: 10, baseXP: 8, category: 'exercise' as const },
  ],

  // COGNITIVE EXERCISES (Intermediate-Advanced)
  cognitive_exercises: [
    { type: 'thought_reframe', name: 'Thought Reframe', icon: '🔄', baseDuration: 240, baseXP: 25, category: 'exercise' as const },
    { type: 'dopamine_pause', name: 'Dopamine Pause', icon: '📵', baseDuration: 300, baseXP: 30, category: 'exercise' as const },
    { type: 'positive_self_talk', name: 'Positive Self Talk', icon: '💬', baseDuration: 180, baseXP: 22, category: 'exercise' as const },
    { type: 'focus_sprint', name: 'Focus Sprint', icon: '⚡', baseDuration: 180, baseXP: 25, category: 'exercise' as const },
    { type: 'value_check', name: 'Value Check', icon: '💎', baseDuration: 240, baseXP: 25, category: 'exercise' as const },
    { type: 'urge_surfing', name: 'Urge Surfing', icon: '🏄', baseDuration: 300, baseXP: 35, category: 'exercise' as const },
    { type: 'positive_action', name: 'Positive Action', icon: '✨', baseDuration: 180, baseXP: 20, category: 'exercise' as const },
    { type: 'self_inquiry', name: 'Self Inquiry', icon: '🤔', baseDuration: 240, baseXP: 28, category: 'exercise' as const },
    { type: 'intent_setting', name: 'Intent Setting', icon: '🎯', baseDuration: 120, baseXP: 18, category: 'exercise' as const },
    { type: 'ego_detach', name: 'Ego Detach', icon: '☁️', baseDuration: 240, baseXP: 30, category: 'exercise' as const },
    { type: 'compulsion_detector', name: 'Compulsion Detector', icon: '🔍', baseDuration: 180, baseXP: 22, category: 'exercise' as const },
  ],

  // REFLECTION EXERCISES (All levels)
  reflection_exercises: [
    { type: 'micro_journal', name: 'Micro Journal', icon: '📝', baseDuration: 180, baseXP: 20, category: 'exercise' as const },
    { type: 'distraction_log', name: 'Distraction Log', icon: '📊', baseDuration: 120, baseXP: 15, category: 'exercise' as const },
    { type: 'mood_naming', name: 'Mood Naming', icon: '😌', baseDuration: 120, baseXP: 15, category: 'exercise' as const },
    { type: 'vision_moment', name: 'Vision Moment', icon: '✨', baseDuration: 240, baseXP: 25, category: 'exercise' as const },
    { type: 'mini_gratitude', name: 'Mini Gratitude', icon: '🙏', baseDuration: 120, baseXP: 15, category: 'exercise' as const },
    { type: 'inner_mentor', name: 'Inner Mentor', icon: '🧙', baseDuration: 300, baseXP: 35, category: 'exercise' as const },
  ],

  // MOVEMENT EXERCISES (All levels)
  movement_exercises: [
    { type: 'body_release', name: 'Body Release', icon: '🤸', baseDuration: 180, baseXP: 20, category: 'exercise' as const },
  ],
};

/**
 * Calculate scaled duration based on level
 */
function getScaledDuration(baseDuration: number, level: number, category: 'challenge' | 'exercise'): number {
  if (category === 'exercise') {
    // Exercises keep consistent durations
    return baseDuration;
  }

  // Challenges scale with level
  const scaleFactor = 1 + (level / 250) * 0.5; // Max 1.5x at level 250
  return Math.round(baseDuration * scaleFactor);
}

/**
 * Calculate scaled XP based on level
 */
function getScaledXP(baseXP: number, level: number): number {
  const scaleFactor = 1 + (level / 250) * 2; // Max 3x at level 250
  return Math.round(baseXP * scaleFactor);
}

/**
 * Calculate difficulty level (1-10) based on game level
 */
function getDifficultyLevel(level: number): number {
  return Math.min(10, Math.ceil(level / 25));
}

/**
 * Get activities for a specific level with intelligent distribution
 */
export function getActivitiesForLevel(level: number): JourneyActivity[] {
  const activities: JourneyActivity[] = [];
  const difficultyLevel = getDifficultyLevel(level);

  // Beginner Levels (1-50): Focus on basics + breathing + grounding
  if (level <= 50) {
    // 2 beginner challenges
    const challenges = ACTIVITY_POOL.beginner_challenges.slice(0, 2);
    challenges.forEach(activity => {
      activities.push({
        ...activity,
        description: `Master the basics with ${activity.name}`,
        scaledDuration: getScaledDuration(activity.baseDuration, level, activity.category),
        scaledXP: getScaledXP(activity.baseXP, level),
        difficultyLevel,
        requiredForProgression: true,
      });
    });

    // 1 breathing exercise
    const breathing = ACTIVITY_POOL.breathing_exercises[level % 4];
    activities.push({
      ...breathing,
      description: `Calm your mind with ${breathing.name}`,
      scaledDuration: breathing.baseDuration,
      scaledXP: getScaledXP(breathing.baseXP, level),
      difficultyLevel: Math.min(5, difficultyLevel),
      requiredForProgression: false,
      isBonus: true,
    });

    // 1 grounding exercise
    const grounding = ACTIVITY_POOL.grounding_exercises[level % 5];
    activities.push({
      ...grounding,
      description: `Ground yourself with ${grounding.name}`,
      scaledDuration: grounding.baseDuration,
      scaledXP: getScaledXP(grounding.baseXP, level),
      difficultyLevel: Math.min(5, difficultyLevel),
      requiredForProgression: false,
      isBonus: true,
    });
  }

  // Intermediate Levels (51-150): Mix of intermediate challenges + cognitive exercises
  else if (level <= 150) {
    // 2-3 intermediate challenges
    const numChallenges = level < 100 ? 2 : 3;
    const challengePool = [
      ...ACTIVITY_POOL.beginner_challenges,
      ...ACTIVITY_POOL.intermediate_challenges,
    ];
    const selectedChallenges = challengePool.slice(0, numChallenges);

    selectedChallenges.forEach(activity => {
      activities.push({
        ...activity,
        description: `Build your skills with ${activity.name}`,
        scaledDuration: getScaledDuration(activity.baseDuration, level, activity.category),
        scaledXP: getScaledXP(activity.baseXP, level),
        difficultyLevel,
        requiredForProgression: true,
      });
    });

    // 1 cognitive exercise
    const cognitiveIndex = Math.floor(level / 10) % ACTIVITY_POOL.cognitive_exercises.length;
    const cognitive = ACTIVITY_POOL.cognitive_exercises[cognitiveIndex];
    activities.push({
      ...cognitive,
      description: `Strengthen your mind with ${cognitive.name}`,
      scaledDuration: cognitive.baseDuration,
      scaledXP: getScaledXP(cognitive.baseXP, level),
      difficultyLevel: Math.min(8, difficultyLevel),
      requiredForProgression: false,
      isBonus: true,
    });

    // 1 reflection exercise (every 5 levels)
    if (level % 5 === 0) {
      const reflection = ACTIVITY_POOL.reflection_exercises[Math.floor(level / 5) % ACTIVITY_POOL.reflection_exercises.length];
      activities.push({
        ...reflection,
        description: `Reflect on your progress with ${reflection.name}`,
        scaledDuration: reflection.baseDuration,
        scaledXP: getScaledXP(reflection.baseXP, level),
        difficultyLevel: Math.min(6, difficultyLevel),
        requiredForProgression: false,
        isBonus: true,
      });
    }
  }

  // Advanced Levels (151-250): All challenge types + advanced exercises
  else {
    // 3-4 advanced challenges
    const numChallenges = level < 200 ? 3 : 4;
    const challengePool = [
      ...ACTIVITY_POOL.intermediate_challenges,
      ...ACTIVITY_POOL.advanced_challenges,
    ];

    // Rotate through available challenges
    const startIndex = Math.floor(level / 10) % challengePool.length;
    const selectedChallenges = [];
    for (let i = 0; i < numChallenges; i++) {
      selectedChallenges.push(challengePool[(startIndex + i) % challengePool.length]);
    }

    selectedChallenges.forEach(activity => {
      activities.push({
        ...activity,
        description: `Master the art of ${activity.name}`,
        scaledDuration: getScaledDuration(activity.baseDuration, level, activity.category),
        scaledXP: getScaledXP(activity.baseXP, level),
        difficultyLevel,
        requiredForProgression: true,
      });
    });

    // 1-2 advanced exercises
    const cognitiveIndex = Math.floor(level / 10) % ACTIVITY_POOL.cognitive_exercises.length;
    const cognitive = ACTIVITY_POOL.cognitive_exercises[cognitiveIndex];
    activities.push({
      ...cognitive,
      description: `Challenge your mind with ${cognitive.name}`,
      scaledDuration: cognitive.baseDuration,
      scaledXP: getScaledXP(cognitive.baseXP, level),
      difficultyLevel,
      requiredForProgression: false,
      isBonus: true,
    });

    // Bonus reflection exercise (every 3 levels at high levels)
    if (level % 3 === 0) {
      const reflection = ACTIVITY_POOL.reflection_exercises[Math.floor(level / 3) % ACTIVITY_POOL.reflection_exercises.length];
      activities.push({
        ...reflection,
        description: `Deep reflection with ${reflection.name}`,
        scaledDuration: reflection.baseDuration,
        scaledXP: getScaledXP(reflection.baseXP, level),
        difficultyLevel: Math.min(10, difficultyLevel),
        requiredForProgression: false,
        isBonus: true,
      });
    }
  }

  return activities;
}

/**
 * Generate tests for milestone levels (every 10 levels)
 */
export function getTestForLevel(level: number): JourneyTest | null {
  // Tests every 10 levels
  if (level % 10 !== 0) return null;

  const realmNumber = Math.ceil(level / 10);
  const activities = getActivitiesForLevel(level);

  // For tests, use required challenges only (2-4 activities)
  const requiredActivities = activities
    .filter(a => a.requiredForProgression)
    .map(a => a.type);

  // Calculate XP reward (sum of all challenge XP + bonus)
  const totalXP = activities
    .filter(a => a.requiredForProgression)
    .reduce((sum, a) => sum + a.scaledXP, 0);

  const bonusXP = Math.round(totalXP * 0.5); // 50% bonus for completing test

  return {
    level,
    name: `Realm ${realmNumber} Mastery Test`,
    description: `Complete all challenges to prove your mastery of Realm ${realmNumber}`,
    activities: requiredActivities,
    passingScore: 70, // Need 70% average to pass
    xpReward: totalXP + bonusXP,
    isComplete: false,
  };
}

/**
 * Calculate XP required for each level (exponential growth)
 */
export function getXPRequiredForLevel(level: number): number {
  const baseXP = 100;
  const growthRate = 1.08; // 8% growth per level
  return Math.round(baseXP * Math.pow(growthRate, level - 1));
}

/**
 * Calculate total XP needed to reach a level
 */
export function getTotalXPToLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPRequiredForLevel(i);
  }
  return total;
}

/**
 * Get journey level data with all activities
 */
export function getJourneyLevel(level: number, currentLevel: number): JourneyLevel {
  const realmId = Math.ceil(level / 10);
  const realmNames = [
    'Awakening', 'Breath', 'Stillness', 'Clarity', 'Flow',
    'Presence', 'Discipline', 'Resilience', 'Insight', 'Balance',
    'Harmony', 'Mastery', 'Wisdom', 'Transcendence', 'Enlightenment',
    'Infinity', 'Eternity', 'Cosmos', 'Void', 'Unity',
    'Perfection', 'Nirvana', 'Ascension', 'Omniscience', 'Absolute',
  ];

  return {
    level,
    realmId,
    realmName: realmNames[realmId - 1] || `Realm ${realmId}`,
    activities: getActivitiesForLevel(level),
    xpRequired: getXPRequiredForLevel(level),
    totalXpToReach: getTotalXPToLevel(level),
    isUnlocked: level <= currentLevel,
  };
}

/**
 * Get all unlocked levels for current progress
 */
export function getUnlockedJourneyLevels(currentLevel: number): JourneyLevel[] {
  const levels: JourneyLevel[] = [];

  // Get current level and next 2 unlocked levels
  for (let i = Math.max(1, currentLevel - 1); i <= Math.min(250, currentLevel + 2); i++) {
    levels.push(getJourneyLevel(i, currentLevel));
  }

  return levels;
}

/**
 * Get suggested next activity based on progress and preferences
 */
export function getNextSuggestedActivity(level: number, completedToday: string[]): JourneyActivity | null {
  const activities = getActivitiesForLevel(level);

  // Prioritize required activities first
  const required = activities.filter(a => a.requiredForProgression && !completedToday.includes(a.type));
  if (required.length > 0) return required[0];

  // Then bonus activities
  const bonus = activities.filter(a => a.isBonus && !completedToday.includes(a.type));
  if (bonus.length > 0) return bonus[0];

  return null;
}
