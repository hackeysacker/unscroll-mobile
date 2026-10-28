/**
 * UNIT TESTS FOR BADGE MECHANICS
 *
 * Covers unlock conditions, progress reporting, rarity grouping, and the
 * guard that prevents duplicate badge awards.
 */

import {
  BADGE_DEFINITIONS,
  initializeBadgeProgress,
  checkBadgeUnlock,
  checkAllBadges,
  getBadgeProgressPercentage,
  getBadgesByRarity,
  getTotalBadgeCount,
} from '../badge-mechanics';
import type {
  BadgeProgress,
  ChallengeResult,
  GameProgress,
  HeartState,
  SkillTreeProgress,
} from '@/types';

const USER_ID = 'user-1';

function makeGameProgress(overrides: Partial<GameProgress> = {}): GameProgress {
  return {
    userId: USER_ID,
    level: 1,
    xp: 0,
    totalXp: 0,
    streak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    streakFreezeUsed: false,
    totalSessionsCompleted: 0,
    totalChallengesCompleted: 0,
    ...overrides,
  };
}

function makeSkillTree(overrides: Partial<SkillTreeProgress> = {}): SkillTreeProgress {
  return {
    userId: USER_ID,
    focus: 0,
    impulseControl: 0,
    distractionResistance: 0,
    ...overrides,
  };
}

function makeHeartState(overrides: Partial<HeartState> = {}): HeartState {
  return {
    userId: USER_ID,
    currentHearts: 5,
    maxHearts: 5,
    lastHeartLost: null,
    lastMidnightReset: null,
    heartRefillSlots: [],
    perfectStreakCount: 0,
    totalHeartsLost: 0,
    totalHeartsGained: 0,
    ...overrides,
  };
}

let resultCounter = 0;
function makeResult(overrides: Partial<ChallengeResult> = {}): ChallengeResult {
  resultCounter += 1;
  return {
    id: `result-${resultCounter}`,
    userId: USER_ID,
    type: 'focus_hold',
    timestamp: Date.now(),
    score: 80,
    duration: 30000,
    xpEarned: 10,
    isPerfect: false,
    ...overrides,
  };
}

