/**
 * RHYTHM TAP CHALLENGE
 * Tap in sync with a visual rhythm pulse
 *
 * Difficulty Scaling:
 * - Faster rhythm at higher levels
 * - Stricter timing window at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface RhythmTapChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function RhythmTapChallenge({ duration, onComplete, onBack, level = 1 }: RhythmTapChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('rhythm_tap');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPulse, setIsPulse] = useState(false);
  const [feedback, setFeedback] = useState<'perfect' | 'good' | 'miss' | null>(null);

  // Tracking refs
  const correctTapsRef = useRef(0);
  const wrongTapsRef = useRef(0);
  const totalBeatsRef = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const beatInterval = Math.max(600, 1000 - (level * 30)); // Faster at higher levels
  const lastBeatTimeRef = useRef(0);

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

  // Rhythm pulse animation
  useEffect(() => {
    if (!isActive) return;

    const pulse = () => {
      totalBeatsRef.current += 1;
      setIsPulse(true);
      lastBeatTimeRef.current = Date.now();

      // Visual pulse animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setIsPulse(false);
      });

      haptics.impactLight();
      sound.targetAppear();
    };

    pulse(); // Initial pulse
    const interval = setInterval(pulse, beatInterval);

    return () => clearInterval(interval);
  }, [isActive, beatInterval]);

  const handleTap = () => {
    if (!isActive) return;

    const now = Date.now();
    const timeSinceLastBeat = now - lastBeatTimeRef.current;
    const timingWindow = beatInterval * 0.3; // 30% timing window

    if (timeSinceLastBeat < timingWindow) {
      // Perfect or good timing
      if (timeSinceLastBeat < beatInterval * 0.15) {
        correctTapsRef.current += 2; // Double points for perfect
        setFeedback('perfect');
        haptics.notificationSuccess();
        sound.targetHit();
        sound.combo(); // Extra sound for perfect timing
      } else {
        correctTapsRef.current += 1;
        setFeedback('good');
        haptics.impactMedium();
        sound.targetHit();
      }
    } else {
      wrongTapsRef.current += 1;
      setFeedback('miss');
      haptics.notificationError();
      sound.targetMiss();
    }

    setTimeout(() => setFeedback(null), 300);
  };

  const handleComplete = () => {
    setIsActive(false);

    const totalPossiblePoints = totalBeatsRef.current * 2; // Max is 2 points per beat
    const actualPoints = correctTapsRef.current;
    const accuracy = totalPossiblePoints > 0
      ? (actualPoints / totalPossiblePoints) * 100
      : 0;
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

  const accuracyPercentage = totalBeatsRef.current > 0
    ? Math.round((correctTapsRef.current / (totalBeatsRef.current * 2)) * 100)
    : 0;

  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

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
          <Text style={[styles.statValue, { color: accuracyPercentage >= 70 ? '#10B981' : '#F59E0B' }]}>
            {accuracyPercentage}%
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

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        <TouchableOpacity
          onPress={handleTap}
          activeOpacity={0.8}
          style={styles.tapArea}
        >
          {/* Expanding ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />

          {/* Main pulse circle */}
          <Animated.View
            style={[
              styles.pulseCircle,
              isPulse && styles.pulseCircleActive,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.pulseIcon}>🥁</Text>
          </Animated.View>

          {/* Feedback */}
          {feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={[
                styles.feedbackText,
                feedback === 'perfect' && styles.feedbackPerfect,
                feedback === 'good' && styles.feedbackGood,
                feedback === 'miss' && styles.feedbackMiss,
              ]}>
                {feedback === 'perfect' ? 'PERFECT!' : feedback === 'good' ? 'GOOD' : 'MISS'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          🎵 Tap in sync with the pulse
        </Text>
        <Text style={styles.subText}>
          Correct: {correctTapsRef.current} • Wrong: {wrongTapsRef.current}
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

  // Challenge Area
  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  tapArea: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#6366F1',
  },
  pulseCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  pulseCircleActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  pulseIcon: {
    fontSize: 48,
  },

  // Feedback
  feedbackContainer: {
    position: 'absolute',
    top: -60,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  feedbackPerfect: {
    color: '#10B981',
  },
  feedbackGood: {
    color: '#F59E0B',
  },
  feedbackMiss: {
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
