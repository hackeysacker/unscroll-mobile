/**
 * Challenge Progression System for 250 Levels (10 Realms × 25 Levels)
 *
 * Maps 20 attention challenges + 4 puzzle types across 10 realms
 * Each realm focuses on specific skills with puzzles mixed in
 * Puzzles appear every 4-5 levels to provide variety and cognitive challenges
 */

import type { ChallengeType } from '@/types';

// ============================================================================
// REALM-BASED CHALLENGE DISTRIBUTION (25 LEVELS PER REALM)
// ============================================================================

/**
 * REALM 1: CALM (Levels 1-25)
 * Focus: Basic attention, stillness, breathing
 * Puzzles: Pattern Matching (introduces puzzle mechanics)
 */
const REALM_CALM_CHALLENGES: ChallengeType[] = [
  'focus_hold',              // 1: Very easy introduction
  'breath_pacing',           // 2: Simple breath cycle
  'look_away',               // 3: Basic disconnect
  'pattern_matching',        // 4: PUZZLE - Simple patterns
  'controlled_breathing',    // 5: Guided breathing
  'finger_hold',             // 6: Still finger hold
  'focus_hold',              // 7: Medium hold time
  'pattern_matching',        // 8: PUZZLE - Color patterns
  'breath_pacing',           // 9: Longer cycles
  'look_away',               // 10: Longer duration
  'stillness_test',          // 11: Short stillness
  'memory_puzzle',           // 12: PUZZLE - Remember patterns
  'controlled_breathing',    // 13: Box breathing
  'finger_hold',             // 14: Longer hold
  'focus_hold',              // 15: Extended focus
  'pattern_matching',        // 16: PUZZLE - Shape patterns
  'breath_pacing',           // 17: Complex cycles
  'stillness_test',          // 18: Medium stillness
  'look_away',               // 19: Extended disconnect
  'memory_puzzle',           // 20: PUZZLE - Sequence memory
  'focus_hold',              // 21: Long focus hold
  'controlled_breathing',    // 22: Advanced breathing
  'stillness_test',          // 23: Long stillness
  'pattern_matching',        // 24: PUZZLE - Complex patterns
  'focus_hold',              // 25: REALM TEST - Master calm
];

/**
 * REALM 2: CLARITY (Levels 26-50)
 * Focus: Tracking, precision, slow movement
 * Puzzles: Spatial Puzzles (tests visual-spatial skills)
 */
const REALM_CLARITY_CHALLENGES: ChallengeType[] = [
  'slow_tracking',           // 26: Very slow tracking
  'finger_tracing',          // 27: Simple line
  'slow_tracking',           // 28: Curved path
  'spatial_puzzle',          // 29: PUZZLE - Rotate shapes
  'multi_object_tracking',   // 30: 1 slow object
  'finger_tracing',          // 31: Shape tracing
  'slow_tracking',           // 32: Complex path
  'logic_puzzle',            // 33: PUZZLE - Simple logic
  'multi_object_tracking',   // 34: 2 objects
  'finger_tracing',          // 35: Long path
  'slow_tracking',           // 36: Fast tracking
  'spatial_puzzle',          // 37: PUZZLE - Arrange pieces
  'multi_object_tracking',   // 38: 3 objects
  'finger_tracing',          // 39: Complex shapes
  'slow_tracking',           // 40: Very fast tracking
  'memory_puzzle',           // 41: PUZZLE - Position memory
  'multi_object_tracking',   // 42: 4 objects
  'finger_tracing',          // 43: Intricate paths
  'slow_tracking',           // 44: Expert tracking
  'spatial_puzzle',          // 45: PUZZLE - 3D rotation
  'multi_object_tracking',   // 46: 5 objects
  'finger_tracing',          // 47: Master precision
  'slow_tracking',           // 48: Ultimate speed
  'logic_puzzle',            // 49: PUZZLE - Pattern logic
  'multi_object_tracking',   // 50: REALM TEST - Master tracking
];

