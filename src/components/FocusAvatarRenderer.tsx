/**
 * Focus Avatar Renderer
 *
 * Renders the evolved avatar with all visual features:
 * - Geometric shapes based on evolution stage
 * - Glow layers
 * - Energy trails
 * - Sparks and particle effects
 * - Core illumination
 * - Split animations for advanced stages
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import {
  FOCUS_AVATAR_EVOLUTIONS,
  type FocusAvatarStage,
  type FocusAvatarEvolution,
} from '@/lib/focus-avatar-evolution';
import type { FocusRealm } from '@/lib/focus-realm-themes';

interface FocusAvatarRendererProps {
  stage: FocusAvatarStage;
  realm: FocusRealm;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const SIZE_MAP = {
  small: 40,
  medium: 60,
  large: 80,
};

/**
 * Energy trail particle
 */
interface TrailParticleProps {
  index: number;
  color: string;
  length: number;
  fadeSpeed: number;
  baseSize: number;
}

function TrailParticle({ index, color, length, fadeSpeed, baseSize }: TrailParticleProps) {
  const opacity = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;
    const duration = 2000 / fadeSpeed;

    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: length,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index, length, fadeSpeed]);

  return (
    <Animated.View
      style={[
        styles.trailParticle,
        {
          width: baseSize * 0.3,
          height: baseSize * 0.3,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

/**
 * Spark effect
 */
interface SparkProps {
  index: number;
  color: string;
  baseSize: number;
}

function Spark({ index, color, baseSize }: SparkProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const angle = (index / 8) * Math.PI * 2;
    const distance = baseSize * 0.8;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    Animated.loop(
      Animated.sequence([
        Animated.delay(Math.random() * 2000),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: targetX,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: targetY,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index, baseSize]);

  return (
    <Animated.View
      style={[
        styles.spark,
        {
          width: baseSize * 0.15,
          height: baseSize * 0.15,
          backgroundColor: color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
}

/**
 * Main Focus Avatar Renderer
 */
export function FocusAvatarRenderer({
  stage,
  realm,
  size = 'medium',
  animated = true,
}: FocusAvatarRendererProps) {
  const evolution = FOCUS_AVATAR_EVOLUTIONS[stage];
  const baseSize = SIZE_MAP[size] * evolution.shape.size;

  // Core animations
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const splitAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!animated) return;

    // Breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: evolution.glow.pulseSpeed * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.5,
          duration: evolution.glow.pulseSpeed * 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gentle rotation for advanced stages
    if (evolution.shape.complexity >= 7) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    }

    // Split animation
    if (evolution.effects.split) {
      Animated.loop(
        Animated.sequence([
          Animated.delay(3000),
          Animated.timing(splitAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(splitAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [evolution, animated]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const splitOffset = splitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  // Blend evolution colors with realm colors
  const coreColor = realm.colors.primary;
  const glowColor = realm.colors.glow;
  const trailColor = realm.colors.accent;

  return (
    <View style={[styles.container, { width: baseSize * 2, height: baseSize * 2 }]}>
      {/* Energy trails */}
      {evolution.trails.enabled && (
        <View style={styles.trailsContainer}>
          {Array.from({ length: evolution.trails.count }).map((_, i) => (
            <View
              key={`trail-${i}`}
              style={[
                styles.trailPath,
                {
                  transform: [{ rotate: `${(i / evolution.trails.count) * 360}deg` }],
                },
              ]}
            >
              <TrailParticle
                index={i}
                color={trailColor}
                length={evolution.trails.length}
                fadeSpeed={evolution.trails.fadeSpeed}
                baseSize={baseSize}
              />
            </View>
          ))}
        </View>
      )}

      {/* Glow layers */}
      {Array.from({ length: evolution.glow.layers }).map((_, i) => {
        const layerSize = baseSize + (i + 1) * evolution.glow.radius;
        const layerOpacity = evolution.glow.intensity / (i + 1);

        return (
          <Animated.View
            key={`glow-${i}`}
            style={[
              styles.glowLayer,
              {
                width: layerSize,
                height: layerSize,
                borderRadius: evolution.shape.type === 'geometric' ? layerSize * 0.15 : layerSize / 2,
                backgroundColor: glowColor,
                opacity: glowPulse.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [layerOpacity * 0.3, layerOpacity * 0.6],
                }),
              },
            ]}
          />
        );
      })}

      {/* Main avatar core */}
      <Animated.View
        style={[
          styles.avatarCore,
          {
            width: baseSize,
            height: baseSize,
            backgroundColor: coreColor,
            borderRadius: evolution.shape.type === 'geometric'
              ? baseSize * 0.2
              : evolution.shape.type === 'complex'
              ? baseSize * 0.3
              : baseSize / 2,
            transform: [
              { scale: breatheAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        {/* Inner core glow */}
        {evolution.effects.coreGlow && (
          <Animated.View
            style={[
              styles.innerCore,
              {
                width: baseSize * 0.5,
                height: baseSize * 0.5,
                backgroundColor: trailColor,
                borderRadius: baseSize * 0.25,
                opacity: glowPulse.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0.5, 0.9],
                }),
              },
            ]}
          />
        )}

        {/* Geometric pattern overlay */}
        {evolution.effects.geometricPattern && (
          <View style={styles.geometricPattern}>
            {Array.from({ length: evolution.shape.edges }).map((_, i) => (
              <View
                key={`edge-${i}`}
                style={[
                  styles.geometricEdge,
                  {
                    width: 2,
                    height: baseSize * 0.3,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: [
                      { rotate: `${(i / evolution.shape.edges) * 360}deg` },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>

      {/* Sparks */}
      {evolution.effects.sparks && (
        <View style={styles.sparksContainer}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Spark key={`spark-${i}`} index={i} color={trailColor} baseSize={baseSize} />
          ))}
        </View>
      )}

      {/* Split duplicate (for multi-focus effect) */}
      {evolution.effects.split && (
        <Animated.View
          style={[
            styles.splitDuplicate,
            {
              width: baseSize,
              height: baseSize,
              borderRadius: evolution.shape.type === 'geometric' ? baseSize * 0.2 : baseSize / 2,
              backgroundColor: coreColor,
              opacity: splitAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
              transform: [
                { translateX: splitOffset },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailPath: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailParticle: {
    borderRadius: 999,
  },
  glowLayer: {
    position: 'absolute',
  },
  avatarCore: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  innerCore: {
    position: 'absolute',
  },
  geometricPattern: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  geometricEdge: {
    position: 'absolute',
  },
  sparksContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spark: {
    position: 'absolute',
    borderRadius: 999,
  },
  splitDuplicate: {
    position: 'absolute',
  },
});
