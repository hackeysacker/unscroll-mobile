import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import type { ChallengeType } from '@/types';

export interface ExerciseStats {
  score: number;
  duration: number;
  accuracy: number;
  focusBreaks?: number;
  correctActions?: number;
  totalActions?: number;
  maxStreak?: number;
  xpEarned?: number;
  isPersonalBest?: boolean;
  achievements?: string[];
}

interface ExerciseOverviewProps {
  challengeType: ChallengeType;
  stats: ExerciseStats;
  onContinue: () => void;
  showHeartLoss?: boolean;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  onTryAgain?: () => void;
  onBack?: () => void;
}

export function ExerciseOverview({
  challengeType,
  stats,
  onContinue,
  showHeartLoss = false,
  onNextLesson,
  hasNextLesson = false,
  onTryAgain,
  onBack,
}: ExerciseOverviewProps) {
  const isPerfect = stats.score >= 95;
  const scoreColor = isPerfect ? '#10b981' : stats.score >= 80 ? '#f59e0b' : '#ef4444';

  // Calculate XP if not provided
  const xpEarned = stats.xpEarned ?? Math.round(stats.score * 0.5 + (isPerfect ? 25 : 0));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isPerfect ? 'Perfect! 🎉' : stats.score >= 80 ? 'Great Job! ⭐' : 'Exercise Complete'}
          </Text>
          {stats.isPersonalBest && (
            <View style={styles.personalBestBadge}>
              <Text style={styles.personalBestText}>🏆 NEW PERSONAL BEST!</Text>
            </View>
          )}
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: scoreColor }]}>
            {Math.round(stats.score)}
          </Text>
          <Text style={styles.scoreLabel}>Score</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{xpEarned} XP</Text>
          </View>
        </View>

        {/* Achievements */}
        {stats.achievements && stats.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            {stats.achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementBadge}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{Math.round(stats.accuracy)}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{(stats.duration / 1000).toFixed(1)}s</Text>
          </View>
          {stats.focusBreaks !== undefined && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Focus Breaks</Text>
              <Text style={styles.statValue}>{stats.focusBreaks}</Text>
            </View>
          )}
          {stats.maxStreak !== undefined && stats.maxStreak > 0 && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Best Streak</Text>
              <Text style={[styles.statValue, styles.streakValue]}>🔥 {stats.maxStreak}</Text>
            </View>
          )}
          {stats.correctActions !== undefined && stats.totalActions !== undefined && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Actions</Text>
              <Text style={styles.statValue}>{stats.correctActions}/{stats.totalActions}</Text>
            </View>
          )}
        </View>

        {/* Heart Loss Warning */}
        {showHeartLoss && stats.score < 80 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ You lost focus. This costs 1 heart.
            </Text>
          </View>
        )}

        {/* Perfect Bonus */}
        {isPerfect && (
          <View style={styles.bonusCard}>
            <Text style={styles.bonusText}>
              ✨ Perfect score! +25 Bonus XP!
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {hasNextLesson && onNextLesson && (
            <Button
              onPress={onNextLesson}
              size="lg"
              style={[styles.button, styles.nextButton]}
            >
              Next Lesson
            </Button>
          )}
          <Button
            onPress={onContinue}
            size="lg"
            style={styles.button}
          >
            Continue
          </Button>
          {onTryAgain && (
            <TouchableOpacity
              onPress={onTryAgain}
              style={styles.tryAgainButton}
            >
              <Text style={styles.tryAgainText}>Try Again</Text>
            </TouchableOpacity>
          )}
          {onBack && (
            <Button
              onPress={onBack}
              variant="outline"
              size="lg"
              style={styles.button}
            >
              ← Back to Progress Path
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 24,
    gap: 24,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreContainer: {
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#9ca3af',
  },
  xpBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  personalBestBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  personalBestText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  achievementBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  achievementText: {
    fontSize: 12,
    color: '#ffffff',
  },
  streakValue: {
    color: '#f59e0b',
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  statLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  warningCard: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  bonusCard: {
    backgroundColor: '#065f46',
    borderRadius: 8,
    padding: 12,
  },
  bonusText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  nextButton: {
    backgroundColor: '#6366f1',
  },
  tryAgainButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tryAgainText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

