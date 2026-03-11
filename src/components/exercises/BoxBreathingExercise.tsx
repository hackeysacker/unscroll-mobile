/**
 * Box Breathing Exercise
 *
 * 3-minute box breathing: 4s in, 4s hold, 4s out, 4s hold
 * Features animated square path with moving dot
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width } = Dimensions.get('window');
const BOX_SIZE = width * 0.65;

interface BoxBreathingExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

function BoxBreathingContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const positionAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathingCycle = () => {
      // Side 1: Inhale (bottom-left to top-left)
      setPhase('inhale');
      Animated.parallel([
        Animated.timing(positionAnim, {
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
        helpers.vibrate('light');

        // Side 2: Hold (top-left to top-right)
        setPhase('hold1');
        Animated.timing(positionAnim, {
          toValue: 2,
          duration: 4000,
          useNativeDriver: true,
        }).start(() => {
          helpers.vibrate('light');

          // Side 3: Exhale (top-right to bottom-right)
          setPhase('exhale');
          Animated.parallel([
            Animated.timing(positionAnim, {
              toValue: 3,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            helpers.vibrate('light');

            // Side 4: Hold (bottom-right to bottom-left)
            setPhase('hold2');
            Animated.timing(positionAnim, {
              toValue: 4,
              duration: 4000,
              useNativeDriver: true,
            }).start(() => {
              helpers.vibrate('light');
              positionAnim.setValue(0);
              breathingCycle();
            });
          });
        });
      });
    };

    breathingCycle();

    return () => {
      positionAnim.stopAnimation();
      glowAnim.stopAnimation();
    };
  }, []);

  const config = getExerciseConfig('box_breathing');

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
    }
  };

  // Calculate dot position along the box
  const dotX = positionAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, 0, BOX_SIZE, BOX_SIZE, 0],
  });

  const dotY = positionAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [BOX_SIZE, 0, 0, BOX_SIZE, BOX_SIZE],
  });

  const boxGlow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return (
    <View style={styles.boxContainer}>
      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.phaseText}>{getPhaseText()}</Text>
        <Text style={styles.phaseSubtext}>4 seconds</Text>
      </View>

      {/* Box visualization */}
      <View style={styles.boxWrapper}>
        {/* Outer glow */}
        <Animated.View
          style={[
            styles.boxGlow,
            {
              width: BOX_SIZE + 80,
              height: BOX_SIZE + 80,
              borderRadius: 24,
              opacity: boxGlow,
              borderColor: config.colors.primary,
              borderWidth: 3,
            },
          ]}
        />

        {/* Main box */}
        <View
          style={[
            styles.box,
            {
              width: BOX_SIZE,
              height: BOX_SIZE,
              borderColor: config.colors.primary,
            },
          ]}
        >
          {/* Corner markers */}
          <View style={[styles.corner, styles.cornerTL, { backgroundColor: config.colors.primary }]} />
          <View style={[styles.corner, styles.cornerTR, { backgroundColor: config.colors.primary }]} />
          <View style={[styles.corner, styles.cornerBL, { backgroundColor: config.colors.primary }]} />
          <View style={[styles.corner, styles.cornerBR, { backgroundColor: config.colors.primary }]} />

          {/* Moving dot */}
          <Animated.View
            style={[
              styles.movingDot,
              {
                backgroundColor: config.colors.accent,
                transform: [
                  { translateX: dotX },
                  { translateY: dotY },
                ],
              },
            ]}
          >
            <View style={styles.dotGlow} />
          </Animated.View>
        </View>
      </View>

      {/* Guidance */}
      <View style={styles.guidanceBox}>
        <Text style={styles.guidanceText}>Follow the dot around the box</Text>
        <Text style={styles.guidanceSubtext}>Used by Navy SEALs for focus and calm</Text>
      </View>
    </View>
  );
}

export function BoxBreathingExercise({ onComplete, onBack }: BoxBreathingExerciseProps) {
  const config = getExerciseConfig('box_breathing');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <BoxBreathingContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
  },
  instructionBox: {
    alignItems: 'center',
    gap: 8,
  },
  phaseText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  phaseSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  boxWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  boxGlow: {
    position: 'absolute',
  },
  box: {
    borderWidth: 3,
    borderRadius: 16,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cornerTL: {
    top: -6,
    left: -6,
  },
  cornerTR: {
    top: -6,
    right: -6,
  },
  cornerBL: {
    bottom: -6,
    left: -6,
  },
  cornerBR: {
    bottom: -6,
    right: -6,
  },
  movingDot: {
    position: 'absolute',
    top: -16,
    left: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotGlow: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
