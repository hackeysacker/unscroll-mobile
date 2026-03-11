/**
 * BASE CHALLENGE TEMPLATE
 *
 * This is the unified architecture that ALL challenges should follow.
 *
 * Key Features:
 * - Auto-starts (no start button needed since ActivityDetailScreen handles explanation)
 * - Consistent visual design with gradient backgrounds
 * - Standardized completion flow
 * - Integrated haptic feedback
 * - Clean, minimal UI focused on the challenge mechanics
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface BaseChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  level?: number;
}

export function BaseChallengeTemplate({ duration, onComplete, level = 1 }: BaseChallengeProps) {
  // Core state
  const [isActive, setIsActive] = useState(true); // Auto-start
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);

  // Challenge-specific state goes here
  // Example: const [currentTarget, setCurrentTarget] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isActive) {
      pulse.start();
    }

    return () => pulse.stop();
  }, [isActive]);

  const handleComplete = () => {
    setIsActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Calculate final score (0-100)
    const finalScore = Math.min(100, Math.max(0, score));

    // Call onComplete with score and actual duration
    onComplete(finalScore, duration - timeLeft);
  };

  // Challenge-specific logic goes here
  const handleUserAction = () => {
    // Example: Update score based on user interaction
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScore(prev => prev + 10);
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      {/* Header with Timer */}
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={styles.timerValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Progress</Text>
          <Text style={styles.scoreValue}>{Math.round(score)}%</Text>
        </View>
      </View>

      {/* Main Challenge Area */}
      <View style={styles.challengeArea}>
        <Text style={styles.instruction}>
          Replace this with challenge-specific UI
        </Text>

        {/* Example interactive element */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={handleUserAction}
            activeOpacity={0.8}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Tap Me</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Footer with Level Info */}
      <View style={styles.footer}>
        <Text style={styles.levelText}>Level {level}</Text>
      </View>
    </LinearGradient>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  timerContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  instruction: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Action Button
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
