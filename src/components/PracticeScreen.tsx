/**
 * Practice Screen - Duolingo Style
 *
 * Quick practice options for users to sharpen their skills
 * Includes daily goals, practice history, and various training modes
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import Svg, { Path, Circle, Rect, Polygon, Ellipse, Line } from 'react-native-svg';
import type { ActivityType } from '@/lib/journey-levels';

// SVG Icon Components
interface IconProps {
  size: number;
  color: string;
}

function BoltIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="13,2 8,13 11,13 9,22 18,10 14,10 16,2"
        fill={color}
      />
    </Svg>
  );
}

function TargetIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" fill="none" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="3" fill={color} />
    </Svg>
  );
}

function TimerIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="13" r="9" fill="none" stroke={color} strokeWidth="2" />
      <Path d="M12 13L12 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M12 13L15 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Rect x="10" y="2" width="4" height="3" rx="1" fill={color} />
      <Path d="M7 5L5 7M17 5L19 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function DiamondIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2L4 8L12 22L20 8Z" fill={color} />
      <Path d="M12 2L8 8L12 14L16 8Z" fill="rgba(255,255,255,0.4)" />
      <Path d="M4 8L8 8L12 14Z" fill="rgba(0,0,0,0.2)" />
      <Path d="M20 8L16 8L12 14Z" fill="rgba(0,0,0,0.2)" />
    </Svg>
  );
}

function FlameIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2C12 2 8 6 8 10C8 13 10 15 12 15C14 15 16 13 16 10C16 6 12 2 12 2Z"
        fill={color}
      />
      <Path
        d="M12 22C12 22 6 18 6 13C6 10 8 8 12 8C16 8 18 10 18 13C18 18 12 22 12 22Z"
        fill={color}
        opacity="0.7"
      />
      <Circle cx="12" cy="14" r="2" fill="#FFD700" />
    </Svg>
  );
}

function BreathIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4 L12 12 Q12 16 9 17 Q7 17 7 15 Q7 13 9 13 M12 12 Q12 16 15 17 Q17 17 17 15 Q17 13 15 13"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path d="M8 19 Q6 21 4 20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <Path d="M16 19 Q18 21 20 20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

function EyeIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 12 C5 7 9 5 12 5 C15 5 19 7 22 12 C19 17 15 19 12 19 C9 19 5 17 2 12"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      />
      <Circle cx="12" cy="12" r="4" fill={color} />
      <Circle cx="12" cy="12" r="2" fill="#000" opacity="0.5" />
      <Circle cx="10.5" cy="10.5" r="1" fill="#FFF" />
    </Svg>
  );
}

function BrainIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3 Q16 3 18 6 Q20 9 19 12 Q20 15 18 18 Q16 21 12 21 Q8 21 6 18 Q4 15 5 12 Q4 9 6 6 Q8 3 12 3"
        fill={color}
      />
      <Path d="M12 3 L12 21" stroke="#FFF" strokeWidth="1" opacity="0.3" />
      <Path d="M8 7 Q10 9 8 11 Q10 13 8 15" stroke="#FFF" strokeWidth="1.5" fill="none" opacity="0.4" />
      <Path d="M16 7 Q14 9 16 11 Q14 13 16 15" stroke="#FFF" strokeWidth="1.5" fill="none" opacity="0.4" />
    </Svg>
  );
}

function HandIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 22 L8 14 Q8 12 10 12 L14 12 Q16 12 16 14 L16 22"
        fill={color}
      />
      <Rect x="10.5" y="4" width="3" height="10" rx="1.5" fill={color} />
      <Ellipse cx="12" cy="5" rx="1.2" ry="0.8" fill="#FFF" opacity="0.4" />
    </Svg>
  );
}

function CheckIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={color} opacity="0.2" />
      <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
      <Path
        d="M6 12 L10 17 L18 7"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="7" y="11" width="10" height="9" rx="1" fill={color} />
      <Path
        d="M9 11 L9 8 Q9 5 12 5 Q15 5 15 8 L15 11"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      <Circle cx="12" cy="15.5" r="2" fill="#FFF" />
    </Svg>
  );
}

interface PracticeScreenProps {
  onBack: () => void;
  onSelectPractice: (type: string) => void;
}

interface PracticeOption {
  id: string;
  title: string;
  description: string;
  IconComponent: React.ComponentType<IconProps>;
  color: [string, string];
  xp: number;
  duration: string;
  activities: ActivityType[];
  category: 'quick' | 'challenge' | 'focus';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export const PRACTICE_OPTIONS: PracticeOption[] = [
  {
    id: 'quick-practice',
    title: 'Quick Practice',
    description: 'Random mix of exercises to keep you sharp',
    IconComponent: BoltIcon,
    color: ['#1CB0F6', '#0E7AB0'],
    xp: 15,
    duration: '2-3 min',
    activities: ['gaze_hold', 'breath_pacing', 'tap_pattern'],
    category: 'quick',
    difficulty: 'easy',
  },
  {
    id: 'focus-training',
    title: 'Focus Training',
    description: 'Deep concentration exercises',
    IconComponent: EyeIcon,
    color: ['#A855F7', '#7E22CE'],
    xp: 20,
    duration: '5 min',
    activities: ['gaze_hold', 'stillness_test', 'focus_hold'],
    category: 'focus',
    difficulty: 'easy',
  },
  {
    id: 'breathing',
    title: 'Breathing Session',
    description: 'Calm your mind with guided breathing',
    IconComponent: BreathIcon,
    color: ['#10B981', '#059669'],
    xp: 10,
    duration: '3-5 min',
    activities: ['breath_pacing', 'controlled_breathing', 'box_breathing'],
    category: 'focus',
    difficulty: 'easy',
  },
  {
    id: 'weak-skills',
    title: 'Strengthen Weak Areas',
    description: 'Focus on exercises you find challenging',
    IconComponent: TargetIcon,
    color: ['#FF9600', '#F59E0B'],
    xp: 20,
    duration: '5 min',
    activities: ['reaction_inhibition', 'impulse_spike_test', 'popup_ignore'],
    category: 'challenge',
    difficulty: 'medium',
  },
  {
    id: 'timed-challenge',
    title: 'Speed Challenge',
    description: 'How many can you complete in 3 minutes?',
    IconComponent: TimerIcon,
    color: ['#EF4444', '#DC2626'],
    xp: 25,
    duration: '3 min',
    activities: ['multi_task_tap', 'tap_pattern', 'memory_flash'],
    category: 'challenge',
    difficulty: 'hard',
  },
  {
    id: 'perfect-run',
    title: 'Perfect Run',
    description: 'Complete without any mistakes',
    IconComponent: DiamondIcon,
    color: ['#EC4899', '#BE185D'],
    xp: 30,
    duration: '5 min',
    activities: ['impulse_spike_test', 'reaction_inhibition', 'stillness_test'],
    category: 'challenge',
    difficulty: 'hard',
  },
  {
    id: 'memory-boost',
    title: 'Memory Boost',
    description: 'Train your working memory',
    IconComponent: BrainIcon,
    color: ['#8B5CF6', '#6D28D9'],
    xp: 20,
    duration: '4 min',
    activities: ['memory_flash', 'multi_object_tracking', 'tap_pattern'],
    category: 'focus',
    difficulty: 'medium',
  },
  {
    id: 'endurance',
    title: 'Endurance Mode',
    description: '10+ exercises in a row. No breaks!',
    IconComponent: FlameIcon,
    color: ['#F59E0B', '#D97706'],
    xp: 50,
    duration: '10+ min',
    activities: ['gaze_hold', 'breath_pacing', 'stillness_test', 'finger_tracing', 'tap_pattern'],
    category: 'challenge',
    difficulty: 'extreme',
  },
];

export function PracticeScreen({ onBack, onSelectPractice }: PracticeScreenProps) {
  const insets = useSafeAreaInsets();
  const { progress } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quick' | 'focus' | 'challenge'>('all');

  const currentLevel = progress?.level || 1;

  // Filter practice options based on category
  const filteredOptions = PRACTICE_OPTIONS.filter(option => 
    selectedCategory === 'all' || option.category === selectedCategory
  );

  const handlePracticeSelect = (option: PracticeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectPractice(option.id);
  };

  const handleCategoryChange = (category: 'all' | 'quick' | 'focus' | 'challenge') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  // Calculate daily practice stats
  const todayPractices = 2; // Mock - would come from game context
  const dailyGoal = 5;
  const dailyProgress = Math.min((todayPractices / dailyGoal) * 100, 100);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Background */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Goal Card */}
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.1)']}
          style={styles.dailyGoalCard}
        >
          <View style={styles.dailyGoalHeader}>
            <View style={styles.dailyGoalInfo}>
              <Text style={styles.dailyGoalTitle}>Daily Practice Goal</Text>
              <Text style={styles.dailyGoalSubtitle}>
                {todayPractices}/{dailyGoal} sessions completed
              </Text>
            </View>
            <View style={styles.dailyGoalBadge}>
              <FlameIcon size={20} color="#FF9500" />
              <Text style={styles.dailyGoalStreak}>{progress?.streak || 0}</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#6366F1', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${dailyProgress}%` }]}
            />
          </View>
          {dailyProgress >= 100 && (
            <View style={styles.goalCompleteTag}>
              <CheckIcon size={14} color="#10B981" />
              <Text style={styles.goalCompleteText}>Goal Complete!</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress?.level || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress?.xp || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress?.totalSessionsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          {(['all', 'quick', 'focus', 'challenge'] as const).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive,
              ]}>
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Practice Options */}
        <Text style={styles.sectionTitle}>Choose Your Practice</Text>

        {filteredOptions.map((option) => {
          const IconComponent = option.IconComponent;
          const difficultyColors = {
            easy: '#10B981',
            medium: '#F59E0B',
            hard: '#EF4444',
            extreme: '#8B5CF6',
          };
          const difficultyLabels = {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            extreme: 'Extreme',
          };
          const difficultyColor = difficultyColors[option.difficulty];
          const difficultyLabel = difficultyLabels[option.difficulty];

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handlePracticeSelect(option)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={option.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.practiceCard}
              >
                <View style={styles.practiceIcon}>
                  <IconComponent size={32} color="#FFFFFF" />
                </View>

                <View style={styles.practiceInfo}>
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceTitle}>
                      {option.title}
                    </Text>
                    <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '30', borderColor: difficultyColor }]}>
                      <Text style={[styles.difficultyBadgeText, { color: difficultyColor }]}>
                        {difficultyLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.practiceDescription}>
                    {option.description}
                  </Text>

                  <View style={styles.practiceFooter}>
                    <View style={styles.xpBadge}>
                      <Text style={styles.xpBadgeText}>+{option.xp} XP</Text>
                    </View>
                    <View style={styles.durationBadge}>
                      <TimerIcon size={12} color="rgba(255, 255, 255, 0.7)" />
                      <Text style={styles.durationText}>{option.duration}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.chevron}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        {/* Motivation Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🎯</Text>
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>Tip of the Day</Text>
            <Text style={styles.motivationText}>
              Consistent short practice sessions are more effective than occasional long ones!
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },

  // Daily Goal Card
  dailyGoalCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  dailyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyGoalInfo: {
    flex: 1,
  },
  dailyGoalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dailyGoalSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dailyGoalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  dailyGoalStreak: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF9500',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalCompleteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  goalCompleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
  },

  // Category Tabs
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTabActive: {
    backgroundColor: '#6366F1',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },

  // Practice Cards
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  practiceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  practiceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  practiceDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  practiceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 28,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },

  // Motivation Card
  motivationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  motivationEmoji: {
    fontSize: 28,
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
});
