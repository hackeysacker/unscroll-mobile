/**
 * Challenge Engine - Viral Unlock System
 *
 * Assigns real-world challenges based on:
 * - Time of day
 * - Recent attempt frequency
 * - Challenge history (avoid repeats)
 * - Intensity setting
 *
 * Principles:
 * - Start easy, escalate with repeated attempts
 * - Context-aware (late night = face down, lights on)
 * - No motivational language, just blunt instructions
 */

export type ChallengeType =
  | 'face_down'      // Tier 1: phone face down 30s
  | 'hold_still'     // Tier 1: phone still 20s
  | 'wait'           // Tier 1: do nothing 15s
  | 'say_it'         // Tier 1: say why you're opening the app
  | 'stand_up'       // Tier 2: phone upright, standing 15s
  | 'walk'           // Tier 2: 15-30 steps
  | 'lights_on'      // Tier 2: ambient light threshold 10s
  | 'leave_room'     // Tier 3: meaningful movement 20s (EXTREME)
  | 'step_outside';  // Tier 3: GPS + motion (EXTREME)

export type IntensityLevel = 'low' | 'normal' | 'high';

export type TimeSegment = 'morning' | 'day' | 'evening' | 'night';

export interface ChallengeConfig {
  type: ChallengeType;
  duration: number; // seconds
  tier: 1 | 2 | 3;
  requiresPermissions: string[]; // e.g., ['MOTION', 'LOCATION']
  title: string; // Blunt, no fluff
  instruction: string;
  fallback?: ChallengeType; // If permissions unavailable
}

export interface ChallengeContext {
  attemptCount: number; // Last 30 minutes
  lastChallenges: ChallengeType[]; // Last 3
  intensity: IntensityLevel;
  timeSegment: TimeSegment;
  availablePermissions: string[]; // ['MOTION', 'LOCATION', 'SPEECH']
  extremeModeEnabled: boolean;
}

// Challenge definitions
const CHALLENGES: Record<ChallengeType, ChallengeConfig> = {
  face_down: {
    type: 'face_down',
    duration: 30,
    tier: 1,
    requiresPermissions: ['MOTION'],
    title: 'Before scrolling',
    instruction: 'Put your phone face down. 30 seconds.',
    fallback: 'wait',
  },
  hold_still: {
    type: 'hold_still',
    duration: 20,
    tier: 1,
    requiresPermissions: ['MOTION'],
    title: 'Before scrolling',
    instruction: 'Hold your phone still. 20 seconds.',
    fallback: 'wait',
  },
  wait: {
    type: 'wait',
    duration: 15,
    tier: 1,
    requiresPermissions: [],
    title: 'Before scrolling',
    instruction: 'Do nothing. 15 seconds. Do not touch.',
  },
  say_it: {
    type: 'say_it',
    duration: 10,
    tier: 1,
    requiresPermissions: ['SPEECH'],
    title: 'Before scrolling',
    instruction: 'Say why you're opening this app.',
    fallback: 'wait',
  },
  stand_up: {
    type: 'stand_up',
    duration: 15,
    tier: 2,
    requiresPermissions: ['MOTION'],
    title: 'Before scrolling',
    instruction: 'Stand up. Stay upright for 15 seconds.',
    fallback: 'hold_still',
  },
  walk: {
    type: 'walk',
    duration: 30,
    tier: 2,
    requiresPermissions: ['MOTION'],
    title: 'Before scrolling',
    instruction: 'Walk 20 steps.',
    fallback: 'wait',
  },
  lights_on: {
    type: 'lights_on',
    duration: 10,
    tier: 2,
    requiresPermissions: ['LIGHT'],
    title: 'Before scrolling',
    instruction: 'Turn the lights on.',
    fallback: 'stand_up',
  },
  leave_room: {
    type: 'leave_room',
    duration: 20,
    tier: 3,
    requiresPermissions: ['MOTION'],
    title: 'Before scrolling',
    instruction: 'Leave the room. Move for 20 seconds.',
    fallback: 'walk',
  },
  step_outside: {
    type: 'step_outside',
    duration: 30,
    tier: 3,
    requiresPermissions: ['LOCATION', 'MOTION', 'LIGHT'],
    title: 'Before scrolling',
    instruction: 'Step outside.',
    fallback: 'leave_room',
  },
};

/**
 * Get current time segment
 */
