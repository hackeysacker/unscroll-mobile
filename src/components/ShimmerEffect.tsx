import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerEffectProps {
  width: number;
  height: number;
  borderRadius?: number;
}

/**
 * Beautiful shimmer loading effect
 * Used for smoother transitions and loading states
 */
export function ShimmerEffect({ width, height, borderRadius = 8 }: ShimmerEffectProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            width,
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  shimmer: {
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});
























