import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useAttentionAvatar } from '@/contexts/AttentionAvatarContext';
import { AttentionAvatar } from './AttentionAvatar';
import { getRealmForLevel } from '@/lib/realm-themes';

interface EnhancedAvatarProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Enhanced Avatar with advanced animations
 * - Breathing effect
 * - Floating motion
 * - Pulse on interaction
 * - Trail effects
 * - Realm-specific glow
 */
export function EnhancedAvatar({ level, size = 'medium' }: EnhancedAvatarProps) {
  const { avatarState, currentEvolution } = useAttentionAvatar();
  const realm = getRealmForLevel(level);
  
  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Breathing animation (subtle scale)
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, []);

  // Floating animation (up and down)
  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floating.start();
    return () => floating.stop();
  }, []);

  // Gentle rotation based on mood
  useEffect(() => {
    if (avatarState.mood === 'celebrating' || avatarState.mood === 'excited') {
      const spinning = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinning.start();
      return () => spinning.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [avatarState.mood]);

  // Glow pulse (synced with realm colors)
  useEffect(() => {
    const glowing = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glowing.start();
    return () => glowing.stop();
  }, [realm]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: breatheAnim },
          { translateY: floatAnim },
          { rotate },
        ],
      }}
    >
      {/* Realm-colored glow effect */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          right: -20,
          bottom: -20,
          backgroundColor: realm.colors.primary,
          borderRadius: 999,
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.3],
          }),
        }}
      />
      
      <AttentionAvatar size={size} showParticles={true} />
    </Animated.View>
  );
}
























