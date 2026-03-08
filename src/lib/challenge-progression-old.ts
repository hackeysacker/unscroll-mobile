/**
 * Challenge Progression System for 100 Levels (10 Realms × 10 Levels)
 * 
 * Maps 19 existing challenges across 10 realms with intelligent scaling
 * Each realm (unit) focuses on specific attention skills
 */

import type { ChallengeType } from '@/types';

// ============================================================================
// REALM-BASED CHALLENGE DISTRIBUTION
// ============================================================================

/**
 * REALM 1: CALM (Levels 1-10)
 * Focus: Basic attention, stillness, breathing
 * Primary Challenges: Focus Hold, Breath Pacing, Look Away, Controlled Breathing
 */
const REALM_CALM_CHALLENGES: ChallengeType[] = [
  'focus_hold',              // 1: Very easy, 5-7s hold
  'breath_pacing',           // 2: Simple breath cycle
  'look_away',               // 3: Basic look away
  'controlled_breathing',    // 4: Guided breathing
  'finger_hold',             // 5: Still finger hold
  'focus_hold',              // 6: Medium hold time
  'breath_pacing',           // 7: Longer cycles
  'look_away',               // 8: Longer duration
  'stillness_test',          // 9: Short stillness
  'focus_hold',              // 10: TEST - All calm skills
];

/**
 * REALM 2: CLARITY (Levels 11-20)
 * Focus: Tracking, precision, slow movement
 * Primary Challenges: Slow Tracking, Finger Tracing, Multi-Object Tracking
 */
const REALM_CLARITY_CHALLENGES: ChallengeType[] = [
  'slow_tracking',           // 11: Very slow tracking
  'finger_tracing',          // 12: Simple line
  'slow_tracking',           // 13: Curved path
  'multi_object_tracking',   // 14: 1 slow object
  'finger_tracing',          // 15: Shape tracing
  'slow_tracking',           // 16: Complex path
  'multi_object_tracking',   // 17: 2 objects
  'finger_tracing',          // 18: Long path
  'slow_tracking',           // 19: Fast tracking
  'multi_object_tracking',   // 20: TEST - Multiple objects
];

/**
 * REALM 3: DISCIPLINE (Levels 21-30)
 * Focus: Impulse control, delays, resistance
 * Primary Challenges: Delay Unlock, Anti-Scroll, Tap Only Correct, Reaction Inhibition
 */
const REALM_DISCIPLINE_CHALLENGES: ChallengeType[] = [
  'delay_unlock',            // 21: Short delay
  'anti_scroll_swipe',       // 22: Few blocks
  'tap_only_correct',        // 23: Simple rule
  'reaction_inhibition',     // 24: Basic inhibition
  'delay_unlock',            // 25: Medium delay
  'anti_scroll_swipe',       // 26: More blocks
  'tap_only_correct',        // 27: Multiple rules
  'reaction_inhibition',     // 28: Fast cues
  'delay_unlock',            // 29: Long delay
  'tap_only_correct',        // 30: TEST - Complex rules
];

/**
 * REALM 4: FLOW (Levels 31-40)
 * Focus: Rhythm, timing, coordination
 * Primary Challenges: Rhythm Tap, Multi-Task Tap, Finger Hold
 */
const REALM_FLOW_CHALLENGES: ChallengeType[] = [
  'rhythm_tap',              // 31: Slow tempo
  'finger_hold',             // 32: Long hold
  'multi_task_tap',          // 33: 1-2 targets
  'rhythm_tap',              // 34: Medium tempo
  'finger_hold',             // 35: Very long hold
  'multi_task_tap',          // 36: 3 targets
  'rhythm_tap',              // 37: Fast tempo
  'multi_task_tap',          // 38: 4 targets
  'rhythm_tap',              // 39: Complex pattern
  'multi_task_tap',          // 40: TEST - Rapid multi-task
];

/**
 * REALM 5: BALANCE (Levels 41-50)
 * Focus: Memory, tracking, sustained attention
 * Primary Challenges: Memory Flash, Multi-Object Tracking, Stillness Test
 */
const REALM_BALANCE_CHALLENGES: ChallengeType[] = [
  'memory_flash',            // 41: 1-2 items
  'multi_object_tracking',   // 42: 2 objects
  'stillness_test',          // 43: 20s stillness
  'memory_flash',            // 44: 3-4 items
  'multi_object_tracking',   // 45: 3 objects
  'stillness_test',          // 46: 40s stillness
  'memory_flash',            // 47: 5-6 items
  'multi_object_tracking',   // 48: 4 objects
  'memory_flash',            // 49: 7-8 items
  'stillness_test',          // 50: TEST - Long stillness
];

