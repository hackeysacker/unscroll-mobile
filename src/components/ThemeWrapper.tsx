import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ThemeWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that applies theme colors and updates status bar
 */
export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { colors } = useTheme();

  // Determine if theme is dark based on background lightness
  const isDark = colors.background === '#030712' || 
                 colors.background === '#2e1065' || 
                 colors.background === '#0c4a6e' ||
                 colors.background === '#431407' ||
                 colors.background === '#052e16';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </>
  );
}

