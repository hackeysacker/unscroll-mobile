/**
 * Sound Generator
 *
 * Uses haptics for feedback (expo-av deprecated)
 * Generates haptic feedback for UI interactions
 */

import * as Haptics from 'expo-haptics';
import type { SoundName } from '@/types/sounds';

// Sound profiles mapping to haptic feedback types
const SOUND_PROFILES: Record<SoundName, Haptics.HapticsImpactStyle | Haptics.HapticsNotificationFeedbackType> = {
  // UI Interactions - Light impact
  tap: Haptics.ImpactFeedbackStyle.Light,
  toggle: Haptics.ImpactFeedbackStyle.Light,
  swipe: Haptics.ImpactFeedbackStyle.Medium,
  select: Haptics.ImpactFeedbackStyle.Medium,

  // Feedback - Notification types
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
  complete: Haptics.NotificationFeedbackType.Success,

  // Challenge Events - Medium to Heavy
  'target-appear': Haptics.ImpactFeedbackStyle.Light,
  'target-hit': Haptics.ImpactFeedbackStyle.Heavy,
  'target-miss': Haptics.ImpactFeedbackStyle.Medium,
  streak: Haptics.ImpactFeedbackStyle.Medium,
  combo: Haptics.ImpactFeedbackStyle.Heavy,

  // Achievements - Heavy + Success
  'level-up': Haptics.ImpactFeedbackStyle.Heavy,
  achievement: Haptics.NotificationFeedbackType.Success,
  reward: Haptics.NotificationFeedbackType.Success,

  // Navigation - Light
  transition: Haptics.ImpactFeedbackStyle.Light,
  back: Haptics.ImpactFeedbackStyle.Light,
  forward: Haptics.ImpactFeedbackStyle.Light,

  // Special
  countdown: Haptics.ImpactFeedbackStyle.Medium,
  'timer-end': Haptics.ImpactFeedbackStyle.Heavy,
  unlock: Haptics.NotificationFeedbackType.Success,
};

/**
 * Haptic Feedback Generator
 * Uses expo-haptics for tactile feedback
 */
class SoundGenerator {
  private isInitialized = true;

  async initialize() {
    // No initialization needed for haptics
    this.isInitialized = true;
  }

  /**
   * Play haptic feedback
   */
  async play(soundName: SoundName, volume: number = 0.5) {
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
      if (typeof hapticType === 'string' && hapticType.includes('Success') || 
          hapticType === Haptics.NotificationFeedbackType.Success ||
          hapticType === Haptics.NotificationFeedbackType.Error ||
          hapticType === Haptics.NotificationFeedbackType.Warning) {
        // Notification feedback
        await Haptics.notificationAsync(hapticType as Haptics.HapticsNotificationFeedbackType);
      } else {
        // Impact feedback
        await Haptics.impactAsync(hapticType as Haptics.HapticsImpactStyle);
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
