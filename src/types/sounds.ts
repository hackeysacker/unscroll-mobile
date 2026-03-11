/**
 * Sound Types
 *
 * Defines all available sound effects in the app
 */

export type SoundName =
  // UI Interactions
  | 'tap'
  | 'toggle'
  | 'swipe'
  | 'select'

  // Feedback
  | 'success'
  | 'error'
  | 'warning'
  | 'complete'

  // Challenge Events
  | 'target-appear'
  | 'target-hit'
  | 'target-miss'
  | 'streak'
  | 'combo'

  // Achievements
  | 'level-up'
  | 'achievement'
  | 'reward'

  // Navigation
  | 'transition'
  | 'back'
  | 'forward'

  // Special
  | 'countdown'
  | 'timer-end'
  | 'unlock';

export type SoundCategory = 'ui' | 'feedback' | 'challenge' | 'achievement' | 'navigation' | 'special';

export interface SoundMetadata {
  name: SoundName;
  category: SoundCategory;
  volume: number; // 0.0 to 1.0
  description: string;
}

export const SOUND_METADATA: Record<SoundName, SoundMetadata> = {
  // UI Interactions
  tap: {
    name: 'tap',
    category: 'ui',
    volume: 0.3,
    description: 'Light tap on button or UI element',
  },
  toggle: {
    name: 'toggle',
    category: 'ui',
    volume: 0.4,
    description: 'Toggle switch or checkbox',
  },
  swipe: {
    name: 'swipe',
    category: 'ui',
    volume: 0.2,
    description: 'Swipe gesture',
  },
  select: {
    name: 'select',
    category: 'ui',
    volume: 0.35,
    description: 'Selection change',
  },

  // Feedback
  success: {
    name: 'success',
    category: 'feedback',
    volume: 0.5,
    description: 'Success confirmation',
  },
  error: {
    name: 'error',
    category: 'feedback',
    volume: 0.45,
    description: 'Error or incorrect action',
  },
  warning: {
    name: 'warning',
    category: 'feedback',
    volume: 0.4,
    description: 'Warning notification',
  },
  complete: {
    name: 'complete',
    category: 'feedback',
    volume: 0.6,
    description: 'Task or challenge completed',
  },

  // Challenge Events
  'target-appear': {
    name: 'target-appear',
    category: 'challenge',
    volume: 0.3,
    description: 'Target appears on screen',
  },
  'target-hit': {
    name: 'target-hit',
    category: 'challenge',
    volume: 0.4,
    description: 'Correct target tapped',
  },
  'target-miss': {
    name: 'target-miss',
    category: 'challenge',
    volume: 0.35,
    description: 'Wrong target tapped or target missed',
  },
  streak: {
    name: 'streak',
    category: 'challenge',
    volume: 0.5,
    description: 'Streak milestone reached',
  },
  combo: {
    name: 'combo',
    category: 'challenge',
    volume: 0.55,
    description: 'Combo multiplier increased',
  },

  // Achievements
  'level-up': {
    name: 'level-up',
    category: 'achievement',
    volume: 0.7,
    description: 'Player levels up',
  },
  achievement: {
    name: 'achievement',
    category: 'achievement',
    volume: 0.65,
    description: 'Achievement unlocked',
  },
  reward: {
    name: 'reward',
    category: 'achievement',
    volume: 0.6,
    description: 'Reward earned',
  },

  // Navigation
  transition: {
    name: 'transition',
    category: 'navigation',
    volume: 0.25,
    description: 'Screen transition',
  },
  back: {
    name: 'back',
    category: 'navigation',
    volume: 0.3,
    description: 'Back navigation',
  },
  forward: {
    name: 'forward',
    category: 'navigation',
    volume: 0.3,
    description: 'Forward navigation',
  },

  // Special
  countdown: {
    name: 'countdown',
    category: 'special',
    volume: 0.5,
    description: 'Countdown tick',
  },
  'timer-end': {
    name: 'timer-end',
    category: 'special',
    volume: 0.6,
    description: 'Timer expires',
  },
  unlock: {
    name: 'unlock',
    category: 'special',
    volume: 0.55,
    description: 'Feature unlocked',
  },
};