/**
 * REALM 6: PRECISION (Levels 51-60)
 * Focus: Accuracy, fine control, tracing
 * Primary Challenges: Finger Tracing, Tap Only Correct, Slow Tracking
 */
const REALM_PRECISION_CHALLENGES: ChallengeType[] = [
  'finger_tracing',          // 51: Precise line
  'tap_only_correct',        // 52: Tight timing
  'slow_tracking',           // 53: Narrow path
  'finger_tracing',          // 54: Complex shape
  'tap_only_correct',        // 55: Multiple conditions
  'slow_tracking',           // 56: Fast precise tracking
  'finger_tracing',          // 57: Spiral/maze
  'tap_only_correct',        // 58: Pattern matching
  'finger_tracing',          // 59: Very complex
  'slow_tracking',           // 60: TEST - Perfect tracking
];

/**
 * REALM 7: REACTION (Levels 61-70)
 * Focus: Speed, inhibition, quick decisions
 * Primary Challenges: Reaction Inhibition, Tap Only Correct, Impulse Spike Test
 */
const REALM_REACTION_CHALLENGES: ChallengeType[] = [
  'reaction_inhibition',     // 61: Simple cues
  'tap_only_correct',        // 62: Fast tapping
  'impulse_spike_test',      // 63: Small distractions
  'reaction_inhibition',     // 64: Multiple rules
  'tap_only_correct',        // 65: Very fast
  'impulse_spike_test',      // 66: Medium distractions
  'reaction_inhibition',     // 67: Complex inhibition
  'impulse_spike_test',      // 68: Heavy distractions
  'reaction_inhibition',     // 69: Max speed
  'impulse_spike_test',      // 70: TEST - Extreme distractions
];

/**
 * REALM 8: MULTI-FOCUS (Levels 71-80)
 * Focus: Divided attention, multi-tasking, distraction resistance
 * Primary Challenges: Multi-Task Tap, Fake Notifications, Popup Ignore
 */
const REALM_MULTI_FOCUS_CHALLENGES: ChallengeType[] = [
  'multi_task_tap',          // 71: 2 simultaneous
  'fake_notifications',      // 72: Few notifications
  'popup_ignore',            // 73: 1-2 popups
  'multi_task_tap',          // 74: 3 simultaneous
  'fake_notifications',      // 75: Many notifications
  'popup_ignore',            // 76: 3-5 popups
  'multi_task_tap',          // 77: 4+ simultaneous
  'fake_notifications',      // 78: Rapid fire
  'popup_ignore',            // 79: Popup storm
  'multi_task_tap',          // 80: TEST - Max multi-task
];

/**
 * REALM 9: MASTERY (Levels 81-90)
 * Focus: Advanced combinations, long duration, high complexity
 * Primary Challenges: Mixed advanced challenges from all realms
 */
const REALM_MASTERY_CHALLENGES: ChallengeType[] = [
  'memory_flash',            // 81: 8+ items
  'multi_object_tracking',   // 82: 5 objects
  'reaction_inhibition',     // 83: Expert level
  'delay_unlock',            // 84: Very long delay
  'finger_tracing',          // 85: Expert precision
  'rhythm_tap',              // 86: Expert rhythm
  'stillness_test',          // 87: 90s+ stillness
  'tap_only_correct',        // 88: All conditions
  'multi_task_tap',          // 89: Max complexity
  'memory_flash',            // 90: TEST - 10 items
];

/**
 * REALM 10: FULL FOCUS (Levels 91-100)
 * Focus: Ultimate challenge, all skills combined, mastery test
 * Primary Challenges: Most difficult variants of all challenges
 */
const REALM_FULL_FOCUS_CHALLENGES: ChallengeType[] = [
  'focus_hold',              // 91: 60s+ hold
  'memory_flash',            // 92: 10 items
  'multi_task_tap',          // 93: Extreme multi-task
  'impulse_spike_test',      // 94: Maximum distraction
  'finger_tracing',          // 95: Most complex path
  'reaction_inhibition',     // 96: Fastest + hardest
  'stillness_test',          // 97: 120s stillness
  'multi_object_tracking',   // 98: 5+ objects
  'tap_only_correct',        // 99: All rules
  'reset',                   // 100: FINAL MASTERY TEST
];

// ============================================================================
// COMPLETE 100-LEVEL PROGRESSION
// ============================================================================

