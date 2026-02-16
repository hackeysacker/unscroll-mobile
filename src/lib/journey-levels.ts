/**
 * JOURNEY LEVEL SYSTEM
 * 
 * A progressive challenge system that becomes more demanding over time.
 * 
 * STRUCTURE:
 * - 10 Realms with 25 levels each (250 total levels)
 * - Realm 1: 1 exercise per level (beginner friendly)
 * - Realm 2-3: 2 exercises per level
 * - Realm 4-5: 3 exercises per level
 * - Realm 6-7: 4 exercises per level
 * - Realm 8-9: 5 exercises per level
 * - Realm 10: 6 exercises per level (master difficulty)
 * 
 * DIFFICULTY:
 * - Duration increases within each realm
 * - Later levels in each realm are harder
 * - Each realm introduces new challenge types
 * - All exercises are required (no bonus)
 */

import type { ChallengeType } from '@/types';
import type { ExerciseType } from './exercise-types';
import { FOCUS_REALMS } from './focus-realm-themes';

export type ActivityType = ChallengeType | ExerciseType;

export interface JourneyActivity {
  type: ActivityType;
  category: 'challenge' | 'exercise';
  name: string;
  description: string;
  icon: string;
  duration: number;
  difficultyLevel: number;
  xpReward: number;
}

export interface JourneyLevel {
  level: number;
  realmId: number;
  realmName: string;
  activities: JourneyActivity[];
  totalDuration: number;
  totalXP: number;
  isUnlocked: boolean;
  isMasteryTest: boolean;
}

// ============================================================================
// REALM EXERCISE POOLS
// Each realm has its own set of exercises that match its theme
// ============================================================================

interface RealmExercise {
  type: ActivityType;
  name: string;
  icon: string;
  category: 'challenge' | 'exercise';
  baseDuration: number;
  baseXP: number;
}