/**
 * REALM 3: DISCIPLINE (Levels 51-75)
 * Focus: Impulse control, delays, resistance
 * Puzzles: Logic Puzzles (tests reasoning and patience)
 */
const REALM_DISCIPLINE_CHALLENGES: ChallengeType[] = [
  'delay_unlock',            // 51: Short delay
  'anti_scroll_swipe',       // 52: Few blocks
  'tap_only_correct',        // 53: Simple rule
  'logic_puzzle',            // 54: PUZZLE - Deduction
  'reaction_inhibition',     // 55: Basic inhibition
  'delay_unlock',            // 56: Medium delay
  'anti_scroll_swipe',       // 57: More blocks
  'pattern_matching',        // 58: PUZZLE - Rule patterns
  'tap_only_correct',        // 59: Multiple rules
  'reaction_inhibition',     // 60: Fast cues
  'delay_unlock',            // 61: Long delay
  'logic_puzzle',            // 62: PUZZLE - Complex logic
  'anti_scroll_swipe',        // 63: Many blocks
  'tap_only_correct',        // 64: Complex rules
  'reaction_inhibition',     // 65: Very fast
  'memory_puzzle',           // 66: PUZZLE - Rule memory
  'delay_unlock',            // 67: Very long delay
  'anti_scroll_swipe',       // 68: Maximum blocks
  'tap_only_correct',        // 69: All rules
  'logic_puzzle',            // 70: PUZZLE - Advanced logic
  'reaction_inhibition',     // 71: Expert speed
  'delay_unlock',            // 72: Extreme delay
  'anti_scroll_swipe',       // 73: Ultimate resistance
  'spatial_puzzle',          // 74: PUZZLE - Strategic placement
  'tap_only_correct',        // 75: REALM TEST - Master discipline
];

/**
 * REALM 4: FLOW (Levels 76-100)
 * Focus: Rhythm, timing, coordination
 * Puzzles: Memory Puzzles (tests sequential memory)
 */
const REALM_FLOW_CHALLENGES: ChallengeType[] = [
  'rhythm_tap',              // 76: Slow tempo
  'finger_hold',             // 77: Long hold
  'multi_task_tap',          // 78: 1-2 targets
  'memory_puzzle',           // 79: PUZZLE - Beat patterns
  'rhythm_tap',              // 80: Medium tempo
  'finger_hold',             // 81: Very long hold
  'multi_task_tap',          // 82: 3 targets
  'pattern_matching',        // 83: PUZZLE - Rhythm patterns
  'rhythm_tap',              // 84: Fast tempo
  'multi_task_tap',          // 85: 4 targets
  'rhythm_tap',              // 86: Complex pattern
  'logic_puzzle',            // 87: PUZZLE - Sequence logic
  'multi_task_tap',          // 88: 5 targets
  'rhythm_tap',              // 89: Very fast
  'finger_hold',             // 90: Expert hold
  'memory_puzzle',           // 91: PUZZLE - Multi-sequence
  'multi_task_tap',          // 92: 6 targets
  'rhythm_tap',              // 93: Expert rhythm
  'multi_task_tap',          // 94: 7 targets
  'spatial_puzzle',          // 95: PUZZLE - Timing placement
  'rhythm_tap',              // 96: Master tempo
  'multi_task_tap',          // 97: Max targets
  'finger_hold',             // 98: Ultimate hold
  'memory_puzzle',           // 99: PUZZLE - Master memory
  'multi_task_tap',          // 100: REALM TEST - Master flow
];

/**
 * REALM 5: BALANCE (Levels 101-125)
 * Focus: Memory, tracking, sustained attention
 * Puzzles: All puzzle types mixed
 */
