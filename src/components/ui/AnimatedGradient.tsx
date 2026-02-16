import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: any;
  children?: React.ReactNode;
  transitionDuration?: number;
}

/**
 * Animated LinearGradient that smoothly transitions between color sets
 * Note: This creates a crossfade effect by layering two gradients
 */
export function AnimatedGradient({ 
  colors, 
  start = { x: 0, y: 0 }, 
  end = { x: 1, y: 1 },
  style,
  children,
  transitionDuration = 600,
}: AnimatedGradientProps) {
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const prevColorsRef = useRef(colors);

  useEffect(() => {
    if (JSON.stringify(prevColorsRef.current) !== JSON.stringify(colors)) {
      // Crossfade between old and new colors
      opacityAnim.setValue(0);
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: transitionDuration,
        easing: Animated.Easing.inOut(Animated.Easing.ease),
        useNativeDriver: true,
      }).start();
      prevColorsRef.current = colors;
    }
  }, [colors, opacityAnim, transitionDuration]);

  return (
    <View style={[{ position: 'relative', width: '100%', height: '100%' }, style]}>
      {/* Previous gradient (fading out) */}
      <LinearGradient
        colors={prevColorsRef.current}
        start={start}
        end={end}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      />
      {/* New gradient (fading in) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          start={start}
          end={end}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {children && (
        <View style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </View>
      )}
    </View>
  );
}

