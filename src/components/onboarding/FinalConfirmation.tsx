import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Button } from '@/components/ui/Button';

interface FinalConfirmationProps {
  onComplete: () => void;
}

export function FinalConfirmation({ onComplete }: FinalConfirmationProps) {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
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
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        {/* Main message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>You are all set</Text>
          <Text style={styles.subtitle}>Let's start building real focus</Text>
        </View>

        {/* What's next */}
        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>What happens next:</Text>
          <View style={styles.nextList}>
            <View style={styles.nextItem}>
              <View style={styles.bullet} />
              <Text style={styles.nextText}>
                Complete your first exercise to unlock your daily streak
              </Text>
            </View>
            <View style={styles.nextItem}>
              <View style={styles.bullet} />
              <Text style={styles.nextText}>
                Train for just a few minutes each day
              </Text>
            </View>
            <View style={styles.nextItem}>
              <View style={styles.bullet} />
              <Text style={styles.nextText}>
                Watch your attention improve over 21 days
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <Button
          onPress={onComplete}
          size="lg"
          style={styles.button}
        >
          Begin Level 1
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
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 56,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#9ca3af',
    textAlign: 'center',
  },
  nextCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#065f46',
    width: '100%',
  },
  nextTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  nextList: {
    gap: 12,
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#065f46',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  nextText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#10b981',
  },
});