const REALM_BALANCE_CHALLENGES: ChallengeType[] = [
  'memory_flash',            // 101: 1-2 items
  'multi_object_tracking',   // 102: 2 objects
  'stillness_test',          // 103: 20s stillness
  'pattern_matching',        // 104: PUZZLE - Hybrid patterns
  'memory_flash',            // 105: 3-4 items
  'multi_object_tracking',   // 106: 3 objects
  'stillness_test',          // 107: 30s stillness
  'logic_puzzle',            // 108: PUZZLE - Memory logic
  'memory_flash',            // 109: 5-6 items
  'multi_object_tracking',   // 110: 4 objects
  'stillness_test',          // 111: 40s stillness
  'spatial_puzzle',          // 112: PUZZLE - Memory spatial
  'memory_flash',            // 113: 7-8 items
  'multi_object_tracking',   // 114: 5 objects
  'stillness_test',          // 115: 50s stillness
  'memory_puzzle',           // 116: PUZZLE - Grid memory
  'memory_flash',            // 117: 9 items
  'multi_object_tracking',   // 118: 5+ objects
  'stillness_test',          // 119: 60s stillness
  'pattern_matching',        // 120: PUZZLE - Complex memory
  'memory_flash',            // 121: 10 items
  'multi_object_tracking',   // 122: Expert tracking
  'stillness_test',          // 123: Expert stillness
  'logic_puzzle',            // 124: PUZZLE - Advanced memory
  'stillness_test',          // 125: REALM TEST - Master balance
];

/**
 * REALM 6: PRECISION (Levels 126-150)
 * Focus: Accuracy, fine control, tracing
 * Puzzles: Spatial Puzzles (tests precise placement)
 */
const REALM_PRECISION_CHALLENGES: ChallengeType[] = [
  'finger_tracing',          // 126: Precise line
  'tap_only_correct',        // 127: Tight timing
  'slow_tracking',           // 128: Narrow path
  'spatial_puzzle',          // 129: PUZZLE - Exact placement
  'finger_tracing',          // 130: Complex shape
  'tap_only_correct',        // 131: Multiple conditions
  'slow_tracking',           // 132: Fast precise
  'pattern_matching',        // 133: PUZZLE - Precision patterns
  'finger_tracing',          // 134: Spiral/maze
  'tap_only_correct',        // 135: Pattern matching
  'slow_tracking',           // 136: Expert precision
  'logic_puzzle',            // 137: PUZZLE - Precision logic
  'finger_tracing',          // 138: Very complex
  'tap_only_correct',        // 139: All conditions
  'slow_tracking',           // 140: Perfect tracking
  'memory_puzzle',           // 141: PUZZLE - Position precision
  'finger_tracing',          // 142: Master tracing
  'tap_only_correct',        // 143: Expert accuracy
  'slow_tracking',           // 144: Ultimate precision
  'spatial_puzzle',          // 145: PUZZLE - Micro placement
  'finger_tracing',          // 146: Perfect paths
  'tap_only_correct',        // 147: Perfect timing
  'slow_tracking',           // 148: Pixel perfect
  'pattern_matching',        // 149: PUZZLE - Exact patterns
  'slow_tracking',           // 150: REALM TEST - Master precision
];

/**
 * REALM 7: REACTION (Levels 151-175)
 * Focus: Speed, inhibition, quick decisions
 * Puzzles: All types with time pressure
 */
const REALM_REACTION_CHALLENGES: ChallengeType[] = [
  'reaction_inhibition',     // 151: Simple cues
  'tap_only_correct',        // 152: Fast tapping
  'impulse_spike_test',      // 153: Small distractions
  'logic_puzzle',            // 154: PUZZLE - Quick logic
  'reaction_inhibition',     // 155: Multiple rules
  'tap_only_correct',        // 156: Very fast
  'impulse_spike_test',      // 157: Medium distractions
  'pattern_matching',        // 158: PUZZLE - Quick patterns
  'reaction_inhibition',     // 159: Complex inhibition
  'tap_only_correct',        // 160: Expert speed
  'impulse_spike_test',      // 161: Heavy distractions
  'memory_puzzle',           // 162: PUZZLE - Quick memory
  'reaction_inhibition',     // 163: Max speed
  'tap_only_correct',        // 164: Lightning fast
  'impulse_spike_test',      // 165: Extreme distractions
  'spatial_puzzle',          // 166: PUZZLE - Quick spatial
  'reaction_inhibition',     // 167: Expert inhibition
  'tap_only_correct',        // 168: Perfect speed
  'impulse_spike_test',      // 169: Maximum distractions
  'logic_puzzle',            // 170: PUZZLE - Speed logic
  'reaction_inhibition',     // 171: Ultimate speed
  'tap_only_correct',        // 172: Master reactions
  'impulse_spike_test',      // 173: Ultimate distractions
  'pattern_matching',        // 174: PUZZLE - Speed patterns
  'impulse_spike_test',      // 175: REALM TEST - Master reaction
];

