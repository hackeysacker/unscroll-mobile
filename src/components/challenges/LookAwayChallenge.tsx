/**
 * LOOK AWAY CHALLENGE
 * Look away from the screen for the specified duration
 *
 * Difficulty Scaling:
 * - Longer required duration at higher levels
 * - Stricter detection threshold
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { Accelerometer } from 'expo-sensors';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface LookAwayChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function LookAwayChallenge({ duration, onComplete, onBack, level = 1 }: LookAwayChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('look_away');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(0);

  // Tracking refs
  const lookAwayTimeRef = useRef(0);
  const totalLookAwaysRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Threshold for detecting device facing down/away (stricter at higher levels)
  const tiltThreshold = Math.max(30, 50 - level * 2);

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

  // Track look-away time
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (isLookingAway) {
        lookAwayTimeRef.current += 100;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isLookingAway]);

  // Accelerometer monitoring
  useEffect(() => {
    if (!isActive) return;

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Calculate tilt angle (device facing down when z is negative)
      // Device is upright when z is close to -1 (gravity pointing down)
      const angle = Math.abs(Math.atan2(Math.sqrt(x * x + y * y), z) * (180 / Math.PI));
      setTiltAngle(angle);

      const wasLookingAway = isLookingAway;
      const nowLookingAway = angle > tiltThreshold;

      if (!wasLookingAway && nowLookingAway) {
        totalLookAwaysRef.current += 1;
        haptics.impactLight();
        sound.targetMiss();
      }

      setIsLookingAway(nowLookingAway);
    });

    return () => subscription.remove();
  }, [isActive, isLookingAway, tiltThreshold]);

  // Glow animation when looking away
  useEffect(() => {
    if (isLookingAway && isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isLookingAway, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const totalMs = duration * 1000;
    const accuracy = (lookAwayTimeRef.current / totalMs) * 100;
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

  const lookAwayPercentage = Math.round((lookAwayTimeRef.current / (duration * 1000)) * 100);

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
          <Text style={styles.statLabel}>Looking Away</Text>
          <Text style={[styles.statValue, { color: lookAwayPercentage >= 80 ? '#10B981' : '#F59E0B' }]}>
            {lookAwayPercentage}%
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
        {/* Glow effect when looking away */}
        {isLookingAway && (
          <Animated.View
            style={[
              styles.glowCircle,
              {
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* Main indicator */}
        <Animated.View
          style={[
            styles.indicatorCircle,
            isLookingAway && styles.indicatorCircleActive,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.indicatorIcon}>{isLookingAway ? '✓' : '👁️'}</Text>
        </Animated.View>

        {/* Tilt indicator */}
        <View style={styles.tiltBar}>
          <View
            style={[
              styles.tiltFill,
              {
                width: `${Math.min(100, (tiltAngle / 90) * 100)}%`,
                backgroundColor: isLookingAway ? '#10B981' : '#F59E0B',
              },
            ]}
          />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isLookingAway ? '✓ Perfect! Keep looking away' : '👁️ Look away from screen'}
        </Text>
        <Text style={styles.subText}>
          {Math.round(lookAwayTimeRef.current / 1000)}s away from screen
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
  glowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#10B981',
  },
  indicatorCircle: {
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
  indicatorCircleActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  indicatorIcon: {
    fontSize: 56,
  },
  tiltBar: {
    marginTop: 40,
    width: 200,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tiltFill: {
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
