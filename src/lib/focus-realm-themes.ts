/**
 * Focus Realm Themes - Vertical Progress Path
 *
 * 25 themed realms representing the journey to complete focus mastery
 * Each realm has 10 levels (250 total levels)
 * Realms flow vertically with smooth dark transitions
 */

export interface FocusRealm {
  id: number;
  name: string;
  theme: string;
  description: string;

  // Visual design
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };

  // Background gradient (vertical flow)
  background: {
    top: string;
    bottom: string;
  };

  // Particle/ambient effects
  particles: {
    type: 'drift' | 'wave' | 'geometric' | 'sparkle' | 'flow' | 'pulse';
    color: string;
    density: 'low' | 'medium' | 'high';
    speed: number; // 0.5 - 2.0
  };

  // Level range
  levels: {
    start: number;
    end: number;
  };
}

/**
 * 10 Focus Realms - Journey into deep focus (250 levels total)
 * Each realm contains 25 levels
 */
export const FOCUS_REALMS: FocusRealm[] = [
  // REALM 1: AWAKENING (Levels 1-25)
  {
    id: 1,
    name: 'Awakening',
    theme: 'First Light',
    description: 'Your journey begins in the depths',
    colors: {
      primary: '#6B5B95',
      secondary: '#402E7A',
      accent: '#9D84B7',
      glow: 'rgba(157, 132, 183, 0.4)',
    },
    background: {
      top: '#1a0f2e',
      bottom: '#2d1b4e',
    },
    particles: {
      type: 'drift',
      color: '#6B5B95',
      density: 'low',
      speed: 0.3,
    },
    levels: { start: 1, end: 25 },
  },

  // REALM 2: BREATH (Levels 26-50)
  {
    id: 2,
    name: 'Breath',
    theme: 'Steady Rhythm',
    description: 'Find your center through breathing',
    colors: {
      primary: '#4A90A4',
      secondary: '#2E5266',
      accent: '#7EBDCE',
      glow: 'rgba(126, 189, 206, 0.4)',
    },
    background: {
      top: '#2d1b4e',
      bottom: '#1e3a52',
    },
    particles: {
      type: 'pulse',
      color: '#4A90A4',
      density: 'low',
      speed: 0.4,
    },
    levels: { start: 26, end: 50 },
  },

  // REALM 3: STILLNESS (Levels 51-75)
  {
    id: 3,
    name: 'Stillness',
    theme: 'Inner Peace',
    description: 'Embrace the quiet within',
    colors: {
      primary: '#3D8B7C',
      secondary: '#2D5F52',
      accent: '#5EBAA8',
      glow: 'rgba(94, 186, 168, 0.4)',
    },
    background: {
      top: '#1e3a52',
      bottom: '#1a4d3f',
    },
    particles: {
      type: 'drift',
      color: '#3D8B7C',
      density: 'low',
      speed: 0.3,
    },
    levels: { start: 51, end: 75 },
  },

  // REALM 4: CLARITY (Levels 76-100)
  {
    id: 4,
    name: 'Clarity',
    theme: 'Open Eyes',
    description: 'See clearly without judgment',
    colors: {
      primary: '#5BA3BF',
      secondary: '#3E6F85',
      accent: '#82C4DB',
      glow: 'rgba(130, 196, 219, 0.4)',
    },
    background: {
      top: '#1a4d3f',
      bottom: '#1e4a66',
    },
    particles: {
      type: 'sparkle',
      color: '#5BA3BF',
      density: 'medium',
      speed: 0.5,
    },
    levels: { start: 76, end: 100 },
  },

  // REALM 5: FLOW (Levels 101-125)
  {
    id: 5,
    name: 'Flow',
    theme: 'Effortless Motion',
    description: 'Move like water through obstacles',
    colors: {
      primary: '#8B5A9B',
      secondary: '#5A3D66',
      accent: '#B87DD1',
      glow: 'rgba(184, 125, 209, 0.45)',
    },
    background: {
      top: '#1e4a66',
      bottom: '#2d1f47',
    },
    particles: {
      type: 'wave',
      color: '#8B5A9B',
      density: 'medium',
      speed: 0.7,
    },
    levels: { start: 101, end: 125 },
  },

  // REALM 6: DISCIPLINE (Levels 126-150)
  {
    id: 6,
    name: 'Discipline',
    theme: 'Iron Will',
    description: 'Forge yourself through repetition',
    colors: {
      primary: '#A85A85',
      secondary: '#7A3D5E',
      accent: '#D17AAF',
      glow: 'rgba(209, 122, 175, 0.4)',
    },
    background: {
      top: '#2d1f47',
      bottom: '#3d1e38',
    },
    particles: {
      type: 'geometric',
      color: '#A85A85',
      density: 'medium',
      speed: 0.4,
    },
    levels: { start: 126, end: 150 },
  },

  // REALM 7: RESILIENCE (Levels 151-175)
  {
    id: 7,
    name: 'Resilience',
    theme: 'Unbreakable',
    description: 'Bend but never break',
    colors: {
      primary: '#D14471',
      secondary: '#A82E52',
      accent: '#E57A99',
      glow: 'rgba(229, 122, 153, 0.6)',
    },
    background: {
      top: '#3d1e38',
      bottom: '#8B2E52',
    },
    particles: {
      type: 'geometric',
      color: '#D14471',
      density: 'medium',
      speed: 0.45,
    },
    levels: { start: 151, end: 175 },
  },

  // REALM 8: INSIGHT (Levels 176-200)
  {
    id: 8,
    name: 'Insight',
    theme: 'Deep Understanding',
    description: 'See the patterns beneath',
    colors: {
      primary: '#D17A99',
      secondary: '#A85A7A',
      accent: '#E5A3BF',
      glow: 'rgba(229, 163, 191, 0.45)',
    },
    background: {
      top: '#8B2E52',
      bottom: '#A85A7A',
    },
    particles: {
      type: 'pulse',
      color: '#D17A99',
      density: 'medium',
      speed: 0.5,
    },
    levels: { start: 176, end: 200 },
  },

  // REALM 9: ASCENSION (Levels 201-225)
  {
    id: 9,
    name: 'Ascension',
    theme: 'Rising Above',
    description: 'Elevate to higher consciousness',
    colors: {
      primary: '#9D71E5',
      secondary: '#7A52C9',
      accent: '#C9A3FF',
      glow: 'rgba(201, 163, 255, 0.7)',
    },
    background: {
      top: '#A85A7A',
      bottom: '#7A71E5',
    },
    particles: {
      type: 'flow',
      color: '#9D71E5',
      density: 'high',
      speed: 0.85,
    },
    levels: { start: 201, end: 225 },
  },

  // REALM 10: ABSOLUTE (Levels 226-250)
  {
    id: 10,
    name: 'Absolute',
    theme: 'Ultimate Reality',
    description: 'The final truth of complete focus',
    colors: {
      primary: '#D4C9FF',
      secondary: '#B7A3E5',
      accent: '#F0E5FF',
      glow: 'rgba(240, 229, 255, 0.8)',
    },
    background: {
      top: '#7A71E5',
      bottom: '#C9B3FF',
    },
    particles: {
      type: 'sparkle',
      color: '#D4C9FF',
      density: 'high',
      speed: 1.0,
    },
    levels: { start: 226, end: 250 },
  },
];

