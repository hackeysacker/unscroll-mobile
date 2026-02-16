import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

interface InsightsProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export function Insights({ onBack, onNavigate }: InsightsProps) {
  const { stats, progress, skillTree } = useGame();
  const { user } = useAuth();
  const { colors } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Safe number formatting - prevents NaN
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
  };

  const formatTime = (ms: any) => {
    const safeMs = safeNumber(ms, 0);
    const seconds = Math.floor(safeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Safe stats with fallbacks
  const safeStats = {
    currentStreak: safeNumber(stats?.currentStreak, 0),
    challengesCompleted: safeNumber(stats?.challengesCompleted, 0),
    bestScore: safeNumber(stats?.bestScore, 0),
    totalTrainingTime: safeNumber(stats?.totalTrainingTime, 0),
    averageSessionDuration: safeNumber(stats?.averageSessionDuration, 0),
  };

  // Safe progress with fallbacks
  const safeProgress = {
    level: safeNumber(progress?.level, 1),
    totalXp: safeNumber(progress?.totalXp, 0),
    longestStreak: safeNumber(progress?.longestStreak, 0),
    totalSessionsCompleted: safeNumber(progress?.totalSessionsCompleted, 0),
    streak: safeNumber(progress?.streak, 0),
  };

  if (!stats && !progress) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading insights...</Text>
      </View>
    );
  }

  // Calculate performance metrics with safe values
  const focusScore = Math.min(100, Math.round(
    (safeStats.currentStreak * 5) +
    (safeProgress.level * 8) +
    (safeStats.challengesCompleted * 0.5)
  ));

  // Weekly data (mock for now - would come from real data)
  const weeklyData = [
    { day: 'Mon', value: 65, active: true },
    { day: 'Tue', value: 80, active: true },
    { day: 'Wed', value: 45, active: true },
    { day: 'Thu', value: 90, active: true },
    { day: 'Fri', value: 70, active: true },
    { day: 'Sat', value: 0, active: false },
    { day: 'Sun', value: 0, active: false },
  ];

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate?.('premium');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Insights" onBack={onBack} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Focus Score Card */}
          <View style={styles.focusScoreCard}>
            <View style={styles.focusScoreHeader}>
              <Text style={styles.focusScoreLabel}>Focus Score</Text>
              <Text style={styles.focusScoreTrend}>↑ 12% this week</Text>
            </View>
            <View style={styles.focusScoreMain}>
              <Text style={styles.focusScoreValue}>{focusScore}</Text>
              <Text style={styles.focusScoreMax}>/100</Text>
            </View>
            <View style={styles.focusScoreBar}>
              <View style={[styles.focusScoreFill, { width: `${focusScore}%` }]} />
            </View>
            <Text style={styles.focusScoreHint}>
              {focusScore >= 80 ? 'Excellent focus! Keep it up! 🔥' :
               focusScore >= 60 ? 'Good progress! Stay consistent 💪' :
               focusScore >= 40 ? 'Building momentum! Keep training 🌱' :
               'Every journey starts here! 🚀'}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatEmoji}>🔥</Text>
              <Text style={styles.quickStatValue}>{safeStats.currentStreak}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatEmoji}>⭐</Text>
              <Text style={styles.quickStatValue}>{safeProgress.level}</Text>
              <Text style={styles.quickStatLabel}>Level</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatEmoji}>💎</Text>
              <Text style={styles.quickStatValue}>{safeProgress.totalXp}</Text>
              <Text style={styles.quickStatLabel}>XP</Text>
            </View>
          </View>

          {/* Weekly Activity */}
          <View style={styles.weeklyCard}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.weeklyChart}>
              {weeklyData.map((day, index) => (
                <View key={day.day} style={styles.weeklyBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${day.value}%` },
                        !day.active && styles.barInactive
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, !day.active && styles.dayLabelInactive]}>
                    {day.day}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>{Math.min(safeStats.currentStreak, 7)}</Text>
                <Text style={styles.weeklyStatLabel}>Active Days</Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>{safeStats.challengesCompleted}</Text>
                <Text style={styles.weeklyStatLabel}>Exercises</Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>{formatTime(safeStats.totalTrainingTime)}</Text>
                <Text style={styles.weeklyStatLabel}>Total Time</Text>
              </View>
            </View>
          </View>

          {/* Performance Metrics */}
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Performance</Text>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>🎯</Text>
                <Text style={styles.metricLabel}>Best Score</Text>
              </View>
              <Text style={styles.metricValue}>{safeStats.bestScore}%</Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>⏱️</Text>
                <Text style={styles.metricLabel}>Avg Session</Text>
              </View>
              <Text style={styles.metricValue}>{formatTime(safeStats.averageSessionDuration)}</Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>🏆</Text>
                <Text style={styles.metricLabel}>Longest Streak</Text>
              </View>
              <Text style={styles.metricValue}>{safeProgress.longestStreak} days</Text>
            </View>

            <View style={[styles.metricRow, styles.metricRowLast]}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>✅</Text>
                <Text style={styles.metricLabel}>Completion Rate</Text>
              </View>
              <Text style={styles.metricValue}>
                {safeProgress.totalSessionsCompleted > 0
                  ? Math.round((safeStats.challengesCompleted / (safeProgress.totalSessionsCompleted * 3)) * 100)
                  : 0}%
              </Text>
            </View>
          </View>

          {/* Skill Breakdown */}
          <View style={styles.skillsCard}>
            <Text style={styles.sectionTitle}>Skills Progress</Text>

            <View style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>🎯 Focus</Text>
                <Text style={styles.skillPercent}>{safeNumber(skillTree?.focus, 0)}%</Text>
              </View>
              <View style={styles.skillBar}>
                <View style={[styles.skillFill, styles.skillFillFocus, { width: `${safeNumber(skillTree?.focus, 0)}%` }]} />
              </View>
            </View>

            <View style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>🛡️ Impulse Control</Text>
                <Text style={styles.skillPercent}>{safeNumber(skillTree?.impulseControl, 0)}%</Text>
              </View>
              <View style={styles.skillBar}>
                <View style={[styles.skillFill, styles.skillFillImpulse, { width: `${safeNumber(skillTree?.impulseControl, 0)}%` }]} />
              </View>
            </View>

            <View style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>🔰 Distraction Shield</Text>
                <Text style={styles.skillPercent}>{safeNumber(skillTree?.distractionResistance, 0)}%</Text>
              </View>
              <View style={styles.skillBar}>
                <View style={[styles.skillFill, styles.skillFillDistraction, { width: `${safeNumber(skillTree?.distractionResistance, 0)}%` }]} />
              </View>
            </View>
          </View>

          {/* Premium Upsell */}
          {!user?.isPremium && (
            <TouchableOpacity style={styles.premiumCard} onPress={handleUpgrade}>
              <View style={styles.premiumContent}>
                <Text style={styles.premiumIcon}>📊</Text>
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Unlock Deep Analytics</Text>
                  <Text style={styles.premiumSubtitle}>
                    Detailed trends, AI insights, and personalized recommendations
                  </Text>
                </View>
              </View>
              <Text style={styles.premiumArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* Achievements Preview */}
          <View style={styles.achievementsCard}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => onNavigate?.('skill-tree')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.achievementsList}>
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🔥</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>On Fire</Text>
                  <Text style={styles.achievementDate}>3-day streak</Text>
                </View>
              </View>
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🎯</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>First Focus</Text>
                  <Text style={styles.achievementDate}>Completed first exercise</Text>
                </View>
              </View>
            </View>
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

  // Focus Score Card
  focusScoreCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  focusScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  focusScoreTrend: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  focusScoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  focusScoreValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
  },
  focusScoreMax: {
    fontSize: 24,
    color: '#64748B',
    marginLeft: 4,
  },
  focusScoreBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  focusScoreFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  focusScoreHint: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  quickStatEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  // Weekly Card
  weeklyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 16,
  },
  weeklyBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
    minHeight: 4,
  },
  barInactive: {
    backgroundColor: '#334155',
  },
  dayLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  dayLabelInactive: {
    color: '#475569',
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  weeklyStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },

  // Metrics Card
  metricsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  metricRowLast: {
    borderBottomWidth: 0,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricEmoji: {
    fontSize: 20,
  },
  metricLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Skills Card
  skillsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skillItem: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  skillPercent: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  skillBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillFillFocus: {
    backgroundColor: '#3B82F6',
  },
  skillFillImpulse: {
    backgroundColor: '#A855F7',
  },
  skillFillDistraction: {
    backgroundColor: '#10B981',
  },

  // Premium Card
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  premiumIcon: {
    fontSize: 32,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  premiumSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  premiumArrow: {
    fontSize: 20,
    color: '#A78BFA',
  },

  // Achievements Card
  achievementsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  achievementsList: {
    gap: 12,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  achievementDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
