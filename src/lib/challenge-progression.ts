/**
 * Challenge Progression System for 250 Levels (10 Realms × 25 Levels)
 *
 * Maps 20 attention challenges + 4 puzzle types across 10 realms
 * Each realm focuses on specific skills with puzzles mixed in
 */

import type { ChallengeType } from '@/types';

// Realm definitions from challenge-progression-250.ts
const REALM_CALM_CHALLENGES: ChallengeType[] = [
  'focus_hold', 'breath_pacing', 'look_away', 'pattern_matching', 'controlled_breathing',
  'finger_hold', 'focus_hold', 'pattern_matching', 'breath_pacing', 'look_away',
  'stillness_test', 'memory_puzzle', 'controlled_breathing', 'finger_hold', 'focus_hold',
  'pattern_matching', 'breath_pacing', 'stillness_test', 'look_away', 'memory_puzzle',
  'focus_hold', 'controlled_breathing', 'stillness_test', 'pattern_matching', 'focus_hold',
];

const REALM_CLARITY_CHALLENGES: ChallengeType[] = [
  'slow_tracking', 'finger_tracing', 'slow_tracking', 'spatial_puzzle', 'multi_object_tracking',
  'finger_tracing', 'slow_tracking', 'logic_puzzle', 'multi_object_tracking', 'finger_tracing',
  'slow_tracking', 'spatial_puzzle', 'multi_object_tracking', 'finger_tracing', 'slow_tracking',
  'memory_puzzle', 'multi_object_tracking', 'finger_tracing', 'slow_tracking', 'spatial_puzzle',
  'multi_object_tracking', 'finger_tracing', 'slow_tracking', 'logic_puzzle', 'multi_object_tracking',
];

const REALM_DISCIPLINE_CHALLENGES: ChallengeType[] = [
  'delay_unlock', 'anti_scroll_swipe', 'tap_only_correct', 'logic_puzzle', 'reaction_inhibition',
  'delay_unlock', 'anti_scroll_swipe', 'pattern_matching', 'tap_only_correct', 'reaction_inhibition',
  'delay_unlock', 'logic_puzzle', 'anti_scroll_swipe', 'tap_only_correct', 'reaction_inhibition',
  'memory_puzzle', 'delay_unlock', 'anti_scroll_swipe', 'tap_only_correct', 'logic_puzzle',
  'reaction_inhibition', 'delay_unlock', 'anti_scroll_swipe', 'spatial_puzzle', 'tap_only_correct',
];

const REALM_FLOW_CHALLENGES: ChallengeType[] = [
  'rhythm_tap', 'finger_hold', 'multi_task_tap', 'memory_puzzle', 'rhythm_tap',
  'finger_hold', 'multi_task_tap', 'pattern_matching', 'rhythm_tap', 'multi_task_tap',
  'rhythm_tap', 'logic_puzzle', 'multi_task_tap', 'rhythm_tap', 'finger_hold',
  'memory_puzzle', 'multi_task_tap', 'rhythm_tap', 'multi_task_tap', 'spatial_puzzle',
  'rhythm_tap', 'multi_task_tap', 'finger_hold', 'memory_puzzle', 'multi_task_tap',
];

const REALM_BALANCE_CHALLENGES: ChallengeType[] = [
  'memory_flash', 'multi_object_tracking', 'stillness_test', 'pattern_matching', 'memory_flash',
  'multi_object_tracking', 'stillness_test', 'logic_puzzle', 'memory_flash', 'multi_object_tracking',
  'stillness_test', 'spatial_puzzle', 'memory_flash', 'multi_object_tracking', 'stillness_test',
  'memory_puzzle', 'memory_flash', 'multi_object_tracking', 'stillness_test', 'pattern_matching',
  'memory_flash', 'multi_object_tracking', 'stillness_test', 'logic_puzzle', 'stillness_test',
];

const REALM_PRECISION_CHALLENGES: ChallengeType[] = [
  'finger_tracing', 'tap_only_correct', 'slow_tracking', 'spatial_puzzle', 'finger_tracing',
  'tap_only_correct', 'slow_tracking', 'pattern_matching', 'finger_tracing', 'tap_only_correct',
  'slow_tracking', 'logic_puzzle', 'finger_tracing', 'tap_only_correct', 'slow_tracking',
  'memory_puzzle', 'finger_tracing', 'tap_only_correct', 'slow_tracking', 'spatial_puzzle',
  'finger_tracing', 'tap_only_correct', 'slow_tracking', 'pattern_matching', 'slow_tracking',
];

const REALM_REACTION_CHALLENGES: ChallengeType[] = [
  'reaction_inhibition', 'tap_only_correct', 'impulse_spike_test', 'logic_puzzle', 'reaction_inhibition',
  'tap_only_correct', 'impulse_spike_test', 'pattern_matching', 'reaction_inhibition', 'tap_only_correct',
  'impulse_spike_test', 'memory_puzzle', 'reaction_inhibition', 'tap_only_correct', 'impulse_spike_test',
  'spatial_puzzle', 'reaction_inhibition', 'tap_only_correct', 'impulse_spike_test', 'logic_puzzle',
  'reaction_inhibition', 'tap_only_correct', 'impulse_spike_test', 'pattern_matching', 'impulse_spike_test',
];

