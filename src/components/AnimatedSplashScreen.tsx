import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Rect, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  // Animation values
  const outerCircleScale = useRef(new Animated.Value(0)).current;
  const phoneOpacity = useRef(new Animated.Value(0)).current;
  const phoneScale = useRef(new Animated.Value(0.3)).current;
  const innerCircleScale = useRef(new Animated.Value(0)).current;
  const xMarkOpacity = useRef(new Animated.Value(0)).current;
  const xMarkScale = useRef(new Animated.Value(0.3)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of animations - build up the logo
    Animated.sequence([
      // Step 1: Outer circle appears with spring (0-500ms)
      Animated.spring(outerCircleScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),

      // Step 2: Phone appears (500-800ms)
      Animated.parallel([
        Animated.timing(phoneOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(phoneScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Step 3: Inner circle appears (800-1100ms)
      Animated.spring(innerCircleScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),

      // Step 4: X mark appears with bounce (1100-1500ms)
      Animated.parallel([
        Animated.timing(xMarkOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(xMarkScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),

      // Step 5: Hold the complete logo (1500-2300ms)
      Animated.delay(800),

      // Step 6: Subtle pulse before finishing (2300-2700ms)
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),

      // Step 7: Fade out to reveal app (2700-3100ms)
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030712', '#0f172a', '#1e293b']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <AnimatedSvg width="280" height="280" viewBox="0 0 100 100">
            <Defs>
              {/* Gradient 1: Outer circle */}
              <SvgLinearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
              </SvgLinearGradient>

              {/* Gradient 2: Phone outline */}
              <SvgLinearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                <Stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
              </SvgLinearGradient>

              {/* Gradient 3: Inner circle */}
              <SvgLinearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>

            {/* Outer circle */}
            <AnimatedCircle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient1)"
              strokeWidth="3"
              fill="none"
              opacity={outerCircleScale}
              scale={outerCircleScale}
              origin="50, 50"
            />

            {/* Phone outline */}
            <AnimatedRect
              x="35"
              y="25"
              width="30"
              height="50"
              rx="3"
              stroke="url(#gradient2)"
              strokeWidth="2.5"
              fill="none"
              opacity={phoneOpacity}
              scale={phoneScale}
              origin="50, 50"
            />

            {/* Phone screen */}
            <AnimatedRect
              x="38"
              y="30"
              width="24"
              height="35"
              rx="1"
              fill="rgba(99, 102, 241, 0.1)"
              opacity={phoneOpacity}
              scale={phoneScale}
              origin="50, 50"
            />

            {/* Inner circle */}
            <AnimatedCircle
              cx="50"
              cy="50"
              r="15"
              stroke="url(#gradient3)"
              strokeWidth="2"
              fill="none"
              opacity={innerCircleScale}
              scale={innerCircleScale}
              origin="50, 50"
            />

            {/* X mark - line 1 */}
            <AnimatedLine
              x1="43"
              y1="43"
              x2="57"
              y2="57"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={xMarkOpacity}
              scale={xMarkScale}
              origin="50, 50"
            />

            {/* X mark - line 2 */}
            <AnimatedLine
              x1="57"
              y1="43"
              x2="43"
              y2="57"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              opacity={xMarkOpacity}
              scale={xMarkScale}
              origin="50, 50"
            />
          </AnimatedSvg>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 12,
    borderColor: '#e5e7eb',
  },
  phoneContainer: {
    width: 180,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phone: {
    width: 160,
    height: 220,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#e5e7eb',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notch: {
    width: 80,
    height: 24,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 3,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    marginTop: -3,
  },
  screen: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  homeIndicator: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  innerCircleContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#374151',
    borderWidth: 4,
    borderColor: '#1f2937',
  },
  xMarkContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xMark: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xBar: {
    position: 'absolute',
    width: 50,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  xBar1: {
    transform: [{ rotate: '45deg' }],
  },
  xBar2: {
    transform: [{ rotate: '-45deg' }],
  },
});