const REALM_EXERCISES: { [key: string]: RealmExercise[] } = {
  
  // REALM 1: AWAKENING (Levels 1-25)
  // Theme: Basic awareness and simple focus
  // 1 exercise per level
  awakening: [
    { type: 'gaze_hold', name: 'Gaze Hold', icon: '👁️', category: 'challenge', baseDuration: 15, baseXP: 10 },
    { type: 'focus_hold', name: 'Focus Hold', icon: '🎯', category: 'challenge', baseDuration: 15, baseXP: 10 },
    { type: 'slow_breathing', name: 'Slow Breathing', icon: '🫁', category: 'exercise', baseDuration: 20, baseXP: 12 },
  ],

  // REALM 2: BREATH (Levels 26-50)
  // Theme: Breathing control and rhythm
  // 2 exercises per level
  breath: [
    { type: 'breath_pacing', name: 'Breath Pacing', icon: '💨', category: 'exercise', baseDuration: 20, baseXP: 12 },
    { type: 'box_breathing', name: 'Box Breathing', icon: '⬛', category: 'exercise', baseDuration: 25, baseXP: 15 },
    { type: 'controlled_breathing', name: 'Controlled Breathing', icon: '🧘', category: 'exercise', baseDuration: 25, baseXP: 15 },
    { type: 'rhythm_tap', name: 'Rhythm Tap', icon: '🎵', category: 'challenge', baseDuration: 20, baseXP: 12 },
  ],

  // REALM 3: STILLNESS (Levels 51-75)
  // Theme: Physical control and calm
  // 2 exercises per level
  stillness: [
    { type: 'stillness_test', name: 'Stillness Test', icon: '🧘‍♂️', category: 'challenge', baseDuration: 25, baseXP: 15 },
    { type: 'finger_hold', name: 'Finger Hold', icon: '☝️', category: 'challenge', baseDuration: 20, baseXP: 12 },
    { type: 'body_scan', name: 'Body Scan', icon: '✨', category: 'exercise', baseDuration: 30, baseXP: 18 },
    { type: 'slow_tracking', name: 'Slow Tracking', icon: '🐢', category: 'challenge', baseDuration: 25, baseXP: 15 },
  ],

  // REALM 4: CLARITY (Levels 76-100)
  // Theme: Visual focus and perception
  // 3 exercises per level
  clarity: [
    { type: 'tap_only_correct', name: 'Tap Correct', icon: '✅', category: 'challenge', baseDuration: 25, baseXP: 15 },
    { type: 'memory_flash', name: 'Memory Flash', icon: '⚡', category: 'challenge', baseDuration: 30, baseXP: 18 },
    { type: 'multi_object_tracking', name: 'Track Objects', icon: '👀', category: 'challenge', baseDuration: 30, baseXP: 18 },
    { type: 'five_senses', name: 'Five Senses', icon: '🌈', category: 'exercise', baseDuration: 35, baseXP: 20 },
  ],

  // REALM 5: FLOW (Levels 101-125)
  // Theme: Smooth movement and coordination
  // 3 exercises per level
  flow: [
    { type: 'finger_tracing', name: 'Finger Tracing', icon: '✍️', category: 'challenge', baseDuration: 30, baseXP: 18 },
    { type: 'moving_target', name: 'Moving Target', icon: '🎯', category: 'challenge', baseDuration: 30, baseXP: 18 },
    { type: 'calm_visual', name: 'Calm Visual', icon: '🌊', category: 'exercise', baseDuration: 35, baseXP: 20 },
    { type: 'slow_tracking', name: 'Precision Track', icon: '🔎', category: 'challenge', baseDuration: 35, baseXP: 20 },
  ],

  // REALM 6: DISCIPLINE (Levels 126-150)
  // Theme: Impulse control and willpower
  // 4 exercises per level
  discipline: [
    { type: 'reaction_inhibition', name: 'Stop Signal', icon: '✋', category: 'challenge', baseDuration: 30, baseXP: 20 },
    { type: 'delay_unlock', name: 'Delay Unlock', icon: '⏱️', category: 'challenge', baseDuration: 35, baseXP: 22 },
    { type: 'urge_surfing', name: 'Urge Surfing', icon: '🌊', category: 'exercise', baseDuration: 40, baseXP: 25 },
    { type: 'impulse_delay', name: 'Impulse Delay', icon: '⏸️', category: 'challenge', baseDuration: 35, baseXP: 22 },
  ],

  // REALM 7: RESILIENCE (Levels 151-175)
  // Theme: Distraction resistance
  // 4 exercises per level
  resilience: [
    { type: 'fake_notifications', name: 'Ignore Alerts', icon: '🔕', category: 'challenge', baseDuration: 35, baseXP: 22 },
    { type: 'popup_ignore', name: 'Popup Ignore', icon: '🚫', category: 'challenge', baseDuration: 35, baseXP: 22 },
    { type: 'distraction_log', name: 'Distraction Log', icon: '📋', category: 'exercise', baseDuration: 40, baseXP: 25 },
    { type: 'focus_hold', name: 'Deep Focus', icon: '💎', category: 'challenge', baseDuration: 40, baseXP: 25 },
  ],

  // REALM 8: INSIGHT (Levels 176-200)
  // Theme: Memory and cognition
  // 5 exercises per level
  insight: [
    { type: 'memory_flash', name: 'Memory Master', icon: '🧠', category: 'challenge', baseDuration: 40, baseXP: 25 },
    { type: 'tap_pattern', name: 'Tap Pattern', icon: '🔢', category: 'challenge', baseDuration: 40, baseXP: 25 },
    { type: 'thought_reframe', name: 'Thought Reframe', icon: '💡', category: 'exercise', baseDuration: 45, baseXP: 28 },
    { type: 'self_inquiry', name: 'Self Inquiry', icon: '🔮', category: 'exercise', baseDuration: 45, baseXP: 28 },
    { type: 'multi_object_tracking', name: 'Advanced Track', icon: '🎪', category: 'challenge', baseDuration: 45, baseXP: 28 },
  ],

  // REALM 9: ASCENSION (Levels 201-225)
  // Theme: Advanced multi-tasking
  // 5 exercises per level
  ascension: [
    { type: 'multi_task_tap', name: 'Multi Task', icon: '⚡', category: 'challenge', baseDuration: 45, baseXP: 30 },
    { type: 'impulse_spike_test', name: 'Impulse Spike', icon: '💥', category: 'challenge', baseDuration: 45, baseXP: 30 },
    { type: 'focus_sprint', name: 'Focus Sprint', icon: '🚀', category: 'exercise', baseDuration: 50, baseXP: 32 },
    { type: 'reaction_inhibition', name: 'Fast Stop', icon: '✋', category: 'challenge', baseDuration: 45, baseXP: 30 },
    { type: 'memory_flash', name: 'Speed Memory', icon: '💭', category: 'challenge', baseDuration: 50, baseXP: 32 },
  ],

  // REALM 10: ABSOLUTE (Levels 226-250)
  // Theme: Complete mastery
  // 6 exercises per level
  absolute: [
    { type: 'multi_task_tap', name: 'Multi Mastery', icon: '👑', category: 'challenge', baseDuration: 50, baseXP: 35 },
    { type: 'impulse_spike_test', name: 'Impulse Master', icon: '💫', category: 'challenge', baseDuration: 50, baseXP: 35 },
    { type: 'mental_reset', name: 'Mental Reset', icon: '🔄', category: 'exercise', baseDuration: 55, baseXP: 38 },
    { type: 'intent_setting', name: 'Intent Setting', icon: '🎯', category: 'exercise', baseDuration: 55, baseXP: 38 },
    { type: 'tap_pattern', name: 'Pattern Master', icon: '🎼', category: 'challenge', baseDuration: 55, baseXP: 38 },
    { type: 'stillness_test', name: 'Ultimate Still', icon: '🗿', category: 'challenge', baseDuration: 60, baseXP: 40 },
  ],
};

