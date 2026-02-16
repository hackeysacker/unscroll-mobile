/**
 * useAnimations Hook
 *
 * Provides animation configuration that respects reducedMotion setting
 * Returns duration values that can be used with Animated API
 */

import { useSettings } from '@/contexts/SettingsContext';

export function useAnimations() {
  const { settings } = useSettings();
  const reducedMotion = settings?.reducedMotion ?? false;

  // Return 0 or very short durations when reduced motion is enabled
  const getDuration = (normalDuration: number): number => {
    return reducedMotion ? 0 : normalDuration;
  };

  const getSpringConfig = (normalConfig: {
    friction?: number;
    tension?: number;
  }) => {
    if (reducedMotion) {
      return {
        friction: 100, // Very high friction = no bounce
        tension: 500,  // Very high tension = instant
      };
    }
    return normalConfig;
  };

  return {
    // Standard durations
    fast: getDuration(200),
    normal: getDuration(400),
    slow: getDuration(600),
    verySlow: getDuration(1000),

    // Custom duration
    duration: getDuration,

    // Spring config
    spring: getSpringConfig,

    // Whether animations are enabled
    enabled: !reducedMotion,
    reducedMotion,
  };
}
