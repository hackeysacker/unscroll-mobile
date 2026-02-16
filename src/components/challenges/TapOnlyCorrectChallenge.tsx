/**
 * TAP ONLY CORRECT CHALLENGE
 * Tap only the GREEN circles - ignore the red ones
 *
 * Difficulty Scaling:
 * - More targets at higher levels
 * - Faster target spawning at higher levels
 * - Higher proportion of incorrect targets at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface TapOnlyCorrectChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

interface Target {
  id: number;
  x: number;
  y: number;
  isCorrect: boolean;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
}

export function TapOnlyCorrectChallenge({ duration, onComplete, onBack, level = 1 }: TapOnlyCorrectChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('tap_only_correct');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [targets, setTargets] = useState<Target[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Tracking refs
  const correctTapsRef = useRef(0);
  const wrongTapsRef = useRef(0);
  const maxStreakRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(1)).current;

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
      const correctRatio = Math.max(0.5, 0.7 - (level * 0.02)); // Fewer correct at higher levels
      const newTarget: Target = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        isCorrect: Math.random() < correctRatio,
        scaleAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(0),
      };

      // Animate target appearance
      Animated.parallel([
        Animated.spring(newTarget.scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(newTarget.opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTargets(prev => [...prev.slice(-3), newTarget]);
    };

    generateTarget();
    const spawnInterval = Math.max(1200, 2000 - (level * 50)); // Faster at higher levels
    const interval = setInterval(generateTarget, spawnInterval);

    return () => clearInterval(interval);
  }, [isActive, level]);

  const handleTap = (target: Target) => {
    const isCorrect = target.isCorrect;

    if (isCorrect) {
      correctTapsRef.current += 1;
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);

      if (newStreak > maxStreakRef.current) {
        maxStreakRef.current = newStreak;
      }

      // Animate streak counter
      Animated.sequence([
        Animated.timing(streakAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(streakAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      haptics.notificationSuccess();
      sound.targetHit();

      if (newStreak === 5) {
        sound.streak();
        setFeedback({ message: '🔥 5 Streak!', type: 'success' });
      } else if (newStreak === 10) {
        sound.streak();
        setFeedback({ message: '🔥🔥 10 Streak!', type: 'success' });
      } else {
        setFeedback({ message: '✓ Correct', type: 'success' });
      }
    } else {
      wrongTapsRef.current += 1;
      setCurrentStreak(0);
      haptics.notificationError();
      sound.targetMiss();
      setFeedback({ message: '✗ Wrong!', type: 'error' });
    }

    // Animate target removal
    Animated.parallel([
      Animated.timing(target.scaleAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(target.opacityAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTargets(prev => prev.filter(t => t.id !== target.id));
    });

    setTimeout(() => setFeedback(null), 800);
  };

  const handleComplete = () => {
    setIsActive(false);

    const totalTaps = correctTapsRef.current + wrongTapsRef.current;
    const accuracy = totalTaps > 0 ? (correctTapsRef.current / totalTaps) * 100 : 0;
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

  const accuracy = (correctTapsRef.current + wrongTapsRef.current) > 0
    ? Math.round((correctTapsRef.current / (correctTapsRef.current + wrongTapsRef.current)) * 100)
    : 0;

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
          <Text style={styles.correctText}>{correctTapsRef.current}</Text>
        </View>
        {currentStreak > 0 && (
          <Animated.View style={[styles.streakContainer, { transform: [{ scale: streakAnim }] }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{currentStreak}</Text>
          </Animated.View>
        )}
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>✗</Text>
          <Text style={styles.wrongText}>{wrongTapsRef.current}</Text>
        </View>
      </View>

      {/* Feedback */}
      {feedback && (
        <View style={[
          styles.feedbackContainer,
          feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
        ]}>
          <Text style={styles.feedbackText}>{feedback.message}</Text>
        </View>
      )}

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        {targets.map((target) => (
          <TouchableOpacity
            key={target.id}
            style={[
              styles.target,
              {
                left: `${target.x}%`,
                top: `${target.y}%`,
                backgroundColor: target.isCorrect ? '#10B981' : '#EF4444',
                transform: [{ scale: target.scaleAnim }],
                opacity: target.opacityAnim,
                shadowColor: target.isCorrect ? '#10B981' : '#EF4444',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 15,
                elevation: 15,
              },
            ]}
            onPress={() => handleTap(target)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.targetInner,
              { backgroundColor: target.isCorrect ? '#10B981' : '#EF4444' }
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          👆 Tap only GREEN circles
        </Text>
        <Text style={styles.subText}>
          Ignore red circles
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

  // Feedback
  feedbackContainer: {
    position: 'absolute',
    top: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  feedbackSuccess: {},
  feedbackError: {},
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  target: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    marginLeft: -45,
    marginTop: -45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  targetInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
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
