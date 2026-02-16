import * as Haptics from 'expo-haptics';
import { Animated } from 'react-native';

// Enhanced color palette for challenges - premium dark mode
export const CHALLENGE_COLORS = {
  // Backgrounds - richer, deeper tones
  background: '#0A0E1A', // Deep navy-black with subtle blue tint
  backgroundSecondary: '#0F1419', // Slightly lighter for contrast
  cardBg: '#1A1F2E', // Rich dark blue-gray with depth
  cardBgElevated: '#232937', // Elevated card background
  challengeAreaBg: '#151A26', // Challenge area background
  
  // Text - improved contrast and readability
  textPrimary: '#FFFFFF', // Pure white for maximum contrast
  textSecondary: '#B4B9C4', // Soft gray-blue for secondary text
  textTertiary: '#8B92A3', // Muted for hints/tips
  textAccent: '#E8EAED', // Light accent text
  
  // Accents - vibrant and modern
  accentPrimary: '#00D9FF', // Bright cyan
  accentSecondary: '#00E5CC', // Teal
  accentGold: '#FFD700', // Gold
  accentPurple: '#A855F7', // Purple
  
  // Status colors - enhanced visibility
  success: '#00FF88', // Bright green
  error: '#FF4444', // Bright red
  warning: '#FFB800', // Bright orange
  info: '#00B8FF', // Bright blue
  
  // Progress and UI elements
  progressBg: '#252B3A', // Darker for progress background
  progressFill: '#00D9FF', // Cyan for progress
  border: '#2A3142', // Subtle borders
  borderLight: '#3A4252', // Lighter borders
  
  // Overlays and effects
  overlay: 'rgba(0, 0, 0, 0.6)', // Dark overlay
  glow: 'rgba(0, 217, 255, 0.3)', // Cyan glow
};

// Text style presets for consistency
export const TEXT_STYLES = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: CHALLENGE_COLORS.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: CHALLENGE_COLORS.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: CHALLENGE_COLORS.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 32,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: CHALLENGE_COLORS.textSecondary,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: CHALLENGE_COLORS.textSecondary,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: CHALLENGE_COLORS.textTertiary,
    lineHeight: 20,
  },
  
  // Labels and metadata
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: CHALLENGE_COLORS.textSecondary,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: CHALLENGE_COLORS.textTertiary,
    lineHeight: 18,
  },
  
  // Accent text
  accent: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: CHALLENGE_COLORS.accentPrimary,
    lineHeight: 24,
  },
  accentSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: CHALLENGE_COLORS.accentPrimary,
    lineHeight: 20,
  },
  
  // Numbers and stats
  number: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: CHALLENGE_COLORS.textPrimary,
    letterSpacing: -1,
    lineHeight: 40,
  },
  numberLarge: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: CHALLENGE_COLORS.textPrimary,
    letterSpacing: -1.5,
    lineHeight: 56,
  },
};

// Background style presets
export const BACKGROUND_STYLES = {
  container: {
    backgroundColor: CHALLENGE_COLORS.background,
  },
  card: {
    backgroundColor: CHALLENGE_COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CHALLENGE_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  cardElevated: {
    backgroundColor: CHALLENGE_COLORS.cardBgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CHALLENGE_COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  challengeArea: {
    backgroundColor: CHALLENGE_COLORS.challengeAreaBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CHALLENGE_COLORS.border,
  },
};

// Haptic feedback helpers
export const hapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

// Animation helpers
export const createPulseAnimation = (value: Animated.Value, min: number = 1, max: number = 1.1) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: max,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: min,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );
};

export const createScaleAnimation = (value: Animated.Value, toValue: number = 1.2) => {
  // Stop any existing animations on this value before starting a new one
  // This prevents conflicts when the same animated value is used multiple times
  value.stopAnimation();
  
  return Animated.spring(value, {
    toValue,
    friction: 3,
    tension: 40,
    useNativeDriver: true,
  });
};

export const createShakeAnimation = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

// Score calculation helpers
export const calculateScore = (correct: number, total: number, maxScore: number = 100): number => {
  if (total === 0) return 0;
  return Math.min(maxScore, Math.round((correct / total) * maxScore));
};

export const getScoreColor = (score: number): string => {
  if (score >= 95) return CHALLENGE_COLORS.success;
  if (score >= 80) return CHALLENGE_COLORS.warning;
  return CHALLENGE_COLORS.error;
};

export const getScoreEmoji = (score: number): string => {
  if (score >= 95) return '🎉';
  if (score >= 80) return '⭐';
  if (score >= 60) return '👍';
  return '💪';
};

// Format helpers
export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  return formatTime(seconds);
};

// Accessibility helpers
export const getAccessibilityLabel = (
  challengeName: string,
  action: string,
  state?: string
): string => {
  let label = `${challengeName} challenge`;
  if (state) label += `, ${state}`;
  if (action) label += `. ${action}`;
  return label;
};
