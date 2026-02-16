/**
 * Vision Moment Exercise
 *
 * Guided visualization of your ideal future self
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface VisionMomentExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const VISION_PHASES = [
  { text: 'Close your eyes...', duration: 10, emoji: '👁️' },
  { text: 'Take a deep breath...', duration: 10, emoji: '🫁' },
  { text: 'Imagine yourself one year from now...', duration: 20, emoji: '🔮' },
  { text: 'You\'ve achieved your goals...', duration: 15, emoji: '🎯' },
  { text: 'How do you feel?', duration: 15, emoji: '✨' },
  { text: 'What have you become?', duration: 15, emoji: '🌟' },
  { text: 'Who are you spending time with?', duration: 15, emoji: '👥' },
  { text: 'What are you doing each day?', duration: 15, emoji: '📅' },
  { text: 'Feel the emotions of that future...', duration: 20, emoji: '💫' },
  { text: 'Hold onto that vision...', duration: 20, emoji: '🎨' },
  { text: 'When ready, open your eyes...', duration: 15, emoji: '👀' },
];

function VisionMomentContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const config = getExerciseConfig('vision_moment');
  const phase = VISION_PHASES[currentPhase];

  useEffect(() => {
    // Fade in text
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    helpers.vibrate('light');

    // Move to next phase
    const timer = setTimeout(() => {
      if (currentPhase < VISION_PHASES.length - 1) {
        fadeAnim.setValue(0);
        setCurrentPhase(currentPhase + 1);
      }
    }, phase.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentPhase]);

  const progress = ((currentPhase + 1) / VISION_PHASES.length) * 100;
  helpers.updateProgress(progress);

  return (
    <View style={styles.visionContainer}>
      <Animated.View
        style={[
          styles.contentBox,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.emojiText,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
              transform: [{
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              }],
            },
          ]}
        >
          {phase.emoji}
        </Animated.Text>
        <Text style={[styles.phaseText, { color: config.colors.primary }]}>
          {phase.text}
        </Text>
      </Animated.View>

      <View style={styles.progressContainer}>
        <View style={styles.progressDots}>
          {VISION_PHASES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i <= currentPhase ? config.colors.primary : '#374151' },
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          {currentPhase + 1} / {VISION_PHASES.length}
        </Text>
      </View>
    </View>
  );
}

export function VisionMomentExercise({ onComplete, onBack }: VisionMomentExerciseProps) {
  const config = getExerciseConfig('vision_moment');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <VisionMomentContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  visionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  contentBox: {
    alignItems: 'center',
    gap: 32,
  },
  emojiText: {
    fontSize: 80,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 12,
  },
  progressDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    maxWidth: 300,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
