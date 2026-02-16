/**
 * Body Scan Exercise
 *
 * 1-minute guided body scan from head to toes with animated body outline
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width } = Dimensions.get('window');

interface BodyScanExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const BODY_PARTS = [
  { name: 'Head', y: 0.1, duration: 10 },
  { name: 'Neck & Shoulders', y: 0.2, duration: 10 },
  { name: 'Arms & Hands', y: 0.35, duration: 10 },
  { name: 'Chest & Back', y: 0.5, duration: 10 },
  { name: 'Stomach', y: 0.6, duration: 10 },
  { name: 'Legs & Feet', y: 0.85, duration: 10 },
];

function BodyScanContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const config = getExerciseConfig('body_scan');
  const currentPart = BODY_PARTS[currentPartIndex];

  useEffect(() => {
    // Animate scan line and glow
    const animateBodyPart = () => {
      Animated.parallel([
        Animated.timing(scanAnim, {
          toValue: currentPart.y,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      helpers.vibrate('light');
    };

    animateBodyPart();

    // Move to next body part
    const timer = setTimeout(() => {
      if (currentPartIndex < BODY_PARTS.length - 1) {
        setCurrentPartIndex(currentPartIndex + 1);
      }
    }, currentPart.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentPartIndex]);

  const progress = ((currentPartIndex + 1) / BODY_PARTS.length) * 100;
  helpers.updateProgress(progress);

  return (
    <View style={styles.bodyContainer}>
      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>Focus on your...</Text>
        <Animated.Text
          style={[
            styles.bodyPartText,
            {
              color: config.colors.primary,
              opacity: glowAnim.interpolate({
                inputRange: [0.3, 1],
                outputRange: [0.6, 1],
              }),
            },
          ]}
        >
          {currentPart.name}
        </Animated.Text>
        <Text style={styles.guidanceText}>Notice any tension or sensation</Text>
      </View>

      {/* Body outline with scan line */}
      <View style={styles.bodyOutlineContainer}>
        {/* Simple body shape */}
        <View style={styles.bodyShape}>
          {/* Head */}
          <View style={[styles.bodyHead, { borderColor: config.colors.primary }]} />

          {/* Torso */}
          <View style={[styles.bodyTorso, { borderColor: config.colors.primary }]} />

          {/* Arms */}
          <View style={styles.armsContainer}>
            <View style={[styles.arm, styles.armLeft, { borderColor: config.colors.primary }]} />
            <View style={[styles.arm, styles.armRight, { borderColor: config.colors.primary }]} />
          </View>

          {/* Legs */}
          <View style={styles.legsContainer}>
            <View style={[styles.leg, styles.legLeft, { borderColor: config.colors.primary }]} />
            <View style={[styles.leg, styles.legRight, { borderColor: config.colors.primary }]} />
          </View>

          {/* Scanning line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                backgroundColor: config.colors.accent,
                top: scanAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                opacity: glowAnim,
              },
            ]}
          />

          {/* Glow effect at current position */}
          <Animated.View
            style={[
              styles.scanGlow,
              {
                backgroundColor: config.colors.primary,
                top: scanAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                opacity: glowAnim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.2, 0.6],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressDots}>
        {BODY_PARTS.map((part, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index <= currentPartIndex
                  ? config.colors.primary
                  : '#374151',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function BodyScanExercise({ onComplete, onBack }: BodyScanExerciseProps) {
  const config = getExerciseConfig('body_scan');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <BodyScanContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
  },
  instructionBox: {
    alignItems: 'center',
    gap: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  bodyPartText: {
    fontSize: 28,
    fontWeight: '700',
  },
  guidanceText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bodyOutlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 1.2,
  },
  bodyShape: {
    width: width * 0.4,
    height: width * 1.2,
    position: 'relative',
    alignItems: 'center',
  },
  bodyHead: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    marginBottom: 10,
  },
  bodyTorso: {
    width: 100,
    height: 140,
    borderWidth: 3,
    borderRadius: 50,
  },
  armsContainer: {
    position: 'absolute',
    top: 80,
    width: 180,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arm: {
    width: 20,
    height: 100,
    borderWidth: 3,
    borderRadius: 10,
  },
  armLeft: {
    position: 'absolute',
    left: 0,
  },
  armRight: {
    position: 'absolute',
    right: 0,
  },
  legsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 5,
  },
  leg: {
    width: 30,
    height: 120,
    borderWidth: 3,
    borderRadius: 15,
  },
  legLeft: {},
  legRight: {},
  scanLine: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 3,
  },
  scanGlow: {
    position: 'absolute',
    left: -40,
    right: -40,
    height: 40,
    borderRadius: 20,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
