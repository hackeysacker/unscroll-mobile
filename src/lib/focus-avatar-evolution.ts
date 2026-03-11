/**
 * Focus Avatar Evolution System
 *
 * The avatar evolves once per unit (10 total evolutions)
 * Each evolution adds new visual features representing growing focus ability
 */

export type FocusAvatarStage =
  | 'calm'          // Unit 1: Soft white light
  | 'clarity'       // Unit 2: Sharper edges
  | 'discipline'    // Unit 3: Denser glow
  | 'flow'          // Unit 4: Light energy trails
  | 'balance'       // Unit 5: Stable color core
  | 'precision'     // Unit 6: Defined geometric shape
  | 'reaction'      // Unit 7: Small sparks
  | 'multi_focus'   // Unit 8: Brief split animations
  | 'mastery'       // Unit 9: Inner core illumination
  | 'full_focus';   // Unit 10: Strong finished glowing form

export interface FocusAvatarEvolution {
  stage: FocusAvatarStage;
  unitNumber: number;
  name: string;
  description: string;

  // Visual properties
  shape: {
    type: 'orb' | 'geometric' | 'complex';
    size: number; // Base size multiplier
    edges: number; // 0 = smooth circle, higher = more defined
    complexity: number; // 1-10 detail level
  };

  // Glow and light
  glow: {
    intensity: number; // 0-1
    radius: number; // Glow spread
    pulseSpeed: number; // Animation speed
    layers: number; // Number of glow layers
  };

  // Energy trails
  trails: {
    enabled: boolean;
    count: number; // Number of trailing particles
    length: number; // Trail length
    fadeSpeed: number;
  };

  // Special effects
  effects: {
    sparks: boolean;
    split: boolean; // Split into multiple forms briefly
    coreGlow: boolean; // Inner illuminated core
    geometricPattern: boolean;
  };

  // Colors (will blend with realm colors)
  colors: {
    core: string;
    glow: string;
    trail: string;
  };

  unlockMessage: string;
}

/**
 * 10 Avatar Evolution Stages (One per unit)
 */
