import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { UIIcon } from '@/components/ui/UIIcon';
import {
  getJourneyLevel,
  getTestForLevel,
  getNextSuggestedActivity,
  type JourneyActivity,
  type JourneyTest,
} from '@/lib/journey-levels';
import type { ChallengeType } from '@/types';
import type { ExerciseType } from '@/lib/exercise-types';

interface FocusJourneyPageProps {
  level: number;
  onBack: () => void;
  onSelectActivity: (activityType: ChallengeType | ExerciseType, isTest?: boolean, testSequence?: (ChallengeType | ExerciseType)[]) => void;
}

export function FocusJourneyPage({ level, onBack, onSelectActivity }: FocusJourneyPageProps) {
  const { progress, canStartChallenge } = useGame();
  const { colors } = useTheme();
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<JourneyActivity | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Entrance animation
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
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [level]);

  if (!progress) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const journeyLevel = getJourneyLevel(level, progress.level);
  const test = getTestForLevel(level);
  const nextSuggested = getNextSuggestedActivity(level, completedToday);

  // All activities are required in the new system
  const isTestLevel = level % 25 === 0;
  const activities = journeyLevel.activities;

  const handleActivityPress = (activity: JourneyActivity) => {
    const { canStart } = canStartChallenge(false);
    if (!canStart) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedActivity(activity);
    onSelectActivity(activity.type as any, false);
  };

  const handleTestPress = (test: JourneyTest) => {
    const { canStart } = canStartChallenge(true);
    if (!canStart) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSelectActivity(test.activities[0] as any, true, test.activities as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={`${journeyLevel.realmName} • Level ${level}`}
        onBack={onBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Level Header */}
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.05)']}
            style={styles.levelHeader}
          >
            <View style={styles.levelInfo}>
              <Text style={styles.realmName}>{journeyLevel.realmName}</Text>
              <Text style={styles.levelNumber}>Level {level}</Text>
              <View style={styles.levelStats}>
                <Text style={styles.statBadge}>
                  {activities.length} exercise{activities.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.statBadge}>
                  ~{Math.round(journeyLevel.totalDuration / 60)} min
                </Text>
              </View>
            </View>

            <View style={styles.xpInfo}>
              <Text style={styles.xpLabel}>Total XP</Text>
              <Text style={styles.xpValue}>{journeyLevel.totalXP}</Text>
            </View>
          </LinearGradient>

          {/* Next Suggested Activity - Only show if NOT a test level */}
          {!isTestLevel && nextSuggested && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <UIIcon name="target" size={20} color="#6366F1" />
                <Text style={styles.sectionTitleText}>Start Here</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleActivityPress(nextSuggested)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  style={styles.suggestedCard}
                >
                  <ActivityIcon
                    activityType={nextSuggested.type}
                    size={32}
                    color="#FFFFFF"
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                  />
                  <View style={styles.suggestedInfo}>
                    <Text style={styles.suggestedName}>{nextSuggested.name}</Text>
                    <Text style={styles.suggestedDescription}>{nextSuggested.description}</Text>
                    <View style={styles.suggestedMeta}>
                      <View style={styles.metaRow}>
                        <UIIcon name="clock" size={14} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.suggestedDuration}>{Math.round(nextSuggested.duration / 60)}m</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <UIIcon name="diamond" size={14} color="rgba(255,255,255,0.9)" />
                        <Text style={styles.suggestedXP}>{nextSuggested.xpReward} XP</Text>
                      </View>
                      <Text style={styles.suggestedLevel}>Lv.{nextSuggested.difficultyLevel}</Text>
                    </View>
                  </View>
                  <Text style={styles.playIcon}>▶</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* All Activities - Only show if NOT a test level */}
          {!isTestLevel && activities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <UIIcon name="book" size={20} color="#6366F1" />
                <Text style={styles.sectionTitleText}>Exercises ({activities.length})</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Complete all exercises to finish this level
              </Text>

              {activities.map((activity, index) => (
                <TouchableOpacity
                  key={`activity-${index}`}
                  onPress={() => handleActivityPress(activity)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(17, 24, 39, 0.8)', 'rgba(17, 24, 39, 0.6)']}
                    style={styles.activityCard}
                  >
                    <View style={styles.activityNumber}>
                      <Text style={styles.activityNumberText}>{index + 1}</Text>
                    </View>
                    <ActivityIcon
                      activityType={activity.type}
                      size={28}
                      color="#FFFFFF"
                      backgroundColor="rgba(99, 102, 241, 0.15)"
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                      <View style={styles.activityMeta}>
                        <View style={styles.metaTag}>
                          <UIIcon name="clock" size={12} color="#A0AEC0" />
                          <Text style={styles.metaText}>{Math.round(activity.duration / 60)}m</Text>
                        </View>
                        <View style={styles.metaTag}>
                          <UIIcon name="diamond" size={12} color="#A0AEC0" />
                          <Text style={styles.metaText}>{activity.xpReward} XP</Text>
                        </View>
                        <View style={[styles.metaTag, styles.difficultyTag]}>
                          <Text style={styles.metaText}>Lv.{activity.difficultyLevel}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Mastery Test - Endurance Exercise */}
          {test && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <UIIcon name="crown" size={22} color="#F59E0B" />
                <Text style={styles.sectionTitleText}>{test.realmName} Mastery Test</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                One comprehensive endurance exercise practicing all skills from this realm
              </Text>

              <TouchableOpacity
                onPress={() => handleTestPress(test)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.testCard}
                >
                  <View style={styles.testHeader}>
                    <UIIcon name="crown" size={48} color="#FFFFFF" withBackground backgroundColor="rgba(255, 255, 255, 0.2)" />
                    <View style={styles.testInfo}>
                      <Text style={styles.testName}>{test.name}</Text>
                      <Text style={styles.testDescription}>{test.description}</Text>
                      <View style={styles.enduranceRow}>
                        <UIIcon name="muscle" size={16} color="#FFFFFF" />
                        <Text style={styles.testEnduranceText}>
                          ENDURANCE TEST • All {test.activities.length} skills in sequence
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.testDetails}>
                    <View style={styles.testStat}>
                      <Text style={styles.testStatLabel}>Duration</Text>
                      <Text style={styles.testStatValue}>{Math.round(test.totalDuration / 60)}m</Text>
                    </View>
                    <View style={styles.testStat}>
                      <Text style={styles.testStatLabel}>Passing Score</Text>
                      <Text style={styles.testStatValue}>{test.passingScore}%</Text>
                    </View>
                    <View style={styles.testStat}>
                      <Text style={styles.testStatLabel}>XP Reward</Text>
                      <Text style={styles.testStatValue}>{test.totalXP}</Text>
                    </View>
                  </View>

                  <View style={styles.testPlayButton}>
                    <Text style={styles.testPlayText}>START MASTERY TEST ▶</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  // Level Header
  levelHeader: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  realmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  levelStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpInfo: {
    alignItems: 'flex-end',
  },
  xpLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  xpValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
    lineHeight: 20,
  },

  // Suggested Activity
  suggestedCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestedIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  suggestedDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  suggestedMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestedDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  suggestedXP: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  suggestedLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // Activity Card
  activityCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  activityIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    lineHeight: 18,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  difficultyTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },

  // Test Card
  testCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 8,
  },
  testEnduranceLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  enduranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testEnduranceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  testDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  testStat: {
    alignItems: 'center',
  },
  testStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  testStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  testPlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  testPlayText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Bottom
  bottomSpacer: {
    height: 40,
  },
});
