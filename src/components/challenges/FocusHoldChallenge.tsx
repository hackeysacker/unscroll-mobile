/**
 * FOCUS HOLD CHALLENGE
 * Hold your finger on a center dot without lifting it
 *
 * Difficulty Scaling:
 * - Movement tolerance: L1 = 30px (very forgiving) → L10 = 8px (strict)
 * - Score calculation based on focus time percentage
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';
import { useFaceTracking } from '@/hooks/useFaceTracking';
import { LookAwayWarning } from '@/components/LookAwayWarning';

interface FocusHoldChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function FocusHoldChallenge({ duration, onComplete, onBack, level = 1 }: FocusHoldChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('focus_hold');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isFocusing, setIsFocusing] = useState(false);

  // Refs for tracking
  const focusTimeRef = useRef(0);
  const focusBreaksRef = useRef(0);
  const longestStreakRef = useRef(0);
  const currentStreakRef = useRef(0);

  // Face tracking integration
  const faceTracking = useFaceTracking({
    enabled: isActive,
    onLookAway: () => {
      // Penalize when looking away
      if (isFocusing) {
        focusBreaksRef.current += 1;
        currentStreakRef.current = 0;
      }
    },
    lookAwayThreshold: 0.5, // Trigger after 0.5 seconds
  });

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
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

  // Progress bar animation
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

  // Track focus time
  useEffect(() => {
    if (!isFocusing || !isActive) return;

    const interval = setInterval(() => {
      focusTimeRef.current += 100;
      currentStreakRef.current += 100;

      if (currentStreakRef.current > longestStreakRef.current) {
        longestStreakRef.current = currentStreakRef.current;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isFocusing, isActive]);

  // Animate when focusing
  useEffect(() => {
    if (isFocusing && isActive) {
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      haptics.impactLight();
      // Light haptic only when starting to focus - no sound to keep it calm
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

      pulseAnim.setValue(1);
    }
  }, [isFocusing, isActive]);

  // Track focus breaks
  useEffect(() => {
    if (isActive && !isFocusing && focusTimeRef.current > 0) {
      focusBreaksRef.current += 1;
      currentStreakRef.current = 0;
      haptics.notificationWarning();
      sound.targetMiss();
    }
  }, [isFocusing, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const totalMs = duration * 1000;
    const accuracy = (focusTimeRef.current / totalMs) * 100;

    // Apply face tracking penalty
    const focusPenalty = faceTracking.getFocusPenalty();
    const score = Math.min(100, Math.max(0, accuracy - focusPenalty));

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const handleFocusStart = () => {
    setIsFocusing(true);
  };

  const handleFocusEnd = () => {
    setIsFocusing(false);
  };

  const focusPercentage = focusTimeRef.current > 0
    ? Math.round((focusTimeRef.current / (duration * 1000)) * 100)
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
      {/* Look Away Warning */}
      <LookAwayWarning
        isLookingAway={!faceTracking.isLookingAtScreen && faceTracking.isFaceDetected}
        attentionScore={faceTracking.attentionScore}
        lookAwayCount={faceTracking.lookAwayCount}
      />

      {/* Header with Stats */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Focus</Text>
          <Text style={[styles.statValue, { color: focusPercentage >= 80 ? '#10B981' : '#F59E0B' }]}>
            {focusPercentage}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
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
        {focusBreaksRef.current > 0 && (
          <Text style={styles.breaksText}>
            ⚠️ Breaks: {focusBreaksRef.current}
          </Text>
        )}
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        <TouchableOpacity
          style={styles.touchArea}
          onPressIn={handleFocusStart}
          onPressOut={handleFocusEnd}
          activeOpacity={1}
        >
          {/* Outer pulse ring */}
          {isFocusing && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: glowOpacity,
                },
              ]}
            />
          )}

          {/* Glow effect */}
          {isFocusing && (
            <Animated.View
              style={[
                styles.glowEffect,
                { opacity: glowOpacity },
              ]}
            />
          )}

          {/* Main dot */}
          <Animated.View
            style={[
              styles.dot,
              isFocusing && styles.dotActive,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {isFocusing && <View style={styles.innerDot} />}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isFocusing ? '✓ Hold steady...' : '👆 Press and hold the dot'}
        </Text>
        {isFocusing && (
          <Text style={styles.focusTime}>
            {Math.round(focusTimeRef.current / 1000)}s focused
          </Text>
        )}
      </View>

      {/* Level indicator */}
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
  pulseRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: '#10B981',
  },
  glowEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#10B981',
  },
  dot: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  dotActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowColor: '#10B981',
  },
  innerDot: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
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
  focusTime: {
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
