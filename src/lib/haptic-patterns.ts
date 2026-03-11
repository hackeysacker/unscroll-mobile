import * as Haptics from 'expo-haptics';

/**
 * Rich haptic feedback patterns for different interactions
 */
export const HapticPatterns = {
  // Light touch feedback
  lightTouch: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  // Node selection
  nodeSelect: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  // Level complete
  levelComplete: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
  },

  // Unit complete (realm transition)
  realmTransition: async () => {
    for (let i = 0; i < 3; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  },

  // Avatar evolution
  evolution: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 600);
  },

  // Milestone achievement
  milestone: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Locked content tap
  locked: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  // Error or failure
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  // Success confirmation
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // Continuous scroll (call repeatedly)
  scroll: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  // Realm boundary crossed
  realmBoundary: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 50);
  },
};

/**
 * Haptic feedback manager with cooldown to prevent overwhelming
 */
export class HapticManager {
  private lastHaptic: number = 0;
  private cooldown: number = 50; // ms

  canTrigger(): boolean {
    const now = Date.now();
    if (now - this.lastHaptic < this.cooldown) {
      return false;
    }
    this.lastHaptic = now;
    return true;
  }

  trigger(pattern: keyof typeof HapticPatterns) {
    if (this.canTrigger()) {
      HapticPatterns[pattern]();
    }
  }
}
























