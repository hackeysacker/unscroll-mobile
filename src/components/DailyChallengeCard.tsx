/**
 * Daily Challenge Card Component
 * Displays the daily challenge with rewards and completion status
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { DailyChallenge } from '@/lib/daily-challenge-manager';
import { getTimeUntilNextChallenge } from '@/lib/daily-challenge-manager';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  isCompleted: boolean;
  currentStreak: number;
  onStart: () => void;
}

export function DailyChallengeCard({
  challenge,
  isCompleted,
  currentStreak,
  onStart,
}: DailyChallengeCardProps) {
  const { colors } = useTheme();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextChallenge());

  // Glow animation
  useEffect(() => {
    if (!isCompleted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isCompleted]);

  // Update countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextChallenge());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (): [string, string] => {
    switch (challenge.difficulty) {
      case 'easy':
        return ['#10B981', '#059669'];
      case 'medium':
        return ['#F59E0B', '#D97706'];
      case 'hard':
        return ['#EF4444', '#DC2626'];
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.6)'],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect when not completed */}
      {!isCompleted && (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: glowColor,
            },
          ]}
        />
      )}

      <BlurView intensity={60} tint="dark" style={styles.card}>
        <LinearGradient
          colors={isCompleted ? ['#1F2937', '#111827'] : getDifficultyColor()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.difficultyBadge, { backgroundColor: isCompleted ? '#6B7280' : 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.difficultyText}>
                  {challenge.difficulty.toUpperCase()}
                </Text>
              </View>
              {currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>🔥 {currentStreak} Day Streak</Text>
                </View>
              )}
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ COMPLETED</Text>
              </View>
            )}
          </View>

          {/* Title & Description */}
          <View style={styles.content}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.description}>{challenge.description}</Text>

            {/* Target Score */}
            <View style={styles.targetContainer}>
              <Text style={styles.targetLabel}>Target Score:</Text>
              <Text style={styles.targetValue}>{challenge.targetScore}%</Text>
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardsTitle}>Rewards:</Text>
            <View style={styles.rewardsList}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={styles.rewardText}>{challenge.rewards.xp} XP</Text>
              </View>
              {challenge.rewards.gems && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>💎</Text>
                  <Text style={styles.rewardText}>{challenge.rewards.gems} Gems</Text>
                </View>
              )}
              {challenge.rewards.hearts && (
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardIcon}>❤️</Text>
                  <Text style={styles.rewardText}>{challenge.rewards.hearts} Heart</Text>
                </View>
              )}
            </View>

            {/* Bonus Rewards */}
            {challenge.bonusRewards && (
              <View style={styles.bonusContainer}>
                <Text style={styles.bonusTitle}>Bonus Rewards:</Text>
                {challenge.bonusRewards.perfectBonus && (
                  <View style={styles.bonusItem}>
                    <Text style={styles.bonusLabel}>💯 Perfect:</Text>
                    <Text style={styles.bonusValue}>
                      +{challenge.bonusRewards.perfectBonus.xp} XP
                      {challenge.bonusRewards.perfectBonus.gems && `, ${challenge.bonusRewards.perfectBonus.gems} 💎`}
                    </Text>
                  </View>
                )}
                {challenge.bonusRewards.speedBonus && (
                  <View style={styles.bonusItem}>
                    <Text style={styles.bonusLabel}>⚡ Speed:</Text>
                    <Text style={styles.bonusValue}>
                      +{challenge.bonusRewards.speedBonus.xp} XP under {challenge.bonusRewards.speedBonus.threshold}s
                      {challenge.bonusRewards.speedBonus.gems && `, ${challenge.bonusRewards.speedBonus.gems} 💎`}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Action Button or Countdown */}
          {isCompleted ? (
            <View style={styles.completedContainer}>
              <Text style={styles.completedMessage}>Challenge completed! 🎉</Text>
              <Text style={styles.countdownText}>
                New challenge in {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={onStart}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start Challenge</Text>
              <Text style={styles.startButtonIcon}>▶</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 24,
    zIndex: 0,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  completedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  targetValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  rewardsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  rewardsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  rewardsList: {
    flexDirection: 'row',
    gap: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardIcon: {
    fontSize: 18,
  },
  rewardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bonusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bonusTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  bonusLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  bonusValue: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  startButtonIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  completedMessage: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  countdownText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
});
