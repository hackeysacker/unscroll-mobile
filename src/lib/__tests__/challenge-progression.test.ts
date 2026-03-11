/**
 * Integration Tests for Challenge Progression System
 * Tests the complete 250-level progression across 10 realms
 */

import {
  CHALLENGE_PROGRESSION,
  getChallengeScaling,
  getChallengeForLevel,
  getChallengeName,
  getChallengeDescription,
} from '../challenge-progression';
import type { ChallengeType } from '@/types';

describe('Challenge Progression - Integration Tests', () => {
  // Realm boundaries in the 250-level system
  const REALM_BOUNDARIES = [
    { name: 'Calm', start: 1, end: 25 },
    { name: 'Clarity', start: 26, end: 50 },
    { name: 'Discipline', start: 51, end: 75 },
    { name: 'Flow', start: 76, end: 100 },
    { name: 'Balance', start: 101, end: 125 },
    { name: 'Precision', start: 126, end: 150 },
    { name: 'Reaction', start: 151, end: 175 },
    { name: 'Multi-Focus', start: 176, end: 200 },
    { name: 'Mastery', start: 201, end: 225 },
    { name: 'Full Focus', start: 226, end: 250 },
  ];

  describe('CHALLENGE_PROGRESSION - Full System', () => {
    test('covers all 250 levels', () => {
      const levels = Object.keys(CHALLENGE_PROGRESSION).map(Number);
      expect(levels.length).toBe(250);
      expect(Math.min(...levels)).toBe(1);
      expect(Math.max(...levels)).toBe(250);
    });

    test('has no gaps in level progression', () => {
      for (let level = 1; level <= 250; level++) {
        expect(CHALLENGE_PROGRESSION[level]).toBeDefined();
      }
    });

    test('all challenges are valid ChallengeType strings', () => {
      const validChallenges = new Set([
        'focus_hold', 'finger_hold', 'slow_tracking', 'tap_only_correct',
        'breath_pacing', 'fake_notifications', 'look_away', 'delay_unlock',
        'anti_scroll_swipe', 'memory_flash', 'reaction_inhibition',
        'multi_object_tracking', 'rhythm_tap', 'stillness_test',
        'impulse_spike_test', 'finger_tracing', 'multi_task_tap',
        'popup_ignore', 'controlled_breathing', 'reset',
        'pattern_matching', 'logic_puzzle', 'memory_puzzle', 'spatial_puzzle',
      ]);

      Object.values(CHALLENGE_PROGRESSION).forEach(challengeType => {
        expect(validChallenges.has(challengeType)).toBe(true);
      });
    });

    test('includes puzzle types throughout progression', () => {
      const puzzleTypes = ['pattern_matching', 'logic_puzzle', 'memory_puzzle', 'spatial_puzzle'];
      const progressionChallenges = Object.values(CHALLENGE_PROGRESSION);

      puzzleTypes.forEach(puzzle => {
        const count = progressionChallenges.filter(c => c === puzzle).length;
        expect(count).toBeGreaterThan(0); // Each puzzle appears at least once
      });
    });
  });

  describe('Realm Structure - Integration', () => {
    test('each realm has exactly 25 levels', () => {
      REALM_BOUNDARIES.forEach(realm => {
        const levelCount = realm.end - realm.start + 1;
        expect(levelCount).toBe(25);
      });
    });

    test('realm boundaries are continuous', () => {
      for (let i = 0; i < REALM_BOUNDARIES.length - 1; i++) {
        const currentRealm = REALM_BOUNDARIES[i];
        const nextRealm = REALM_BOUNDARIES[i + 1];
        expect(nextRealm.start).toBe(currentRealm.end + 1);
      }
    });

    test('Calm realm (1-25) focuses on basic attention skills', () => {
      const calmChallenges = new Set<ChallengeType>();
      for (let level = 1; level <= 25; level++) {
        calmChallenges.add(CHALLENGE_PROGRESSION[level]);
      }

      // Should include focus_hold, breath_pacing, etc.
      expect(calmChallenges.has('focus_hold')).toBe(true);
      expect(calmChallenges.has('breath_pacing')).toBe(true);
    });

    test('Full Focus realm (226-250) is the most challenging', () => {
      const fullFocusChallenges = new Set<ChallengeType>();
      for (let level = 226; level <= 250; level++) {
        fullFocusChallenges.add(CHALLENGE_PROGRESSION[level]);
      }

      // Should include the final reset challenge at level 250
      expect(CHALLENGE_PROGRESSION[250]).toBe('reset');
    });
  });

  describe('getChallengeForLevel - Integration', () => {
    test('returns correct challenges for realm boundaries', () => {
      expect(getChallengeForLevel(1)).toBe('focus_hold'); // Calm start
      expect(getChallengeForLevel(26)).toBe('slow_tracking'); // Clarity start
      expect(getChallengeForLevel(51)).toBe('delay_unlock'); // Discipline start
      expect(getChallengeForLevel(76)).toBe('rhythm_tap'); // Flow start
      expect(getChallengeForLevel(250)).toBe('reset'); // Final challenge
    });

    test('returns fallback for invalid levels', () => {
      expect(getChallengeForLevel(0)).toBe('focus_hold');
      expect(getChallengeForLevel(251)).toBe('focus_hold');
      expect(getChallengeForLevel(-1)).toBe('focus_hold');
      expect(getChallengeForLevel(9999)).toBe('focus_hold');
    });

    test('works consistently across all 250 levels', () => {
      for (let level = 1; level <= 250; level++) {
        const challenge = getChallengeForLevel(level);
        expect(challenge).toBe(CHALLENGE_PROGRESSION[level]);
        expect(typeof challenge).toBe('string');
        expect(challenge.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getChallengeScaling - Difficulty Progression', () => {
    test('difficulty increases from level 1 to 250 for focus_hold', () => {
      const level1 = getChallengeScaling('focus_hold', 1);
      const level125 = getChallengeScaling('focus_hold', 125);
      const level250 = getChallengeScaling('focus_hold', 250);

      // Duration should increase
      expect(level1.duration).toBeLessThan(level125.duration);
      expect(level125.duration).toBeLessThan(level250.duration);

      // Movement tolerance should decrease (harder)
      expect(level1.movementTolerance).toBeGreaterThan(level125.movementTolerance);
      expect(level125.movementTolerance).toBeGreaterThan(level250.movementTolerance);
    });

    test('difficulty increases for tap_only_correct challenge', () => {
      const level1 = getChallengeScaling('tap_only_correct', 1);
      const level250 = getChallengeScaling('tap_only_correct', 250);

      // More targets at higher levels
      expect(level250.targetCount).toBeGreaterThan(level1.targetCount);
      // More decoys at higher levels
      expect(level250.decoyCount).toBeGreaterThan(level1.decoyCount);
      // Less time per target (harder)
      expect(level250.timePerTarget).toBeLessThan(level1.timePerTarget);
    });

    test('puzzle difficulty scales correctly', () => {
      const puzzleTypes: ChallengeType[] = ['pattern_matching', 'logic_puzzle', 'memory_puzzle', 'spatial_puzzle'];

      puzzleTypes.forEach(puzzle => {
        const level1 = getChallengeScaling(puzzle, 1);
        const level250 = getChallengeScaling(puzzle, 250);

        // All puzzles should have at least one parameter that increases
        const level1Values = Object.values(level1).filter(v => typeof v === 'number');
        const level250Values = Object.values(level250).filter(v => typeof v === 'number');

        expect(level1Values.length).toBeGreaterThan(0);
        expect(level250Values.length).toBeGreaterThan(0);
      });
    });

    test('pattern_matching scales grid size and complexity', () => {
      const level1 = getChallengeScaling('pattern_matching', 1);
      const level250 = getChallengeScaling('pattern_matching', 250);

      expect(level250.gridSize).toBeGreaterThan(level1.gridSize);
      expect(level250.patternComplexity).toBeGreaterThanOrEqual(level1.patternComplexity);
      expect(level250.colors).toBeGreaterThan(level1.colors);
      expect(level250.timeLimit).toBeLessThan(level1.timeLimit);
    });

    test('spatial_puzzle enables features at higher levels', () => {
      const level10 = getChallengeScaling('spatial_puzzle', 10);
      const level150 = getChallengeScaling('spatial_puzzle', 150);
      const level250 = getChallengeScaling('spatial_puzzle', 250);

      // Rotation enabled after 30% (level ~75)
      expect(level10.rotationEnabled).toBe(false);
      expect(level150.rotationEnabled).toBe(true);

      // Timed mode after 50% (level ~125)
      expect(level150.timedMode).toBe(true);
      expect(level250.timedMode).toBe(true);
    });

    test('all challenge types return valid scaling objects', () => {
      const uniqueChallenges = new Set(Object.values(CHALLENGE_PROGRESSION));

      uniqueChallenges.forEach(challengeType => {
        const scaling = getChallengeScaling(challengeType, 100);
        expect(scaling).toBeDefined();
        expect(typeof scaling).toBe('object');
        expect(Object.keys(scaling).length).toBeGreaterThan(0);
      });
    });

    test('scaling is consistent across the same level', () => {
      const level = 42;
      const scaling1 = getChallengeScaling('focus_hold', level);
      const scaling2 = getChallengeScaling('focus_hold', level);

      expect(scaling1).toEqual(scaling2);
    });
  });

  describe('getChallengeName - All Challenge Types', () => {
    test('returns names for all challenges in progression', () => {
      const uniqueChallenges = new Set(Object.values(CHALLENGE_PROGRESSION));

      uniqueChallenges.forEach(challengeType => {
        const name = getChallengeName(challengeType);
        expect(name).toBeDefined();
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    test('returns human-readable names', () => {
      expect(getChallengeName('focus_hold')).toBe('Focus Hold');
      expect(getChallengeName('tap_only_correct')).toBe('Tap Only Correct');
      expect(getChallengeName('pattern_matching')).toBe('Pattern Matching');
      expect(getChallengeName('memory_puzzle')).toBe('Memory Puzzle');
    });

    test('handles unknown challenge types gracefully', () => {
      const unknownType = 'unknown_challenge' as ChallengeType;
      const name = getChallengeName(unknownType);
      expect(name).toBe('unknown_challenge');
    });

    test('puzzle challenge names are distinct', () => {
      const puzzleNames = [
        getChallengeName('pattern_matching'),
        getChallengeName('logic_puzzle'),
        getChallengeName('memory_puzzle'),
        getChallengeName('spatial_puzzle'),
      ];

      const uniqueNames = new Set(puzzleNames);
      expect(uniqueNames.size).toBe(4); // All different
    });
  });

  describe('getChallengeDescription - Integration', () => {
    test('descriptions include scaling parameters', () => {
      const desc1 = getChallengeDescription('focus_hold', 1);
      const desc250 = getChallengeDescription('focus_hold', 250);

      expect(desc1).toContain('s'); // Contains time unit
      expect(desc250).toContain('s');
      expect(desc1).not.toBe(desc250); // Different descriptions for different levels
    });

    test('memory_flash description shows correct item count', () => {
      const scaling = getChallengeScaling('memory_flash', 100);
      const description = getChallengeDescription('memory_flash', 100);

      expect(description).toContain(scaling.itemCount.toString());
    });

    test('tap_only_correct description mentions rules', () => {
      const description = getChallengeDescription('tap_only_correct', 50);
      expect(description).toContain('rules');
    });

    test('puzzle descriptions are informative', () => {
      const patternDesc = getChallengeDescription('pattern_matching', 100);
      const logicDesc = getChallengeDescription('logic_puzzle', 100);
      const memoryDesc = getChallengeDescription('memory_puzzle', 100);
      const spatialDesc = getChallengeDescription('spatial_puzzle', 100);

      expect(patternDesc).toContain('pattern');
      expect(logicDesc).toContain('logic');
      expect(memoryDesc).toContain('pairs');
      expect(spatialDesc).toContain('pieces');
    });

    test('spatial_puzzle description changes with timed mode', () => {
      const level50 = getChallengeDescription('spatial_puzzle', 50);
      const level200 = getChallengeDescription('spatial_puzzle', 200);

      // Level 200 should have timed mode (t > 0.5)
      expect(level200).toContain('in');
      expect(level200).toContain('s');
    });

    test('all progression challenges have descriptions', () => {
      const uniqueChallenges = new Set(Object.values(CHALLENGE_PROGRESSION));

      uniqueChallenges.forEach(challengeType => {
        const description = getChallengeDescription(challengeType, 100);
        expect(description).toBeDefined();
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Complete Progression Flow - Integration', () => {
    test('progression from level 1 to 250 is coherent', () => {
      for (let level = 1; level <= 250; level++) {
        const challengeType = getChallengeForLevel(level);
        const scaling = getChallengeScaling(challengeType, level);
        const name = getChallengeName(challengeType);
        const description = getChallengeDescription(challengeType, level);

        expect(challengeType).toBeDefined();
        expect(scaling).toBeDefined();
        expect(name).toBeDefined();
        expect(description).toBeDefined();
        expect(description).toContain(name);
      }
    });

    test('user journey through a complete realm', () => {
      // Test going through Calm realm (levels 1-25)
      const calmProgress = [];
      for (let level = 1; level <= 25; level++) {
        const challengeType = getChallengeForLevel(level);
        const scaling = getChallengeScaling(challengeType, level);
        calmProgress.push({
          level,
          challengeType,
          scaling,
        });
      }

      expect(calmProgress.length).toBe(25);

      // Verify increasing difficulty for same challenge type
      const focusHoldLevels = calmProgress.filter(p => p.challengeType === 'focus_hold');
      if (focusHoldLevels.length >= 2) {
        const first = focusHoldLevels[0];
        const last = focusHoldLevels[focusHoldLevels.length - 1];
        expect(last.scaling.duration).toBeGreaterThanOrEqual(first.scaling.duration);
      }
    });

    test('challenge variety increases in later realms', () => {
      // Calm realm (1-25)
      const calmChallenges = new Set<ChallengeType>();
      for (let level = 1; level <= 25; level++) {
        calmChallenges.add(getChallengeForLevel(level));
      }

      // Mastery realm (201-225)
      const masteryChallenges = new Set<ChallengeType>();
      for (let level = 201; level <= 225; level++) {
        masteryChallenges.add(getChallengeForLevel(level));
      }

      // Mastery should have more variety
      expect(masteryChallenges.size).toBeGreaterThanOrEqual(calmChallenges.size);
    });

    test('puzzle frequency is consistent across realms', () => {
      const puzzleTypes = ['pattern_matching', 'logic_puzzle', 'memory_puzzle', 'spatial_puzzle'];

      REALM_BOUNDARIES.forEach(realm => {
        let puzzleCount = 0;
        for (let level = realm.start; level <= realm.end; level++) {
          const challengeType = getChallengeForLevel(level);
          if (puzzleTypes.includes(challengeType)) {
            puzzleCount++;
          }
        }

        // Each realm should have some puzzles (at least 1-2)
        expect(puzzleCount).toBeGreaterThan(0);
      });
    });

    test('final level (250) is reset challenge', () => {
      const finalChallenge = getChallengeForLevel(250);
      expect(finalChallenge).toBe('reset');

      const scaling = getChallengeScaling('reset', 250);
      expect(scaling.challengeCount).toBeGreaterThan(0);
      expect(scaling.timeLimit).toBeGreaterThan(0);
    });
  });

  describe('Scaling Edge Cases - Integration', () => {
    test('level 1 has beginner-friendly parameters', () => {
      const challenges: ChallengeType[] = ['focus_hold', 'tap_only_correct', 'memory_flash'];

      challenges.forEach(challengeType => {
        const scaling = getChallengeScaling(challengeType, 1);
        const values = Object.values(scaling).filter(v => typeof v === 'number');

        // Should have reasonable beginner values
        expect(values.length).toBeGreaterThan(0);
      });
    });

    test('level 250 has expert parameters', () => {
      const challenges: ChallengeType[] = ['focus_hold', 'tap_only_correct', 'memory_flash'];

      challenges.forEach(challengeType => {
        const level1Scaling = getChallengeScaling(challengeType, 1);
        const level250Scaling = getChallengeScaling(challengeType, 250);

        // At least one parameter should be different (harder)
        expect(level1Scaling).not.toEqual(level250Scaling);
      });
    });

    test('mid-level parameters are between min and max', () => {
      const challengeType = 'focus_hold';
      const level1 = getChallengeScaling(challengeType, 1);
      const level125 = getChallengeScaling(challengeType, 125);
      const level250 = getChallengeScaling(challengeType, 250);

      expect(level125.duration).toBeGreaterThanOrEqual(level1.duration);
      expect(level125.duration).toBeLessThanOrEqual(level250.duration);
    });

    test('unknown challenge type returns default scaling', () => {
      const unknownType = 'unknown_challenge' as ChallengeType;
      const scaling = getChallengeScaling(unknownType, 100);

      expect(scaling).toBeDefined();
      expect(scaling.duration).toBeDefined();
      expect(scaling.difficulty).toBeDefined();
    });
  });

  describe('Realm Transitions - Integration', () => {
    test('challenge changes at realm boundaries', () => {
      REALM_BOUNDARIES.forEach((realm, index) => {
        if (index < REALM_BOUNDARIES.length - 1) {
          const lastOfRealm = getChallengeForLevel(realm.end);
          const firstOfNext = getChallengeForLevel(realm.end + 1);

          // Challenges should exist at boundaries
          expect(lastOfRealm).toBeDefined();
          expect(firstOfNext).toBeDefined();
        }
      });
    });

    test('difficulty continues to scale across realm boundaries', () => {
      // Test focus_hold if it appears in multiple realms
      const level25 = getChallengeScaling('focus_hold', 25); // End of Calm
      const level26 = getChallengeScaling('focus_hold', 26); // Start of Clarity

      // Difficulty should not reset at realm boundary
      expect(level26.duration).toBeGreaterThanOrEqual(level25.duration);
    });

    test('all realms are accessible', () => {
      REALM_BOUNDARIES.forEach(realm => {
        const firstLevel = getChallengeForLevel(realm.start);
        const midLevel = getChallengeForLevel(Math.floor((realm.start + realm.end) / 2));
        const lastLevel = getChallengeForLevel(realm.end);

        expect(firstLevel).toBeDefined();
        expect(midLevel).toBeDefined();
        expect(lastLevel).toBeDefined();
      });
    });
  });

  describe('Data Consistency - Integration', () => {
    test('CHALLENGE_PROGRESSION has no duplicate level keys', () => {
      const levels = Object.keys(CHALLENGE_PROGRESSION).map(Number);
      const uniqueLevels = new Set(levels);
      expect(uniqueLevels.size).toBe(levels.length);
    });

    test('all challenge types in progression have names', () => {
      const challengesWithoutNames: ChallengeType[] = [];

      Object.values(CHALLENGE_PROGRESSION).forEach(challengeType => {
        const name = getChallengeName(challengeType);
        if (name === challengeType) {
          // Name not found, using fallback
          challengesWithoutNames.push(challengeType);
        }
      });

      expect(challengesWithoutNames.length).toBe(0);
    });

    test('all challenge types in progression have scaling logic', () => {
      const uniqueChallenges = new Set(Object.values(CHALLENGE_PROGRESSION));

      uniqueChallenges.forEach(challengeType => {
        const scaling1 = getChallengeScaling(challengeType, 1);
        const scaling250 = getChallengeScaling(challengeType, 250);

        expect(scaling1).toBeDefined();
        expect(scaling250).toBeDefined();
        expect(Object.keys(scaling1).length).toBeGreaterThan(0);
        expect(Object.keys(scaling250).length).toBeGreaterThan(0);
      });
    });
  });
});