export const CHALLENGE_PROGRESSION: Record<number, ChallengeType> = {
  // Realm 1: Calm (1-10)
  ...Object.fromEntries(REALM_CALM_CHALLENGES.map((c, i) => [i + 1, c])),
  
  // Realm 2: Clarity (11-20)
  ...Object.fromEntries(REALM_CLARITY_CHALLENGES.map((c, i) => [i + 11, c])),
  
  // Realm 3: Discipline (21-30)
  ...Object.fromEntries(REALM_DISCIPLINE_CHALLENGES.map((c, i) => [i + 21, c])),
  
  // Realm 4: Flow (31-40)
  ...Object.fromEntries(REALM_FLOW_CHALLENGES.map((c, i) => [i + 31, c])),
  
  // Realm 5: Balance (41-50)
  ...Object.fromEntries(REALM_BALANCE_CHALLENGES.map((c, i) => [i + 41, c])),
  
  // Realm 6: Precision (51-60)
  ...Object.fromEntries(REALM_PRECISION_CHALLENGES.map((c, i) => [i + 51, c])),
  
  // Realm 7: Reaction (61-70)
  ...Object.fromEntries(REALM_REACTION_CHALLENGES.map((c, i) => [i + 61, c])),
  
  // Realm 8: Multi-Focus (71-80)
  ...Object.fromEntries(REALM_MULTI_FOCUS_CHALLENGES.map((c, i) => [i + 71, c])),
  
  // Realm 9: Mastery (81-90)
  ...Object.fromEntries(REALM_MASTERY_CHALLENGES.map((c, i) => [i + 81, c])),
  
  // Realm 10: Full Focus (91-100)
  ...Object.fromEntries(REALM_FULL_FOCUS_CHALLENGES.map((c, i) => [i + 91, c])),
};

// ============================================================================
// SCALING FUNCTIONS FOR EACH CHALLENGE TYPE
// ============================================================================

/**
 * Get difficulty parameters for a specific level (1-100)
 * Returns parameters scaled appropriately for each challenge type
 */
export function getChallengeScaling(challengeType: ChallengeType, level: number) {
  // Normalize level to 0-1 range across all 100 levels
  const t = (level - 1) / 99;
  
  // Different scaling curves
  const linear = (min: number, max: number) => min + t * (max - min);
  const easeIn = (min: number, max: number) => min + (t * t) * (max - min);
  const easeOut = (min: number, max: number) => min + (1 - (1 - t) * (1 - t)) * (max - min);
  
  switch (challengeType) {
    case 'focus_hold':
    case 'finger_hold':
      return {
        duration: Math.round(easeIn(5, 70)), // 5s to 70s
        movementTolerance: Math.round(easeOut(30, 5)), // 30px to 5px
      };
    
    case 'slow_tracking':
    case 'multi_object_tracking':
      return {
        speed: linear(0.3, 2.0), // 0.3x to 2.0x speed
        objectCount: Math.round(linear(1, 5)), // 1 to 5 objects
        pathComplexity: Math.min(5, 1 + Math.floor(t * 4)), // 1-5 complexity
      };
    
    case 'tap_only_correct':
    case 'reaction_inhibition':
      return {
        targetCount: Math.round(linear(3, 20)), // 3 to 20 targets
        decoyCount: Math.round(easeIn(1, 15)), // 1 to 15 decoys
        timePerTarget: easeOut(3, 0.5), // 3s to 0.5s
        rulesCount: Math.min(4, 1 + Math.floor(t * 3)), // 1-4 rules
      };
    
    case 'memory_flash':
      return {
        itemCount: Math.round(linear(1, 10)), // 1 to 10 items
        displayTime: easeOut(3, 0.8), // 3s to 0.8s
        recallTime: linear(5, 15), // 5s to 15s
      };
    
    case 'breath_pacing':
    case 'controlled_breathing':
      return {
        breathCycle: Math.round(linear(4, 16)), // 4s to 16s cycle
        holdDuration: Math.round(linear(0, 6)), // 0s to 6s hold
        cycles: Math.round(linear(3, 12)), // 3 to 12 cycles
      };
    
    case 'fake_notifications':
    case 'popup_ignore':
    case 'impulse_spike_test':
      return {
        count: Math.round(easeIn(1, 30)), // 1 to 30 distractions
        speed: linear(0.5, 2.5), // 0.5x to 2.5x speed
        intensity: Math.round(linear(1, 10)), // 1-10 intensity
      };
    
    case 'delay_unlock':
      return {
        delayDuration: Math.round(easeIn(3, 45)), // 3s to 45s delay
        temptationIntensity: linear(1, 10), // 1-10 temptation
      };
    
    case 'anti_scroll_swipe':
      return {
        blockCount: Math.round(easeIn(2, 40)), // 2 to 40 blocks
        scrollSpeed: linear(0.5, 2.0), // 0.5x to 2.0x speed
      };
    
    case 'look_away':
    case 'stillness_test':
      return {
        duration: Math.round(easeIn(7, 120)), // 7s to 120s
        movementThreshold: Math.round(easeOut(25, 5)), // 25px to 5px
      };
    
    case 'rhythm_tap':
      return {
        tempo: Math.round(linear(60, 180)), // 60-180 BPM
        patternLength: Math.round(linear(4, 20)), // 4-20 beats
        complexity: Math.min(5, 1 + Math.floor(t * 4)), // 1-5 complexity
      };
    
    case 'finger_tracing':
      return {
        pathLength: Math.round(linear(100, 600)), // 100px to 600px
        pathType: t < 0.2 ? 'line' : t < 0.4 ? 'curve' : t < 0.6 ? 'shape' : t < 0.8 ? 'complex' : 'maze',
        accuracyThreshold: Math.round(easeOut(30, 6)), // 30px to 6px
      };
    
    case 'multi_task_tap':
      return {
        simultaneousTargets: Math.round(linear(1, 7)), // 1 to 7 targets
        tapFrequency: easeIn(2, 0.3), // 2s to 0.3s between taps
        complexity: Math.min(5, 1 + Math.floor(t * 4)), // 1-5 complexity
      };
    
    case 'reset':
      return {
        challengeCount: Math.round(linear(3, 10)), // 3-10 mini challenges
        timeLimit: Math.round(linear(30, 120)), // 30s-120s total
      };
    
    default:
      return {
        duration: Math.round(linear(5, 60)),
        difficulty: linear(1, 10),
      };
  }
}

