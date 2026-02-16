import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

interface SkillTreeProps {
  onBack: () => void;
}

// Comprehensive skill definitions with sub-skills
const SKILL_BRANCHES = {
  focus: {
    name: 'Focus Mastery',
    emoji: '🎯',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    description: 'Core attention and concentration skills',
    subSkills: [
      { name: 'Gaze Control', emoji: '👁️', description: 'Hold steady focus on targets' },
      { name: 'Tracking', emoji: '🔍', description: 'Follow moving objects smoothly' },
      { name: 'Sustained Attention', emoji: '⏱️', description: 'Maintain focus over time' },
      { name: 'Visual Processing', emoji: '🖼️', description: 'Quickly process visual info' },
    ],
  },
  impulseControl: {
    name: 'Impulse Control',
    emoji: '🛡️',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    description: 'Self-regulation and patience',
    subSkills: [
      { name: 'Delayed Gratification', emoji: '⏳', description: 'Wait for better rewards' },
      { name: 'Response Inhibition', emoji: '✋', description: 'Stop automatic responses' },
      { name: 'Patience', emoji: '🧘', description: 'Stay calm under pressure' },
      { name: 'Self-Regulation', emoji: '🎛️', description: 'Control emotional reactions' },
    ],
  },
  distractionResistance: {
    name: 'Distraction Shield',
    emoji: '🔰',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    description: 'Filter noise and stay focused',
    subSkills: [
      { name: 'Noise Filtering', emoji: '🔇', description: 'Ignore irrelevant stimuli' },
      { name: 'Selective Attention', emoji: '🎯', description: 'Choose what to focus on' },
      { name: 'Context Switching', emoji: '🔄', description: 'Transition tasks smoothly' },
      { name: 'Mental Clarity', emoji: '💎', description: 'Maintain clear thinking' },
    ],
  },
  memory: {
    name: 'Memory Palace',
    emoji: '🧠',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    description: 'Working memory and recall',
    subSkills: [
      { name: 'Pattern Recognition', emoji: '🔮', description: 'Spot patterns quickly' },
      { name: 'Sequence Memory', emoji: '📋', description: 'Remember ordered items' },
      { name: 'Spatial Memory', emoji: '🗺️', description: 'Recall locations' },
      { name: 'Quick Recall', emoji: '⚡', description: 'Fast memory retrieval' },
    ],
  },
  breathing: {
    name: 'Breath Master',
    emoji: '🌬️',
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    description: 'Breathing and calmness',
    subSkills: [
      { name: 'Rhythm Control', emoji: '🎵', description: 'Steady breathing patterns' },
      { name: 'Deep Breathing', emoji: '🫁', description: 'Full, calming breaths' },
      { name: 'Stress Relief', emoji: '🍃', description: 'Breathe away tension' },
      { name: 'Box Breathing', emoji: '⬜', description: 'Advanced techniques' },
    ],
  },
};

const RANKS = [
  { name: 'Novice', emoji: '🌱', min: 0, color: '#6B7280' },
  { name: 'Apprentice', emoji: '🔷', min: 20, color: '#3B82F6' },
  { name: 'Adept', emoji: '💜', min: 40, color: '#8B5CF6' },
  { name: 'Expert', emoji: '💎', min: 60, color: '#06B6D4' },
  { name: 'Master', emoji: '⭐', min: 80, color: '#F59E0B' },
  { name: 'Grandmaster', emoji: '👑', min: 95, color: '#EF4444' },
];

const ACHIEVEMENTS = [
  { id: 'first_focus', name: 'First Focus', emoji: '🎯', description: 'Complete your first focus exercise', unlocked: true },
  { id: 'streak_3', name: 'On Fire', emoji: '🔥', description: '3-day streak', unlocked: true },
  { id: 'streak_7', name: 'Dedicated', emoji: '⚡', description: '7-day streak', unlocked: false },
  { id: 'streak_30', name: 'Unstoppable', emoji: '🏆', description: '30-day streak', unlocked: false },
  { id: 'all_skills', name: 'Well Rounded', emoji: '🌟', description: 'Train all skill types', unlocked: false },
  { id: 'master_focus', name: 'Laser Focus', emoji: '🔴', description: 'Master focus skills', unlocked: false },
];