describe('Badge Mechanics', () => {
  describe('initializeBadgeProgress', () => {
    it('starts with no unlocked badges and no progress', () => {
      const progress = initializeBadgeProgress(USER_ID);
      expect(progress.userId).toBe(USER_ID);
      expect(progress.unlockedBadges).toEqual([]);
      expect(progress.progress).toEqual({});
    });
  });

  describe('checkBadgeUnlock', () => {
    it('unlocks first_focus after one challenge', () => {
      const badge = checkBadgeUnlock(
        'first_focus',
        initializeBadgeProgress(USER_ID),
        makeGameProgress(),
        makeSkillTree(),
        [makeResult()]
      );
      expect(badge).not.toBeNull();
      expect(badge!.type).toBe('first_focus');
      expect(badge!.name).toBe(BADGE_DEFINITIONS.first_focus.name);
    });

    it('does not unlock first_focus with no results', () => {
      const badge = checkBadgeUnlock(
        'first_focus',
        initializeBadgeProgress(USER_ID),
        makeGameProgress(),
        makeSkillTree(),
        []
      );
      expect(badge).toBeNull();
    });

    it('never awards a badge that is already unlocked', () => {
      const progress = initializeBadgeProgress(USER_ID);
      progress.unlockedBadges.push({
        id: 'existing',
        type: 'first_focus',
        unlockedAt: Date.now(),
        name: BADGE_DEFINITIONS.first_focus.name,
        description: BADGE_DEFINITIONS.first_focus.description,
        icon: BADGE_DEFINITIONS.first_focus.icon,
      });

      const badge = checkBadgeUnlock(
        'first_focus',
        progress,
        makeGameProgress(),
        makeSkillTree(),
        [makeResult()]
      );
      expect(badge).toBeNull();
    });

    it('unlocks first_perfect only when a perfect score exists', () => {
      expect(
        checkBadgeUnlock(
          'first_perfect',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          [makeResult({ isPerfect: false })]
        )
      ).toBeNull();

      expect(
        checkBadgeUnlock(
          'first_perfect',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          [makeResult({ isPerfect: true })]
        )
      ).not.toBeNull();
    });

    it('tracks consecutive perfect scores for hot streaks', () => {
      const results = [
        makeResult({ isPerfect: true }),
        makeResult({ isPerfect: true }),
        makeResult({ isPerfect: true }),
      ];
      const badge = checkBadgeUnlock(
        'hot_streak_3',
        initializeBadgeProgress(USER_ID),
        makeGameProgress(),
        makeSkillTree(),
        results
      );
      expect(badge).not.toBeNull();
    });

    it('breaks the perfect streak when a non-perfect result arrives', () => {
      const results = [
        makeResult({ isPerfect: true }),
        makeResult({ isPerfect: true }),
        makeResult({ isPerfect: false }),
        makeResult({ isPerfect: true }),
      ];
      const badge = checkBadgeUnlock(
        'hot_streak_3',
        initializeBadgeProgress(USER_ID),
        makeGameProgress(),
        makeSkillTree(),
        results
      );
      expect(badge).toBeNull();
    });

    it('unlocks level and xp milestone badges from progress', () => {
      expect(
        checkBadgeUnlock(
          'level_5',
          initializeBadgeProgress(USER_ID),
          makeGameProgress({ level: 5 }),
          makeSkillTree(),
          []
        )
      ).not.toBeNull();

      expect(
        checkBadgeUnlock(
          'xp_100',
          initializeBadgeProgress(USER_ID),
          makeGameProgress({ totalXp: 100 }),
          makeSkillTree(),
          []
        )
      ).not.toBeNull();
    });

    it('unlocks skill mastery badges from the skill tree', () => {
      expect(
        checkBadgeUnlock(
          'focus_master',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree({ focus: 100 }),
          []
        )
      ).not.toBeNull();

      expect(
        checkBadgeUnlock(
          'triple_master',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree({ focus: 100, impulseControl: 100, distractionResistance: 100 }),
          []
        )
      ).not.toBeNull();
    });

    it('requires all three skills for triple_master', () => {
      expect(
        checkBadgeUnlock(
          'triple_master',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree({ focus: 100, impulseControl: 100, distractionResistance: 50 }),
          []
        )
      ).toBeNull();
    });

    it('uses heart state for heart badges', () => {
      expect(
        checkBadgeUnlock(
          'heart_collector',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          [],
          makeHeartState({ totalHeartsGained: 10 })
        )
      ).not.toBeNull();

      expect(
        checkBadgeUnlock(
          'heart_collector',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          [],
          makeHeartState({ totalHeartsGained: 2 })
        )
      ).toBeNull();
    });

    it('unlocks quick_reflexes for a fast high-scoring result', () => {
      expect(
        checkBadgeUnlock(
          'quick_reflexes',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          [makeResult({ duration: 5000, score: 95 })]
        )
      ).not.toBeNull();

      expect(
        checkBadgeUnlock(
          'quick_reflexes',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          [makeResult({ duration: 50000, score: 95 })]
        )
      ).toBeNull();
    });

    it('counts challenge categories for specialist badges', () => {
      const results = Array.from({ length: 5 }, () =>
        makeResult({ type: 'breath_pacing' })
      );
      expect(
        checkBadgeUnlock(
          'breath_beginner',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          results
        )
      ).not.toBeNull();

      expect(
        checkBadgeUnlock(
          'breath_master',
          initializeBadgeProgress(USER_ID),
          makeGameProgress(),
          makeSkillTree(),
          results
        )
      ).toBeNull();
    });
  });

  describe('checkAllBadges', () => {
    it('returns multiple newly unlocked badges at once', () => {
      const badges = checkAllBadges(
        initializeBadgeProgress(USER_ID),
        makeGameProgress({ level: 10, totalXp: 500, streak: 7, totalChallengesCompleted: 25 }),
        makeSkillTree({ focus: 50 }),
        [makeResult({ isPerfect: true }), makeResult({ isPerfect: true })]
      );

      const types = badges.map((b) => b.type);
      expect(types).toContain('first_focus');
      expect(types).toContain('first_perfect');
      expect(types).toContain('level_10');
      expect(types).toContain('streak_7');
      expect(types).toContain('challenges_25');
      expect(types).toContain('focus_journeyman');
    });

    it('returns an empty array for a brand new user', () => {
      const badges = checkAllBadges(
        initializeBadgeProgress(USER_ID),
        makeGameProgress(),
        makeSkillTree(),
        []
      );
      expect(badges).toEqual([]);
    });
  });

  describe('getBadgeProgressPercentage', () => {
    it('reports 100% for an already unlocked badge', () => {
      const progress = initializeBadgeProgress(USER_ID);
      progress.unlockedBadges.push({
        id: 'existing',
        type: 'challenges_10',
        unlockedAt: Date.now(),
        name: BADGE_DEFINITIONS.challenges_10.name,
        description: BADGE_DEFINITIONS.challenges_10.description,
        icon: BADGE_DEFINITIONS.challenges_10.icon,
      });

      const result = getBadgeProgressPercentage(
        'challenges_10',
        progress,
        makeGameProgress(),
        makeSkillTree(),
        []
      );
      expect(result.percentage).toBe(100);
    });

    it('computes a partial percentage for challenge milestones', () => {
      const result = getBadgeProgressPercentage(
        'challenges_25',
        initializeBadgeProgress(USER_ID),
        makeGameProgress({ totalChallengesCompleted: 5 }),
        makeSkillTree(),
        []
      );
      expect(result.current).toBe(5);
      expect(result.target).toBe(25);
      expect(result.percentage).toBe(20);
    });

    it('caps percentage at 100', () => {
      const result = getBadgeProgressPercentage(
        'challenges_10',
        initializeBadgeProgress(USER_ID),
        makeGameProgress({ totalChallengesCompleted: 999 }),
        makeSkillTree(),
        []
      );
      expect(result.percentage).toBe(100);
    });

    it('uses the longest streak when the current streak has reset', () => {
      const result = getBadgeProgressPercentage(
        'streak_7',
        initializeBadgeProgress(USER_ID),
        makeGameProgress({ streak: 0, longestStreak: 7 }),
        makeSkillTree(),
        []
      );
      expect(result.current).toBe(7);
      expect(result.percentage).toBe(100);
    });
  });

  describe('getBadgesByRarity', () => {
    it('returns a non-empty list for every rarity tier', () => {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
      for (const rarity of rarities) {
        const badges = getBadgesByRarity(rarity);
        expect(badges.length).toBeGreaterThan(0);
        for (const type of badges) {
          expect(BADGE_DEFINITIONS[type].rarity).toBe(rarity);
        }
      }
    });

    it('accounts for every defined badge exactly once', () => {
      const all = [
        ...getBadgesByRarity('common'),
        ...getBadgesByRarity('uncommon'),
        ...getBadgesByRarity('rare'),
        ...getBadgesByRarity('epic'),
        ...getBadgesByRarity('legendary'),
      ];
      expect(new Set(all).size).toBe(all.length);
      expect(all.length).toBe(getTotalBadgeCount());
    });
  });

  describe('getTotalBadgeCount', () => {
    it('matches the number of badge definitions', () => {
      expect(getTotalBadgeCount()).toBe(Object.keys(BADGE_DEFINITIONS).length);
    });
  });
});
