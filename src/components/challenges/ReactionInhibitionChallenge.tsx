/**
 * REACTION INHIBITION CHALLENGE
 * Tap only GREEN targets - resist tapping RED and BLUE
 *
 * Difficulty Scaling:
 * - Faster target switching at higher levels
 * - More non-green targets at higher levels
 * - Shorter display duration at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface ReactionInhibitionChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

interface Target {
  id: number;
  color: 'green' | 'red' | 'blue';
  shouldTap: boolean;
}

export function ReactionInhibitionChallenge({ duration, onComplete, onBack, level = 1 }: ReactionInhibitionChallengeProps) {
  // Hooks
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('reaction_inhibition');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Tracking refs
  const correctActionsRef = useRef(0);
  const wrongActionsRef = useRef(0);
  const maxStreakRef = useRef(0);
  const inhibitionsRef = useRef(0); // Successfully ignored non-green
  const targetShowTimeRef = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const targetAppearAnim = useRef(new Animated.Value(0)).current;

  const targetRule = 'green';

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = ((duration - timeLeft) / duration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, duration]);

  // Generate targets
  useEffect(() => {
    if (!isActive) return;

    const generateTarget = () => {
      const colors: Array<'green' | 'red' | 'blue'> = ['green', 'red', 'blue'];

      // Adjust probability based on level
      const greenProbability = Math.max(0.3, 0.5 - (level * 0.02));
      const rand = Math.random();
      const color = rand < greenProbability ? 'green' : (rand < 0.65 ? 'red' : 'blue');
      const shouldTap = color === targetRule;

      const targetId = Date.now();
      setCurrentTarget({
        id: targetId,
        color,
        shouldTap,
      });
      targetShowTimeRef.current = targetId;

      // Animate target appearance
      targetAppearAnim.setValue(0);
      Animated.spring(targetAppearAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      haptics.impactLight();
      sound.targetAppear();

      // Auto-hide after duration
      const displayDuration = Math.max(1000, 1800 - (level * 50));
      setTimeout(() => {
        setCurrentTarget(prev => {
          if (prev) {
            if (!prev.shouldTap) {
              // Correctly inhibited
              correctActionsRef.current += 1;
              inhibitionsRef.current += 1;
              const newStreak = currentStreak + 1;
              setCurrentStreak(newStreak);
              if (newStreak > maxStreakRef.current) {
                maxStreakRef.current = newStreak;
              }
            } else {
              // Missed green target
              wrongActionsRef.current += 1;
              setCurrentStreak(0);
            }
          }
          return null;
        });
      }, displayDuration);
    };

    generateTarget();
    const interval = Math.max(1500, 2500 - (level * 80));
    const intervalId = setInterval(generateTarget, interval);

    return () => clearInterval(intervalId);
  }, [isActive, level, currentStreak]);

  const handleTap = () => {
    if (!currentTarget) return;

    // Animate tap
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentTarget.shouldTap) {
      // Correct tap
      correctActionsRef.current += 1;
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreakRef.current) {
        maxStreakRef.current = newStreak;
      }
      setFeedback('correct');
      haptics.notificationSuccess();
      sound.targetHit();
    } else {
      // Wrong tap
      wrongActionsRef.current += 1;
      setCurrentStreak(0);
      setFeedback('wrong');
      haptics.notificationError();
      sound.targetMiss();
    }

    setCurrentTarget(null);
    setTimeout(() => setFeedback(null), 500);
  };

  const handleComplete = () => {
    setIsActive(false);

    const totalActions = correctActionsRef.current + wrongActionsRef.current;
    const accuracy = totalActions > 0 ? (correctActionsRef.current / totalActions) * 100 : 0;
    const score = Math.min(100, Math.max(0, accuracy));

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const accuracy = (correctActionsRef.current + wrongActionsRef.current) > 0
    ? Math.round((correctActionsRef.current / (correctActionsRef.current + wrongActionsRef.current)) * 100)
    : 0;

  const getColorStyle = (color: string) => {
    switch (color) {
      case 'green':
        return { backgroundColor: '#10B981' };
      case 'red':
        return { backgroundColor: '#EF4444' };
      case 'blue':
        return { backgroundColor: '#3B82F6' };
      default:
        return { backgroundColor: '#6B7280' };
    }
  };

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={[styles.statValue, { color: accuracy >= 70 ? '#10B981' : '#F59E0B' }]}>
            {accuracy}%
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>✓</Text>
          <Text style={styles.correctText}>{correctActionsRef.current}</Text>
        </View>
        {currentStreak > 0 && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{currentStreak}</Text>
          </View>
        )}
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>✗</Text>
          <Text style={styles.wrongText}>{wrongActionsRef.current}</Text>
        </View>
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        {currentTarget ? (
          <TouchableOpacity
            onPress={handleTap}
            activeOpacity={0.8}
            style={styles.targetTouchArea}
          >
            <Animated.View
              style={[
                styles.target,
                getColorStyle(currentTarget.color),
                {
                  transform: [
                    { scale: scaleAnim },
                    { scale: targetAppearAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.targetText}>
                {currentTarget.color === 'green' ? 'TAP!' : 'WAIT'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Ready...</Text>
          </View>
        )}
      </View>

      {/* Feedback */}
      {feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={[
            styles.feedbackText,
            feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong
          ]}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Tap only GREEN - resist RED and BLUE
        </Text>
        <Text style={styles.subText}>
          Inhibited: {inhibitionsRef.current}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.levelText}>Level {level}</Text>
      </View>
    </LinearGradient>
    </BaseChallengeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statEmoji: {
    fontSize: 24,
  },
  correctText: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  wrongText: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  target: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 25,
  },
  targetText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  waitingContainer: {
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },

  // Feedback
  feedbackContainer: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  feedbackCorrect: {
    color: '#10B981',
  },
  feedbackWrong: {
    color: '#EF4444',
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
