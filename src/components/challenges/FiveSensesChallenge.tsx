/**
 * FIVE SENSES CHALLENGE
 * Grounding exercise using all five senses for present-moment awareness
 *
 * Used in Realm 4 (Clarity) - 180s grounding practice
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { hapticPatterns as haptics } from '@/lib/haptic-patterns';

interface FiveSensesChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

const SENSES = [
  { 
    name: 'See', 
    emoji: '👁️', 
    instruction: 'Notice 5 things you can SEE around you',
    duration: 36,
    color: '#2196F3'
  },
  { 
    name: 'Touch', 
    emoji: '✋', 
    instruction: 'Feel 4 things you can TOUCH near you',
    duration: 36,
    color: '#FF9800'
  },
  { 
    name: 'Hear', 
    emoji: '👂', 
    instruction: 'Listen for 3 things you can HEAR right now',
    duration: 36,
    color: '#4CAF50'
  },
  { 
    name: 'Smell', 
    emoji: '👃', 
    instruction: 'Notice 2 things you can SMELL in the air',
    duration: 36,
    color: '#9C27B0'
  },
  { 
    name: 'Taste', 
    emoji: '👅', 
    instruction: 'Become aware of 1 thing you can TASTE',
    duration: 36,
    color: '#F44336'
  },
];

const config: ChallengeConfig = {
  name: 'Five Senses',
  icon: '🌟',
  description: 'Ground yourself in the present moment using all five senses. This powerful technique brings instant clarity and focus.',
  duration: 180,
  xpReward: 15,
  difficulty: 'easy',
  instructions: [
    'Follow the 5-4-3-2-1 grounding technique',
    '5 things you can see',
    '4 things you can touch', 
    '3 things you can hear',
    '2 things you can smell',
    '1 thing you can taste',
  ],
  benefits: [
    'Grounds you in the present',
    'Reduces anxiety and stress',
    'Sharpens sensory awareness',
    'Improves focus and clarity',
  ],
  colors: {
    background: '#0a0a1a',
    primary: '#3F51B5',
    secondary: '#5C6BC0',
  },
};

export function FiveSensesChallenge({ duration, onComplete, onBack, level = 1 }: FiveSensesChallengeProps) {
  const themeStyles = useThemeStyles();

  // State
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentSenseIndex, setCurrentSenseIndex] = useState(0);
  const [senseTimeLeft, setSenseTimeLeft] = useState(SENSES[0].duration);

  // Tracking refs
  const completedSenses = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentSense = SENSES[currentSenseIndex];

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

  // Sense timer
  useEffect(() => {
    if (!isActive) return;

    const senseTimer = setInterval(() => {
      setSenseTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next sense
          const nextIndex = (currentSenseIndex + 1) % SENSES.length;
          setCurrentSenseIndex(nextIndex);
          completedSenses.current += 1;
          
          // Haptic feedback for sense change
          haptics.impactMedium();
          sound.transition();
          
          return SENSES[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(senseTimer);
  }, [isActive, currentSenseIndex]);

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

  // Sense animation
  useEffect(() => {
    if (!isActive) return;

    // Scale and glow animation for current sense
    Animated.parallel([
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
      ),
      Animated.timing(rotationAnim, {
        toValue: currentSenseIndex,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSenseIndex, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const expectedSenses = Math.floor(duration / 36); // Average sense duration
    const score = Math.min(100, (completedSenses.current / expectedSenses) * 120);

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const getSenseCount = () => {
    return 5 - currentSenseIndex;
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 5],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#0a0a1a', '#1a0a2e', '#0a0a1a']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Senses</Text>
            <Text style={[styles.statValue, { color: currentSense.color }]}>
              {completedSenses.current}/5
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
                backgroundColor: currentSense.color,
                opacity: glowOpacity,
                transform: [{ scale: scaleAnim }, { rotate: rotation }],
              },
            ]}
          />

          {/* Current sense circle */}
          <Animated.View
            style={[
              styles.senseCircle,
              {
                backgroundColor: currentSense.color,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.senseEmoji}>{currentSense.emoji}</Text>
            <Text style={styles.senseCount}>{getSenseCount()}</Text>
            <Text style={styles.senseName}>{currentSense.name}</Text>
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {currentSense.instruction}
          </Text>
          <Text style={styles.senseTimer}>
            {senseTimeLeft}s
          </Text>
          <Text style={styles.methodText}>
            5-4-3-2-1 Grounding Method
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.realmText}>Realm 4 - Clarity</Text>
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
    backgroundColor: 'rgba(63, 81, 181, 0.15)',
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
    backgroundColor: '#3F51B5',
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
  senseCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    gap: 8,
    shadowColor: '#3F51B5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  senseEmoji: {
    fontSize: 48,
  },
  senseCount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  senseName: {
    fontSize: 20,
    fontWeight: '600',
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
    lineHeight: 24,
  },
  senseTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3F51B5',
  },
  methodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
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
    color: 'rgba(63, 81, 181, 0.7)',
    fontWeight: '600',
  },
});