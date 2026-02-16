/**
 * Daily Challenge Screen
 * Shows the daily challenge with special rewards
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useDailyChallenge } from '@/contexts/DailyChallengeContext';
import { DailyChallengeCard } from './DailyChallengeCard';
import { getUpcomingChallenges } from '@/lib/daily-challenge-manager';

interface DailyChallengeScreenProps {
  onBack: () => void;
  onStartChallenge: (challengeType: string) => void;
}

export function DailyChallengeScreen({ onBack, onStartChallenge }: DailyChallengeScreenProps) {
  const { colors } = useTheme();
  const { dailyChallenge, progress, isCompleted } = useDailyChallenge();

  const upcomingChallenges = getUpcomingChallenges(3);

  const handleStartChallenge = () => {
    onStartChallenge(dailyChallenge.challengeType);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Daily Challenge</Text>
            <Text style={styles.headerSubtitle}>
              Complete for bonus rewards
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Today's Challenge */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <Text style={styles.sectionTitle}>Today's Challenge</Text>
            </View>
            <DailyChallengeCard
              challenge={dailyChallenge}
              isCompleted={isCompleted}
              currentStreak={progress?.currentStreak || 0}
              onStart={handleStartChallenge}
            />
          </View>

          {/* Streak Info */}
          {progress && progress.currentStreak > 0 && (
            <View style={styles.streakSection}>
              <View style={styles.streakCard}>
                <Text style={styles.streakTitle}>🔥 Daily Challenge Streak</Text>
                <Text style={styles.streakValue}>{progress.currentStreak} Days</Text>
                {progress.longestStreak > progress.currentStreak && (
                  <Text style={styles.streakRecord}>
                    Record: {progress.longestStreak} days
                  </Text>
                )}
                {progress.currentStreak >= 7 && (
                  <View style={styles.streakMilestone}>
                    <Text style={styles.streakMilestoneText}>
                      ⭐ Weekly Streak Bonus: +100 XP, +5 💎
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Upcoming Challenges Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📅</Text>
              <Text style={styles.sectionTitle}>Upcoming Challenges</Text>
            </View>
            <View style={styles.upcomingList}>
              {upcomingChallenges.map((challenge, index) => (
                <View key={challenge.id} style={styles.upcomingItem}>
                  <View style={styles.upcomingLeft}>
                    <Text style={styles.upcomingDay}>Day {index + 1}</Text>
                    <View style={styles.upcomingInfo}>
                      <Text style={styles.upcomingTitle}>{challenge.title}</Text>
                      <Text style={styles.upcomingDesc}>{challenge.challengeType.replace(/_/g, ' ')}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.upcomingDifficulty,
                    {
                      backgroundColor:
                        challenge.difficulty === 'easy'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : challenge.difficulty === 'medium'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                    },
                  ]}>
                    <Text
                      style={[
                        styles.upcomingDifficultyText,
                        {
                          color:
                            challenge.difficulty === 'easy'
                              ? '#10B981'
                              : challenge.difficulty === 'medium'
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      {challenge.difficulty}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>ℹ️</Text>
              <Text style={styles.sectionTitle}>How It Works</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  New challenge available every day at midnight
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Complete the target score to earn rewards
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Earn bonus rewards for perfect scores and speed
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  Build a streak for weekly bonus rewards (+100 XP every 7 days)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streakSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  streakCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakRecord: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  streakMilestone: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakMilestoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  upcomingList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  upcomingDay: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  upcomingDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'capitalize',
  },
  upcomingDifficulty: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingDifficultyText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoBullet: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
});