export const FOCUS_AVATAR_EVOLUTIONS: Record<FocusAvatarStage, FocusAvatarEvolution> = {
  // UNIT 1: CALM - Soft white light
  calm: {
    stage: 'calm',
    unitNumber: 1,
    name: 'Gentle Light',
    description: 'A soft white glow emerges from stillness',
    shape: {
      type: 'orb',
      size: 1.0,
      edges: 0,
      complexity: 1,
    },
    glow: {
      intensity: 0.3,
      radius: 20,
      pulseSpeed: 2.0,
      layers: 1,
    },
    trails: {
      enabled: false,
      count: 0,
      length: 0,
      fadeSpeed: 0,
    },
    effects: {
      sparks: false,
      split: false,
      coreGlow: false,
      geometricPattern: false,
    },
    colors: {
      core: '#FFFFFF',
      glow: 'rgba(255, 255, 255, 0.3)',
      trail: '#FFFFFF',
    },
    unlockMessage: 'Your focus awakens as a gentle light',
  },

  // UNIT 2: CLARITY - Sharper edges
  clarity: {
    stage: 'clarity',
    unitNumber: 2,
    name: 'Clear Orb',
    description: 'The light crystallizes with defined edges',
    shape: {
      type: 'orb',
      size: 1.1,
      edges: 2,
      complexity: 2,
    },
    glow: {
      intensity: 0.4,
      radius: 25,
      pulseSpeed: 1.8,
      layers: 2,
    },
    trails: {
      enabled: false,
      count: 0,
      length: 0,
      fadeSpeed: 0,
    },
    effects: {
      sparks: false,
      split: false,
      coreGlow: false,
      geometricPattern: false,
    },
    colors: {
      core: '#FFF9E6',
      glow: 'rgba(255, 249, 230, 0.4)',
      trail: '#FFE5B4',
    },
    unlockMessage: 'Your vision sharpens into clarity',
  },

  // UNIT 3: DISCIPLINE - Denser glow
  discipline: {
    stage: 'discipline',
    unitNumber: 3,
    name: 'Solid Core',
    description: 'The glow intensifies and solidifies',
    shape: {
      type: 'orb',
      size: 1.2,
      edges: 3,
      complexity: 3,
    },
    glow: {
      intensity: 0.6,
      radius: 30,
      pulseSpeed: 1.5,
      layers: 3,
    },
    trails: {
      enabled: false,
      count: 0,
      length: 0,
      fadeSpeed: 0,
    },
    effects: {
      sparks: false,
      split: false,
      coreGlow: false,
      geometricPattern: false,
    },
    colors: {
      core: '#8B7355',
      glow: 'rgba(139, 115, 85, 0.6)',
      trail: '#A0826D',
    },
    unlockMessage: 'Your discipline forges an unbreakable core',
  },

  // UNIT 4: FLOW - Light energy trails
  flow: {
    stage: 'flow',
    unitNumber: 4,
    name: 'Flowing Energy',
    description: 'Graceful trails of light follow your movement',
    shape: {
      type: 'orb',
      size: 1.3,
      edges: 3,
      complexity: 4,
    },
    glow: {
      intensity: 0.5,
      radius: 35,
      pulseSpeed: 1.2,
      layers: 3,
    },
    trails: {
      enabled: true,
      count: 3,
      length: 40,
      fadeSpeed: 0.8,
    },
    effects: {
      sparks: false,
      split: false,
      coreGlow: false,
      geometricPattern: false,
    },
    colors: {
      core: '#4A90A4',
      glow: 'rgba(74, 144, 164, 0.5)',
      trail: '#7BC8DB',
    },
    unlockMessage: 'You flow like water, leaving trails of energy',
  },

  // UNIT 5: BALANCE - Stable color core
  balance: {
    stage: 'balance',
    unitNumber: 5,
    name: 'Harmonized Core',
    description: 'Perfect balance creates a stable, vibrant center',
    shape: {
      type: 'orb',
      size: 1.4,
      edges: 4,
      complexity: 5,
    },
    glow: {
      intensity: 0.6,
      radius: 38,
      pulseSpeed: 1.0,
      layers: 4,
    },
    trails: {
      enabled: true,
      count: 4,
      length: 45,
      fadeSpeed: 0.7,
    },
    effects: {
      sparks: false,
      split: false,
      coreGlow: true,
      geometricPattern: false,
    },
    colors: {
      core: '#9B7EBD',
      glow: 'rgba(155, 126, 189, 0.5)',
      trail: '#D4C4F0',
    },
    unlockMessage: 'Perfect equilibrium illuminates your core',
  },

  // UNIT 6: PRECISION - Defined geometric shape
  precision: {
    stage: 'precision',
    unitNumber: 6,
    name: 'Crystal Form',
    description: 'Precision refines you into perfect geometry',
    shape: {
      type: 'geometric',
      size: 1.5,
      edges: 8,
      complexity: 7,
    },
    glow: {
      intensity: 0.7,
      radius: 40,
      pulseSpeed: 0.9,
      layers: 4,
    },
    trails: {
      enabled: true,
      count: 5,
      length: 50,
      fadeSpeed: 0.6,
    },
    effects: {
      sparks: false,
      split: false,
      coreGlow: true,
      geometricPattern: true,
    },
    colors: {
      core: '#C0C0C0',
      glow: 'rgba(192, 192, 192, 0.7)',
      trail: '#E8E8E8',
    },
    unlockMessage: 'Your focus crystallizes into perfect form',
  },

  // UNIT 7: REACTION - Small sparks
  reaction: {
    stage: 'reaction',
    unitNumber: 7,
    name: 'Lightning Core',
    description: 'Electric sparks crackle around you',
    shape: {
      type: 'geometric',
      size: 1.6,
      edges: 8,
      complexity: 8,
    },
    glow: {
      intensity: 0.8,
      radius: 42,
      pulseSpeed: 0.7,
      layers: 5,
    },
    trails: {
      enabled: true,
      count: 6,
      length: 55,
      fadeSpeed: 0.9,
    },
    effects: {
      sparks: true,
      split: false,
      coreGlow: true,
      geometricPattern: true,
    },
    colors: {
      core: '#FFB347',
      glow: 'rgba(255, 179, 71, 0.6)',
      trail: '#FFD993',
    },
    unlockMessage: 'Lightning-fast reactions spark around you',
  },

  // UNIT 8: MULTI FOCUS - Brief split animations
  multi_focus: {
    stage: 'multi_focus',
    unitNumber: 8,
    name: 'Fractured Unity',
    description: 'Your essence splits and reunites seamlessly',
    shape: {
      type: 'complex',
      size: 1.7,
      edges: 12,
      complexity: 9,
    },
    glow: {
      intensity: 0.8,
      radius: 45,
      pulseSpeed: 0.6,
      layers: 5,
    },
    trails: {
      enabled: true,
      count: 8,
      length: 60,
      fadeSpeed: 1.0,
    },
    effects: {
      sparks: true,
      split: true,
      coreGlow: true,
      geometricPattern: true,
    },
    colors: {
      core: '#4ECDC4',
      glow: 'rgba(78, 205, 196, 0.6)',
      trail: '#8EE5E0',
    },
    unlockMessage: 'Your attention divides without losing strength',
  },

  // UNIT 9: MASTERY - Inner core illumination
  mastery: {
    stage: 'mastery',
    unitNumber: 9,
    name: 'Illuminated Master',
    description: 'Radiant power emanates from your enlightened core',
    shape: {
      type: 'complex',
      size: 1.8,
      edges: 16,
      complexity: 10,
    },
    glow: {
      intensity: 0.9,
      radius: 50,
      pulseSpeed: 0.5,
      layers: 6,
    },
    trails: {
      enabled: true,
      count: 10,
      length: 70,
      fadeSpeed: 1.1,
    },
    effects: {
      sparks: true,
      split: true,
      coreGlow: true,
      geometricPattern: true,
    },
    colors: {
      core: '#9370DB',
      glow: 'rgba(147, 112, 219, 0.8)',
      trail: '#BFAEE5',
    },
    unlockMessage: 'You have transcended into mastery',
  },

  // UNIT 10: FULL FOCUS - Strong finished glowing form
  full_focus: {
    stage: 'full_focus',
    unitNumber: 10,
    name: 'Perfect Focus',
    description: 'Ultimate union of mind and energy - the complete form',
    shape: {
      type: 'complex',
      size: 2.0,
      edges: 20,
      complexity: 10,
    },
    glow: {
      intensity: 1.0,
      radius: 60,
      pulseSpeed: 0.4,
      layers: 7,
    },
    trails: {
      enabled: true,
      count: 12,
      length: 80,
      fadeSpeed: 1.2,
    },
    effects: {
      sparks: true,
      split: true,
      coreGlow: true,
      geometricPattern: true,
    },
    colors: {
      core: '#FFD700',
      glow: 'rgba(255, 215, 0, 1)',
      trail: '#FFF19A',
    },
    unlockMessage: 'You have achieved PERFECT FOCUS - The ultimate form!',
  },
};

