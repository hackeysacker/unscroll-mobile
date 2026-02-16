import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface WelcomeProps {
  onNext: () => void;
}

export function Welcome({ onNext }: WelcomeProps) {
  const [scrollPosition] = useState(new Animated.Value(0));

  useEffect(() => {
    // Simulate endless scrolling animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollPosition, {
          toValue: 100,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scrollPosition, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateY = scrollPosition.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -200],
  });

  return (
    <View style={styles.container}>
      {/* Ambient gradient orbs - simplified for mobile */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.content}>
        {/* Animated phone/screen representation */}
        <View style={styles.phoneContainer}>
          <View style={styles.phone}>
            <Animated.View
              style={[
                styles.scrollContent,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.scrollLine}>
                  <View style={[styles.line, styles.lineFull]} />
                  <View style={[styles.line, styles.linePartial]} />
                </View>
              ))}
            </Animated.View>
          </View>
          {/* Animated finger */}
          <Text style={styles.finger}>👆</Text>
        </View>

        {/* Main copy */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome.</Text>
          <Text style={styles.subtitle}>Let's rebuild your attention.</Text>
          <Text style={styles.description}>This takes less than 90 seconds.</Text>

          <TouchableOpacity style={styles.button} onPress={onNext}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
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
  orb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 100,
  },
  orb2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 100,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    zIndex: 10,
  },
  phoneContainer: {
    alignItems: 'center',
    marginBottom: 64,
    position: 'relative',
  },
  phone: {
    width: 160,
    height: 224,
    borderRadius: 24,
    backgroundColor: '#111827',
    padding: 2,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    height: '100%',
  },
  scrollLine: {
    marginBottom: 12,
  },
  line: {
    height: 8,
    backgroundColor: '#818cf8',
    borderRadius: 4,
    marginBottom: 8,
  },
  lineFull: {
    width: '100%',
  },
  linePartial: {
    width: '75%',
    backgroundColor: '#a78bfa',
  },
  finger: {
    fontSize: 32,
    position: 'absolute',
    bottom: '20%',
    textShadowColor: 'rgba(167, 139, 250, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

