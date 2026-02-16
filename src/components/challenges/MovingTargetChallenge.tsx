/**
 * MOVING TARGET CHALLENGE
 * Track and tap the moving target as quickly as possible
 *
 * Difficulty Scaling:
 * - Slower movement at lower levels
 * - Faster movement at higher levels
 * - More frequent position changes at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface MovingTargetChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function MovingTargetChallenge({ duration, onComplete, onBack, level = 1 }: MovingTargetChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('moving_target');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hits, setHits] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [feedback, setFeedback] = useState<'hit' | null>(null);

  // Animations
  const targetAnimX = useRef(new Animated.Value(50)).current;
  const targetAnimY = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hitScaleAnim = useRef(new Animated.Value(1)).current;

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

  // Move target at intervals
  useEffect(() => {
    if (!isActive) return;

    const moveTarget = () => {
      const newX = Math.random() * 70 + 15;
      const newY = Math.random() * 70 + 15;

      const moveDuration = Math.max(600, 1000 - (level * 30)); // Faster at higher levels

      Animated.parallel([
        Animated.timing(targetAnimX, {
          toValue: newX,
          duration: moveDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(targetAnimY, {
          toValue: newY,
          duration: moveDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();

      setTotalTargets(prev => prev + 1);
    };

    moveTarget(); // Initial move
    const interval = setInterval(moveTarget, Math.max(1500, 2500 - (level * 50))); // More frequent at higher levels

    return () => clearInterval(interval);
  }, [isActive, level]);

  const handleTargetClick = () => {
    setHits(prev => prev + 1);
    setFeedback('hit');
    haptics.notificationSuccess();
    sound.targetHit();

    // Hit animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(hitScaleAnim, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(hitScaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => setFeedback(null), 500);
  };

  const handleComplete = () => {
    setIsActive(false);

    const accuracy = totalTargets > 0 ? (hits / totalTargets) * 100 : 0;
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

  const accuracy = totalTargets > 0
    ? Math.round((hits / totalTargets) * 100)
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

      {/* Feedback */}
      {feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>✓ Hit!</Text>
        </View>
      )}

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        <Animated.View
          style={[
            styles.target,
            {
              left: targetAnimX.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              top: targetAnimY.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              transform: [
                { scale: scaleAnim },
                { scale: hitScaleAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.targetTouch}
            onPress={handleTargetClick}
            activeOpacity={0.8}
          >
            <View style={styles.targetInner}>
              <Text style={styles.targetIcon}>🎯</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          👆 Tap the moving target!
        </Text>
        {totalTargets > 0 && (
          <Text style={styles.subText}>
            {hits}/{totalTargets} targets hit
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

  // Feedback
  feedbackContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 12,
    borderRadius: 8,
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
  },
  targetTouch: {
    width: '100%',
    height: '100%',
  },
  targetInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  targetIcon: {
    fontSize: 40,
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