const REALM_MULTI_FOCUS_CHALLENGES: ChallengeType[] = [
  'multi_task_tap', 'fake_notifications', 'popup_ignore', 'memory_puzzle', 'multi_task_tap',
  'fake_notifications', 'popup_ignore', 'spatial_puzzle', 'multi_task_tap', 'fake_notifications',
  'popup_ignore', 'logic_puzzle', 'multi_task_tap', 'fake_notifications', 'popup_ignore',
  'pattern_matching', 'multi_task_tap', 'fake_notifications', 'popup_ignore', 'memory_puzzle',
  'multi_task_tap', 'fake_notifications', 'popup_ignore', 'spatial_puzzle', 'multi_task_tap',
];

const REALM_MASTERY_CHALLENGES: ChallengeType[] = [
  'memory_flash', 'multi_object_tracking', 'reaction_inhibition', 'logic_puzzle', 'delay_unlock',
  'finger_tracing', 'rhythm_tap', 'spatial_puzzle', 'stillness_test', 'tap_only_correct',
  'multi_task_tap', 'memory_puzzle', 'memory_flash', 'impulse_spike_test', 'reaction_inhibition',
  'pattern_matching', 'multi_object_tracking', 'fake_notifications', 'popup_ignore', 'logic_puzzle',
  'stillness_test', 'finger_tracing', 'multi_task_tap', 'spatial_puzzle', 'memory_flash',
];

const REALM_FULL_FOCUS_CHALLENGES: ChallengeType[] = [
  'focus_hold', 'memory_flash', 'multi_task_tap', 'pattern_matching', 'impulse_spike_test',
  'finger_tracing', 'reaction_inhibition', 'logic_puzzle', 'stillness_test', 'multi_object_tracking',
  'tap_only_correct', 'memory_puzzle', 'delay_unlock', 'rhythm_tap', 'popup_ignore',
  'spatial_puzzle', 'fake_notifications', 'anti_scroll_swipe', 'multi_task_tap', 'pattern_matching',
  'memory_flash', 'reaction_inhibition', 'stillness_test', 'logic_puzzle', 'reset',
];

export const CHALLENGE_PROGRESSION: Record<number, ChallengeType> = {
  ...Object.fromEntries(REALM_CALM_CHALLENGES.map((c, i) => [i + 1, c])),
  ...Object.fromEntries(REALM_CLARITY_CHALLENGES.map((c, i) => [i + 26, c])),
  ...Object.fromEntries(REALM_DISCIPLINE_CHALLENGES.map((c, i) => [i + 51, c])),
  ...Object.fromEntries(REALM_FLOW_CHALLENGES.map((c, i) => [i + 76, c])),
  ...Object.fromEntries(REALM_BALANCE_CHALLENGES.map((c, i) => [i + 101, c])),
  ...Object.fromEntries(REALM_PRECISION_CHALLENGES.map((c, i) => [i + 126, c])),
  ...Object.fromEntries(REALM_REACTION_CHALLENGES.map((c, i) => [i + 151, c])),
  ...Object.fromEntries(REALM_MULTI_FOCUS_CHALLENGES.map((c, i) => [i + 176, c])),
  ...Object.fromEntries(REALM_MASTERY_CHALLENGES.map((c, i) => [i + 201, c])),
  ...Object.fromEntries(REALM_FULL_FOCUS_CHALLENGES.map((c, i) => [i + 226, c])),
};

/**
 * Get difficulty parameters for a specific level (1-250)
 * Returns parameters scaled appropriately for each challenge type
 */
