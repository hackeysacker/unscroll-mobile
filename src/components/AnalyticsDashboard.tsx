import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { analytics, AnalyticsEvent, getAnalyticsSummary } from '@/lib/analytics';

interface AnalyticsDashboardProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export function AnalyticsDashboard({ onBack, onNavigate }: AnalyticsDashboardProps) {
  const { stats, progress, skillTree } = useGame();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  // Local analytics state
  const [analyticsSummary, setAnalyticsSummary] = useState<{
    totalEvents: number;
    unsyncedEvents: number;
    currentSession: any;
  } | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

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

  // Load analytics data
  useEffect(() => {
    const summary = analytics.getAnalyticsSummary();
    setAnalyticsSummary(summary);
    
    // Track screen view
    analytics.track(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: 'analytics_dashboard',
    });
  }, []);

  // Safe number formatting
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

  const formatDuration = (ms: number) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
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

  const safeProgress = {
    level: safeNumber(progress?.level, 1),
    totalXp: safeNumber(progress?.totalXp, 0),
    longestStreak: safeNumber(progress?.longestStreak, 0),
    totalSessionsCompleted: safeNumber(progress?.totalSessionsCompleted, 0),
    streak: safeNumber(progress?.streak, 0),
  };

  // Calculate derived metrics
  const engagementScore = Math.min(100, Math.round(
    (safeStats.currentStreak * 8) +
    (safeProgress.totalSessionsCompleted * 2) +
    (safeStats.challengesCompleted * 1.5)
  ));

  const avgXpPerSession = safeProgress.totalSessionsCompleted > 0 
    ? Math.round(safeProgress.totalXp / safeProgress.totalSessionsCompleted)
    : 0;

  const completionRate = safeProgress.totalSessionsCompleted > 0
    ? Math.round((safeStats.challengesCompleted / safeProgress.totalSessionsCompleted) * 100)
    : 0;

  // Weekly activity data (derived from stats)
  const weeklyActivity = [
    { day: 'Mon', value: Math.min(100, safeStats.currentStreak * 15), active: safeStats.currentStreak > 0 },
    { day: 'Tue', value: Math.min(100, safeStats.currentStreak * 12), active: safeStats.currentStreak > 1 },
    { day: 'Wed', value: Math.min(100, safeStats.currentStreak * 18), active: safeStats.currentStreak > 2 },
    { day: 'Thu', value: Math.min(100, safeStats.currentStreak * 10), active: safeStats.currentStreak > 3 },
    { day: 'Fri', value: Math.min(100, safeStats.currentStreak * 14), active: safeStats.currentStreak > 4 },
    { day: 'Sat', value: Math.min(100, safeStats.currentStreak * 20), active: safeStats.currentStreak > 5 },
    { day: 'Sun', value: Math.min(100, safeStats.currentStreak * 16), active: safeStats.currentStreak > 6 },
  ];

  // Event type breakdown
  const eventTypes = [
    { type: 'Challenges', emoji: '🎯', count: safeStats.challengesCompleted },
    { type: 'Sessions', emoji: '📱', count: safeProgress.totalSessionsCompleted },
    { type: 'Level Ups', emoji: '⬆️', count: Math.floor(safeProgress.totalXp / 1000) },
    { type: 'Skills', emoji: '🏆', count: Math.floor((safeNumber(skillTree?.focus, 0) + safeNumber(skillTree?.impulseControl, 0) + safeNumber(skillTree?.distractionResistance, 0)) / 3) },
  ];

  if (!stats && !progress) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Analytics" onBack={onBack} />
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
          {/* Engagement Score Card */}
          <View style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <Text style={styles.engagementLabel}>Engagement Score</Text>
              <Text style={styles.engagementTrend}>
                {engagementScore >= 80 ? '🔥 On Fire!' : 
                 engagementScore >= 50 ? '📈 Growing' : '🌱 Just Started'}
              </Text>
            </View>
            <View style={styles.engagementMain}>
              <Text style={styles.engagementValue}>{engagementScore}</Text>
              <Text style={styles.engagementMax}>/100</Text>
            </View>
            <View style={styles.engagementBar}>
              <View style={[styles.engagementFill, { width: `${engagementScore}%` }]} />
            </View>
            <Text style={styles.engagementHint}>
              Based on your streak, sessions, and challenge completion
            </Text>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.quickStatsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{safeStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={styles.statValue}>{safeStats.challengesCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>{safeProgress.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={styles.statEmoji}>💎</Text>
              <Text style={styles.statValue}>{safeProgress.totalXp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>

          {/* Weekly Activity Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weekly Activity</Text>
            <View style={styles.weeklyChart}>
              {weeklyActivity.map((day, index) => (
                <View key={day.day} style={styles.weeklyBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${Math.max(day.value, 5)}%` },
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
                <Text style={[styles.weeklyStatValue, { color: colors.foreground }]}>
                  {Math.min(safeStats.currentStreak, 7)}
                </Text>
                <Text style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>
                  Active Days
                </Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={[styles.weeklyStatValue, { color: colors.foreground }]}>
                  {safeStats.challengesCompleted}
                </Text>
                <Text style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>
                  Exercises
                </Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={[styles.weeklyStatValue, { color: colors.foreground }]}>
                  {formatTime(safeStats.totalTrainingTime)}
                </Text>
                <Text style={[styles.weeklyStatLabel, { color: colors.mutedForeground }]}>
                  Total Time
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Metrics */}
          <View style={[styles.metricsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Performance Metrics</Text>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>🎯</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Best Score</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {safeStats.bestScore}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>⏱️</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Avg Session</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {formatTime(safeStats.averageSessionDuration)}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>🏅</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Longest Streak</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {safeProgress.longestStreak} days
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>✅</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Completion Rate</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {completionRate}%
              </Text>
            </View>

            <View style={[styles.metricRow, styles.metricRowLast]}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>💰</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Avg XP/Session</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {avgXpPerSession} XP
              </Text>
            </View>
          </View>

          {/* Event Type Breakdown */}
          <View style={[styles.eventsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Activity Breakdown</Text>
            <View style={styles.eventGrid}>
              {eventTypes.map((item, index) => (
                <View key={item.type} style={styles.eventItem}>
                  <Text style={styles.eventEmoji}>{item.emoji}</Text>
                  <Text style={[styles.eventValue, { color: colors.foreground }]}>
                    {item.count}
                  </Text>
                  <Text style={[styles.eventLabel, { color: colors.mutedForeground }]}>
                    {item.type}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Analytics System Status */}
          <View style={[styles.systemCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Analytics System</Text>
            
            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>📊</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Total Events</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {analyticsSummary?.totalEvents || 0}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>☁️</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Synced</Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {(analyticsSummary?.totalEvents || 0) - (analyticsSummary?.unsyncedEvents || 0)}
              </Text>
            </View>

            <View style={[styles.metricRow, styles.metricRowLast]}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricEmoji}>📱</Text>
                <Text style={[styles.metricLabel, { color: colors.foreground }]}>Pending Sync</Text>
              </View>
              <Text style={[styles.metricValue, { color: analyticsSummary?.unsyncedEvents ? '#f59e0b' : colors.primary }]}>
                {analyticsSummary?.unsyncedEvents || 0}
              </Text>
            </View>
          </View>

          {/* Skills Progress */}
          <View style={[styles.skillsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Skills Progress</Text>

            <View style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={[styles.skillName, { color: colors.foreground }]}>🎯 Focus</Text>
                <Text style={[styles.skillPercent, { color: colors.primary }]}>
                  {safeNumber(skillTree?.focus, 0)}%
                </Text>
              </View>
              <View style={[styles.skillBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.skillFill, styles.skillFillFocus, { width: `${safeNumber(skillTree?.focus, 0)}%` }]} />
              </View>
            </View>

            <View style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={[styles.skillName, { color: colors.foreground }]}>🛡️ Impulse Control</Text>
                <Text style={[styles.skillPercent, { color: colors.primary }]}>
                  {safeNumber(skillTree?.impulseControl, 0)}%
                </Text>
              </View>
              <View style={[styles.skillBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.skillFill, styles.skillFillImpulse, { width: `${safeNumber(skillTree?.impulseControl, 0)}%` }]} />
              </View>
            </View>

            <View style={[styles.skillItem, styles.skillItemLast]}>
              <View style={styles.skillHeader}>
                <Text style={[styles.skillName, { color: colors.foreground }]}>🔰 Distraction Shield</Text>
                <Text style={[styles.skillPercent, { color: colors.primary }]}>
                  {safeNumber(skillTree?.distractionResistance, 0)}%
                </Text>
              </View>
              <View style={[styles.skillBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.skillFill, styles.skillFillDistraction, { width: `${safeNumber(skillTree?.distractionResistance, 0)}%` }]} />
              </View>
            </View>
          </View>

          {/* Spacer for bottom padding */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  // Engagement Card
  engagementCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#6366f1',
  },
  engagementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  engagementLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  engagementTrend: {
    fontSize: 14,
    color: '#fbbf24',
  },
  engagementMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  engagementValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  engagementMax: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  engagementBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  engagementFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  engagementHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  // Quick Stats Grid
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  // Chart Card
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 16,
  },
  weeklyBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    backgroundColor: '#6366f1',
    borderRadius: 4,
    minHeight: 4,
  },
  barInactive: {
    backgroundColor: '#e5e7eb',
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#6b7280',
  },
  dayLabelInactive: {
    opacity: 0.5,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  weeklyStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  // Metrics Card
  metricsCard: {
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
    borderBottomColor: '#e5e7eb',
  },
  metricRowLast: {
    borderBottomWidth: 0,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 15,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Events Card
  eventsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  eventEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  eventValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  eventLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  // System Card
  systemCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  // Skills Card
  skillsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skillItem: {
    marginBottom: 16,
  },
  skillItemLast: {
    marginBottom: 0,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
  },
  skillPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  skillBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillFillFocus: {
    backgroundColor: '#6366f1',
  },
  skillFillImpulse: {
    backgroundColor: '#22c55e',
  },
  skillFillDistraction: {
    backgroundColor: '#f59e0b',
  },
  bottomSpacer: {
    height: 40,
  },
});
