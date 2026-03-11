/**
 * COMPREHENSIVE UNIT TESTS FOR GAME MECHANICS
 *
 * Tests all game mechanics calculations and utilities including:
 * - Difficulty scaling
 * - XP calculations
 * - Level progression
 * - Streak management
 * - Challenge unlocking
 * - Score calculations
 * - Progress tree generation
 */

import {
  // Constants
  XP_PER_CHALLENGE,
  XP_PER_SESSION,
  XP_PER_LEVEL,
  PERFECT_FOCUS_BONUS,
  STREAK_MULTIPLIER_THRESHOLD,
  MAX_LEVEL,

  // Functions
  getLevelDifficulty,
  getChallengeDifficultyConfig,
  getLevelMilestone,
  getUserLevelBracket,
  getStreakMultiplier,
  calculateXP,
  checkLevelUp,
  getChallengeDifficulty,
  getChallengeSkillPath,
  getMinLevelForChallenge,
  isChallengeUnlocked,
  getAvailableChallenges,
  calculateSkillProgress,
  updateStreak,
  scoreChallenge,
  generateProgressTree,

  // Types
  LEVEL_MILESTONES,
} from '../game-mechanics';

describe('Game Mechanics - Constants', () => {
  test('constants have correct values', () => {
    expect(XP_PER_CHALLENGE).toBe(10);
    expect(XP_PER_SESSION).toBe(30);
    expect(XP_PER_LEVEL).toBe(200);
    expect(PERFECT_FOCUS_BONUS).toBe(10);
    expect(STREAK_MULTIPLIER_THRESHOLD).toBe(4);
    expect(MAX_LEVEL).toBe(250);
  });
});

describe('getLevelDifficulty', () => {
  test('returns correct difficulty for level 1', () => {
    const difficulty = getLevelDifficulty(1);

    expect(difficulty.duration).toBeGreaterThanOrEqual(5);
    expect(difficulty.toleranceMultiplier).toBeCloseTo(2.5, 1);
    expect(difficulty.speedMultiplier).toBeCloseTo(0.3, 1);
    expect(difficulty.itemCount).toBe(1);
    expect(difficulty.distractionCount).toBe(0);
    expect(difficulty.ruleCount).toBe(1);
    expect(difficulty.xpMultiplier).toBe(1.0);
    expect(difficulty.difficultyLabel).toBe('Very Easy');
    expect(difficulty.stageLabel).toBe('Foundation');
  });

  test('returns correct difficulty for level 10', () => {
    const difficulty = getLevelDifficulty(10);

    expect(difficulty.difficultyLabel).toBe('Very Easy');
    expect(difficulty.stageLabel).toBe('Foundation');
    expect(difficulty.duration).toBeGreaterThan(5);
    expect(difficulty.toleranceMultiplier).toBeLessThan(2.5);
  });

  test('returns correct difficulty for level 30', () => {
    const difficulty = getLevelDifficulty(30);

    expect(difficulty.difficultyLabel).toBe('Easy');
    expect(difficulty.stageLabel).toBe('Growth');
  });

  test('returns correct difficulty for level 60', () => {
    const difficulty = getLevelDifficulty(60);

    expect(difficulty.difficultyLabel).toBe('Medium');
    expect(difficulty.stageLabel).toBe('Proficiency');
  });

  test('returns correct difficulty for level 90', () => {
    const difficulty = getLevelDifficulty(90);

    expect(difficulty.difficultyLabel).toBe('Hard');
    expect(difficulty.stageLabel).toBe('Mastery');
  });

  test('returns correct difficulty for level 250 (max)', () => {
    const difficulty = getLevelDifficulty(250);

    expect(difficulty.duration).toBeCloseTo(70, 0);
    expect(difficulty.toleranceMultiplier).toBeCloseTo(0.5, 1);
    expect(difficulty.speedMultiplier).toBeCloseTo(2.0, 1);
    expect(difficulty.itemCount).toBe(12);
    expect(difficulty.distractionCount).toBe(30);
    expect(difficulty.ruleCount).toBe(4);
    expect(difficulty.xpMultiplier).toBe(5.0);
    expect(difficulty.difficultyLabel).toBe('Expert');
    expect(difficulty.stageLabel).toBe('Excellence');
  });

  test('clamps level to valid range (below min)', () => {
    const difficulty = getLevelDifficulty(0);
    expect(difficulty.difficultyLabel).toBe('Very Easy');
  });

  test('clamps level to valid range (above max)', () => {
    const difficulty = getLevelDifficulty(300);
    expect(difficulty.difficultyLabel).toBe('Expert');
    expect(difficulty.stageLabel).toBe('Excellence');
  });

  test('difficulty increases smoothly across levels', () => {
    const level1 = getLevelDifficulty(1);
    const level50 = getLevelDifficulty(50);
    const level250 = getLevelDifficulty(250);

    expect(level50.duration).toBeGreaterThan(level1.duration);
    expect(level250.duration).toBeGreaterThan(level50.duration);

    expect(level50.speedMultiplier).toBeGreaterThan(level1.speedMultiplier);
    expect(level250.speedMultiplier).toBeGreaterThan(level50.speedMultiplier);
  });
});

