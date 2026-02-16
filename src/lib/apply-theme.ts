import type { ThemeColors } from './theme-colors';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Utility to apply theme colors to style objects
 * This allows existing StyleSheet styles to be enhanced with theme colors
 */
export function applyThemeToStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(
  baseStyles: T,
  colors: ThemeColors
): T {
  // Create a new styles object with theme colors applied
  const themedStyles = {} as T;

  for (const [key, style] of Object.entries(baseStyles)) {
    themedStyles[key as keyof T] = {
      ...style,
      // Apply theme colors to common style properties
      ...(('backgroundColor' in style && typeof style.backgroundColor === 'string' && style.backgroundColor.startsWith('#')) 
        ? { backgroundColor: getThemedBackground(style.backgroundColor, colors) }
        : {}),
      ...(('color' in style && typeof style.color === 'string' && style.color.startsWith('#'))
        ? { color: getThemedColor(style.color, colors) }
        : {}),
      ...(('borderColor' in style && typeof style.borderColor === 'string' && style.borderColor.startsWith('#'))
        ? { borderColor: getThemedBorderColor(style.borderColor, colors) }
        : {}),
    } as T[keyof T];
  }

  return themedStyles;
}

function getThemedBackground(original: string, colors: ThemeColors): string {
  // Map common hardcoded background colors to theme colors
  const mapping: Record<string, keyof ThemeColors> = {
    '#0F172A': 'background',
    '#030712': 'background',
    '#111827': 'card',
    '#1E293B': 'card',
    '#1f2937': 'card',
    '#334155': 'muted',
    '#4F46E5': 'primary',
    '#6366f1': 'primary',
  };
  return mapping[original] ? colors[mapping[original]] as string : original;
}

function getThemedColor(original: string, colors: ThemeColors): string {
  // Map common hardcoded text colors to theme colors
  const mapping: Record<string, keyof ThemeColors> = {
    '#ffffff': 'foreground',
    '#F9FAFB': 'foreground',
    '#94A3B8': 'mutedForeground',
    '#9ca3af': 'mutedForeground',
    '#CBD5E1': 'mutedForeground',
    '#E2E8F0': 'mutedForeground',
  };
  return mapping[original] ? colors[mapping[original]] as string : original;
}

function getThemedBorderColor(original: string, colors: ThemeColors): string {
  // Map common hardcoded border colors to theme colors
  const mapping: Record<string, keyof ThemeColors> = {
    '#374151': 'border',
    '#334155': 'border',
    '#1f2937': 'border',
    '#6366f1': 'primary',
    '#4F46E5': 'primary',
  };
  return mapping[original] ? colors[mapping[original]] as string : original;
}
























