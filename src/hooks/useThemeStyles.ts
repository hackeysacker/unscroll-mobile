import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Hook that provides theme-aware styles
 * Returns a function to create styles with theme colors applied
 */
export function useThemeStyles() {
  const { colors } = useTheme();

  const createStyles = useMemo(() => {
    return <T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(
      stylesFn: (colors: typeof colors) => T
    ): T => {
      return StyleSheet.create(stylesFn(colors));
    };
  }, [colors]);

  return {
    colors,
    createStyles,
    // Direct color aliases for convenience
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    surface: colors.surface,
    accent: colors.accent,
    border: colors.border,
    // Common theme-aware style helpers
    common: {
      container: {
        flex: 1,
        backgroundColor: colors.background,
      } as ViewStyle,
      card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      } as ViewStyle,
      text: {
        color: colors.foreground,
      } as TextStyle,
      textMuted: {
        color: colors.mutedForeground,
      } as TextStyle,
      primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
      } as ViewStyle,
      primaryButtonText: {
        color: colors.primaryForeground,
        fontWeight: '600',
      } as TextStyle,
      secondaryButton: {
        backgroundColor: colors.secondary,
        borderRadius: 12,
        padding: 16,
      } as ViewStyle,
      secondaryButtonText: {
        color: colors.secondaryForeground,
        fontWeight: '600',
      } as TextStyle,
    },
  };
}
