/**
 * Get realm for a specific level
 */
export function getRealmForLevel(level: number): FocusRealm {
  const realm = FOCUS_REALMS.find(r => level >= r.levels.start && level <= r.levels.end);
  return realm || FOCUS_REALMS[0];
}

/**
 * Get transition colors between two realms
 */
export function getRealmTransition(fromLevel: number, toLevel: number): {
  fromRealm: FocusRealm;
  toRealm: FocusRealm;
  progress: number;
} {
  const fromRealm = getRealmForLevel(fromLevel);
  const toRealm = getRealmForLevel(toLevel);

  // Calculate progress through transition
  const levelInRealm = fromLevel - fromRealm.levels.start;
  const realmSize = fromRealm.levels.end - fromRealm.levels.start + 1;
  const progress = levelInRealm / realmSize;

  return { fromRealm, toRealm, progress };
}

/**
 * Interpolate color between two hex colors
 */
export function interpolateColor(color1: string, color2: string, t: number): string {
  const hex = (c: string) => parseInt(c.replace('#', ''), 16);
  const r1 = (hex(color1) >> 16) & 255;
  const g1 = (hex(color1) >> 8) & 255;
  const b1 = hex(color1) & 255;

  const r2 = (hex(color2) >> 16) & 255;
  const g2 = (hex(color2) >> 8) & 255;
  const b2 = hex(color2) & 255;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
