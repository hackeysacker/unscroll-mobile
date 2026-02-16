/**
 * Calm Visual Exercise
 *
 * Animated waves/circles synced with breathing for visual meditation
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width, height } = Dimensions.get('window');

interface CalmVisualExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function CalmVisualContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;

  const config = getExerciseConfig('calm_visual');

  useEffect(() => {
    // Wave animations - different speeds
    const waveAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(wave1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    const waveAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(wave2, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(wave2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    );

    const waveAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.timing(wave3, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(wave3, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    );

    // Circle animations - expanding ripples
    const circleAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    waveAnimation1.start();
    waveAnimation2.start();
    waveAnimation3.start();
    circleAnimation(circle1, 0).start();
    circleAnimation(circle2, 1000).start();
    circleAnimation(circle3, 2000).start();

    return () => {
      waveAnimation1.stop();
      waveAnimation2.stop();
      waveAnimation3.stop();
    };
  }, []);

  const wave1Y = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const wave2Y = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const wave3Y = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const createCircleStyle = (anim: Animated.Value) => ({
    scale: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 2.5],
    }),
    opacity: anim.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.6, 0],
    }),
  });

  return (
    <View style={styles.visualContainer}>
      {/* Instruction */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>Let your eyes gently follow</Text>
        <Text style={styles.breathText}>Breathe slowly with the flow</Text>
      </View>

      {/* Animated visual area */}
      <View style={styles.visualArea}>
        {/* Expanding circles */}
        <View style={styles.circleContainer}>
          {[circle1, circle2, circle3].map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.expandingCircle,
                {
                  borderColor: config.colors.primary,
                  transform: [{ scale: createCircleStyle(anim).scale }],
                  opacity: createCircleStyle(anim).opacity,
                },
              ]}
            />
          ))}
        </View>

        {/* Wave layers */}
        <View style={styles.waveContainer}>
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: config.colors.primary,
                opacity: 0.2,
                transform: [{ translateY: wave1Y }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: config.colors.secondary,
                opacity: 0.3,
                transform: [{ translateY: wave2Y }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: config.colors.accent,
                opacity: 0.25,
                transform: [{ translateY: wave3Y }],
              },
            ]}
          />
        </View>
      </View>

      {/* Guidance */}
      <View style={styles.guidanceBox}>
        <Text style={styles.guidanceText}>Allow thoughts to pass like waves</Text>
        <Text style={styles.guidanceSubtext}>No need to hold onto anything</Text>
      </View>
    </View>
  );
}

export function CalmVisualExercise({ onComplete, onBack }: CalmVisualExerciseProps) {
  const config = getExerciseConfig('calm_visual');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <CalmVisualContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  visualContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  instructionBox: {
    alignItems: 'center',
    gap: 8,
  },
  instructionText: {
    fontSize: 18,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  breathText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleContainer: {
    position: 'absolute',
    width: width,
    height: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandingCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
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
