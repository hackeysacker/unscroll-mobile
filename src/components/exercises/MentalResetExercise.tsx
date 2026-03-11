/**
 * Mental Reset Exercise
 *
 * 90-second pause with whiteboard clearing animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width } = Dimensions.get('window');

interface MentalResetExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function MentalResetContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const eraseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const breathCount = useRef(0);

  const config = getExerciseConfig('mental_reset');

  useEffect(() => {
    // Erasing animation that loops
    const eraseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(eraseAnim, {
          toValue: 1,
          duration: 18000, // 18 seconds per erase
          useNativeDriver: true,
        }),
        Animated.timing(eraseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Fade animation for "thoughts"
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.2,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    );

    eraseLoop.start();
    fadeLoop.start();

    // Count breaths
    const breathInterval = setInterval(() => {
      breathCount.current += 1;
      if (breathCount.current % 2 === 0) {
        helpers.vibrate('light');
      }
    }, 6000);

    return () => {
      eraseLoop.stop();
      fadeLoop.stop();
      clearInterval(breathInterval);
    };
  }, []);

  const eraseX = eraseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.8, width * 0.8],
  });

  return (
    <View style={styles.resetContainer}>
      {/* Instructions */}
      <View style={styles.topSection}>
        <Text style={styles.titleText}>Mental Reset</Text>
        <Text style={styles.subtitleText}>Close your eyes and imagine clearing a whiteboard</Text>
      </View>

      {/* Whiteboard visualization */}
      <View style={styles.whiteboardContainer}>
        <View style={[styles.whiteboard, { borderColor: config.colors.primary }]}>
          {/* Scribbles/thoughts */}
          <Animated.View style={[styles.thoughtLayer, { opacity: fadeAnim }]}>
            <Text style={styles.thoughtText}>worry</Text>
            <Text style={[styles.thoughtText, styles.thoughtText2]}>stress</Text>
            <Text style={[styles.thoughtText, styles.thoughtText3]}>task</Text>
            <Text style={[styles.thoughtText, styles.thoughtText4]}>deadline</Text>
            <Text style={[styles.thoughtText, styles.thoughtText5]}>meeting</Text>
          </Animated.View>

          {/* Eraser */}
          <Animated.View
            style={[
              styles.eraser,
              {
                backgroundColor: config.colors.accent,
                transform: [{ translateX: eraseX }],
              },
            ]}
          >
            <View style={styles.eraserSponge} />
          </Animated.View>

          {/* Erased trail */}
          <Animated.View
            style={[
              styles.erasedTrail,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                width: eraseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Breathing guidance */}
      <View style={styles.breathSection}>
        <Text style={styles.breathLabel}>Take 5 deep breaths</Text>
        <View style={styles.breathCircles}>
          {[1, 2, 3, 4, 5].map((num) => (
            <View
              key={num}
              style={[
                styles.breathCircle,
                {
                  backgroundColor: Math.ceil(breathCount.current / 2) >= num
                    ? config.colors.primary
                    : '#374151',
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Guidance text */}
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceText}>
          Watch the eraser clear your mental clutter
        </Text>
        <Text style={styles.guidanceSubtext}>
          Each breath creates more space
        </Text>
      </View>
    </View>
  );
}

export function MentalResetExercise({ onComplete, onBack }: MentalResetExerciseProps) {
  const config = getExerciseConfig('mental_reset');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <MentalResetContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  resetContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  topSection: {
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitleText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  whiteboardContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  whiteboard: {
    width: width * 0.8,
    height: width * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  thoughtLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: 16,
  },
  thoughtText: {
    position: 'absolute',
    fontSize: 16,
    color: '#374151',
    fontStyle: 'italic',
  },
  thoughtText2: {
    top: 40,
    right: 30,
    fontSize: 14,
  },
  thoughtText3: {
    bottom: 60,
    left: 40,
    fontSize: 18,
  },
  thoughtText4: {
    top: 80,
    left: 20,
    fontSize: 12,
  },
  thoughtText5: {
    bottom: 30,
    right: 50,
    fontSize: 15,
  },
  eraser: {
    position: 'absolute',
    top: '50%',
    width: 60,
    height: 40,
    borderRadius: 8,
    marginTop: -20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  eraserSponge: {
    width: 40,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
  },
  erasedTrail: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    opacity: 0.5,
  },
  breathSection: {
    alignItems: 'center',
    gap: 12,
  },
  breathLabel: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  breathCircles: {
    flexDirection: 'row',
    gap: 12,
  },
  breathCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  guidanceSection: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  guidanceText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guidanceSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
