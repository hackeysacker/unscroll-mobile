/**
 * Attention Avatar Evolution System
 * 
 * The avatar evolves based on user progress, representing their attention mastery
 */

export type AvatarStage =
  | 'spark'       // Level 1-3: Just starting, a tiny light
  | 'ember'       // Level 4-8: Growing warmth
  | 'flame'       // Level 9-15: Burning bright
  | 'orb'         // Level 16-25: Taking shape
  | 'wisp'        // Level 26-40: Ethereal creature forming
  | 'sprite'      // Level 41-60: Defined creature
  | 'spirit'      // Level 61-85: Powerful spirit
  | 'guardian'    // Level 86-120: Protector of focus
  | 'sage'        // Level 121-160: Wise master
  | 'celestial'   // Level 161-200: Transcendent being
  | 'master';     // Level 200+: Ultimate form

export type AvatarMood = 
  | 'idle'        // Default state
  | 'happy'       // After success
  | 'excited'     // Milestone achieved
  | 'sad'         // Lost hearts
  | 'disappointed'// Broke streak
  | 'sleeping'    // Inactive for days
  | 'celebrating' // Major achievement
  | 'focused'     // During training
  | 'glowing';    // High performance

export type AvatarSkin = 
  | 'default'     // Classic light theme
  | 'fire'        // Warm colors
  | 'water'       // Cool blues
  | 'nature'      // Greens
  | 'cosmic'      // Purple space
  | 'shadow'      // Dark theme
  | 'gold'        // Premium
  | 'rainbow';    // Premium

export interface AvatarEvolution {
  stage: AvatarStage;
  name: string;
  description: string;
  emoji: string;
  minLevel: number;
  maxLevel: number;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
  };
  size: {
    width: number;
    height: number;
  };
  unlockMessage: string;
}

export interface AvatarState {
  stage: AvatarStage;
  mood: AvatarMood;
  skin: AvatarSkin;
  name: string; // User-given name for their avatar
  lastInteraction: number;
  evolutionProgress: number; // 0-100, progress to next stage
  customizations: {
    hasWings: boolean;
    hasCrown: boolean;
    hasAura: boolean;
    particleEffect: 'none' | 'sparkles' | 'flames' | 'stars';
  };
}

export const AVATAR_EVOLUTIONS: Record<AvatarStage, AvatarEvolution> = {
  spark: {
    stage: 'spark',
    name: 'Spark',
    description: 'A tiny flicker of potential awakening',
    emoji: '✨',
    minLevel: 1,
    maxLevel: 3,
    colors: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.5)',
    },
    size: { width: 40, height: 40 },
    unlockMessage: 'Your attention journey begins...',
  },
  ember: {
    stage: 'ember',
    name: 'Ember',
    description: 'Growing warmth and determination',
    emoji: '🔥',
    minLevel: 4,
    maxLevel: 8,
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      glow: 'rgba(249, 115, 22, 0.6)',
    },
    size: { width: 48, height: 48 },
    unlockMessage: 'Your focus is growing stronger!',
  },
  flame: {
    stage: 'flame',
    name: 'Flame',
    description: 'Burning bright with newfound power',
    emoji: '🔥',
    minLevel: 9,
    maxLevel: 15,
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.7)',
    },
    size: { width: 56, height: 56 },
    unlockMessage: 'Your inner fire blazes bright!',
  },
  orb: {
    stage: 'orb',
    name: 'Orb',
    description: 'A crystalline form of pure focus',
    emoji: '🔮',
    minLevel: 16,
    maxLevel: 25,
    colors: {
      primary: '#818cf8',
      secondary: '#6366f1',
      glow: 'rgba(129, 140, 248, 0.7)',
    },
    size: { width: 64, height: 64 },
    unlockMessage: 'Your attention takes solid form!',
  },
  wisp: {
    stage: 'wisp',
    name: 'Wisp',
    description: 'An ethereal creature of gentle power',
    emoji: '👻',
    minLevel: 26,
    maxLevel: 40,
    colors: {
      primary: '#a78bfa',
      secondary: '#8b5cf6',
      glow: 'rgba(167, 139, 250, 0.8)',
    },
    size: { width: 72, height: 80 },
    unlockMessage: 'A creature of focus emerges!',
  },
  sprite: {
    stage: 'sprite',
    name: 'Sprite',
    description: 'A radiant being dancing with energy',
    emoji: '🧚',
    minLevel: 41,
    maxLevel: 60,
    colors: {
      primary: '#c084fc',
      secondary: '#a855f7',
      glow: 'rgba(192, 132, 252, 0.9)',
    },
    size: { width: 80, height: 88 },
    unlockMessage: 'Your attention shines with brilliance!',
  },
  spirit: {
    stage: 'spirit',
    name: 'Spirit',
    description: 'A powerful essence of concentration',
    emoji: '🌟',
    minLevel: 61,
    maxLevel: 85,
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      glow: 'rgba(6, 182, 212, 0.9)',
    },
    size: { width: 88, height: 96 },
    unlockMessage: 'Your spirit grows ever stronger!',
  },
  guardian: {
    stage: 'guardian',
    name: 'Guardian',
    description: 'A mighty protector of mental clarity',
    emoji: '🛡️',
    minLevel: 86,
    maxLevel: 120,
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      glow: 'rgba(16, 185, 129, 1)',
    },
    size: { width: 96, height: 104 },
    unlockMessage: 'You have become a Guardian of Focus!',
  },
  sage: {
    stage: 'sage',
    name: 'Sage',
    description: 'Ancient wisdom flows through you',
    emoji: '🧙',
    minLevel: 121,
    maxLevel: 160,
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      glow: 'rgba(139, 92, 246, 1)',
    },
    size: { width: 104, height: 112 },
    unlockMessage: 'You have achieved Sage-level mastery!',
  },
  celestial: {
    stage: 'celestial',
    name: 'Celestial',
    description: 'A transcendent being of pure awareness',
    emoji: '🌌',
    minLevel: 161,
    maxLevel: 199,
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      glow: 'rgba(236, 72, 153, 1)',
    },
    size: { width: 112, height: 120 },
    unlockMessage: 'You have transcended mortal limits!',
  },
  master: {
    stage: 'master',
    name: 'Attention Master',
    description: 'The ultimate form - perfect focus achieved',
    emoji: '👑',
    minLevel: 200,
    maxLevel: 999,
    colors: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      glow: 'rgba(251, 191, 36, 1)',
    },
    size: { width: 120, height: 128 },
    unlockMessage: 'You have achieved PERFECT ATTENTION!',
  },
};

