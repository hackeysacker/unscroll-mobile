/**
 * Ten Second Reflection Exercise
 *
 * Ultra-quick 10-second mindfulness pause
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface TenSecondReflectionExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function TenSecondReflectionContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [countdown, setCountdown] = useState(10);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(0)).current;

  const config = getExerciseConfig('ten_second_reflection');

  useEffect(() => {
    // Initial scale in
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        helpers.vibrate('light');
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const breathScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.1],
  });

  const progress = ((10 - countdown) / 10) * 100;
  helpers.updateProgress(progress);

  return (
    <View style={styles.reflectionContainer}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Emoji */}
        <Animated.Text
          style={[
            styles.emojiText,
            {
              transform: [{ scale: breathScale }],
            },
          ]}
        >
          ⚡
        </Animated.Text>

        {/* Countdown */}
        <Animated.Text
          style={[
            styles.countdownText,
            {
              color: config.colors.primary,
              transform: [{ scale: breathScale }],
            },
          ]}
        >
          {countdown}
        </Animated.Text>

        {/* Instruction */}
        <Text style={styles.instructionText}>
          {countdown > 7
            ? 'Pause'
            : countdown > 4
            ? 'Take one deep breath'
            : countdown > 0
            ? 'Notice where you are'
            : 'Continue'}
        </Text>

        {/* Visual breath indicator */}
        <Animated.View
          style={[
            styles.breathCircle,
            {
              borderColor: config.colors.primary,
              transform: [{ scale: breathScale }],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

export function TenSecondReflectionExercise({ onComplete, onBack }: TenSecondReflectionExerciseProps) {
  const config = getExerciseConfig('ten_second_reflection');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <TenSecondReflectionContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  reflectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 32,
  },
  emojiText: {
    fontSize: 80,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 20,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    position: 'absolute',
    top: -40,
    opacity: 0.3,
  },
});
