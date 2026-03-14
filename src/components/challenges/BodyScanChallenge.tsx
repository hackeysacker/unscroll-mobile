/**
 * BODY SCAN CHALLENGE
 * Mindful awareness of physical sensations throughout the body
 *
 * Used in Realm 3 (Stillness) - 60s body awareness practice
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { HapticPatterns as haptics } from '@/lib/haptic-patterns';

interface BodyScanChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

const BODY_PARTS = [
  { name: 'Feet', emoji: '🦶', duration: 8 },
  { name: 'Legs', emoji: '🦵', duration: 10 },
  { name: 'Hips', emoji: '🫃', duration: 8 },
  { name: 'Stomach', emoji: '🤰', duration: 8 },
  { name: 'Chest', emoji: '🫁', duration: 8 },
  { name: 'Arms', emoji: '💪', duration: 10 },
  { name: 'Shoulders', emoji: '🤷', duration: 6 },
  { name: 'Head', emoji: '🧠', duration: 8 },
];

const config: ChallengeConfig = {
  name: 'Body Scan',
  icon: '🧘',
  description: 'Develop mindful awareness by systematically focusing attention on different parts of your body.',
  duration: 60,
  xpReward: 12,
  difficulty: 'easy',
  instructions: [
    'Sit comfortably with your eyes closed',
    'Focus on each body part as it appears',
    'Notice any sensations without judgment',
    'Continue breathing naturally',
  ],
  benefits: [
    'Increases body awareness',
    'Reduces physical tension',
    'Improves mindful attention',
    'Promotes relaxation',
  ],
  colors: {
    background: '#0a1a0a',
    primary: '#4CAF50',
    secondary: '#66BB6A',
  },
};

export function BodyScanChallenge({ duration, onComplete, onBack, level = 1 }: BodyScanChallengeProps) {
  const themeStyles = useThemeStyles();

  // State
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [partTimeLeft, setPartTimeLeft] = useState(BODY_PARTS[0].duration);

  // Tracking refs
  const completedParts = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentPart = BODY_PARTS[currentPartIndex];

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  // Part timer
  useEffect(() => {
    if (!isActive) return;

    const partTimer = setInterval(() => {
      setPartTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next part
          const nextIndex = (currentPartIndex + 1) % BODY_PARTS.length;
          setCurrentPartIndex(nextIndex);
          completedParts.current += 1;
          
          // Haptic feedback for part change
          haptics.impactMedium();
          sound.transition();
          
          return BODY_PARTS[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(partTimer);
  }, [isActive, currentPartIndex]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = ((duration - timeLeft) / duration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, duration]);

  // Body part animation
  useEffect(() => {
    if (!isActive) return;

    // Gentle pulsing animation for current body part
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow effect
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentPartIndex, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const expectedParts = Math.round(duration / 8); // Average part duration
    const score = Math.min(100, (completedParts.current / expectedParts) * 120);

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#0a1a0a', '#0a2a0a', '#0a1a0a']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Parts</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {completedParts.current}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>

        {/* Challenge Area */}
        <View style={styles.challengeArea}>
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                backgroundColor: '#4CAF50',
                opacity: glowOpacity,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />

          {/* Current body part */}
          <Animated.View
            style={[
              styles.bodyPartCircle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.partEmoji}>{currentPart.emoji}</Text>
            <Text style={styles.partName}>{currentPart.name}</Text>
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Focus your attention on your {currentPart.name.toLowerCase()}
          </Text>
          <Text style={styles.partTimer}>
            {partTimeLeft}s
          </Text>
          <Text style={styles.guidanceText}>
            Notice any sensations, warmth, tension, or tingling
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.realmText}>Realm 3 - Stillness</Text>
        </View>
      </LinearGradient>
    </BaseChallengeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  bodyPartCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    gap: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  partEmoji: {
    fontSize: 48,
  },
  partName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  partTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
  },
  guidanceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  realmText: {
    fontSize: 12,
    color: 'rgba(76, 175, 80, 0.7)',
    fontWeight: '600',
  },
});