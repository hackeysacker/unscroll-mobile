/**
 * Body Release Exercise
 *
 * Guided stretches for shoulders, neck, arms, and torso
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface BodyReleaseExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const STRETCHES = [
  { name: 'Shoulder Rolls', emoji: '💪', duration: 20, instruction: 'Roll your shoulders back 5 times' },
  { name: 'Neck Stretch', emoji: '🙆', duration: 25, instruction: 'Gently tilt your head side to side' },
  { name: 'Arm Reach', emoji: '🙌', duration: 25, instruction: 'Reach both arms overhead and stretch' },
  { name: 'Torso Twist', emoji: '🔄', duration: 25, instruction: 'Twist your torso left and right' },
  { name: 'Deep Breath', emoji: '🫁', duration: 25, instruction: 'Take 3 deep breaths' },
];

function BodyReleaseContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [currentStretch, setCurrentStretch] = useState(0);
  const [countdown, setCountdown] = useState(STRETCHES[0].duration);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const config = getExerciseConfig('body_release');
  const stretch = STRETCHES[currentStretch];

  useEffect(() => {
    // Pulse animation for emoji
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
    pulse.start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: stretch.duration * 1000,
        useNativeDriver: false,
      }).start();
    });

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          helpers.vibrate('medium');

          // Move to next stretch
          if (currentStretch < STRETCHES.length - 1) {
            setTimeout(() => {
              setCurrentStretch(currentStretch + 1);
              setCountdown(STRETCHES[currentStretch + 1].duration);
            }, 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      pulse.stop();
      clearInterval(timer);
    };
  }, [currentStretch]);

  const overallProgress = ((currentStretch + 1) / STRETCHES.length) * 100;
  helpers.updateProgress(overallProgress);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.releaseContainer}>
      {/* Stretch info */}
      <View style={styles.topSection}>
        <Text style={styles.stretchNumber}>
          Stretch {currentStretch + 1} of {STRETCHES.length}
        </Text>
        <Animated.Text
          style={[
            styles.emojiText,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {stretch.emoji}
        </Animated.Text>
        <Text style={[styles.stretchName, { color: config.colors.primary }]}>
          {stretch.name}
        </Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionSection}>
        <Text style={styles.instructionText}>{stretch.instruction}</Text>
      </View>

      {/* Countdown */}
      <View style={styles.countdownSection}>
        <Text style={styles.countdownNumber}>{countdown}</Text>
        <Text style={styles.countdownLabel}>seconds</Text>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: config.colors.primary,
                width: progressWidth,
              },
            ]}
          />
        </View>
      </View>

      {/* Stretch indicators */}
      <View style={styles.stretchDots}>
        {STRETCHES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.stretchDot,
              {
                backgroundColor: index < currentStretch
                  ? config.colors.primary
                  : index === currentStretch
                  ? config.colors.accent
                  : '#374151',
              },
            ]}
          />
        ))}
      </View>

      {/* Guidance */}
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceText}>
          Move gently and breathe deeply
        </Text>
      </View>
    </View>
  );
}

export function BodyReleaseExercise({ onComplete, onBack }: BodyReleaseExerciseProps) {
  const config = getExerciseConfig('body_release');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <BodyReleaseContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  releaseContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  topSection: {
    alignItems: 'center',
    gap: 16,
  },
  stretchNumber: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emojiText: {
    fontSize: 80,
  },
  stretchName: {
    fontSize: 28,
    fontWeight: '700',
  },
  instructionSection: {
    paddingHorizontal: 32,
  },
  instructionText: {
    fontSize: 20,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 32,
  },
  countdownSection: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countdownLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stretchDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stretchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  guidanceSection: {
    paddingHorizontal: 32,
  },
  guidanceText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
