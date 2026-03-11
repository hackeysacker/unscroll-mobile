/**
 * Ego Detach Exercise
 *
 * Observer perspective - see thoughts as clouds passing
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

const { width } = Dimensions.get('window');

interface EgoDetachExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const THOUGHTS = ['worry', 'plan', 'memory', 'judgment', 'fear', 'hope'];

function EgoDetachContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const cloud1 = useRef(new Animated.Value(-100)).current;
  const cloud2 = useRef(new Animated.Value(-100)).current;
  const cloud3 = useRef(new Animated.Value(-100)).current;
  const observerPulse = useRef(new Animated.Value(1)).current;

  const config = getExerciseConfig('ego_detach');

  useEffect(() => {
    // Clouds floating across
    const animateCloud = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: width + 100,
            duration: 15000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Observer pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(observerPulse, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(observerPulse, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    animateCloud(cloud1, 0).start();
    animateCloud(cloud2, 5000).start();
    animateCloud(cloud3, 10000).start();
    pulse.start();

    return () => {
      cloud1.stopAnimation();
      cloud2.stopAnimation();
      cloud3.stopAnimation();
      observerPulse.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.detachContainer}>
      {/* Instructions */}
      <View style={styles.topSection}>
        <Text style={styles.titleText}>Observer Perspective</Text>
        <Text style={styles.subtitleText}>
          You are not your thoughts. You are the awareness observing them.
        </Text>
      </View>

      {/* Sky with clouds */}
      <View style={styles.skySection}>
        {/* Observer (you) */}
        <View style={styles.observerContainer}>
          <Animated.View
            style={[
              styles.observerCircle,
              {
                borderColor: config.colors.primary,
                transform: [{ scale: observerPulse }],
              },
            ]}
          >
            <Text style={styles.observerText}>YOU</Text>
            <Text style={styles.observerSubtext}>The Observer</Text>
          </Animated.View>
        </View>

        {/* Thought clouds */}
        <View style={styles.cloudsContainer}>
          {[cloud1, cloud2, cloud3].map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.cloud,
                {
                  transform: [{ translateX: anim }],
                  top: 100 + index * 80,
                },
              ]}
            >
              <View style={[styles.cloudShape, { backgroundColor: config.colors.primary }]}>
                <Text style={styles.thoughtText}>{THOUGHTS[index % THOUGHTS.length]}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Guidance */}
      <View style={styles.guidanceSection}>
        <Text style={styles.guidanceTitle}>Notice:</Text>
        <Text style={styles.guidanceText}>
          Thoughts come and go like clouds in the sky
        </Text>
        <Text style={styles.guidanceText}>
          You are the sky, not the clouds
        </Text>
        <Text style={styles.guidanceText}>
          You can watch them pass without attaching to them
        </Text>
      </View>
    </View>
  );
}

export function EgoDetachExercise({ onComplete, onBack }: EgoDetachExerciseProps) {
  const config = getExerciseConfig('ego_detach');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <EgoDetachContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  detachContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  topSection: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
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
    lineHeight: 20,
  },
  skySection: {
    flex: 1,
    position: 'relative',
  },
  observerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
    zIndex: 10,
  },
  observerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  observerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  observerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cloudsContainer: {
    flex: 1,
    position: 'relative',
  },
  cloud: {
    position: 'absolute',
    left: 0,
  },
  cloudShape: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    opacity: 0.5,
  },
  thoughtText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  guidanceSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guidanceText: {
    fontSize: 15,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
  },
});
