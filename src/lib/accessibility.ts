/**
 * Accessibility Utilities
 * Provides helpers for screen reader support and accessibility features
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { useState, useEffect } from 'react';

/**
 * Accessibility labels for common UI elements
 */
export const A11Y_LABELS = {
  // Navigation
  backButton: 'Go back',
  closeButton: 'Close',
  menuButton: 'Open menu',
  settingsButton: 'Open settings',

  // Hearts
  heartsDisplay: (current: number, max: number) =>
    `You have ${current} out of ${max} hearts remaining`,
  heartLost: 'You lost a heart',
  heartGained: 'You gained a heart',

  // Progress
  xpDisplay: (current: number, next: number) =>
    `${current} XP earned. ${next} XP until next level`,
  levelDisplay: (level: number) => `Level ${level}`,
  streakDisplay: (streak: number) =>
    `${streak} day streak${streak !== 1 ? 's' : ''}`,

  // Challenges
  challengeButton: (name: string, difficulty: string) =>
    `Start ${name} challenge. Difficulty: ${difficulty}`,
  challengeComplete: (score: number, xp: number) =>
    `Challenge complete! Score: ${score}%. Earned ${xp} XP`,
  perfectScore: 'Perfect score! Bonus XP earned',

  // Leaderboard
  leaderboardRank: (rank: number, total: number) =>
    `You rank ${rank} out of ${total} players`,
  leaderboardEntry: (rank: number, name: string, xp: number) =>
    `Rank ${rank}: ${name} with ${xp} XP`,

  // Daily Challenge
  dailyChallengeAvailable: 'New daily challenge available',
  dailyChallengeComplete: 'Daily challenge completed',
  dailyChallengeStreak: (streak: number) =>
    `Daily challenge streak: ${streak} days`,

  // Friends
  friendRequest: (name: string) => `Friend request from ${name}`,
  friendAccepted: (name: string) => `${name} is now your friend`,

  // Achievements
  achievementUnlocked: (title: string, description: string) =>
    `Achievement unlocked: ${title}. ${description}`,

  // Settings
  settingToggle: (name: string, enabled: boolean) =>
    `${name}: ${enabled ? 'enabled' : 'disabled'}`,

  // General
  loading: 'Loading',
  error: (message: string) => `Error: ${message}`,
  success: (message: string) => `Success: ${message}`,
} as const;

/**
 * Accessibility hints for interactive elements
 */
export const A11Y_HINTS = {
  button: 'Double tap to activate',
  link: 'Double tap to open',
  toggle: 'Double tap to toggle',
  slider: 'Swipe up or down to adjust',
  incrementButton: 'Double tap to increase',
  decrementButton: 'Double tap to decrease',
  dismissable: 'Swipe right to dismiss',
  expandable: 'Double tap to expand',
} as const;

/**
 * Accessibility roles for elements
 */
export const A11Y_ROLES = {
  button: 'button',
  link: 'link',
  header: 'header',
  image: 'image',
  text: 'text',
  adjustable: 'adjustable',
  imageButton: 'imagebutton',
  summary: 'summary',
  alert: 'alert',
} as const;

/**
 * Hook to check if screen reader is enabled
 */
export function useScreenReader() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
      setIsScreenReaderEnabled(enabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return isScreenReaderEnabled;
}

/**
 * Hook to check if reduce motion is enabled
 */
export function useReduceMotion() {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setIsReduceMotionEnabled(enabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return isReduceMotionEnabled;
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Announce with delay (useful after state changes)
 */
export function announceDelayed(message: string, delay: number = 100) {
  setTimeout(() => {
    announceForAccessibility(message);
  }, delay);
}

/**
 * Format number for screen reader
 */
export function formatNumberA11y(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
}

/**
 * Format time for screen reader
 */
export function formatTimeA11y(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);

  return parts.join(', ');
}

/**
 * Format percentage for screen reader
 */
export function formatPercentageA11y(percent: number): string {
  return `${Math.round(percent)} percent`;
}

/**
 * Get accessible progress announcement
 */
export function getProgressA11y(current: number, total: number): string {
  const percent = Math.round((current / total) * 100);
  return `Progress: ${current} of ${total}, ${percent} percent complete`;
}

/**
 * Generate accessible button props
 */
export function getButtonA11y(
  label: string,
  hint?: string,
  disabled: boolean = false
) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint || A11Y_HINTS.button,
    accessibilityRole: A11Y_ROLES.button as any,
    accessibilityState: { disabled },
  };
}

/**
 * Generate accessible toggle props
 */
export function getToggleA11y(
  label: string,
  checked: boolean,
  disabled: boolean = false
) {
  return {
    accessible: true,
    accessibilityLabel: A11Y_LABELS.settingToggle(label, checked),
    accessibilityHint: A11Y_HINTS.toggle,
    accessibilityRole: 'switch' as any,
    accessibilityState: { checked, disabled },
  };
}

/**
 * Generate accessible slider props
 */
export function getSliderA11y(
  label: string,
  value: number,
  min: number,
  max: number
) {
  return {
    accessible: true,
    accessibilityLabel: `${label}: ${value}`,
    accessibilityHint: A11Y_HINTS.slider,
    accessibilityRole: A11Y_ROLES.adjustable as any,
    accessibilityValue: {
      min,
      max,
      now: value,
      text: value.toString(),
    },
  };
}

/**
 * Generate accessible heading props
 */
export function getHeadingA11y(text: string, level: 1 | 2 | 3 = 1) {
  return {
    accessible: true,
    accessibilityLabel: text,
    accessibilityRole: A11Y_ROLES.header as any,
    accessibilityLevel: level,
  };
}

/**
 * Generate accessible image props
 */
export function getImageA11y(description: string) {
  return {
    accessible: true,
    accessibilityLabel: description,
    accessibilityRole: A11Y_ROLES.image as any,
  };
}

/**
 * Generate accessible alert props
 */
export function getAlertA11y(message: string) {
  return {
    accessible: true,
    accessibilityLabel: message,
    accessibilityRole: A11Y_ROLES.alert as any,
    accessibilityLiveRegion: 'polite' as any,
  };
}

/**
 * Check if voice over is running (iOS)
 */
export async function isVoiceOverRunning(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return await AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Check if TalkBack is running (Android)
 */
export async function isTalkBackRunning(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  return await AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Focus on element (useful for screen readers)
 */
export function setAccessibilityFocus(reactTag: number) {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  announceStateChanges: boolean;
  verboseAnnouncements: boolean;
  hapticFeedback: boolean;
}

export const DEFAULT_A11Y_SETTINGS: AccessibilitySettings = {
  screenReaderEnabled: false,
  reduceMotionEnabled: false,
  announceStateChanges: true,
  verboseAnnouncements: false,
  hapticFeedback: true,
};