describe('getChallengeDifficultyConfig', () => {
  test('returns easier config for level 1', () => {
    const config = getChallengeDifficultyConfig(1);

    // Should be super easy
    expect(config.holdDuration).toBeCloseTo(3, 0);
    expect(config.movementTolerance).toBeCloseTo(50, 0);
    expect(config.targetSpeed).toBeCloseTo(0.2, 1);
    expect(config.itemsToRemember).toBe(1);
    expect(config.displayTime).toBeCloseTo(5, 0);
    expect(config.targetCount).toBeCloseTo(2, 0);
    expect(config.decoyCount).toBeCloseTo(0, 0);
    expect(config.objectsToTrack).toBe(1);
  });

  test('returns harder config for level 250', () => {
    const config = getChallengeDifficultyConfig(250);

    // Should be much harder
    expect(config.holdDuration).toBeGreaterThan(20);
    expect(config.movementTolerance).toBeLessThan(20);
    expect(config.targetSpeed).toBeGreaterThan(1);
    expect(config.itemsToRemember).toBeGreaterThan(5);
    expect(config.displayTime).toBeLessThan(3);
  });

  test('difficulty scales smoothly', () => {
    const level1 = getChallengeDifficultyConfig(1);
    const level100 = getChallengeDifficultyConfig(100);
    const level250 = getChallengeDifficultyConfig(250);

    expect(level100.holdDuration).toBeGreaterThan(level1.holdDuration);
    expect(level250.holdDuration).toBeGreaterThan(level100.holdDuration);
  });
});

describe('getLevelMilestone', () => {
  test('returns milestone for level 1', () => {
    const milestone = getLevelMilestone(1);
    expect(milestone).toBeDefined();
    expect(milestone?.name).toBe('First Steps');
    expect(milestone?.emoji).toBe('🌱');
  });

  test('returns milestone for level 10', () => {
    const milestone = getLevelMilestone(10);
    expect(milestone).toBeDefined();
    expect(milestone?.name).toBe('Focus Master');
    expect(milestone?.emoji).toBe('👑');
  });

  test('returns undefined for level without milestone', () => {
    const milestone = getLevelMilestone(11);
    expect(milestone).toBeUndefined();
  });

  test('all milestones have required properties', () => {
    LEVEL_MILESTONES.forEach(milestone => {
      expect(milestone.level).toBeGreaterThan(0);
      expect(milestone.name).toBeTruthy();
      expect(milestone.description).toBeTruthy();
      expect(milestone.emoji).toBeTruthy();
      expect(milestone.reward).toBeTruthy();
    });
  });
});

