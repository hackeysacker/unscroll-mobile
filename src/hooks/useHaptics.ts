/**
 * useHaptics Hook
 *
 * Provides haptic feedback functions that respect user settings
 * Automatically checks if vibration is enabled before triggering haptics
 */

import * as Haptics from 'expo-haptics';
import { useSettings } from '@/contexts/SettingsContext';

export function useHaptics() {
  const { settings } = useSettings();

  const impactLight = () => {
    if (settings?.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const impactMedium = () => {
    if (settings?.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const impactHeavy = () => {
    if (settings?.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const notificationSuccess = () => {
    if (settings?.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const notificationWarning = () => {
    if (settings?.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const notificationError = () => {
    if (settings?.vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const selectionChanged = () => {
    if (settings?.vibrationEnabled) {
      Haptics.selectionAsync();
    }
  };

  return {
    impactLight,
    impactMedium,
    impactHeavy,
    notificationSuccess,
    notificationWarning,
    notificationError,
    selectionChanged,
    isEnabled: settings?.vibrationEnabled ?? true,
  };
}
