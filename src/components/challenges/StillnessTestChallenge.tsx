/**
 * STILLNESS TEST CHALLENGE
 * Keep your device perfectly still for the duration
 *
 * Difficulty Scaling:
 * - Stricter movement threshold at higher levels
 * - Longer required stillness duration
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { Accelerometer } from 'expo-sensors';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface StillnessTestChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function StillnessTestChallenge({ duration, onComplete, onBack, level = 1 }: StillnessTestChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('stillness_test');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isStill, setIsStill] = useState(true);
  const [movementIntensity, setMovementIntensity] = useState(0);

  // Tracking refs
  const stillTimeRef = useRef(0);
  const movementsRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const movementThreshold = Math.max(0.05, 0.15 - (level * 0.01)); // Stricter at higher levels

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

  // Track stillness time
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (isStill) {
        stillTimeRef.current += 100;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isStill]);

  // Accelerometer monitoring
  useEffect(() => {
    if (!isActive) return;

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Calculate total movement
      const movement = Math.sqrt(x * x + y * y + z * z) - 1; // Subtract gravity
      const intensity = Math.abs(movement);

      setMovementIntensity(intensity);

      const wasStill = isStill;
      const nowStill = intensity < movementThreshold;

      if (wasStill && !nowStill) {
        movementsRef.current += 1;
        haptics.impactLight();
        sound.targetMiss();
      }

      setIsStill(nowStill);
    });

    return () => subscription.remove();
  }, [isActive, isStill, movementThreshold]);

  // Calm animation when still
  useEffect(() => {
    if (isStill && isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isStill, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const totalMs = duration * 1000;
    const accuracy = (stillTimeRef.current / totalMs) * 100;
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

  const stillnessPercentage = Math.round((stillTimeRef.current / (duration * 1000)) * 100);

  const waveRotation = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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
          <Text style={styles.statLabel}>Stillness</Text>
          <Text style={[styles.statValue, { color: stillnessPercentage >= 80 ? '#10B981' : '#F59E0B' }]}>
            {stillnessPercentage}%
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
        {movementsRef.current > 0 && (
          <Text style={styles.movementsText}>
            Movements detected: {movementsRef.current}
          </Text>
        )}
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        {/* Calm waves when still */}
        {isStill && (
          <Animated.View
            style={[
              styles.waveCircle,
              {
                transform: [{ rotate: waveRotation }],
                opacity: 0.3,
              },
            ]}
          />
        )}

        {/* Main stillness indicator */}
        <Animated.View
          style={[
            styles.stillnessCircle,
            isStill && styles.stillnessCircleActive,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.stillnessIcon}>{isStill ? '🗿' : '⚠️'}</Text>
        </Animated.View>

        {/* Movement intensity indicator */}
        <View style={styles.intensityBar}>
          <View
            style={[
              styles.intensityFill,
              {
                width: `${Math.min(100, movementIntensity * 200)}%`,
                backgroundColor: movementIntensity > movementThreshold ? '#EF4444' : '#10B981',
              },
            ]}
          />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isStill ? '✓ Perfect stillness' : '⚠️ Keep device still'}
        </Text>
        <Text style={styles.subText}>
          {Math.round(stillTimeRef.current / 1000)}s of stillness
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
  movementsText: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  waveCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  stillnessCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  stillnessCircleActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  stillnessIcon: {
    fontSize: 56,
  },
  intensityBar: {
    marginTop: 40,
    width: 200,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 4,
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