/**
 * REALM 8: MULTI-FOCUS (Levels 176-200)
 * Focus: Divided attention, multi-tasking
 * Puzzles: Complex multi-element puzzles
 */
const REALM_MULTI_FOCUS_CHALLENGES: ChallengeType[] = [
  'multi_task_tap',          // 176: 2 simultaneous
  'fake_notifications',      // 177: Few notifications
  'popup_ignore',            // 178: 1-2 popups
  'memory_puzzle',           // 179: PUZZLE - Multi-memory
  'multi_task_tap',          // 180: 3 simultaneous
  'fake_notifications',      // 181: Many notifications
  'popup_ignore',            // 182: 3-5 popups
  'spatial_puzzle',          // 183: PUZZLE - Multi-spatial
  'multi_task_tap',          // 184: 4+ simultaneous
  'fake_notifications',      // 185: Rapid fire
  'popup_ignore',            // 186: Popup storm
  'logic_puzzle',            // 187: PUZZLE - Multi-logic
  'multi_task_tap',          // 188: 5 targets
  'fake_notifications',      // 189: Expert distractions
  'popup_ignore',            // 190: Expert popups
  'pattern_matching',        // 191: PUZZLE - Multi-patterns
  'multi_task_tap',          // 192: 6 targets
  'fake_notifications',      // 193: Maximum distractions
  'popup_ignore',            // 194: Maximum popups
  'memory_puzzle',           // 195: PUZZLE - Multi-task memory
  'multi_task_tap',          // 196: 7 targets
  'fake_notifications',      // 197: Ultimate distractions
  'popup_ignore',            // 198: Ultimate popups
  'spatial_puzzle',          // 199: PUZZLE - Complex multi
  'multi_task_tap',          // 200: REALM TEST - Master multi-focus
];

/**
 * REALM 9: MASTERY (Levels 201-225)
 * Focus: Advanced combinations, high complexity
 * Puzzles: Master-level puzzles
 */
const REALM_MASTERY_CHALLENGES: ChallengeType[] = [
  'memory_flash',            // 201: 8+ items
  'multi_object_tracking',   // 202: 5 objects
  'reaction_inhibition',     // 203: Expert level
  'logic_puzzle',            // 204: PUZZLE - Master logic
  'delay_unlock',            // 205: Very long delay
  'finger_tracing',          // 206: Expert precision
  'rhythm_tap',              // 207: Expert rhythm
  'spatial_puzzle',          // 208: PUZZLE - Master spatial
  'stillness_test',          // 209: 90s+ stillness
  'tap_only_correct',        // 210: All conditions
  'multi_task_tap',          // 211: Max complexity
  'memory_puzzle',           // 212: PUZZLE - Master memory
  'memory_flash',            // 213: 10 items
  'impulse_spike_test',      // 214: Maximum distractions
  'reaction_inhibition',     // 215: Ultimate speed
  'pattern_matching',        // 216: PUZZLE - Master patterns
  'multi_object_tracking',   // 217: Expert tracking
  'fake_notifications',      // 218: Expert resistance
  'popup_ignore',            // 219: Expert popups
  'logic_puzzle',            // 220: PUZZLE - Ultimate logic
  'stillness_test',          // 221: 120s stillness
  'finger_tracing',          // 222: Master tracing
  'multi_task_tap',          // 223: Ultimate multi-task
  'spatial_puzzle',          // 224: PUZZLE - Ultimate spatial
  'memory_flash',            // 225: REALM TEST - Master mastery
];