/**
 * Get the challenge type for a specific level
 */
export function getChallengeForLevel(level: number): ChallengeType {
  return CHALLENGE_PROGRESSION[level] || 'focus_hold';
}

/**
 * Get human-readable challenge name
 */
export function getChallengeName(challengeType: ChallengeType): string {
  const names: Record<ChallengeType, string> = {
    focus_hold: 'Focus Hold',
    finger_hold: 'Finger Hold',
    slow_tracking: 'Slow Tracking',
    tap_only_correct: 'Tap Only Correct',
    breath_pacing: 'Breath Pacing',
    fake_notifications: 'Fake Notifications',
    look_away: 'Look Away',
    delay_unlock: 'Delay Unlock',
    anti_scroll_swipe: 'Anti-Scroll Swipe',
    memory_flash: 'Memory Flash',
    reaction_inhibition: 'Reaction Inhibition',
    multi_object_tracking: 'Multi-Object Tracking',
    rhythm_tap: 'Rhythm Tap',
    stillness_test: 'Stillness Test',
    impulse_spike_test: 'Impulse Spike Test',
    finger_tracing: 'Finger Tracing',
    multi_task_tap: 'Multi-Task Tap',
    popup_ignore: 'Pop-Up Ignore',
    controlled_breathing: 'Controlled Breathing',
    reset: 'Reset Challenge',
    // Legacy
    gaze_hold: 'Gaze Hold',
    moving_target: 'Moving Target',
    distraction_resistance: 'Distraction Resistance',
    tap_pattern: 'Tap Pattern',
    audio_focus: 'Audio Focus',
    impulse_delay: 'Impulse Delay',
    stability_hold: 'Stability Hold',
  };

  return names[challengeType] || challengeType;
}

/**
 * Get challenge description for UI
 */
export function getChallengeDescription(challengeType: ChallengeType, level: number): string {
  const scaling = getChallengeScaling(challengeType, level);

  switch (challengeType) {
    case 'focus_hold':
      return `Hold your focus for ${scaling.duration}s without breaking`;
    case 'memory_flash':
      return `Remember ${scaling.itemCount} items in ${(scaling.displayTime ?? 1).toFixed(1)}s`;
    case 'tap_only_correct':
      return `Tap ${scaling.targetCount} correct targets (${scaling.rulesCount} rules)`;
    case 'stillness_test':
      return `Stay perfectly still for ${scaling.duration}s`;
    case 'breath_pacing':
      return `Follow the breathing pattern for ${scaling.cycles} cycles`;
    case 'look_away':
      return `Look away from the screen for ${scaling.duration}s`;
    case 'anti_scroll_swipe':
      return `Resist scrolling through ${scaling.blockCount} blocks`;
    case 'reset':
      return `Complete ${scaling.challengeCount} mini-challenges in ${scaling.timeLimit}s`;
    default:
      return `Complete the ${getChallengeName(challengeType)} challenge`;
  }
}























