import type { ThemeType } from '@/types';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  // Animated theme-specific colors
  gradientStart?: string;
  gradientEnd?: string;
  shadowColor?: string;
}

/**
 * Stunning theme color palettes - 8 distinctive, beautiful themes
 * Each creates an immersive, memorable experience
 */
export const THEME_COLORS: Record<ThemeType, ThemeColors> = {
  
  // ===== DARK THEMES =====

  // 🎬 Noir Cinema - Dramatic film noir with warm amber highlights
  'noir-cinema': {
    background: '#0C0A09',
    foreground: '#FAFAF9',
    card: '#1C1917',
    cardForeground: '#FAFAF9',
    primary: '#F59E0B',
    primaryForeground: '#0C0A09',
    secondary: '#292524',
    secondaryForeground: '#FAFAF9',
    accent: '#FCD34D',
    accentForeground: '#0C0A09',
    muted: '#292524',
    mutedForeground: '#A8A29E',
    border: '#44403C',
    input: '#292524',
    ring: '#F59E0B',
    success: '#84CC16',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#F59E0B',
    gradientStart: '#0C0A09',
    gradientEnd: '#292524',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
  },

  // 🌸 Tokyo Neon - Cyberpunk electric pink & cyan
  'tokyo-neon': {
    background: '#030712',
    foreground: '#F9FAFB',
    card: '#111827',
    cardForeground: '#F9FAFB',
    primary: '#EC4899',
    primaryForeground: '#FFFFFF',
    secondary: '#4A044E',
    secondaryForeground: '#FDF4FF',
    accent: '#06B6D4',
    accentForeground: '#030712',
    muted: '#1F2937',
    mutedForeground: '#9CA3AF',
    border: '#831843',
    input: '#1F2937',
    ring: '#EC4899',
    success: '#06B6D4',
    warning: '#F59E0B',
    error: '#F43F5E',
    info: '#EC4899',
    gradientStart: '#030712',
    gradientEnd: '#4A044E',
    shadowColor: 'rgba(236, 72, 153, 0.35)',
  },

  // 🌌 Arctic Aurora - Deep arctic blues with aurora greens
  'arctic-aurora': {
    background: '#0F172A',
    foreground: '#F0FDFA',
    card: '#1E293B',
    cardForeground: '#F0FDFA',
    primary: '#2DD4BF',
    primaryForeground: '#042F2E',
    secondary: '#083344',
    secondaryForeground: '#ECFEFF',
    accent: '#22D3EE',
    accentForeground: '#0F172A',
    muted: '#1E293B',
    mutedForeground: '#94A3B8',
    border: '#155E75',
    input: '#1E293B',
    ring: '#2DD4BF',
    success: '#2DD4BF',
    warning: '#FBBF24',
    error: '#FB7185',
    info: '#22D3EE',
    gradientStart: '#0F172A',
    gradientEnd: '#083344',
    shadowColor: 'rgba(45, 212, 191, 0.30)',
  },

  // 💎 Rose Quartz - Luxurious dark with rose gold shimmer
  'rose-quartz': {
    background: '#18181B',
    foreground: '#FFF1F2',
    card: '#27272A',
    cardForeground: '#FFF1F2',
    primary: '#FB7185',
    primaryForeground: '#18181B',
    secondary: '#4C0519',
    secondaryForeground: '#FFF1F2',
    accent: '#FDA4AF',
    accentForeground: '#18181B',
    muted: '#3F3F46',
    mutedForeground: '#A1A1AA',
    border: '#9F1239',
    input: '#3F3F46',
    ring: '#FB7185',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F43F5E',
    info: '#FB7185',
    gradientStart: '#18181B',
    gradientEnd: '#4C0519',
    shadowColor: 'rgba(251, 113, 133, 0.30)',
  },

  // 🍵 Matcha Zen - Japanese-inspired deep matcha & cream
  'matcha-zen': {
    background: '#1C1917',
    foreground: '#F5F5F4',
    card: '#292524',
    cardForeground: '#F5F5F4',
    primary: '#84CC16',
    primaryForeground: '#1A2E05',
    secondary: '#14532D',
    secondaryForeground: '#F0FDF4',
    accent: '#A3E635',
    accentForeground: '#1C1917',
    muted: '#44403C',
    mutedForeground: '#A8A29E',
    border: '#166534',
    input: '#44403C',
    ring: '#84CC16',
    success: '#84CC16',
    warning: '#FDE047',
    error: '#EF4444',
    info: '#22D3EE',
    gradientStart: '#1C1917',
    gradientEnd: '#14532D',
    shadowColor: 'rgba(132, 204, 22, 0.25)',
  },

  // 🌌 Cosmic Void - Ultra-deep space with nebula purples
  'cosmic-void': {
    background: '#030303',
    foreground: '#FAF5FF',
    card: '#18181B',
    cardForeground: '#FAF5FF',
    primary: '#A855F7',
    primaryForeground: '#FFFFFF',
    secondary: '#2E1065',
    secondaryForeground: '#F5F3FF',
    accent: '#C084FC',
    accentForeground: '#030303',
    muted: '#27272A',
    mutedForeground: '#A1A1AA',
    border: '#581C87',
    input: '#27272A',
    ring: '#A855F7',
    success: '#C084FC',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#A855F7',
    gradientStart: '#030303',
    gradientEnd: '#2E1065',
    shadowColor: 'rgba(168, 85, 247, 0.35)',
  },

  // ===== LIGHT THEMES =====

  // 🔮 Aura Glass - Ethereal frosted lavender dreamscape
  'aura-glass': {
    background: '#F5F3FF',
    foreground: '#1E1B4B',
    card: '#EDE9FE',
    cardForeground: '#1E1B4B',
    primary: '#8B5CF6',
    primaryForeground: '#FFFFFF',
    secondary: '#DDD6FE',
    secondaryForeground: '#4C1D95',
    accent: '#A78BFA',
    accentForeground: '#FFFFFF',
    muted: '#EDE9FE',
    mutedForeground: '#6D28D9',
    border: '#C4B5FD',
    input: '#EDE9FE',
    ring: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#8B5CF6',
    gradientStart: '#F5F3FF',
    gradientEnd: '#DDD6FE',
    shadowColor: 'rgba(139, 92, 246, 0.20)',
  },

  // 📜 Paper Craft - Artisanal warm off-white & terracotta
  'paper-craft': {
    background: '#FFFBEB',
    foreground: '#451A03',
    card: '#FEF3C7',
    cardForeground: '#451A03',
    primary: '#EA580C',
    primaryForeground: '#FFFFFF',
    secondary: '#FED7AA',
    secondaryForeground: '#9A3412',
    accent: '#FB923C',
    accentForeground: '#FFFFFF',
    muted: '#FEF3C7',
    mutedForeground: '#9A3412',
    border: '#FDBA74',
    input: '#FEF3C7',
    ring: '#EA580C',
    success: '#16A34A',
    warning: '#EA580C',
    error: '#DC2626',
    info: '#0284C7',
    gradientStart: '#FFFBEB',
    gradientEnd: '#FEF3C7',
    shadowColor: 'rgba(234, 88, 12, 0.15)',
  },
};

/**
 * Get theme colors for a specific theme
 */
export function getThemeColors(theme: ThemeType): ThemeColors {
  return THEME_COLORS[theme] || THEME_COLORS['noir-cinema'];
}

/**
 * Get animated gradient colors for a theme
 */
export function getThemeGradient(theme: ThemeType): [string, string] {
  const colors = getThemeColors(theme);
  return [colors.gradientStart || colors.background, colors.gradientEnd || colors.background];
}