// ============================================================================
// DIFFICULTY SCALING
// ============================================================================

/**
 * Get the number of exercises required for a level based on realm
 */
function getExerciseCount(realmIndex: number, levelInRealm: number): number {
  // Base count by realm
  const baseCount = [
    1, // Realm 1: 1 exercise
    2, // Realm 2: 2 exercises
    2, // Realm 3: 2 exercises
    3, // Realm 4: 3 exercises
    3, // Realm 5: 3 exercises
    4, // Realm 6: 4 exercises
    4, // Realm 7: 4 exercises
    5, // Realm 8: 5 exercises
    5, // Realm 9: 5 exercises
    6, // Realm 10: 6 exercises
  ][realmIndex] || 1;

  // Add extra exercise for later levels in realm (levels 20-24)
  const bonusForLateLevel = levelInRealm >= 20 ? 1 : 0;

  return Math.min(baseCount + bonusForLateLevel, 6);
}

/**
 * Get difficulty multiplier based on level position
 * Returns a value between 1.0 and 2.0
 */
function getDifficultyMultiplier(realmIndex: number, levelInRealm: number): number {
  // Base difficulty from realm (0.0 to 0.9)
  const realmBonus = realmIndex * 0.1;
  
  // Level progress within realm (0.0 to 0.4)
  const levelBonus = (levelInRealm / 25) * 0.4;
  
  return 1.0 + realmBonus + levelBonus;
}

/**
 * Get the difficulty level (1-10) for display
 */
