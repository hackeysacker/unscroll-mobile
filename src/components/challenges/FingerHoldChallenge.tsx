/**
 * FINGER HOLD CHALLENGE
 * Hold your finger on a target area without moving
 *
 * Difficulty Scaling:
 * - Shorter target hold times at lower levels
 * - Stricter movement tolerance at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface FingerHoldChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function FingerHoldChallenge({ duration, onComplete, onBack, level = 1 }: FingerHoldChallengeProps) {
  // Hooks
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('finger_hold');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isHolding, setIsHolding] = useState(false);

  // Tracking refs
  const holdTimeRef = useRef(0);
  const breaksRef = useRef(0);
  const longestStreakRef = useRef(0);
  const currentStreakRef = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Track hold time
  useEffect(() => {
    if (!isHolding || !isActive) return;

    const interval = setInterval(() => {
      holdTimeRef.current += 100;
      currentStreakRef.current += 100;

      if (currentStreakRef.current > longestStreakRef.current) {
        longestStreakRef.current = currentStreakRef.current;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isHolding, isActive]);

  // Animations when holding
  useEffect(() => {
    if (isHolding && isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      haptics.impactLight();
      sound.targetHit();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHolding, isActive]);

  // Track breaks
  useEffect(() => {
    if (isActive && !isHolding && holdTimeRef.current > 0) {
      breaksRef.current += 1;
      currentStreakRef.current = 0;
      haptics.notificationWarning();
      sound.targetMiss();
    }
  }, [isHolding, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const totalMs = duration * 1000;
    const accuracy = (holdTimeRef.current / totalMs) * 100;
    const score = Math.min(100, Math.max(0, accuracy));

    if (score >= 80) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const holdPercentage = holdTimeRef.current > 0
    ? Math.round((holdTimeRef.current / (duration * 1000)) * 100)
    : 0;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
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
          <Text style={styles.statLabel}>Hold</Text>
          <Text style={[styles.statValue, { color: holdPercentage >= 80 ? '#10B981' : '#F59E0B' }]}>
            {holdPercentage}%
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
        {breaksRef.current > 0 && (
          <Text style={styles.breaksText}>
            ⚠️ Breaks: {breaksRef.current}
          </Text>
        )}
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        <TouchableOpacity
          style={styles.touchArea}
          onPressIn={() => setIsHolding(true)}
          onPressOut={() => setIsHolding(false)}
          activeOpacity={1}
        >
          {/* Glow effect */}
          {isHolding && (
            <Animated.View
              style={[
                styles.glowEffect,
                { opacity: glowOpacity },
              ]}
            />
          )}

          {/* Target */}
          <Animated.View
            style={[
              styles.target,
              isHolding && styles.targetActive,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.targetIcon}>👆</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isHolding ? '✓ Holding...' : '👆 Press and hold'}
        </Text>
        {isHolding && (
          <Text style={styles.holdTime}>
            {Math.round(holdTimeRef.current / 1000)}s held
          </Text>
        )}
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
  breaksText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '600',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  touchArea: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#10B981',
  },
  target: {
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
  targetActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  targetIcon: {
    fontSize: 48,
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  holdTime: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
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
