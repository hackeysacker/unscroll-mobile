/**
 * SLOW TRACKING CHALLENGE
 * Follow a slowly moving target with precision
 *
 * Difficulty Scaling:
 * - Slower movement speed at lower levels
 * - Faster movement at higher levels
 * - Stricter tracking tolerance at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface SlowTrackingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function SlowTrackingChallenge({ duration, onComplete, onBack, level = 1 }: SlowTrackingChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('slow_tracking');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isTracking, setIsTracking] = useState(false);

  // Tracking refs
  const trackingTimeRef = useRef(0);
  const totalTimeRef = useRef(0);

  // Animations
  const targetX = useRef(new Animated.Value(150)).current;
  const targetY = useRef(new Animated.Value(200)).current;
  const fingerX = useRef(0);
  const fingerY = useRef(0);
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

  // Move target in circular pattern
  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      const speed = 8000 - (level * 200); // Faster at higher levels

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(targetX, {
              toValue: 250,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(targetX, {
              toValue: 150,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(targetX, {
              toValue: 50,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(targetX, {
              toValue: 150,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.timing(targetY, {
              toValue: 300,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(targetY, {
              toValue: 400,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(targetY, {
              toValue: 300,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(targetY, {
              toValue: 200,
              duration: speed / 4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]),
        ])
      ).start();
    };

    animate();
  }, [isActive, level]);

  // Track tracking accuracy
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      totalTimeRef.current += 100;

      if (isTracking) {
        trackingTimeRef.current += 100;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isTracking]);

  // Pan responder for finger tracking
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        fingerX.current = locationX;
        fingerY.current = locationY;
        checkTracking();
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        fingerX.current = locationX;
        fingerY.current = locationY;
        checkTracking();
      },
      onPanResponderRelease: () => {
        setIsTracking(false);
      },
    })
  ).current;

  const checkTracking = () => {
    // Get current target position from animation values
    const currentTargetX = (targetX as any)._value;
    const currentTargetY = (targetY as any)._value;

    const distance = Math.sqrt(
      Math.pow(fingerX.current - currentTargetX, 2) +
      Math.pow(fingerY.current - currentTargetY, 2)
    );

    const tolerance = 80 - (level * 3); // Stricter at higher levels
    const tracking = distance < tolerance;

    if (tracking !== isTracking) {
      setIsTracking(tracking);
      if (tracking) {
        // Sound only plays on state change (not every frame)
        haptics.impactLight();
        sound.targetHit();
      }
    }
  };

  const handleComplete = () => {
    setIsActive(false);

    const accuracy = totalTimeRef.current > 0
      ? (trackingTimeRef.current / totalTimeRef.current) * 100
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

  const trackingPercentage = totalTimeRef.current > 0
    ? Math.round((trackingTimeRef.current / totalTimeRef.current) * 100)
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
          <Text style={styles.statLabel}>Tracking</Text>
          <Text style={[styles.statValue, { color: trackingPercentage >= 70 ? '#10B981' : '#F59E0B' }]}>
            {trackingPercentage}%
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
      <View style={styles.challengeArea} {...panResponder.panHandlers}>
        {/* Moving target */}
        <Animated.View
          style={[
            styles.target,
            isTracking && styles.targetActive,
            {
              position: 'absolute',
              left: targetX,
              top: targetY,
              transform: [{ translateX: -30 }, { translateY: -30 }],
            },
          ]}
        >
          <Text style={styles.targetIcon}>🎯</Text>
        </Animated.View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isTracking ? '✓ Tracking!' : '👆 Follow the moving target'}
        </Text>
        <Text style={styles.subText}>
          Keep your finger close to the target
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    position: 'relative',
  },
  target: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 32,
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