/**
 * REALM 10: FULL FOCUS (Levels 226-250)
 * Focus: Ultimate challenge, all skills combined, mastery test
 * Puzzles: Ultimate challenge puzzles
 */
const REALM_FULL_FOCUS_CHALLENGES: ChallengeType[] = [
  'focus_hold',              // 226: 60s+ hold
  'memory_flash',            // 227: 10 items
  'multi_task_tap',          // 228: Extreme multi-task
  'pattern_matching',        // 229: PUZZLE - Ultimate patterns
  'impulse_spike_test',      // 230: Maximum distraction
  'finger_tracing',          // 231: Most complex path
  'reaction_inhibition',     // 232: Fastest + hardest
  'logic_puzzle',            // 233: PUZZLE - Final logic
  'stillness_test',          // 234: 120s stillness
  'multi_object_tracking',   // 235: 5+ objects
  'tap_only_correct',        // 236: All rules
  'memory_puzzle',           // 237: PUZZLE - Final memory
  'delay_unlock',            // 238: Ultimate delay
  'rhythm_tap',              // 239: Ultimate rhythm
  'popup_ignore',            // 240: Ultimate popups
  'spatial_puzzle',          // 241: PUZZLE - Final spatial
  'fake_notifications',      // 242: Ultimate distractions
  'anti_scroll_swipe',       // 243: Ultimate resistance
  'multi_task_tap',          // 244: Ultimate complexity
  'pattern_matching',        // 245: PUZZLE - Grand patterns
  'memory_flash',            // 246: Ultimate memory
  'reaction_inhibition',     // 247: Ultimate speed
  'stillness_test',          // 248: Ultimate stillness
  'logic_puzzle',            // 249: PUZZLE - Grand finale
  'reset',                   // 250: FINAL MASTERY TEST
];

// ============================================================================
// COMPLETE 250-LEVEL PROGRESSION
// ============================================================================

export const CHALLENGE_PROGRESSION: Record<number, ChallengeType> = {
  // Realm 1: Calm (1-25)
  ...Object.fromEntries(REALM_CALM_CHALLENGES.map((c, i) => [i + 1, c])),

  // Realm 2: Clarity (26-50)
  ...Object.fromEntries(REALM_CLARITY_CHALLENGES.map((c, i) => [i + 26, c])),

  // Realm 3: Discipline (51-75)
  ...Object.fromEntries(REALM_DISCIPLINE_CHALLENGES.map((c, i) => [i + 51, c])),

  // Realm 4: Flow (76-100)
  ...Object.fromEntries(REALM_FLOW_CHALLENGES.map((c, i) => [i + 76, c])),

  // Realm 5: Balance (101-125)
  ...Object.fromEntries(REALM_BALANCE_CHALLENGES.map((c, i) => [i + 101, c])),

  // Realm 6: Precision (126-150)
  ...Object.fromEntries(REALM_PRECISION_CHALLENGES.map((c, i) => [i + 126, c])),

  // Realm 7: Reaction (151-175)
  ...Object.fromEntries(REALM_REACTION_CHALLENGES.map((c, i) => [i + 151, c])),

  // Realm 8: Multi-Focus (176-200)
  ...Object.fromEntries(REALM_MULTI_FOCUS_CHALLENGES.map((c, i) => [i + 176, c])),

  // Realm 9: Mastery (201-225)
  ...Object.fromEntries(REALM_MASTERY_CHALLENGES.map((c, i) => [i + 201, c])),

  // Realm 10: Full Focus (226-250)
  ...Object.fromEntries(REALM_FULL_FOCUS_CHALLENGES.map((c, i) => [i + 226, c])),
};

// Export the rest of the functions from the original file
export * from './challenge-progression';
