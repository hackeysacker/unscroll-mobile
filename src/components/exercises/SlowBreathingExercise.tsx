/**
 * Slow Breathing Exercise
 *
 * 2-minute breathing exercise with 4-second inhale, 6-second exhale
 * Features animated breathing circle with smooth expansion/contraction
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

interface SlowBreathingExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function BreathingContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const breathAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const breathCycleRef = useRef<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    // Start breathing animation loop
    const breathingLoop = () => {
      // Inhale (4 seconds)
      breathCycleRef.current = 'inhale';
      Animated.parallel([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Exhale (6 seconds)
        breathCycleRef.current = 'exhale';
        helpers.vibrate('light');
        Animated.parallel([
          Animated.timing(breathAnim, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          helpers.vibrate('light');
          breathingLoop();
        });
      });
    };

    breathingLoop();

    return () => {
      breathAnim.stopAnimation();
      glowAnim.stopAnimation();
    };
  }, []);

  const scale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.3],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });

  const config = getExerciseConfig('slow_breathing');

  return (
    <View style={styles.breathingContainer}>
      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Animated.Text
          style={[
            styles.breathInstruction,
            {
              opacity: breathAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1, 1],
              }),
            },
          ]}
        >
          {breathCycleRef.current === 'inhale' ? 'Breathe In' : 'Breathe Out'}
        </Animated.Text>
        <Text style={styles.breathSubtext}>
          {breathCycleRef.current === 'inhale' ? '4 seconds' : '6 seconds'}
        </Text>
      </View>

      {/* Breathing Circle */}
      <View style={styles.circleContainer}>
        {/* Outer glow layers */}
        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: CIRCLE_SIZE + 100,
              height: CIRCLE_SIZE + 100,
              borderRadius: (CIRCLE_SIZE + 100) / 2,
              opacity: glowOpacity,
              backgroundColor: config.colors.primary,
              transform: [{ scale: scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: CIRCLE_SIZE + 60,
              height: CIRCLE_SIZE + 60,
              borderRadius: (CIRCLE_SIZE + 60) / 2,
              opacity: glowOpacity.interpolate({
                inputRange: [0.2, 0.8],
                outputRange: [0.3, 1],
              }),
              backgroundColor: config.colors.primary,
              transform: [{ scale: scale }],
            },
          ]}
        />

        {/* Main breathing circle */}
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: CIRCLE_SIZE / 2,
              transform: [{ scale: scale }],
            },
          ]}
        >
          <LinearGradient
            colors={[config.colors.primary, config.colors.secondary]}
            style={styles.circleGradient}
          />
        </Animated.View>

        {/* Center dot */}
        <View style={styles.centerDot} />
      </View>

      {/* Gentle guidance */}
      <View style={styles.guidanceBox}>
        <Text style={styles.guidanceText}>Follow the circle's rhythm</Text>
        <Text style={styles.guidanceSubtext}>Expand as you breathe in, contract as you breathe out</Text>
      </View>
    </View>
  );
}

export function SlowBreathingExercise({ onComplete, onBack }: SlowBreathingExerciseProps) {
  const config = getExerciseConfig('slow_breathing');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <BreathingContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  breathingContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
  },
  instructionBox: {
    alignItems: 'center',
    gap: 8,
  },
  breathInstruction: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  breathSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    opacity: 0.2,
  },
  breathingCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  guidanceBox: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 32,
  },
  guidanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guidanceSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
