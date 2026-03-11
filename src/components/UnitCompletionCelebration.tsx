import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AttentionAvatar } from './AttentionAvatar';
import type { RealmTheme } from '@/lib/realm-themes';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UnitCompletionCelebrationProps {
  realm: RealmTheme;
  avatarName: string;
  onComplete: () => void;
}

/**
 * Epic celebration sequence when completing a unit (realm)
 * Shows avatar evolution and realm transition
 */
export function UnitCompletionCelebration({
  realm,
  avatarName,
  onComplete,
}: UnitCompletionCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.5)).current;
  const particleAnims = useRef(
    Array.from({ length: 50 }, () => new Animated.Value(0))
  ).current;
  const textSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Haptic celebration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Sequence animation
    Animated.sequence([
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      
      // Avatar appears
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      
      // Text slides in
      Animated.spring(textSlide, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Particle burst
    particleAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1500 + Math.random() * 500,
        delay: index * 20,
        useNativeDriver: true,
      }).start();
    });

    // Auto-complete after celebration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[
          realm.colors.backgroundGradientStart + 'CC',
          realm.colors.backgroundGradientEnd + 'CC',
        ]}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Celebration particles */}
        {particleAnims.map((anim, index) => {
          const angle = (index / particleAnims.length) * Math.PI * 2;
          const distance = 150 + Math.random() * 100;
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  backgroundColor: index % 3 === 0 
                    ? realm.colors.primary
                    : index % 3 === 1
                    ? realm.colors.secondary
                    : realm.colors.accent,
                  transform: [
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.cos(angle) * distance],
                      }),
                    },
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin(angle) * distance],
                      }),
                    },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.5, 0],
                      }),
                    },
                  ],
                  opacity: anim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                },
              ]}
            />
          );
        })}
        
        {/* Avatar */}
        <Animated.View
          style={{
            transform: [{ scale: avatarScale }],
            marginBottom: 32,
          }}
        >
          <AttentionAvatar size="large" showParticles={true} />
        </Animated.View>
        
        {/* Text */}
        <Animated.View
          style={{
            transform: [{ translateY: textSlide }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.realmEmoji}>{realm.emoji}</Text>
          <Text style={[styles.title, { color: realm.colors.primary }]}>
            Realm Complete!
          </Text>
          <Text style={styles.realmName}>{realm.name}</Text>
          <Text style={styles.subtitle}>{avatarName} has evolved!</Text>
          
          <View style={styles.rewardBox}>
            <Text style={styles.rewardEmoji}>✨</Text>
            <Text style={styles.rewardText}>
              New abilities unlocked
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  realmEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  realmName: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  rewardBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
