function getDifficultyLevel(realmIndex: number, levelInRealm: number): number {
  const base = realmIndex + 1; // 1-10 based on realm
  const levelProgress = Math.floor(levelInRealm / 5); // 0-4 based on position
  return Math.min(10, base + Math.floor(levelProgress / 2));
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Get journey level with all required exercises
 */
export function getJourneyLevel(level: number, userLevel: number): JourneyLevel {
  // Calculate realm and position
  const realmIndex = Math.max(0, Math.min(9, Math.floor((level - 1) / 25)));
  const realm = FOCUS_REALMS[realmIndex];
  const levelInRealm = ((level - 1) % 25) + 1;
  
  // Check if this is a mastery test level (every 25 levels)
  const isMasteryTest = level % 25 === 0;
  
  // Get realm exercises
  const realmKey = Object.keys(REALM_EXERCISES)[realmIndex];
  const realmExercises = REALM_EXERCISES[realmKey] || REALM_EXERCISES.awakening;
  
  // Get difficulty values
  const exerciseCount = getExerciseCount(realmIndex, levelInRealm);
  const difficultyMultiplier = getDifficultyMultiplier(realmIndex, levelInRealm);
  const difficultyLevel = getDifficultyLevel(realmIndex, levelInRealm);
  
  // Build activities list
  const activities: JourneyActivity[] = [];
  
  if (!isMasteryTest) {
    // Select exercises for this level
    for (let i = 0; i < exerciseCount; i++) {
      // Rotate through available exercises
      const exerciseIndex = (levelInRealm - 1 + i) % realmExercises.length;
      const exercise = realmExercises[exerciseIndex];
      
      // Scale duration and XP based on difficulty
      const scaledDuration = Math.round(exercise.baseDuration * difficultyMultiplier);
      const scaledXP = Math.round(exercise.baseXP * difficultyMultiplier);
      
      activities.push({
        type: exercise.type,
        category: exercise.category,
        name: exercise.name,
        description: getExerciseDescription(exercise.type, difficultyLevel),
        icon: exercise.icon,
        duration: scaledDuration,
        difficultyLevel,
        xpReward: scaledXP,
      });
    }
  }
  
  // Calculate totals
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const totalXP = activities.reduce((sum, a) => sum + a.xpReward, 0);
  
  return {
    level,
    realmId: realm.id,
    realmName: realm.name,
    activities,
    totalDuration,
    totalXP,
    isUnlocked: level <= userLevel,
    isMasteryTest,
  };
}

/**
 * Get description for an exercise based on difficulty
 */
function getExerciseDescription(type: ActivityType, difficulty: number): string {
  const descriptions: { [key: string]: string[] } = {
    gaze_hold: [
      'Hold your gaze on the target',
      'Focus steadily on the center point',
      'Maintain unwavering eye contact with the target',
    ],
    focus_hold: [
      'Keep your focus on the target',
      'Hold your attention without wandering',
      'Sustain deep concentration on the focal point',
    ],
    slow_breathing: [
      'Breathe slowly and deeply',
      'Follow the breathing rhythm carefully',
      'Master the art of controlled breath',
    ],
    breath_pacing: [
      'Match your breath to the guide',
      'Synchronize your breathing pattern',
      'Perfect your breath control timing',
    ],
    box_breathing: [
      'Follow the four-sided breath pattern',
      'Complete the breathing square with precision',
      'Master the box breathing technique',
    ],
    controlled_breathing: [
      'Control your breathing rate',
      'Maintain steady breath control',
      'Demonstrate complete breath mastery',
    ],
    rhythm_tap: [
      'Tap along to the rhythm',
      'Match the beat precisely',
      'Perfect your rhythmic timing',
    ],
    stillness_test: [
      'Stay as still as possible',
      'Minimize all movement',
      'Achieve complete stillness',
    ],
    finger_hold: [
      'Hold your finger steady',
      'Keep perfectly stable',
      'Demonstrate precise control',
    ],
    body_scan: [
      'Scan through your body',
      'Notice each body part carefully',
      'Complete a thorough body awareness scan',
    ],
    slow_tracking: [
      'Follow the slow-moving target',
      'Track with smooth precision',
      'Maintain perfect tracking accuracy',
    ],
    tap_only_correct: [
      'Only tap the correct targets',
      'Be selective with your taps',
      'Demonstrate perfect accuracy',
    ],
    memory_flash: [
      'Remember what you see',
      'Recall the pattern accurately',
      'Master rapid memory recall',
    ],
    multi_object_tracking: [
      'Track multiple moving objects',
      'Keep eyes on all targets',
      'Master divided attention tracking',
    ],
    five_senses: [
      'Notice your five senses',
      'Explore each sense mindfully',
      'Complete sensory awareness',
    ],
    finger_tracing: [
      'Trace the path with your finger',
      'Follow the line smoothly',
      'Perfect your tracing accuracy',
    ],
    moving_target: [
      'Follow the moving target',
      'Track the motion precisely',
      'Master moving target focus',
    ],
    calm_visual: [
      'Watch the calming visual',
      'Let your mind settle',
      'Achieve visual tranquility',
    ],
    reaction_inhibition: [
      'Stop when you see the signal',
      'Control your impulse to react',
      'Master impulse inhibition',
    ],
    delay_unlock: [
      'Wait patiently to unlock',
      'Resist the urge to act early',
      'Perfect delayed gratification',
    ],
    urge_surfing: [
      'Ride out the urge',
      'Observe without acting',
      'Master urge awareness',
    ],
    impulse_delay: [
      'Delay your response',
      'Wait before acting',
      'Control impulsive reactions',
    ],
    fake_notifications: [
      'Ignore the fake alerts',
      'Stay focused despite distractions',
      'Achieve notification immunity',
    ],
    popup_ignore: [
      'Ignore the popups',
      'Maintain focus through interruptions',
      'Master distraction resistance',
    ],
    distraction_log: [
      'Log your distractions',
      'Notice what pulls your attention',
      'Build distraction awareness',
    ],
    tap_pattern: [
      'Tap the correct pattern',
      'Remember and repeat the sequence',
      'Master pattern recognition',
    ],
    thought_reframe: [
      'Reframe your thoughts',
      'Shift perspective positively',
      'Transform negative thinking',
    ],
    self_inquiry: [
      'Explore your inner thoughts',
      'Question your assumptions',
      'Deepen self-understanding',
    ],
    multi_task_tap: [
      'Handle multiple tasks',
      'Switch between activities smoothly',
      'Master multi-tasking',
    ],
    impulse_spike_test: [
      'Resist sudden impulses',
      'Stay calm under pressure',
      'Control spike reactions',
    ],
    focus_sprint: [
      'Maintain intense focus',
      'Sprint through the challenge',
      'Achieve peak concentration',
    ],
    mental_reset: [
      'Clear your mind completely',
      'Reset your mental state',
      'Achieve mental clarity',
    ],
    intent_setting: [
      'Set your intention clearly',
      'Focus on your goal',
      'Align your purpose',
    ],
  };
  
  const exerciseDescriptions = descriptions[type] || ['Complete this exercise'];
  const descIndex = Math.min(Math.floor(difficulty / 4), exerciseDescriptions.length - 1);
  return exerciseDescriptions[descIndex];
}

// ============================================================================
// MASTERY TEST
// ============================================================================

export interface JourneyTest {
  level: number;
  name: string;
  description: string;
  activities: JourneyActivity[];
  passingScore: number;
  totalDuration: number;
  totalXP: number;
  realmName: string;
}

/**
 * Get mastery test for a realm (every 25 levels)
 */
export function getTestForLevel(level: number): JourneyTest | null {
  if (level % 25 !== 0) return null;
  
  const realmIndex = Math.floor((level - 1) / 25);
  const realm = FOCUS_REALMS[realmIndex];
  const realmKey = Object.keys(REALM_EXERCISES)[realmIndex];
  const realmExercises = REALM_EXERCISES[realmKey] || REALM_EXERCISES.awakening;
  
  // Build test activities (all exercises from the realm at max difficulty)
  const activities: JourneyActivity[] = realmExercises.map(exercise => ({
    type: exercise.type,
    category: exercise.category,
    name: exercise.name,
    description: `Master ${exercise.name}`,
    icon: exercise.icon,
    duration: Math.round(exercise.baseDuration * 1.5), // 50% longer for test
    difficultyLevel: 10,
    xpReward: Math.round(exercise.baseXP * 2), // Double XP for test
  }));
  
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const totalXP = activities.reduce((sum, a) => sum + a.xpReward, 0);
  
  return {
    level,
    name: `${realm.name} Mastery Test`,
    description: `Complete all ${realm.name} exercises to prove your mastery`,
    activities,
    passingScore: 70 + (realmIndex * 2), // 70% to 88% passing score
    totalDuration,
    totalXP,
    realmName: realm.name,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the primary activity type for a level (used for node icons)
 */
export function getPrimaryActivityType(level: number): ActivityType | null {
  const realmIndex = Math.max(0, Math.min(9, Math.floor((level - 1) / 25)));
  const levelInRealm = ((level - 1) % 25) + 1;
  
  if (level % 25 === 0) return null; // Mastery test
  
  const realmKey = Object.keys(REALM_EXERCISES)[realmIndex];
  const realmExercises = REALM_EXERCISES[realmKey] || REALM_EXERCISES.awakening;
  
  const exerciseIndex = (levelInRealm - 1) % realmExercises.length;
  return realmExercises[exerciseIndex]?.type || null;
}

/**
 * Get suggested next activity (first incomplete)
 */
export function getNextSuggestedActivity(level: number, completedTypes: string[]): JourneyActivity | null {
  const journeyLevel = getJourneyLevel(level, level);
  return journeyLevel.activities.find(a => !completedTypes.includes(a.type)) || null;
}

/**
 * Get level summary for display
 */
export function getLevelSummary(level: number): {
  exerciseCount: number;
  estimatedMinutes: number;
  difficulty: string;
  realmName: string;
} {
  const journeyLevel = getJourneyLevel(level, level);
  
  const difficultyLabels = [
    'Beginner', 'Easy', 'Normal', 'Moderate', 'Challenging',
    'Hard', 'Very Hard', 'Expert', 'Master', 'Legendary'
  ];
  
  const avgDifficulty = journeyLevel.activities.length > 0
    ? Math.round(journeyLevel.activities.reduce((sum, a) => sum + a.difficultyLevel, 0) / journeyLevel.activities.length)
    : 1;
  
  return {
    exerciseCount: journeyLevel.activities.length,
    estimatedMinutes: Math.round(journeyLevel.totalDuration / 60),
    difficulty: difficultyLabels[avgDifficulty - 1] || 'Unknown',
    realmName: journeyLevel.realmName,
  };
}