/**
 * Get avatar stage based on user level
 */
export function getAvatarStage(level: number): AvatarStage {
  if (level >= 200) return 'master';
  if (level >= 161) return 'celestial';
  if (level >= 121) return 'sage';
  if (level >= 86) return 'guardian';
  if (level >= 61) return 'spirit';
  if (level >= 41) return 'sprite';
  if (level >= 26) return 'wisp';
  if (level >= 16) return 'orb';
  if (level >= 9) return 'flame';
  if (level >= 4) return 'ember';
  return 'spark';
}

/**
 * Calculate evolution progress to next stage (0-100)
 */
export function getEvolutionProgress(level: number): number {
  const currentStage = getAvatarStage(level);
  const evolution = AVATAR_EVOLUTIONS[currentStage];
  
  if (level >= evolution.maxLevel) return 100;
  
  const levelRange = evolution.maxLevel - evolution.minLevel + 1;
  const levelInStage = level - evolution.minLevel;
  
  return Math.round((levelInStage / levelRange) * 100);
}

/**
 * Determine avatar mood based on game state
 */
export function determineAvatarMood(params: {
  hearts: number;
  maxHearts: number;
  streak: number;
  lastSessionTime?: number;
  recentPerformance?: number; // 0-100
}): AvatarMood {
  const { hearts, maxHearts, streak, lastSessionTime, recentPerformance } = params;
  
  // Sleeping if inactive for 2+ days
  if (lastSessionTime && Date.now() - lastSessionTime > 2 * 24 * 60 * 60 * 1000) {
    return 'sleeping';
  }
  
  // Disappointed if streak broke
  if (streak === 0 && lastSessionTime && Date.now() - lastSessionTime > 24 * 60 * 60 * 1000) {
    return 'disappointed';
  }
  
  // Sad if low hearts
  if (hearts <= 1) {
    return 'sad';
  }
  
  // Celebrating if perfect performance
  if (recentPerformance && recentPerformance >= 95) {
    return 'celebrating';
  }
  
  // Excited if high performance or good streak
  if ((recentPerformance && recentPerformance >= 80) || streak >= 7) {
    return 'excited';
  }
  
  // Happy if doing well
  if (hearts >= maxHearts - 1 || (recentPerformance && recentPerformance >= 70)) {
    return 'happy';
  }
  
  // Glowing if on a streak
  if (streak >= 3) {
    return 'glowing';
  }
  
  return 'idle';
}

/**
 * Get skin colors
 */
export function getSkinColors(skin: AvatarSkin, baseColors: AvatarEvolution['colors']) {
  const skins: Record<AvatarSkin, AvatarEvolution['colors']> = {
    default: baseColors,
    fire: {
      primary: '#ef4444',
      secondary: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.8)',
    },
    water: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      glow: 'rgba(6, 182, 212, 0.8)',
    },
    nature: {
      primary: '#10b981',
      secondary: '#059669',
      glow: 'rgba(16, 185, 129, 0.8)',
    },
    cosmic: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      glow: 'rgba(139, 92, 246, 0.9)',
    },
    shadow: {
      primary: '#374151',
      secondary: '#1f2937',
      glow: 'rgba(55, 65, 81, 0.7)',
    },
    gold: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      glow: 'rgba(251, 191, 36, 1)',
    },
    rainbow: {
      primary: '#ec4899',
      secondary: '#a855f7',
      glow: 'rgba(236, 72, 153, 0.9)',
    },
  };
  
  return skins[skin];
}

/**
 * Check if avatar should show special effect
 */
export function shouldShowEffect(params: {
  streak: number;
  recentAchievement?: boolean;
  isPremium?: boolean;
}): { show: boolean; effect: 'sparkles' | 'flames' | 'stars' | 'aura' | 'none' } {
  const { streak, recentAchievement, isPremium } = params;
  
  if (recentAchievement) {
    return { show: true, effect: 'stars' };
  }
  
  if (streak >= 14) {
    return { show: true, effect: 'flames' };
  }
  
  if (streak >= 7) {
    return { show: true, effect: 'sparkles' };
  }
  
  if (isPremium) {
    return { show: true, effect: 'aura' };
  }
  
  return { show: false, effect: 'none' };
}