describe('getUserLevelBracket', () => {
  test('returns beginner for level 1-10', () => {
    expect(getUserLevelBracket(1)).toBe('beginner');
    expect(getUserLevelBracket(5)).toBe('beginner');
    expect(getUserLevelBracket(10)).toBe('beginner');
  });

  test('returns intermediate for level 11-20', () => {
    expect(getUserLevelBracket(11)).toBe('intermediate');
    expect(getUserLevelBracket(15)).toBe('intermediate');
    expect(getUserLevelBracket(20)).toBe('intermediate');
  });

  test('returns advanced for level 21+', () => {
    expect(getUserLevelBracket(21)).toBe('advanced');
    expect(getUserLevelBracket(50)).toBe('advanced');
    expect(getUserLevelBracket(250)).toBe('advanced');
  });
});

describe('getStreakMultiplier', () => {
  test('returns 1 for streak below threshold', () => {
    expect(getStreakMultiplier(0)).toBe(1);
    expect(getStreakMultiplier(1)).toBe(1);
    expect(getStreakMultiplier(3)).toBe(1);
  });

  test('returns correct multiplier at threshold', () => {
    expect(getStreakMultiplier(4)).toBe(1.1);
  });

  test('returns increasing multiplier above threshold', () => {
    expect(getStreakMultiplier(5)).toBe(1.2);
    expect(getStreakMultiplier(6)).toBe(1.3);
    expect(getStreakMultiplier(10)).toBe(1.7);
  });
});

