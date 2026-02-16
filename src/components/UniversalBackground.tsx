/**
 * UNIVERSAL BACKGROUND COMPONENT
 * Beautiful animated gradient with particle effects
 * Used consistently across all challenges and screens
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UniversalBackgroundProps {
  children: React.ReactNode;
  variant?: 'calm' | 'focus' | 'energy' | 'mastery';
}

// Particle system for ambient effects
interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  size: number;
  opacity: Animated.Value;
  duration: number;
}

export function UniversalBackground({
  children,
  variant = 'focus'
}: UniversalBackgroundProps) {
  // Create floating particles
  const particles = useRef<Particle[]>(
    Array.from({ length: 20 }, (_, i) => ({
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(Math.random() * SCREEN_HEIGHT),
      size: Math.random() * 40 + 20,
      opacity: new Animated.Value(Math.random() * 0.3 + 0.1),
      duration: Math.random() * 10000 + 15000,
    }))
  ).current;

  // Gradient animation values
  const gradientAnim = useRef(new Animated.Value(0)).current;

  // Animate gradient shift
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 20000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Animate particles
  useEffect(() => {
    particles.forEach((particle) => {
      // Float animation
      const animateParticle = () => {
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.random() * SCREEN_WIDTH,
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * SCREEN_HEIGHT,
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: Math.random() * 0.4 + 0.2,
              duration: particle.duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: Math.random() * 0.2 + 0.05,
              duration: particle.duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateParticle());
      };

      animateParticle();
    });
  }, []);

  // Define gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'calm':
        return ['#0f172a', '#1e293b', '#0f172a', '#1e1b4b'];
      case 'energy':
        return ['#1e1b4b', '#312e81', '#1e3a8a', '#1e293b'];
      case 'mastery':
        return ['#1e1b4b', '#4c1d95', '#581c87', '#1e293b'];
      case 'focus':
      default:
        return ['#0a0118', '#1a0b2e', '#16213e', '#0f3460'];
    }
  };

  const gradientColors = getGradientColors();

  return (
    <View style={styles.container}>
      {/* Base animated gradient */}
      <Animated.View style={[styles.gradientContainer, {
        opacity: gradientAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.85, 1],
        }),
      }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Ambient glow overlay */}
      <View style={styles.glowOverlay} pointerEvents="none">
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'transparent', 'rgba(139, 92, 246, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </View>

      {/* Floating particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {particles.map((particle, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                ],
                opacity: particle.opacity,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.4)', 'rgba(139, 92, 246, 0.2)', 'transparent']}
              style={styles.particleGradient}
            />
          </Animated.View>
        ))}
      </View>

      {/* Radial glow effects */}
      <View style={styles.radialContainer} pointerEvents="none">
        <View style={[styles.radialGlow, styles.radialGlow1]} />
        <View style={[styles.radialGlow, styles.radialGlow2]} />
        <View style={[styles.radialGlow, styles.radialGlow3]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Subtle noise texture overlay */}
      <View style={styles.noiseOverlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0118',
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
  particleGradient: {
    flex: 1,
    borderRadius: 100,
  },
  radialContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  radialGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.15,
  },
  radialGlow1: {
    top: -100,
    left: -100,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  radialGlow2: {
    bottom: -150,
    right: -100,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  radialGlow3: {
    top: '40%',
    left: '30%',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    opacity: 0.3,
  },
});
