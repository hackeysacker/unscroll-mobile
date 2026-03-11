import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Button } from '@/components/ui/Button';
import { UIIcon } from '@/components/ui/UIIcon';

interface FirstWinProps {
  onNext: () => void;
}

export function FirstWin({ onNext }: FirstWinProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Confetti effect */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          {[...Array(12)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confetti,
                {
                  left: `${20 + i * 6}%`,
                  top: `${10 + (i % 3) * 20}%`,
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.6],
                  }),
                },
              ]}
            />
          ))}
        </View>
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <UIIcon name="star" size={64} color="#FFFFFF" />
        </View>

        {/* Main message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>You just completed</Text>
          <Text style={styles.percentage}>1%</Text>
          <Text style={styles.subtitle}>of your attention journey</Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            Every expert started exactly where you are now. The difference is they kept going.
          </Text>
        </View>

        {/* CTA */}
        <Button onPress={onNext} size="lg" style={styles.button}>
          Start Your First 2-Minute Training
        </Button>
      </Animated.View>
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818cf8',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  percentage: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#818cf8',
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  quoteText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});