export function getTimeSegment(): TimeSegment {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get challenge difficulty multiplier based on attempts
 * More attempts = harder/longer challenges
 */
function getDifficultyMultiplier(attemptCount: number): number {
  if (attemptCount === 0) return 1.0;
  if (attemptCount === 1) return 1.0;
  if (attemptCount === 2) return 1.2;
  if (attemptCount >= 3 && attemptCount < 5) return 1.5;
  return 2.0; // 5+ attempts = double difficulty
}

/**
 * Select next challenge based on context
 * Core algorithm for viral unlock system
 */
export function selectChallenge(context: ChallengeContext): ChallengeConfig {
  const { attemptCount, lastChallenges, intensity, timeSegment, availablePermissions, extremeModeEnabled } = context;

  // Build available challenge pool
  let pool: ChallengeType[] = [];

  // Tier 1 (always available)
  const tier1: ChallengeType[] = ['face_down', 'hold_still', 'wait', 'say_it'];

  // Tier 2 (after 2nd attempt or normal+ intensity)
  const tier2: ChallengeType[] = ['stand_up', 'walk', 'lights_on'];

  // Tier 3 (extreme mode only, or 5+ attempts)
  const tier3: ChallengeType[] = ['leave_room', 'step_outside'];

  // Start with tier 1
  pool = [...tier1];

  // Add tier 2 if:
  // - 2+ attempts, or
  // - normal/high intensity
  if (attemptCount >= 2 || intensity !== 'low') {
    pool.push(...tier2);
  }

  // Add tier 3 if:
  // - extreme mode enabled, or
  // - 5+ attempts (escalation)
  if (extremeModeEnabled || attemptCount >= 5) {
    pool.push(...tier3);
  }

  // Context-aware weighting
  const weights: Record<ChallengeType, number> = {} as any;

  pool.forEach(type => {
    weights[type] = 1.0;

    // Late night: favor face down and lights on
    if (timeSegment === 'night') {
      if (type === 'face_down') weights[type] = 3.0;
      if (type === 'lights_on') weights[type] = 2.5;
    }

    // Morning: favor gentle challenges
    if (timeSegment === 'morning') {
      if (type === 'stand_up') weights[type] = 2.0;
      if (type === 'wait') weights[type] = 1.5;
    }

    // Reduce weight for recent challenges (avoid repeats)
    if (lastChallenges.includes(type)) {
      weights[type] *= 0.2;
    }

    // Check permissions availability
    const config = CHALLENGES[type];
    const hasPermissions = config.requiresPermissions.every(p => availablePermissions.includes(p));
    if (!hasPermissions) {
      weights[type] = 0; // Cannot use this challenge
    }

    // High intensity: favor tier 2/3
    if (intensity === 'high') {
      const tier = CHALLENGES[type].tier;
      if (tier >= 2) weights[type] *= 1.5;
    }
  });

  // Filter out zero-weight challenges
  const available = pool.filter(type => weights[type] > 0);

  if (available.length === 0) {
    // Fallback to simplest challenge if nothing available
    return CHALLENGES.wait;
  }

  // Weighted random selection
  const totalWeight = available.reduce((sum, type) => sum + weights[type], 0);
  let random = Math.random() * totalWeight;

  for (const type of available) {
    random -= weights[type];
    if (random <= 0) {
      let selectedConfig = { ...CHALLENGES[type] };

      // Apply difficulty multiplier to duration
      const multiplier = getDifficultyMultiplier(attemptCount);
      selectedConfig.duration = Math.round(selectedConfig.duration * multiplier);

      return selectedConfig;
    }
  }

  // Fallback
  return CHALLENGES[available[0]];
}

/**
 * Get challenge config by type
 */
export function getChallengeConfig(type: ChallengeType): ChallengeConfig {
  return CHALLENGES[type];
}

/**
 * Get fallback challenge if permissions unavailable
 */
export function getFallbackChallenge(type: ChallengeType): ChallengeConfig {
  const config = CHALLENGES[type];
  if (config.fallback) {
    return CHALLENGES[config.fallback];
  }
  return CHALLENGES.wait; // Ultimate fallback
}

/**
 * Check if challenge can be used with current permissions
 */
export function canUseChallenge(type: ChallengeType, availablePermissions: string[]): boolean {
  const config = CHALLENGES[type];
  return config.requiresPermissions.every(p => availablePermissions.includes(p));
}
