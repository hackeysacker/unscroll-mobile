import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useAvatar, EVOLUTION_STAGES } from '@/contexts/AvatarContext';
import type { AvatarEvolutionStage, AvatarMood, AvatarReaction } from '@/types';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showGlow?: boolean;
  interactive?: boolean;
  style?: any;
}

// Size configurations
const SIZES = {
  small: { container: 40, core: 20, glow: 60 },
  medium: { container: 80, core: 40, glow: 120 },
  large: { container: 120, core: 60, glow: 180 },
  xlarge: { container: 200, core: 100, glow: 300 },
};

// Evolution stage visual configs
const STAGE_VISUALS: Record<AvatarEvolutionStage, {
  coreStyle: 'circle' | 'soft' | 'complex';
  layers: number;
  pulseSpeed: number;
  floatSpeed: number;
}> = {
  spark: { coreStyle: 'circle', layers: 1, pulseSpeed: 2000, floatSpeed: 3000 },
  ember: { coreStyle: 'circle', layers: 2, pulseSpeed: 1800, floatSpeed: 2800 },
  orb: { coreStyle: 'soft', layers: 2, pulseSpeed: 1600, floatSpeed: 2600 },
  sprite: { coreStyle: 'soft', layers: 3, pulseSpeed: 1400, floatSpeed: 2400 },
  guardian: { coreStyle: 'complex', layers: 3, pulseSpeed: 1200, floatSpeed: 2200 },
  sentinel: { coreStyle: 'complex', layers: 4, pulseSpeed: 1000, floatSpeed: 2000 },
  master: { coreStyle: 'complex', layers: 4, pulseSpeed: 800, floatSpeed: 1800 },
  transcendent: { coreStyle: 'complex', layers: 5, pulseSpeed: 600, floatSpeed: 1600 },
};

export function Avatar({ size = 'medium', showGlow = true, interactive = true, style }: AvatarProps) {
  const { avatar, currentReaction, getSkinColors, triggerReaction } = useAvatar();

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const sizeConfig = SIZES[size];
  const colors = getSkinColors();
  const stageVisual = avatar ? STAGE_VISUALS[avatar.evolutionStage] : STAGE_VISUALS.spark;

  // Floating animation
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: stageVisual.floatSpeed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: stageVisual.floatSpeed,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    float.start();
    return () => float.stop();
  }, [stageVisual.floatSpeed]);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: stageVisual.pulseSpeed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: stageVisual.pulseSpeed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [stageVisual.pulseSpeed]);

  // Glow animation
  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);

  // Handle reactions
  useEffect(() => {
    if (!currentReaction) return;

    const playReaction = (reaction: AvatarReaction) => {
      const intensity = reaction.intensity === 'subtle' ? 0.5 : reaction.intensity === 'normal' ? 1 : 1.5;

      switch (reaction.type) {
        case 'bounce':
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1 + 0.2 * intensity,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.9,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'spin':
          Animated.timing(rotateAnim, {
            toValue: intensity,
            duration: reaction.duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => rotateAnim.setValue(0));
          break;

        case 'glow':
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: reaction.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: reaction.duration / 2,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'dim':
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: reaction.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: reaction.duration / 2,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'grow':
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.5 * intensity,
              duration: reaction.duration * 0.4,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: reaction.duration * 0.6,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'shake':
          Animated.sequence([
            Animated.timing(rotateAnim, { toValue: 0.05, duration: 50, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: -0.05, duration: 50, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: 0.05, duration: 50, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: -0.05, duration: 50, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]).start();
          break;

        case 'celebrate':
          Animated.parallel([
            Animated.sequence([
              Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]),
            Animated.timing(rotateAnim, {
              toValue: 2,
              duration: reaction.duration,
              useNativeDriver: true,
            }),
          ]).start(() => rotateAnim.setValue(0));
          break;

        case 'sparkle':
          Animated.loop(
            Animated.sequence([
              Animated.timing(glowAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
              Animated.timing(glowAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
            ]),
            { iterations: Math.floor(reaction.duration / 200) }
          ).start();
          break;

        case 'nod':
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 150, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          ]).start();
          break;

        default:
          break;
      }
    };

    playReaction(currentReaction);
  }, [currentReaction]);

  if (!avatar) return null;

  // Calculate brightness-based opacity
  const brightnessOpacity = 0.5 + (avatar.brightness / 200);

  // Float interpolation
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  // Rotation interpolation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    if (interactive) {
      triggerReaction({ type: 'bounce', intensity: 'subtle', duration: 500 });
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: sizeConfig.container,
          height: sizeConfig.container,
          transform: [
            { translateY: floatY },
            { scale: Animated.multiply(pulseAnim, scaleAnim) },
            { rotate: spin },
          ],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      {/* Outer glow */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: sizeConfig.glow,
              height: sizeConfig.glow,
              borderRadius: sizeConfig.glow / 2,
              backgroundColor: colors.glow,
              opacity: Animated.multiply(glowAnim, brightnessOpacity * 0.5),
            },
          ]}
        />
      )}

      {/* Middle layer */}
      {stageVisual.layers >= 2 && (
        <View
          style={[
            styles.middleLayer,
            {
              width: sizeConfig.core * 1.5,
              height: sizeConfig.core * 1.5,
              borderRadius: sizeConfig.core * 0.75,
              backgroundColor: colors.secondary,
              opacity: 0.6 * brightnessOpacity,
            },
          ]}
        />
      )}

      {/* Core */}
      <View
        style={[
          styles.core,
          {
            width: sizeConfig.core,
            height: sizeConfig.core,
            borderRadius: stageVisual.coreStyle === 'circle' ? sizeConfig.core / 2 : sizeConfig.core / 3,
            backgroundColor: colors.primary,
            opacity: brightnessOpacity,
          },
        ]}
      >
        {/* Inner glow for advanced stages */}
        {stageVisual.layers >= 3 && (
          <View
            style={[
              styles.innerGlow,
              {
                width: sizeConfig.core * 0.5,
                height: sizeConfig.core * 0.5,
                borderRadius: sizeConfig.core * 0.25,
                backgroundColor: colors.glow,
              },
            ]}
          />
        )}
      </View>

      {/* Additional layers for higher evolution stages */}
      {stageVisual.layers >= 4 && (
        <View
          style={[
            styles.orbitRing,
            {
              width: sizeConfig.core * 2,
              height: sizeConfig.core * 2,
              borderRadius: sizeConfig.core,
              borderColor: colors.secondary,
              borderWidth: 1,
              opacity: 0.3 * brightnessOpacity,
            },
          ]}
        />
      )}

      {/* Crown accessory */}
      {avatar.accessory === 'crown' && (
        <View
          style={[
            styles.crown,
            {
              top: -sizeConfig.core * 0.3,
            },
          ]}
        >
          <View style={[styles.crownPoint, { backgroundColor: colors.primary }]} />
        </View>
      )}

      {/* Halo accessory */}
      {avatar.accessory === 'halo' && (
        <View
          style={[
            styles.halo,
            {
              width: sizeConfig.core * 1.2,
              height: sizeConfig.core * 0.3,
              top: -sizeConfig.core * 0.4,
              borderColor: colors.glow,
              borderWidth: 2,
              borderRadius: sizeConfig.core * 0.6,
            },
          ]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  middleLayer: {
    position: 'absolute',
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  innerGlow: {
    opacity: 0.8,
  },
  orbitRing: {
    position: 'absolute',
  },
  crown: {
    position: 'absolute',
    alignItems: 'center',
  },
  crownPoint: {
    width: 8,
    height: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  halo: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

export default Avatar;