/**
 * Get avatar stage based on current level (for 250 levels)
 * Avatar evolves every 25 levels
 */
export function getAvatarStageForLevel(level: number): FocusAvatarStage {
  if (level >= 226) return 'full_focus';  // Levels 226-250
  if (level >= 201) return 'mastery';      // Levels 201-225
  if (level >= 176) return 'multi_focus';  // Levels 176-200
  if (level >= 151) return 'reaction';     // Levels 151-175
  if (level >= 126) return 'precision';    // Levels 126-150
  if (level >= 101) return 'balance';      // Levels 101-125
  if (level >= 76) return 'flow';          // Levels 76-100
  if (level >= 51) return 'discipline';    // Levels 51-75
  if (level >= 26) return 'clarity';       // Levels 26-50
  return 'calm';                            // Levels 1-25
}

/**
 * Get evolution progress within current evolution tier (0-100)
 */
export function getUnitProgress(level: number): number {
  const evolutionTier = Math.ceil(level / 25);
  const levelInTier = ((level - 1) % 25) + 1;
  return Math.round((levelInTier / 25) * 100);
}

/**
 * Check if level triggers evolution (every 25 levels)
 */
export function isEvolutionLevel(level: number): boolean {
  return level % 25 === 1 && level > 1;
}

/**
 * Get the next evolution stage
 */
export function getNextEvolution(currentStage: FocusAvatarStage): FocusAvatarEvolution | null {
  const stages: FocusAvatarStage[] = [
    'calm', 'clarity', 'discipline', 'flow', 'balance',
    'precision', 'reaction', 'multi_focus', 'mastery', 'full_focus'
  ];

  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null;
  }

  return FOCUS_AVATAR_EVOLUTIONS[stages[currentIndex + 1]];
}
