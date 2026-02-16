/**
 * Achievement Notification Component
 * Beautiful toast-style notifications for unlocked achievements
 */

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { hapticPatterns } from '@/lib/haptic-patterns';
import { soundManager } from '@/lib/sound-manager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward?: number;
  gemReward?: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
  autoHideDuration?: number;
}

export function AchievementNotification({
  achievement,
  onDismiss,
  autoHideDuration = 4000,
}: AchievementNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play achievement sound and haptic
    soundManager.achievement();
    hapticPatterns.milestone();

    // Entrance animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => {
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getRarityColors = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return {
          gradient: ['#FCD34D', '#F59E0B', '#D97706'],
          glow: '#FCD34D',
          text: '#FEF3C7',
        };
      case 'epic':
        return {
          gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
          glow: '#A78BFA',
          text: '#EDE9FE',
        };
      case 'rare':
        return {
          gradient: ['#60A5FA', '#3B82F6', '#2563EB'],
          glow: '#60A5FA',
          text: '#DBEAFE',
        };
      default:
        return {
          gradient: ['#6EE7B7', '#10B981', '#059669'],
          glow: '#6EE7B7',
          text: '#D1FAE5',
        };
    }
  };

  const colors = getRarityColors();

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            backgroundColor: colors.glow,
            opacity: glowOpacity,
          },
        ]}
      />

      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <LinearGradient colors={colors.gradient} style={styles.gradient}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{achievement.icon}</Text>
            </View>

            {/* Text content */}
            <View style={styles.textContainer}>
              <View style={styles.header}>
                <Text style={[styles.rarity, { color: colors.text }]}>
                  {achievement.rarity.toUpperCase()}
                </Text>
                {achievement.rarity === 'legendary' && (
                  <Text style={styles.sparkle}>✨</Text>
                )}
              </View>
              <Text style={styles.title}>{achievement.title}</Text>
              <Text style={styles.description}>{achievement.description}</Text>

              {/* Rewards */}
              {(achievement.xpReward || achievement.gemReward) && (
                <View style={styles.rewards}>
                  {achievement.xpReward && (
                    <View style={styles.reward}>
                      <Text style={styles.rewardIcon}>⚡</Text>
                      <Text style={styles.rewardText}>+{achievement.xpReward} XP</Text>
                    </View>
                  )}
                  {achievement.gemReward && (
                    <View style={styles.reward}>
                      <Text style={styles.rewardIcon}>💎</Text>
                      <Text style={styles.rewardText}>+{achievement.gemReward}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    opacity: 0.5,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    padding: 2,
  },
  content: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rarity: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sparkle: {
    fontSize: 12,
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  rewards: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
