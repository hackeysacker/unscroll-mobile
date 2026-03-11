/**
 * Urge Surfing Exercise
 *
 * Visualize urges as waves that rise and fall without acting on them
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width } = Dimensions.get('window');

interface UrgeSurfingExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function UrgeSurfingContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [urgeLevel, setUrgeLevel] = useState(30);
  const waveAnim = useRef(new Animated.Value(0)).current;
  const surfboardAnim = useRef(new Animated.Value(0)).current;

  const config = getExerciseConfig('urge_surfing');

  useEffect(() => {
    // Wave animation - rises and falls
    const waveSequence = Animated.loop(
      Animated.sequence([
        // Rise
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        // Peak hold
        Animated.delay(2000),
        // Fall
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
        // Trough hold
        Animated.delay(2000),
      ])
    );

    // Surfboard follows wave
    const surfboardSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(surfboardAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(surfboardAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    );

    waveSequence.start();
    surfboardSequence.start();

    return () => {
      waveSequence.stop();
      surfboardSequence.stop();
    };
  }, []);

  const waveHeight = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 200],
  });

  const surfboardY = surfboardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });

  const getPhaseText = () => {
    const progress = waveAnim._value;
    if (progress < 0.3) return 'Urge is rising...';
    if (progress < 0.6) return 'Approaching the peak...';
    if (progress < 0.7) return 'At the peak - just observe';
    return 'Urge is passing...';
  };

  return (
    <View style={styles.surfContainer}>
      {/* Instructions */}
      <View style={styles.topSection}>
        <Text style={styles.titleText}>Ride the Wave</Text>
        <Text style={styles.subtitleText}>Watch the urge rise and fall without acting</Text>
      </View>

      {/* Wave visualization */}
      <View style={styles.oceanContainer}>
        <View style={styles.ocean}>
          {/* Wave */}
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: config.colors.primary,
                height: waveHeight,
              },
            ]}
          >
            {/* Surfboard */}
            <Animated.View
              style={[
                styles.surfboard,
                {
                  transform: [{ translateY: surfboardY }],
                },
              ]}
            >
              <Text style={styles.surfboardEmoji}>🏄</Text>
            </Animated.View>
          </Animated.View>

          {/* Water line */}
          <View style={styles.waterLine} />
        </View>

        <Text style={[styles.phaseText, { color: config.colors.accent }]}>
          {getPhaseText()}
        </Text>
      </View>

      {/* Urge intensity tracking */}
      <View style={styles.sliderSection}>
        <Text style={styles.sliderLabel}>How strong is your urge right now?</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={urgeLevel}
          onValueChange={setUrgeLevel}
          minimumTrackTintColor={config.colors.primary}
          maximumTrackTintColor="#374151"
          thumbTintColor={config.colors.accent}
        />
        <Text style={styles.urgeValue}>{Math.round(urgeLevel)}%</Text>
      </View>

      {/* Guidance */}
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceText}>
          {urgeLevel > 70
            ? 'Notice the intensity without judgment. It will pass.'
            : urgeLevel > 40
            ? 'You\'re riding the wave. Stay present with the feeling.'
            : 'The urge is subsiding. You didn\'t give in. Well done.'}
        </Text>
        <Text style={styles.guidanceSubtext}>
          Remember: Urges are temporary. They always peak and pass.
        </Text>
      </View>
    </View>
  );
}

export function UrgeSurfingExercise({ onComplete, onBack }: UrgeSurfingExerciseProps) {
  const config = getExerciseConfig('urge_surfing');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <UrgeSurfingContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  surfContainer: {
    flex: 1,
    justifyContent: 'space-between',
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
  oceanContainer: {
    alignItems: 'center',
    gap: 16,
  },
  ocean: {
    width: width * 0.8,
    height: 220,
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  wave: {
    width: '100%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    position: 'relative',
    opacity: 0.7,
  },
  surfboard: {
    position: 'absolute',
    top: -40,
    left: '50%',
    marginLeft: -25,
  },
  surfboardEmoji: {
    fontSize: 50,
  },
  waterLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B82F6',
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sliderSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  urgeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guidanceSection: {
    paddingHorizontal: 24,
    gap: 8,
  },
  guidanceText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  guidanceSubtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