describe('calculateXP', () => {
  test('calculates XP without bonuses', () => {
    expect(calculateXP(100, false, 0)).toBe(100);
  });

  test('adds perfect bonus', () => {
    const baseXP = 100;
    const withBonus = calculateXP(baseXP, true, 0);
    expect(withBonus).toBe(baseXP + PERFECT_FOCUS_BONUS);
  });

  test('applies streak multiplier', () => {
    const baseXP = 100;
    const streak = 5;
    const multiplier = getStreakMultiplier(streak);
    const result = calculateXP(baseXP, false, streak);
    expect(result).toBe(Math.floor(baseXP * multiplier));
  });

  test('applies both perfect bonus and streak multiplier', () => {
    const baseXP = 100;
    const streak = 5;
    const multiplier = getStreakMultiplier(streak);
    const result = calculateXP(baseXP, true, streak);
    expect(result).toBe(Math.floor((baseXP + PERFECT_FOCUS_BONUS) * multiplier));
  });

  test('floors the result', () => {
    const result = calculateXP(10, false, 5);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('checkLevelUp', () => {
  test('no level up when XP below threshold', () => {
    const result = checkLevelUp(100, 5);
    expect(result.newLevel).toBe(5);
    expect(result.remainingXP).toBe(100);
  });

  test('levels up once when XP exceeds threshold', () => {
    const result = checkLevelUp(250, 5);
    expect(result.newLevel).toBe(6);
    expect(result.remainingXP).toBe(50);
  });

  test('levels up multiple times', () => {
    const result = checkLevelUp(650, 5);
    expect(result.newLevel).toBe(8);
    expect(result.remainingXP).toBe(50);
  });

  test('stops at MAX_LEVEL', () => {
    const result = checkLevelUp(1000, 250);
    expect(result.newLevel).toBe(250);
    expect(result.remainingXP).toBeGreaterThanOrEqual(1000);
  });

  test('handles exact level up amount', () => {
    const result = checkLevelUp(200, 1);
    expect(result.newLevel).toBe(2);
    expect(result.remainingXP).toBe(0);
  });
});

describe('getChallengeDifficulty', () => {
  test('returns base difficulty for level 1', () => {
    const difficulty = getChallengeDifficulty('focus_hold', 1);
    expect(difficulty).toBe(1);
  });

  test('increases difficulty with user level', () => {
    const level1 = getChallengeDifficulty('focus_hold', 1);
    const level10 = getChallengeDifficulty('focus_hold', 10);
    expect(level10).toBeGreaterThan(level1);
  });

  test('caps at difficulty 10', () => {
    const difficulty = getChallengeDifficulty('focus_hold', 1000);
    expect(difficulty).toBeLessThanOrEqual(10);
  });

  test('different challenges have different base difficulties', () => {
    const easy = getChallengeDifficulty('focus_hold', 1);
    const medium = getChallengeDifficulty('slow_tracking', 1);
    const hard = getChallengeDifficulty('fake_notifications', 1);

    expect(easy).toBeLessThan(medium);
    expect(medium).toBeLessThan(hard);
  });
});

describe('getChallengeSkillPath', () => {
  test('maps focus challenges correctly', () => {
    expect(getChallengeSkillPath('focus_hold')).toBe('focus');
    expect(getChallengeSkillPath('slow_tracking')).toBe('focus');
    expect(getChallengeSkillPath('memory_flash')).toBe('focus');
  });

  test('maps impulse control challenges correctly', () => {
    expect(getChallengeSkillPath('tap_only_correct')).toBe('impulseControl');
    expect(getChallengeSkillPath('delay_unlock')).toBe('impulseControl');
    expect(getChallengeSkillPath('anti_scroll_swipe')).toBe('impulseControl');
  });

  test('maps distraction resistance challenges correctly', () => {
    expect(getChallengeSkillPath('fake_notifications')).toBe('distractionResistance');
    expect(getChallengeSkillPath('popup_ignore')).toBe('distractionResistance');
    expect(getChallengeSkillPath('impulse_spike_test')).toBe('distractionResistance');
  });

  test('defaults to focus for unknown challenges', () => {
    expect(getChallengeSkillPath('unknown_challenge' as any)).toBe('focus');
  });
});

describe('getMinLevelForChallenge', () => {
  test('all MVP challenges available from level 1', () => {
    expect(getMinLevelForChallenge('focus_hold')).toBe(1);
    expect(getMinLevelForChallenge('finger_hold')).toBe(1);
    expect(getMinLevelForChallenge('slow_tracking')).toBe(1);
    expect(getMinLevelForChallenge('fake_notifications')).toBe(1);
  });

  test('defaults to level 1 for unknown challenges', () => {
    expect(getMinLevelForChallenge('unknown' as any)).toBe(1);
  });
});

describe('isChallengeUnlocked', () => {
  test('unlocks challenge when level requirement met', () => {
    expect(isChallengeUnlocked('focus_hold', 1)).toBe(true);
    expect(isChallengeUnlocked('focus_hold', 5)).toBe(true);
  });

  test('locks challenge when level requirement not met', () => {
    expect(isChallengeUnlocked('focus_hold', 0)).toBe(false);
  });
});

describe('getAvailableChallenges', () => {
  test('returns available challenges for level 1', () => {
    const challenges = getAvailableChallenges(1);
    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges).toContain('gaze_hold');
  });

  test('returns more challenges for higher levels', () => {
    const level1Challenges = getAvailableChallenges(1);
    const level10Challenges = getAvailableChallenges(10);
    expect(level10Challenges.length).toBeGreaterThanOrEqual(level1Challenges.length);
  });

  test('all returned challenges are unlocked', () => {
    const level = 5;
    const challenges = getAvailableChallenges(level);
    challenges.forEach(challenge => {
      expect(isChallengeUnlocked(challenge, level)).toBe(true);
    });
  });
});

describe('calculateSkillProgress', () => {
  test('increases progress on perfect score', () => {
    const result = calculateSkillProgress('focus_hold', 100, 50);
    expect(result).toBe(55);
  });

  test('increases progress on good score', () => {
    const result = calculateSkillProgress('focus_hold', 80, 50);
    expect(result).toBe(54);
  });

  test('minimal progress on poor score', () => {
    const result = calculateSkillProgress('focus_hold', 20, 50);
    expect(result).toBe(51);
  });

  test('caps progress at 100', () => {
    const result = calculateSkillProgress('focus_hold', 100, 98);
    expect(result).toBe(100);
  });

  test('never decreases progress', () => {
    const current = 50;
    const result = calculateSkillProgress('focus_hold', 0, current);
    expect(result).toBeGreaterThanOrEqual(current);
  });
});

describe('updateStreak', () => {
  const today = Date.now();
  const yesterday = today - (24 * 60 * 60 * 1000);
  const twoDaysAgo = today - (2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = today - (3 * 24 * 60 * 60 * 1000);

  test('starts new streak when no previous session', () => {
    const result = updateStreak(null, today);
    expect(result.newStreak).toBe(1);
    expect(result.shouldFreeze).toBe(false);
  });

  test('no change when playing same day', () => {
    const result = updateStreak(today - 1000, today);
    expect(result.newStreak).toBe(0);
    expect(result.shouldFreeze).toBe(false);
  });

  test('increments streak for next day', () => {
    const result = updateStreak(yesterday, today);
    expect(result.newStreak).toBe(1);
    expect(result.shouldFreeze).toBe(false);
  });

  test('allows freeze for one missed day', () => {
    const result = updateStreak(twoDaysAgo, today);
    expect(result.newStreak).toBe(0);
    expect(result.shouldFreeze).toBe(true);
  });

  test('breaks streak after missing more than one day', () => {
    const result = updateStreak(threeDaysAgo, today);
    expect(result.newStreak).toBe(0);
    expect(result.shouldFreeze).toBe(false);
  });

  test('handles time zones correctly with midnight reset', () => {
    // Create dates at different times but same day
    const morning = new Date(2024, 0, 1, 8, 0, 0).getTime();
    const evening = new Date(2024, 0, 1, 20, 0, 0).getTime();

    const result = updateStreak(morning, evening);
    expect(result.newStreak).toBe(0); // Same day
  });
});

describe('scoreChallenge', () => {
  test('scores gaze_hold based on accuracy', () => {
    expect(scoreChallenge('gaze_hold', { accuracy: 1.0 })).toBe(100);
    expect(scoreChallenge('gaze_hold', { accuracy: 0.8 })).toBe(80);
    expect(scoreChallenge('gaze_hold', { accuracy: 0.5 })).toBe(50);
  });

  test('scores distraction_resistance with penalty', () => {
    expect(scoreChallenge('distraction_resistance', { distractions: 0 })).toBe(100);
    expect(scoreChallenge('distraction_resistance', { distractions: 5 })).toBe(50);
    expect(scoreChallenge('distraction_resistance', { distractions: 10 })).toBe(0);
  });

  test('scores impulse_delay based on duration accuracy', () => {
    const perfect = scoreChallenge('impulse_delay', { duration: 10000 });
    expect(perfect).toBe(100);

    const good = scoreChallenge('impulse_delay', { duration: 9000 });
    expect(good).toBeGreaterThan(80);
    expect(good).toBeLessThan(100);
  });

  test('caps score at 100', () => {
    const score = scoreChallenge('gaze_hold', { accuracy: 1.5 });
    expect(score).toBe(100);
  });

  test('returns 0 for unknown challenge type', () => {
    const score = scoreChallenge('unknown' as any, { accuracy: 1.0 });
    expect(score).toBe(0);
  });

  test('handles missing performance data', () => {
    expect(scoreChallenge('gaze_hold', {})).toBe(0);
  });
});

describe('generateProgressTree', () => {
  test('generates tree with correct number of nodes', () => {
    const tree = generateProgressTree('user123', 1);
    // 250 levels * 21 nodes per level (20 exercises + 1 test)
    expect(tree.nodes.length).toBe(MAX_LEVEL * 21);
  });

  test('first node is available', () => {
    const tree = generateProgressTree('user123', 1);
    const firstNode = tree.nodes[0];
    expect(firstNode.status).toBe('available');
    expect(firstNode.level).toBe(1);
    expect(firstNode.position).toBe(0);
  });

  test('other nodes start as locked', () => {
    const tree = generateProgressTree('user123', 1);
    const secondNode = tree.nodes[1];
    expect(secondNode.status).toBe('locked');
  });

  test('currentNodeId points to first available node', () => {
    const tree = generateProgressTree('user123', 1);
    expect(tree.currentNodeId).toBe('1-0');
  });

  test('contains correct node types', () => {
    const tree = generateProgressTree('user123', 1);
    const level1Nodes = tree.nodes.filter(n => n.level === 1);

    const exercises = level1Nodes.filter(n => n.nodeType === 'exercise');
    const tests = level1Nodes.filter(n => n.nodeType === 'test');

    expect(exercises.length).toBe(20);
    expect(tests.length).toBe(1);
  });

  test('test nodes have test sequences', () => {
    const tree = generateProgressTree('user123', 1);
    const testNode = tree.nodes.find(n => n.nodeType === 'test');

    expect(testNode?.testSequence).toBeDefined();
    expect(testNode?.testSequence!.length).toBeGreaterThan(0);
  });

  test('XP rewards increase with level', () => {
    const tree = generateProgressTree('user123', 1);
    const level1Exercise = tree.nodes.find(n => n.level === 1 && n.nodeType === 'exercise');
    const level10Exercise = tree.nodes.find(n => n.level === 10 && n.nodeType === 'exercise');

    expect(level10Exercise!.xpReward).toBeGreaterThan(level1Exercise!.xpReward);
  });

  test('test nodes give 5x XP compared to exercises', () => {
    const tree = generateProgressTree('user123', 1);
    const exercise = tree.nodes.find(n => n.level === 1 && n.nodeType === 'exercise');
    const test = tree.nodes.find(n => n.level === 1 && n.nodeType === 'test');

    expect(test!.xpReward).toBe(XP_PER_CHALLENGE * 5);
  });

  test('stores userId correctly', () => {
    const userId = 'test-user-123';
    const tree = generateProgressTree(userId, 1);
    expect(tree.userId).toBe(userId);
  });

  test('has correct version number', () => {
    const tree = generateProgressTree('user123', 1);
    expect(tree.version).toBe(3);
  });

  test('clamps current level to valid range', () => {
    const treeBelow = generateProgressTree('user123', 0);
    const treeAbove = generateProgressTree('user123', 300);

    expect(treeBelow.nodes.length).toBeGreaterThan(0);
    expect(treeAbove.nodes.length).toBeGreaterThan(0);
  });
});

describe('Integration Tests', () => {
  test('full level progression flow', () => {
    let level = 1;
    let xp = 0;
    const streak = 0;

    // Complete a challenge
    const earnedXP = calculateXP(XP_PER_CHALLENGE, true, streak);
    xp += earnedXP;

    // Check level up
    const levelUp = checkLevelUp(xp, level);
    expect(levelUp.newLevel).toBe(1); // Not enough for level 2 yet

    // Complete many challenges
    for (let i = 0; i < 20; i++) {
      xp += calculateXP(XP_PER_CHALLENGE, false, 0);
    }

    const finalLevelUp = checkLevelUp(xp, level);
    expect(finalLevelUp.newLevel).toBeGreaterThan(level);
  });

  test('streak affects XP correctly', () => {
    const baseXP = XP_PER_CHALLENGE;

    // No streak
    const noStreak = calculateXP(baseXP, false, 0);

    // High streak
    const highStreak = calculateXP(baseXP, false, 10);

    expect(highStreak).toBeGreaterThan(noStreak);
  });

  test('difficulty scales appropriately across progression', () => {
    const levels = [1, 10, 30, 60, 90, 250];
    const difficulties = levels.map(l => getLevelDifficulty(l));

    // Duration should increase
    for (let i = 1; i < difficulties.length; i++) {
      expect(difficulties[i].duration).toBeGreaterThan(difficulties[i - 1].duration);
    }

    // Tolerance should decrease (get stricter)
    for (let i = 1; i < difficulties.length; i++) {
      expect(difficulties[i].toleranceMultiplier).toBeLessThan(difficulties[i - 1].toleranceMultiplier);
    }
  });

  test('progress tree structure is consistent', () => {
    const tree = generateProgressTree('user', 1);

    // Check every level has 20 exercises + 1 test
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const levelNodes = tree.nodes.filter(n => n.level === level);
      expect(levelNodes.length).toBe(21);

      const exercises = levelNodes.filter(n => n.nodeType === 'exercise');
      const tests = levelNodes.filter(n => n.nodeType === 'test');

      expect(exercises.length).toBe(20);
      expect(tests.length).toBe(1);
    }
  });
});