export function SkillTree({ onBack }: SkillTreeProps) {
  const { skillTree, progress } = useGame();
  const { colors } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  if (!skillTree || !progress) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading...</Text>
      </View>
    );
  }

  // Calculate overall progress and rank
  const skillValues = {
    focus: skillTree.focus,
    impulseControl: skillTree.impulseControl,
    distractionResistance: skillTree.distractionResistance,
    memory: Math.min(100, (skillTree.focus + skillTree.impulseControl) / 2),
    breathing: Math.min(100, (skillTree.focus + skillTree.distractionResistance) / 2),
  };

  const totalProgress = Object.values(skillValues).reduce((a, b) => a + b, 0) / Object.keys(skillValues).length;

  const getCurrentRank = () => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (totalProgress >= RANKS[i].min) {
        return { current: RANKS[i], next: RANKS[i + 1] || null, index: i };
      }
    }
    return { current: RANKS[0], next: RANKS[1], index: 0 };
  };

  const { current: currentRank, next: nextRank } = getCurrentRank();
  const progressToNext = nextRank
    ? ((totalProgress - currentRank.min) / (nextRank.min - currentRank.min)) * 100
    : 100;

  const handleSkillPress = (skillKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Could navigate to skill detail in future
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Skills & Progress" onBack={onBack} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Overall Rank Card */}
          <View style={styles.rankCard}>
            <View style={styles.rankHeader}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankEmoji}>{currentRank.emoji}</Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankTitle}>{currentRank.name}</Text>
                <Text style={styles.rankSubtitle}>Overall Skill Level</Text>
              </View>
              <View style={styles.rankPercent}>
                <Text style={[styles.rankPercentText, { color: currentRank.color }]}>
                  {Math.round(totalProgress)}%
                </Text>
              </View>
            </View>

            {nextRank && (
              <View style={styles.nextRankSection}>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progressToNext}%`, backgroundColor: currentRank.color }]} />
                </View>
                <Text style={styles.nextRankLabel}>
                  {Math.round(nextRank.min - totalProgress)}% to {nextRank.name} {nextRank.emoji}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Overview */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{progress.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{progress.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{progress.totalChallengesCompleted}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
          </View>

          {/* Skill Branches */}
          <Text style={styles.sectionTitle}>Skill Branches</Text>

          {Object.entries(SKILL_BRANCHES).map(([key, branch]) => {
            const skillValue = skillValues[key as keyof typeof skillValues];
            const isLocked = skillValue === 0;

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.branchCard,
                  { backgroundColor: branch.bgColor, borderColor: branch.borderColor },
                  isLocked && styles.branchLocked,
                ]}
                onPress={() => handleSkillPress(key)}
                activeOpacity={0.7}
              >
                <View style={styles.branchHeader}>
                  <View style={styles.branchLeft}>
                    <View style={[styles.branchIcon, { backgroundColor: branch.color }]}>
                      <Text style={styles.branchEmoji}>{branch.emoji}</Text>
                    </View>
                    <View style={styles.branchInfo}>
                      <Text style={styles.branchName}>{branch.name}</Text>
                      <Text style={styles.branchDesc}>{branch.description}</Text>
                    </View>
                  </View>
                  <View style={styles.branchRight}>
                    <Text style={[styles.branchPercent, { color: branch.color }]}>
                      {Math.round(skillValue)}%
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.branchProgressContainer}>
                  <View style={[styles.branchProgress, { width: `${skillValue}%`, backgroundColor: branch.color }]} />
                </View>

                {/* Sub-skills */}
                <View style={styles.subSkillsGrid}>
                  {branch.subSkills.map((subSkill, index) => {
                    const subProgress = skillValue * (0.7 + (index * 0.1));
                    const unlocked = subProgress > index * 25;

                    return (
                      <View
                        key={subSkill.name}
                        style={[
                          styles.subSkillItem,
                          !unlocked && styles.subSkillLocked,
                        ]}
                      >
                        <Text style={[styles.subSkillEmoji, !unlocked && styles.subSkillEmojiLocked]}>
                          {unlocked ? subSkill.emoji : '🔒'}
                        </Text>
                        <Text style={[styles.subSkillName, !unlocked && styles.subSkillNameLocked]}>
                          {subSkill.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Achievements Section */}
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <Text style={styles.achievementEmoji}>
                  {achievement.unlocked ? achievement.emoji : '🔒'}
                </Text>
                <Text style={[styles.achievementName, !achievement.unlocked && styles.achievementNameLocked]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementDesc, !achievement.unlocked && styles.achievementDescLocked]}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Rank Progression */}
          <Text style={styles.sectionTitle}>Rank Progression</Text>
          <View style={styles.ranksContainer}>
            {RANKS.map((rank, index) => {
              const isUnlocked = totalProgress >= rank.min;
              const isCurrent = currentRank.name === rank.name;

              return (
                <View key={rank.name} style={styles.rankItem}>
                  <View style={[
                    styles.rankDot,
                    isUnlocked && { backgroundColor: rank.color },
                    isCurrent && styles.rankDotCurrent,
                  ]}>
                    <Text style={styles.rankDotEmoji}>{rank.emoji}</Text>
                  </View>
                  <Text style={[
                    styles.rankItemName,
                    isUnlocked && { color: rank.color },
                    isCurrent && styles.rankItemNameCurrent,
                  ]}>
                    {rank.name}
                  </Text>
                  <Text style={styles.rankItemMin}>{rank.min}%</Text>
                  {index < RANKS.length - 1 && (
                    <View style={[
                      styles.rankConnector,
                      isUnlocked && { backgroundColor: rank.color },
                    ]} />
                  )}
                </View>
              );
            })}
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
  },

  // Rank Card
  rankCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 32,
  },
  rankInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rankTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  rankSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  rankPercent: {
    alignItems: 'flex-end',
  },
  rankPercentText: {
    fontSize: 28,
    fontWeight: '700',
  },
  nextRankSection: {
    gap: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  nextRankLabel: {
    fontSize: 13,
    color: '#64748B',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
    marginTop: 8,
  },

  // Branch Card
  branchCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  branchLocked: {
    opacity: 0.5,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  branchIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchEmoji: {
    fontSize: 24,
  },
  branchInfo: {
    marginLeft: 12,
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  branchDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  branchRight: {
    marginLeft: 12,
  },
  branchPercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  branchProgressContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  branchProgress: {
    height: '100%',
    borderRadius: 3,
  },

  // Sub-skills
  subSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subSkillItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subSkillLocked: {
    opacity: 0.4,
  },
  subSkillEmoji: {
    fontSize: 14,
  },
  subSkillEmojiLocked: {
    opacity: 0.6,
  },
  subSkillName: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  subSkillNameLocked: {
    color: '#64748B',
  },

  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: '#64748B',
  },
  achievementDesc: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  achievementDescLocked: {
    color: '#475569',
  },

  // Rank Progression
  ranksContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  rankDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankDotCurrent: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rankDotEmoji: {
    fontSize: 18,
  },
  rankItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 12,
  },
  rankItemNameCurrent: {
    fontWeight: '700',
  },
  rankItemMin: {
    fontSize: 12,
    color: '#475569',
  },
  rankConnector: {
    position: 'absolute',
    left: 19,
    top: 52,
    width: 2,
    height: 24,
    backgroundColor: '#334155',
  },
});
