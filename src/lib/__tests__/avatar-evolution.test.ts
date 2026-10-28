/**
 * UNIT TESTS FOR AVATAR EVOLUTION
 *
 * Covers stage thresholds, evolution progress calculation, mood
 * determination, skin palettes, and special-effect selection.
 */

import {
  AVATAR_EVOLUTIONS,
  getAvatarStage,
  getEvolutionProgress,
  determineAvatarMood,
  getSkinColors,
  shouldShowEffect,
  type AvatarSkin,
} from '../avatar-evolution';

describe('Avatar Evolution', () => {
  describe('getAvatarStage', () => {
    it('returns spark for the lowest levels', () => {
      expect(getAvatarStage(1)).toBe('spark');
      expect(getAvatarStage(3)).toBe('spark');
    });

    it('maps level thresholds to the correct stage', () => {
      expect(getAvatarStage(4)).toBe('ember');
      expect(getAvatarStage(9)).toBe('flame');
      expect(getAvatarStage(16)).toBe('orb');
      expect(getAvatarStage(26)).toBe('wisp');
      expect(getAvatarStage(41)).toBe('sprite');
      expect(getAvatarStage(61)).toBe('spirit');
      expect(getAvatarStage(86)).toBe('guardian');
      expect(getAvatarStage(121)).toBe('sage');
      expect(getAvatarStage(161)).toBe('celestial');
      expect(getAvatarStage(200)).toBe('master');
    });

    it('never returns an unknown stage above the cap', () => {
      expect(getAvatarStage(9999)).toBe('master');
      expect(Object.keys(AVATAR_EVOLUTIONS)).toContain(getAvatarStage(9999));
    });
  });

  describe('getEvolutionProgress', () => {
    it('returns 100% at the top of a stage range', () => {
      expect(getEvolutionProgress(3)).toBe(100); // max of spark
    });

    it('returns 0% at the start of a stage', () => {
      expect(getEvolutionProgress(4)).toBe(0); // min of ember
    });

    it('returns a mid-range percentage', () => {
      const progress = getEvolutionProgress(5);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('always stays within 0-100', () => {
      for (let level = 1; level <= 250; level++) {
        const p = getEvolutionProgress(level);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('determineAvatarMood', () => {
    it('is sleeping after two days of inactivity', () => {
      const twoDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(
        determineAvatarMood({ hearts: 5, maxHearts: 5, streak: 10, lastSessionTime: twoDaysAgo })
      ).toBe('sleeping');
    });

    it('is disappointed when the streak broke after a day away', () => {
      const dayAgo = Date.now() - 25 * 60 * 60 * 1000;
      expect(
        determineAvatarMood({ hearts: 5, maxHearts: 5, streak: 0, lastSessionTime: dayAgo })
      ).toBe('disappointed');
    });

    it('is sad at one heart or fewer', () => {
      expect(determineAvatarMood({ hearts: 1, maxHearts: 5, streak: 0 })).toBe('sad');
      expect(determineAvatarMood({ hearts: 0, maxHearts: 5, streak: 0 })).toBe('sad');
    });

    it('is celebrating at 95%+ performance', () => {
      expect(
        determineAvatarMood({ hearts: 5, maxHearts: 5, streak: 0, recentPerformance: 95 })
      ).toBe('celebrating');
    });

    it('is excited at 80%+ performance or a 7-day streak', () => {
      expect(
        determineAvatarMood({ hearts: 5, maxHearts: 5, streak: 0, recentPerformance: 80 })
      ).toBe('excited');
      expect(determineAvatarMood({ hearts: 5, maxHearts: 5, streak: 7 })).toBe('excited');
    });

    it('is happy near full hearts or 70%+ performance', () => {
      expect(determineAvatarMood({ hearts: 4, maxHearts: 5, streak: 0 })).toBe('happy');
      expect(
        determineAvatarMood({ hearts: 5, maxHearts: 5, streak: 0, recentPerformance: 70 })
      ).toBe('happy');
    });

    it('is glowing on a 3+ day streak', () => {
      expect(determineAvatarMood({ hearts: 5, maxHearts: 5, streak: 3 })).toBe('glowing');
    });

    it('falls back to idle with no notable state', () => {
      expect(determineAvatarMood({ hearts: 3, maxHearts: 5, streak: 0 })).toBe('idle');
    });
  });

  describe('getSkinColors', () => {
    const baseColors = {
      primary: '#111111',
      secondary: '#222222',
      glow: 'rgba(0, 0, 0, 0.5)',
    };

    it('returns base colors for the default skin', () => {
      expect(getSkinColors('default', baseColors)).toBe(baseColors);
    });

    it('returns a distinct palette for every named skin', () => {
      const skins: AvatarSkin[] = ['fire', 'water', 'nature', 'cosmic', 'shadow', 'gold', 'rainbow'];
      for (const skin of skins) {
        const colors = getSkinColors(skin, baseColors);
        expect(colors.primary).toBeTruthy();
        expect(colors.secondary).toBeTruthy();
        expect(colors.glow).toBeTruthy();
        expect(colors.primary).not.toBe(baseColors.primary);
      }
    });
  });

  describe('shouldShowEffect', () => {
    it('shows stars right after an achievement', () => {
      expect(shouldShowEffect({ streak: 0, recentAchievement: true })).toEqual({
        show: true,
        effect: 'stars',
      });
    });

    it('shows flames on a 14+ day streak', () => {
      expect(shouldShowEffect({ streak: 14 })).toEqual({ show: true, effect: 'flames' });
    });

    it('shows sparkles on a 7+ day streak', () => {
      expect(shouldShowEffect({ streak: 7 })).toEqual({ show: true, effect: 'sparkles' });
    });

    it('shows an aura for premium users', () => {
      expect(shouldShowEffect({ streak: 0, isPremium: true })).toEqual({ show: true, effect: 'aura' });
    });

    it('shows nothing for a plain user with no streak', () => {
      expect(shouldShowEffect({ streak: 0 })).toEqual({ show: false, effect: 'none' });
    });
  });
});
