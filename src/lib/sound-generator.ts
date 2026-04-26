/**
 * Sound Generator
 *
 * Uses haptics for feedback (expo-av deprecated)
 * Generates haptic feedback for UI interactions
 */

import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
import type { SoundName } from '@/types/sounds';

// Sound profiles mapping to haptic feedback types
type HapticFeedbackType = ImpactFeedbackStyle | NotificationFeedbackType;
const SOUND_PROFILES: Record<SoundName, HapticFeedbackType> = {
  // UI Interactions - Light impact
  tap: ImpactFeedbackStyle.Light,
  toggle: ImpactFeedbackStyle.Light,
  swipe: ImpactFeedbackStyle.Medium,
  select: ImpactFeedbackStyle.Medium,

  // Feedback - Notification types
  success: NotificationFeedbackType.Success,
  error: NotificationFeedbackType.Error,
  warning: NotificationFeedbackType.Warning,
  complete: NotificationFeedbackType.Success,

  // Challenge Events - Medium to Heavy
  'target-appear': ImpactFeedbackStyle.Light,
  'target-hit': ImpactFeedbackStyle.Heavy,
  'target-miss': ImpactFeedbackStyle.Medium,
  streak: ImpactFeedbackStyle.Medium,
  combo: ImpactFeedbackStyle.Heavy,

  // Achievements - Heavy + Success
  'level-up': ImpactFeedbackStyle.Heavy,
  achievement: NotificationFeedbackType.Success,
  reward: NotificationFeedbackType.Success,

  // Navigation - Light
  transition: ImpactFeedbackStyle.Light,
  back: ImpactFeedbackStyle.Light,
  forward: ImpactFeedbackStyle.Light,

  // Special
  countdown: ImpactFeedbackStyle.Medium,
  'timer-end': ImpactFeedbackStyle.Heavy,
  unlock: NotificationFeedbackType.Success,
};

/**
 * Haptic Feedback Generator
 * Uses expo-haptics for tactile feedback
 */
class SoundGenerator {
  private isInitialized = true;

  async initialize() {
    this.isInitialized = true;
  }

  /**
   * Play haptic feedback
   */
  async play(soundName: SoundName, _volume: number = 0.5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const hapticType = SOUND_PROFILES[soundName];
      
      if (!hapticType) {
        console.warn(`Unknown haptic: ${soundName}`);
        return;
      }

      // Determine if it's impact or notification feedback
      if (hapticType === NotificationFeedbackType.Success ||
          hapticType === NotificationFeedbackType.Error ||
          hapticType === NotificationFeedbackType.Warning) {
        await notificationAsync(hapticType);
      } else {
        await impactAsync(hapticType as ImpactFeedbackStyle);
      }

    } catch (error) {
      if (__DEV__) {
        console.error(`Failed to play haptic ${soundName}:`, error);
      }
    }
  }

  /**
   * Cleanup
   */
  async cleanup() {
    // Nothing to clean up for haptics
  }
}

// Export singleton instance
export const soundGenerator = new SoundGenerator();