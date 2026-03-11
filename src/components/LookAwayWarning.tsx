/**
 * Look Away Warning Component
 *
 * Displays a warning when user looks away from screen
 * Shows attention score and feedback
 */

import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface LookAwayWarningProps {
  isLookingAway: boolean;
  attentionScore: number;
  lookAwayCount: number;
}

export function LookAwayWarning({ isLookingAway, attentionScore, lookAwayCount }: LookAwayWarningProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLookingAway) {
      // Fade in and shake
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isLookingAway]);

  if (!isLookingAway && fadeAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.95)', 'rgba(220, 38, 38, 0.95)']}
        style={styles.gradient}
      >
        <Text style={styles.icon}>👀</Text>
        <Text style={styles.title}>Look at the screen!</Text>
        <Text style={styles.subtitle}>Stay focused to maintain your score</Text>

        {/* Attention Score Bar */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBarBackground}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${attentionScore * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.scoreText}>Focus: {Math.round(attentionScore * 100)}%</Text>
        </View>

        {lookAwayCount > 0 && (
          <Text style={styles.countText}>Look-aways: {lookAwayCount}</Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  scoreContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  scoreBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  countText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
});
