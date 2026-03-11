/**
 * Realm Themes for the Progress Path
 * 
 * Each unit (1-10) is a realm with its own visual identity
 * that blends smoothly into the next
 */

export interface RealmTheme {
  id: number;
  name: string;
  description: string;
  emoji: string;
  
  // Visual colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundGradientStart: string;
    backgroundGradientEnd: string;
  };
  
  // Particle/animation style
  particles: {
    type: 'dust' | 'waves' | 'sparks' | 'lines' | 'ribbons' | 'orbs' | 'stars' | 'geometric' | 'energy' | 'aura';
    color: string;
    count: number;
    speed: 'slow' | 'medium' | 'fast';
  };
  
  // Avatar evolution for this realm
  avatarEvolution: {
    description: string;
    visualChanges: string[];
  };
}

export const REALM_THEMES: Record<number, RealmTheme> = {
  1: {
    id: 1,
    name: 'Calm',
    description: 'The beginning of your journey',
    emoji: '🌊',
    colors: {
      primary: '#6B9BD1',
      secondary: '#94B8D8',
      accent: '#B8D4EA',
      background: '#0A1929',
      backgroundGradientStart: '#0A1929',
      backgroundGradientEnd: '#1A2940',
    },
    particles: {
      type: 'waves',
      color: 'rgba(107, 155, 209, 0.3)',
      count: 20,
      speed: 'slow',
    },
    avatarEvolution: {
      description: 'Small soft white light',
      visualChanges: ['Base form', 'Gentle glow', 'Calm presence'],
    },
  },
  
  2: {
    id: 2,
    name: 'Clarity',
    description: 'Clear vision emerges',
    emoji: '✨',
    colors: {
      primary: '#E8F4F8',
      secondary: '#D4E8F0',
      accent: '#B8D9E8',
      background: '#1A2940',
      backgroundGradientStart: '#1A2940',
      backgroundGradientEnd: '#F5F8FA',
    },
    particles: {
      type: 'dust',
      color: 'rgba(232, 244, 248, 0.4)',
      count: 30,
      speed: 'slow',
    },
    avatarEvolution: {
      description: 'Gains sharp glow edges',
      visualChanges: ['Defined edges', 'Brighter core', 'Clear aura'],
    },
  },
  
  3: {
    id: 3,
    name: 'Discipline',
    description: 'Strength through structure',
    emoji: '🔶',
    colors: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#FCD34D',
      background: '#F5F8FA',
      backgroundGradientStart: '#F5F8FA',
      backgroundGradientEnd: '#FEF3C7',
    },
    particles: {
      type: 'geometric',
      color: 'rgba(245, 158, 11, 0.3)',
      count: 15,
      speed: 'medium',
    },
    avatarEvolution: {
      description: 'Light gets denser',
      visualChanges: ['Solid form', 'Steady glow', 'Grounded energy'],
    },
  },
  
  4: {
    id: 4,
    name: 'Flow',
    description: 'Moving with effortless grace',
    emoji: '🌀',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      background: '#FEF3C7',
      backgroundGradientStart: '#FEF3C7',
      backgroundGradientEnd: '#EDE9FE',
    },
    particles: {
      type: 'ribbons',
      color: 'rgba(139, 92, 246, 0.4)',
      count: 12,
      speed: 'medium',
    },
    avatarEvolution: {
      description: 'Small energy trails behind it',
      visualChanges: ['Motion trails', 'Flowing movement', 'Dynamic presence'],
    },
  },
  
  5: {
    id: 5,
    name: 'Balance',
    description: 'Perfect equilibrium achieved',
    emoji: '⚖️',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7',
      background: '#EDE9FE',
      backgroundGradientStart: '#EDE9FE',
      backgroundGradientEnd: '#D1FAE5',
    },
    particles: {
      type: 'orbs',
      color: 'rgba(16, 185, 129, 0.3)',
      count: 18,
      speed: 'slow',
    },
    avatarEvolution: {
      description: 'Color becomes stable',
      visualChanges: ['Harmonious colors', 'Balanced glow', 'Centered energy'],
    },
  },
  
  6: {
    id: 6,
    name: 'Precision',
    description: 'Laser-focused execution',
    emoji: '🎯',
    colors: {
      primary: '#06B6D4',
      secondary: '#22D3EE',
      accent: '#67E8F9',
      background: '#D1FAE5',
      backgroundGradientStart: '#D1FAE5',
      backgroundGradientEnd: '#CFFAFE',
    },
    particles: {
      type: 'lines',
      color: 'rgba(6, 182, 212, 0.4)',
      count: 25,
      speed: 'fast',
    },
    avatarEvolution: {
      description: 'Shape becomes more defined',
      visualChanges: ['Sharp geometry', 'Precise form', 'Clean lines'],
    },
  },
  
  7: {
    id: 7,
    name: 'Reaction',
    description: 'Lightning-fast responses',
    emoji: '⚡',
    colors: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FCA5A5',
      background: '#CFFAFE',
      backgroundGradientStart: '#CFFAFE',
      backgroundGradientEnd: '#FEE2E2',
    },
    particles: {
      type: 'sparks',
      color: 'rgba(239, 68, 68, 0.5)',
      count: 40,
      speed: 'fast',
    },
    avatarEvolution: {
      description: 'Small sparks appear',
      visualChanges: ['Energy bursts', 'Electric edges', 'Quick flashes'],
    },
  },
  
  8: {
    id: 8,
    name: 'Multi-Focus',
    description: 'Mastering multiple streams',
    emoji: '🔀',
    colors: {
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#F9A8D4',
      background: '#FEE2E2',
      backgroundGradientStart: '#FEE2E2',
      backgroundGradientEnd: '#FCE7F3',
    },
    particles: {
      type: 'orbs',
      color: 'rgba(236, 72, 153, 0.4)',
      count: 35,
      speed: 'medium',
    },
    avatarEvolution: {
      description: 'Splits briefly then re-forms',
      visualChanges: ['Dual presence', 'Split energy', 'Unified power'],
    },
  },
  
  9: {
    id: 9,
    name: 'Mastery',
    description: 'True expertise unlocked',
    emoji: '👑',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#DDD6FE',
      background: '#FCE7F3',
      backgroundGradientStart: '#FCE7F3',
      backgroundGradientEnd: '#E9D5FF',
    },
    particles: {
      type: 'stars',
      color: 'rgba(139, 92, 246, 0.5)',
      count: 30,
      speed: 'slow',
    },
    avatarEvolution: {
      description: 'Gets inner core glow',
      visualChanges: ['Radiant core', 'Deep power', 'Master aura'],
    },
  },
  
  10: {
    id: 10,
    name: 'Full Focus',
    description: 'Complete attention mastery',
    emoji: '🌟',
    colors: {
      primary: '#FBBF24',
      secondary: '#FCD34D',
      accent: '#FDE68A',
      background: '#E9D5FF',
      backgroundGradientStart: '#E9D5FF',
      backgroundGradientEnd: '#FEF3C7',
    },
    particles: {
      type: 'aura',
      color: 'rgba(251, 191, 36, 0.6)',
      count: 50,
      speed: 'medium',
    },
    avatarEvolution: {
      description: 'Strong, full glowing form',
      visualChanges: ['Maximum radiance', 'Complete form', 'Perfect focus'],
    },
  },
};

/**
 * Get realm theme for a given level
 */
export function getRealmForLevel(level: number): RealmTheme {
  const unitNumber = Math.ceil(level / 10);
  const clampedUnit = Math.max(1, Math.min(10, unitNumber));
  return REALM_THEMES[clampedUnit];
}

/**
 * Get transition progress between two realms (0-1)
 * Used for smooth color/particle transitions
 */
export function getRealmTransition(level: number): {
  currentRealm: RealmTheme;
  nextRealm: RealmTheme | null;
  progress: number; // 0-1, how far through current realm
} {
  const levelInUnit = ((level - 1) % 10) + 1;
  const currentUnit = Math.ceil(level / 10);
  const nextUnit = Math.min(10, currentUnit + 1);
  
  return {
    currentRealm: REALM_THEMES[currentUnit],
    nextRealm: currentUnit < 10 ? REALM_THEMES[nextUnit] : null,
    progress: levelInUnit / 10,
  };
}

/**
 * Interpolate between two colors based on progress (0-1)
 */
export function interpolateColor(color1: string, color2: string, progress: number): string {
  // Simple hex color interpolation
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
