export function getChallengeScaling(challengeType: ChallengeType, level: number) {
  // Normalize level to 0-1 range across all 250 levels
  const t = (level - 1) / 249;

  // Different scaling curves
  const linear = (min: number, max: number) => min + t * (max - min);
  const easeIn = (min: number, max: number) => min + (t * t) * (max - min);
  const easeOut = (min: number, max: number) => min + (1 - (1 - t) * (1 - t)) * (max - min);

  switch (challengeType) {
    // Existing challenges (same scaling logic)
    case 'focus_hold':
    case 'finger_hold':
      return {
        duration: Math.round(easeIn(5, 70)),
        movementTolerance: Math.round(easeOut(30, 5)),
      };

    case 'slow_tracking':
    case 'multi_object_tracking':
      return {
        speed: linear(0.3, 2.0),
        objectCount: Math.round(linear(1, 5)),
        pathComplexity: Math.min(5, 1 + Math.floor(t * 4)),
      };

    case 'tap_only_correct':
    case 'reaction_inhibition':
      return {
        targetCount: Math.round(linear(3, 20)),
        decoyCount: Math.round(easeIn(1, 15)),
        timePerTarget: easeOut(3, 0.5),
        rulesCount: Math.min(4, 1 + Math.floor(t * 3)),
      };

    case 'memory_flash':
      return {
        itemCount: Math.round(linear(1, 10)),
        displayTime: easeOut(3, 0.8),
        recallTime: linear(5, 15),
      };

    case 'breath_pacing':
    case 'controlled_breathing':
      return {
        breathCycle: Math.round(linear(4, 16)),
        holdDuration: Math.round(linear(0, 6)),
        cycles: Math.round(linear(3, 12)),
      };

    case 'fake_notifications':
    case 'popup_ignore':
    case 'impulse_spike_test':
      return {
        count: Math.round(easeIn(1, 30)),
        speed: linear(0.5, 2.5),
        intensity: Math.round(linear(1, 10)),
      };

    case 'delay_unlock':
      return {
        delayDuration: Math.round(easeIn(3, 45)),
        temptationIntensity: linear(1, 10),
      };

    case 'anti_scroll_swipe':
      return {
        blockCount: Math.round(easeIn(2, 40)),
        scrollSpeed: linear(0.5, 2.0),
      };

    case 'look_away':
    case 'stillness_test':
      return {
        duration: Math.round(easeIn(7, 120)),
        movementThreshold: Math.round(easeOut(25, 5)),
      };

    case 'rhythm_tap':
      return {
        tempo: Math.round(linear(60, 180)),
        patternLength: Math.round(linear(4, 20)),
        complexity: Math.min(5, 1 + Math.floor(t * 4)),
      };

    case 'finger_tracing':
      return {
        pathLength: Math.round(linear(100, 600)),
        pathType: t < 0.2 ? 'line' : t < 0.4 ? 'curve' : t < 0.6 ? 'shape' : t < 0.8 ? 'complex' : 'maze',
        accuracyThreshold: Math.round(easeOut(30, 6)),
      };

    case 'multi_task_tap':
      return {
        simultaneousTargets: Math.round(linear(1, 7)),
        tapFrequency: easeIn(2, 0.3),
        complexity: Math.min(5, 1 + Math.floor(t * 4)),
      };

    case 'reset':
      return {
        challengeCount: Math.round(linear(3, 10)),
        timeLimit: Math.round(linear(30, 120)),
      };

    // NEW PUZZLE TYPES
    case 'pattern_matching':
      return {
        gridSize: Math.round(linear(3, 6)), // 3x3 to 6x6 grid
        patternComplexity: Math.min(5, 1 + Math.floor(t * 4)), // 1-5 complexity
        timeLimit: Math.round(easeOut(60, 20)), // 60s to 20s
        colors: Math.round(linear(2, 8)), // 2 to 8 colors
      };

    case 'logic_puzzle':
      return {
        gridSize: Math.round(linear(4, 9)), // 4x4 to 9x9 grid
        cluesGiven: Math.round(easeOut(80, 30)), // 80% to 30% clues
        difficulty: Math.min(5, 1 + Math.floor(t * 4)), // 1-5 difficulty
        timeLimit: Math.round(easeOut(120, 40)), // 120s to 40s
      };

    case 'memory_puzzle':
      return {
        gridSize: Math.round(linear(2, 6)), // 2x2 to 6x6 grid
        pairsCount: Math.round(linear(2, 18)), // 2 to 18 pairs
        displayTime: easeOut(5, 1), // 5s to 1s
        flipTime: easeOut(2, 0.5), // 2s to 0.5s
      };

    case 'spatial_puzzle':
      return {
        pieces: Math.round(linear(4, 16)), // 4 to 16 pieces
        rotationEnabled: t > 0.3, // Rotation after 30% progress
        timedMode: t > 0.5, // Timed after 50% progress
        timeLimit: Math.round(easeOut(90, 30)), // 90s to 30s
      };

    default:
      return {
        duration: Math.round(linear(5, 60)),
        difficulty: linear(1, 10),
      };
  }
}

export function getChallengeForLevel(level: number): ChallengeType {
  return CHALLENGE_PROGRESSION[level] || 'focus_hold';
}

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
    // Puzzles
    pattern_matching: 'Pattern Matching',
    logic_puzzle: 'Logic Puzzle',
    memory_puzzle: 'Memory Puzzle',
    spatial_puzzle: 'Spatial Puzzle',
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

export function getChallengeDescription(challengeType: ChallengeType, level: number): string {
  const scaling = getChallengeScaling(challengeType, level);

  switch (challengeType) {
    case 'focus_hold':
      return `Hold your focus for ${scaling.duration}s without breaking`;
    case 'memory_flash':
      return `Remember ${scaling.itemCount} items in ${scaling.displayTime.toFixed(1)}s`;
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
    case 'pattern_matching':
      return `Match ${scaling.gridSize}x${scaling.gridSize} pattern in ${scaling.timeLimit}s`;
    case 'logic_puzzle':
      return `Solve ${scaling.gridSize}x${scaling.gridSize} logic puzzle`;
    case 'memory_puzzle':
      return `Match ${scaling.pairsCount} pairs in ${scaling.gridSize}x${scaling.gridSize} grid`;
    case 'spatial_puzzle':
      return `Arrange ${scaling.pieces} pieces${scaling.timedMode ? ` in ${scaling.timeLimit}s` : ''}`;
    default:
      return `Complete the ${getChallengeName(challengeType)} challenge`;
  }
}

