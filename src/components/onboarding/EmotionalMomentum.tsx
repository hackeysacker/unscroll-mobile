import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Button } from '@/components/ui/Button';

interface EmotionalMomentumProps {
  onNext: () => void;
}

export function EmotionalMomentum({ onNext }: EmotionalMomentumProps) {
  const [breatheScale] = useState(new Animated.Value(1));

  useEffect(() => {
    // Breathing animation: inhale (4s) -> exhale (4s)
    const breatheAnimation = () => {
      Animated.sequence([
        Animated.timing(breatheScale, {
          toValue: 1.3, // Inhale
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheScale, {
          toValue: 1, // Exhale
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    breatheAnimation();
    const interval = setInterval(breatheAnimation, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Ambient gradient orb that syncs with breathing */}
      <Animated.View
        style={[
          styles.orb,
          {
            transform: [{ scale: breatheScale }],
          },
        ]}
      />

      <View style={styles.content}>
        {/* Breathing circle */}
        <View style={styles.breathingContainer}>
          {/* Multiple glowing rings */}
          <Animated.View
            style={[
              styles.glowRing1,
              {
                transform: [{ scale: breatheScale.interpolate({
                  inputRange: [1, 1.3],
                  outputRange: [1.2, 1.56],
                }) }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing2,
              {
                transform: [{ scale: breatheScale.interpolate({
                  inputRange: [1, 1.3],
                  outputRange: [1.1, 1.43],
                }) }],
              },
            ]}
          />

          {/* Main breathing circle */}
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: breatheScale }],
              },
            ]}
          >
            <View style={styles.innerGradient} />
          </Animated.View>
        </View>

        {/* Motivational copy */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Imagine how much your life changes with{' '}
            <Text style={styles.highlight}>real focus</Text>.
          </Text>

          <Text style={styles.subtitle}>
            You are <Text style={styles.bold}>21 days</Text> away.
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.buttonContainer}>
          <Button onPress={onNext} size="lg" style={styles.button}>
            Continue
          </Button>
        </View>

        {/* Breathing instruction */}
        <Text style={styles.instruction}>Breathe with the circle</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 150,
    marginTop: -150,
    marginLeft: -150,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    zIndex: 10,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    position: 'relative',
    marginBottom: 48,
  },
  glowRing1: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  glowRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  breathingCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  innerGradient: {
    position: 'absolute',
    inset: 0,
    borderRadius: 64,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 36,
  },
  highlight: {
    color: '#818cf8',
  },
  subtitle: {
    fontSize: 20,
    color: '#9ca3af',
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: '#818cf8',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  instruction: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

