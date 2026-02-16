import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RealmTheme } from '@/lib/realm-themes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RealmTransitionOverlayProps {
  fromRealm: RealmTheme;
  toRealm: RealmTheme;
  progress: number; // 0-1
  onComplete?: () => void;
}

/**
 * Beautiful transition overlay when crossing realm boundaries
 * Creates a wave/ripple effect with colors blending
 */
export function RealmTransitionOverlay({
  fromRealm,
  toRealm,
  progress,
  onComplete,
}: RealmTransitionOverlayProps) {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (progress > 0.7) {
      // Trigger transition animation
      fadeAnim.setValue(1);
      
      Animated.parallel([
        // Wave animations
        Animated.timing(wave1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(wave2, {
          toValue: 1,
          duration: 1200,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(wave3, {
          toValue: 1,
          duration: 1400,
          delay: 200,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1500,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [progress]);

  if (progress < 0.7) return null;

  const waveTransform = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT, -SCREEN_HEIGHT],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1.5, 2],
        }),
      },
    ],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.wave, waveTransform(wave1), { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[toRealm.colors.primary, toRealm.colors.secondary]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      <Animated.View style={[styles.wave, waveTransform(wave2), { opacity: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.7],
      }) }]}>
        <LinearGradient
          colors={[toRealm.colors.secondary, toRealm.colors.accent]}
          style={styles.gradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
      
      <Animated.View style={[styles.wave, waveTransform(wave3), { opacity: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }) }]}>
        <LinearGradient
          colors={[toRealm.colors.accent, toRealm.colors.primary]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: SCREEN_WIDTH * 3,
    height: SCREEN_HEIGHT * 3,
    left: -SCREEN_WIDTH,
    borderRadius: SCREEN_WIDTH * 1.5,
  },
  gradient: {
    flex: 1,
  },
});
























