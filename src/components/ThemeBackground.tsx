import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ViewStyle } from 'react-native';

interface ThemeBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Animated wrapper that smoothly transitions theme background colors
 * Use this to wrap any screen component
 */
export function ThemeBackground({ children, style }: ThemeBackgroundProps) {
  const { colors, fadeAnim } = useTheme();
  const backgroundColorAnim = useRef(new Animated.Value(1)).current;
  const prevColorRef = useRef(colors.background);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevColorRef.current = colors.background;
      return;
    }

    // Animate background color change
    if (prevColorRef.current !== colors.background) {
      backgroundColorAnim.setValue(0);
      Animated.timing(backgroundColorAnim, {
        toValue: 1,
        duration: 600,
        easing: Animated.Easing.inOut(Animated.Easing.ease),
        useNativeDriver: false, // backgroundColor doesn't support native driver
      }).start(() => {
        prevColorRef.current = colors.background;
      });
    }
  }, [colors.background, backgroundColorAnim]);

  const animatedBackgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [prevColorRef.current, colors.background],
  });

  return (
    <Animated.View 
      style={[
        { 
          flex: 1, 
          backgroundColor: animatedBackgroundColor,
          opacity: fadeAnim,
        }, 
        style
      ]}
    >
      {children}
    </Animated.View>
  );
}











