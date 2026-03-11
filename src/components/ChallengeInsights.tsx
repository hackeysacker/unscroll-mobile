import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { useAttentionAvatar } from '@/contexts/AttentionAvatarContext';
import { getChallengeName } from '@/lib/challenge-progression';
import type { ChallengeType } from '@/types';

interface ChallengeInsightsProps {
  challengeType: ChallengeType;
  level: number;
  score: number;
  duration: number;
  isPerfect: boolean;
  xpEarned: number;
  onContinue: () => void;
  onRetry: () => void;
  onBack: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Enhanced Challenge Insights - Beautiful feedback with key metrics
 */
export function ChallengeInsights({
  challengeType,
  level,
  score,
  duration,
  isPerfect,
  xpEarned,
  onContinue,
  onRetry,
  onBack,
}: ChallengeInsightsProps) {
  const insets = useSafeAreaInsets();
  const { triggerReaction } = useAttentionAvatar();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [animatedScore, setAnimatedScore] = useState(0);

  const isPassed = score >= 80;

  useEffect(() => {
    // Trigger avatar reaction
    if (isPerfect) {
      triggerReaction('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (isPassed) {
      triggerReaction('success');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      triggerReaction('failure');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnim, {
        toValue: score,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(progressAnim, {
        toValue: score,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const listener = scoreAnim.addListener(({ value }) => {
      setAnimatedScore(Math.round(value));
    });

    return () => {
      scoreAnim.removeListener(listener);
    };
  }, []);

  const getScoreColor = () => {
    if (isPerfect) return '#FFD700';
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#6366F1';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreGrade = () => {
    if (isPerfect) return 'S';
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  const getScoreMessage = () => {
    if (isPerfect) return 'Perfect!';
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Well Done!';
    if (score >= 70) return 'Good Effort!';
    return 'Keep Trying!';
  };

  const calculateMetrics = () => {
    const accuracy = Math.min(100, Math.round(score * 0.90 + 8));
    const reactionTime = Math.round(250 + (100 - score) * 2.5);
    const focus = Math.min(100, Math.round(score * 0.88 + 10));
    return { accuracy, reactionTime, focus };
  };

  const getInsights = () => {
    const insights: Record<string, string[]> = {
      focus_hold: score >= 80
        ? [
            'Strong sustained attention - keep building endurance',
            'Your focus remains stable throughout the challenge',
            'Try longer durations to push your limits further',
          ]
        : [
            'Focus tends to drift mid-challenge',
            'Try deep breathing before starting',
            'Practice daily to build sustained attention',
          ],

      memory_flash: score >= 80
        ? [
            'Excellent visual memory encoding',
            'Group items into categories for even better recall',
            'Your pattern recognition is strong',
          ]
        : [
            'Use chunking: group items into smaller sets',
            'Create mental stories to link items together',
            'Visualization improves retention significantly',
          ],

      tap_only_correct: score >= 80
        ? [
            'Strong impulse control and pattern recognition',
            'Work on faster decision-making next time',
            'Your accuracy remains consistent under pressure',
          ]
        : [
            'Slow down slightly - accuracy over speed',
            'Trust your first instinct more',
            'Build pattern recognition through repetition',
          ],

      breath_pacing: score >= 80
        ? [
            'Good breathing rhythm maintained',
            'Focus on smooth transitions between breaths',
            'Diaphragmatic breathing is more sustainable',
          ]
        : [
            'Don\'t force the pace - breathe naturally',
            'Practice diaphragm breathing, not chest breathing',
            'Consistency beats intensity in breath work',
          ],

      stillness_test: score >= 80
        ? [
            'Minimal movement detected - excellent control',
            'Find your most stable position before starting',
            'Mind-body connection is developing well',
          ]
        : [
            'Micro-movements detected - relax more',
            'Mental stillness creates physical stillness',
            'Try different sitting positions for stability',
          ],

      slow_tracking: score >= 80
        ? [
            'Good smooth pursuit eye movements',
            'Maintain peripheral awareness while tracking',
            'Predict target movement for smoother tracking',
          ]
        : [
            'Keep eyes relaxed, not strained',
            'Anticipate where the target will move',
            'Smooth pursuit improves with daily practice',
          ],

      default: score >= 80
        ? [
            'Solid performance across all metrics',
            'Your consistency is improving',
            'Keep practicing daily for best results',
          ]
        : [
            'Focus on the fundamentals first',
            'Small daily improvements compound over time',
            'Review the challenge guide for tips',
          ],
    };

    return insights[challengeType] || insights.default;
  };

  const scoreColor = getScoreColor();
  const metrics = calculateMetrics();
  const insights = getInsights();
  const radius = 70;
  const circumference = radius * 2 * Math.PI;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
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
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            paddingBottom: Math.max(insets.bottom + 20, 24),
          },
        ]}
      >
        {/* Hero Score Circle */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            {/* Dual glow effect */}
            <View style={[styles.scoreGlow, { backgroundColor: scoreColor + '15' }]} />
            <View style={[styles.scoreGlowInner, { backgroundColor: scoreColor + '25' }]} />

            {/* Circular progress */}
            <Svg width={160} height={160} style={{ position: 'absolute' }}>
              <Circle
                cx={80}
                cy={80}
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={10}
                fill="none"
              />
              <AnimatedCircle
                cx={80}
                cy={80}
                r={radius}
                stroke={scoreColor}
                strokeWidth={10}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 80 80)`}
              />
            </Svg>

            {/* Score number */}
            <View style={styles.scoreContent}>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {animatedScore}
              </Text>
              <Text style={styles.scoreGrade}>{getScoreGrade()}</Text>
            </View>
          </View>

          {/* Score message */}
          <Text style={[styles.scoreMessage, { color: scoreColor }]}>
            {getScoreMessage()}
          </Text>

          {/* Challenge info */}
          <Text style={styles.challengeName}>{getChallengeName(challengeType)}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Level {level}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{(duration / 1000).toFixed(1)}s</Text>
            {isPerfect && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.perfectText}>⭐ Perfect</Text>
              </>
            )}
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.04)']}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{metrics.accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(245, 158, 11, 0.12)', 'rgba(245, 158, 11, 0.04)']}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{metrics.reactionTime}ms</Text>
            <Text style={styles.statLabel}>Reaction</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(139, 92, 246, 0.12)', 'rgba(139, 92, 246, 0.04)']}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{metrics.focus}%</Text>
            <Text style={styles.statLabel}>Focus</Text>
          </LinearGradient>
        </View>

        {/* Status + XP Card */}
        <LinearGradient
          colors={isPassed
            ? ['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.08)']
            : ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statusCard}
        >
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: isPassed ? '#10B981' : '#EF4444' }]}>
                {isPassed ? '✓ PASSED' : '✗ FAILED'}
              </Text>
            </View>

            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.xpBadge}
            >
              <Text style={styles.xpIcon}>✨</Text>
              <Text style={styles.xpValue}>+{xpEarned} XP</Text>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Insights Card */}
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightCard}
        >
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={styles.insightLabel}>Key Insights</Text>
          </View>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isPassed && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onRetry();
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryIcon}>🔄</Text>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onContinue();
            }}
            style={[styles.continueButton, !isPassed && styles.continueButtonFailed]}
          >
            <LinearGradient
              colors={isPassed ? ['#6366F1', '#8B5CF6'] : ['#4B5563', '#374151']}
              style={styles.continueGradient}
            >
              <Text style={styles.continueText}>
                {isPassed ? 'Continue' : 'Go Back'}
              </Text>
              <Text style={styles.continueIcon}>{isPassed ? '→' : '←'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 18,
  },

  // Hero Score
  scoreSection: {
    alignItems: 'center',
    gap: 12,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.4,
  },
  scoreGlowInner: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    opacity: 0.3,
  },
  scoreContent: {
    alignItems: 'center',
    gap: 4,
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
  },
  scoreGrade: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1.5,
  },
  scoreMessage: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  metaDot: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  perfectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
  },

  // Quick Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Status + XP
  statusCard: {
    borderRadius: 18,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  xpBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  xpIcon: {
    fontSize: 16,
  },
  xpValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Insights
  insightCard: {
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  insightIcon: {
    fontSize: 22,
  },
  insightLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C4B5FD',
    letterSpacing: 0.3,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '800',
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Actions
  actions: {
    gap: 10,
    marginTop: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  retryIcon: {
    fontSize: 16,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  continueButtonFailed: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
      },
    }),
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  continueIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
