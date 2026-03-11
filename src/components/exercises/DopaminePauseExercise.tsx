/**
 * Dopamine Pause Exercise
 *
 * 5-minute timer to resist phone checking urges with urge intensity slider
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width } = Dimensions.get('window');

interface DopaminePauseExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function DopaminePauseContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [urgeIntensity, setUrgeIntensity] = useState(50);
  const phoneAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const config = getExerciseConfig('dopamine_pause');

  useEffect(() => {
    // Phone shake animation when urge is high
    if (urgeIntensity > 70) {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(phoneAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(phoneAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(phoneAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(phoneAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      );
      shake.start();
      return () => shake.stop();
    } else {
      // Gentle pulse for lower urges
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [urgeIntensity]);

  const handleSliderChange = (value: number) => {
    setUrgeIntensity(value);
    if (value < 30) {
      helpers.vibrate('light');
    }
  };

  const getUrgeText = () => {
    if (urgeIntensity < 30) return 'Urge is weakening';
    if (urgeIntensity < 70) return 'Just observe the urge';
    return 'Notice the peak intensity';
  };

  const getUrgeColor = () => {
    if (urgeIntensity < 30) return '#10B981';
    if (urgeIntensity < 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.pauseContainer}>
      {/* Instructions */}
      <View style={styles.topSection}>
        <Text style={styles.titleText}>Resist the Urge</Text>
        <Text style={styles.subtitleText}>Put your phone down and sit with the feeling</Text>
      </View>

      {/* Phone Icon */}
      <View style={styles.phoneSection}>
        <Animated.View
          style={[
            styles.phoneIconContainer,
            {
              transform: [
                { translateX: phoneAnim },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <View style={[styles.phoneIcon, { borderColor: config.colors.primary }]}>
            <View style={styles.phoneScreen} />
            <View style={[styles.phoneButton, { backgroundColor: config.colors.primary }]} />
          </View>
          <Text style={styles.phoneEmoji}>📱</Text>
        </Animated.View>

        {/* Crossed out symbol when urge is low */}
        {urgeIntensity < 30 && (
          <View style={styles.crossOut}>
            <View style={[styles.crossLine, { backgroundColor: '#10B981' }]} />
          </View>
        )}
      </View>

      {/* Urge intensity slider */}
      <View style={styles.sliderSection}>
        <Text style={styles.sliderLabel}>How strong is your urge?</Text>
        <Text style={[styles.urgeStatus, { color: getUrgeColor() }]}>
          {getUrgeText()}
        </Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderMinLabel}>Weak</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={urgeIntensity}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={getUrgeColor()}
            maximumTrackTintColor="#374151"
            thumbTintColor={getUrgeColor()}
          />
          <Text style={styles.sliderMaxLabel}>Strong</Text>
        </View>

        <Text style={styles.intensityNumber}>{Math.round(urgeIntensity)}%</Text>
      </View>

      {/* Guidance */}
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceText}>
          {urgeIntensity > 70
            ? 'The urge will peak and pass. You are in control.'
            : urgeIntensity > 30
            ? 'Notice the urge without acting on it. This builds willpower.'
            : 'Great! The urge is fading. You are breaking the pattern.'}
        </Text>
      </View>

      {/* Time remaining */}
      <View style={styles.timeSection}>
        <Text style={styles.timeLabel}>Time remaining</Text>
        <Text style={[styles.timeValue, { color: config.colors.primary }]}>
          {Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}

export function DopaminePauseExercise({ onComplete, onBack }: DopaminePauseExerciseProps) {
  const config = getExerciseConfig('dopamine_pause');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <DopaminePauseContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  pauseContainer: {
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
  },
  phoneSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 200,
  },
  phoneIconContainer: {
    alignItems: 'center',
  },
  phoneIcon: {
    width: 100,
    height: 160,
    borderWidth: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  phoneButton: {
    width: 40,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  phoneEmoji: {
    fontSize: 48,
    marginTop: -120,
  },
  crossOut: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossLine: {
    width: 140,
    height: 6,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  sliderSection: {
    gap: 12,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  urgeStatus: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  intensityNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guidanceSection: {
    paddingHorizontal: 16,
  },
  guidanceText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 22,
  },
  timeSection: {
    alignItems: 'center',
    gap: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  timeValue: {
    fontSize: 40,
    fontWeight: '700',
  },
});
