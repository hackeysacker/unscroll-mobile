/**
 * BOX BREATHING CHALLENGE
 * Military-grade breathing technique for focus and calm
 *
 * Pattern: Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
 * Used by Navy SEALs for stress management
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';

interface BoxBreathingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const config: ChallengeConfig = {
  name: 'Box Breathing',
  icon: '⬜',
  description: 'Military-grade breathing technique used by Navy SEALs to enhance focus, reduce stress, and maintain calm under pressure.',
  duration: 180,
  xpReward: 15,
  difficulty: 'medium',
  instructions: [
    'Breathe in for 4 seconds',
    'Hold for 4 seconds',
    'Breathe out for 4 seconds',
    'Hold for 4 seconds',
    'Repeat for 3 minutes',
  ],
  benefits: [
    'Enhances mental focus',
    'Regulates stress response',
    'Improves emotional control',
    'Used by elite performers',
  ],
  colors: {
    background: '#0a0a1a',
    primary: '#6C63FF',
    secondary: '#5A54E0',
  },
};

export function BoxBreathingChallenge({ duration, onComplete, onBack, level = 1 }: BoxBreathingChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [cycleTime, setCycleTime] = useState(0);

  // Tracking refs
  const completedCycles = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const PHASE_DURATION = 4;
  const TOTAL_CYCLE = PHASE_DURATION * 4;

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

  // Cycle timer
  useEffect(() => {
    if (!isActive) return;

    const cycleTimer = setInterval(() => {
      setCycleTime(prev => {
        const newTime = (prev + 0.1) % TOTAL_CYCLE;

        if (newTime < PHASE_DURATION) {
          setBreathPhase('inhale');
        } else if (newTime < PHASE_DURATION * 2) {
          setBreathPhase('hold1');
        } else if (newTime < PHASE_DURATION * 3) {
          setBreathPhase('exhale');
        } else {
          setBreathPhase('hold2');
        }

        if (newTime < 0.1) {
          completedCycles.current += 1;
          haptics.impactMedium();
          sound.transition();
        }

        return newTime;
      });
    }, 100);

    return () => clearInterval(cycleTimer);
  }, [isActive]);

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

  // Box animation - creates square breathing pattern
  useEffect(() => {
    if (!isActive) return;

    let targetScale = 0.5;
    let targetRotation = 0;

    const phaseProgress = cycleTime % PHASE_DURATION;

    if (breathPhase === 'inhale') {
      targetScale = 0.5 + (phaseProgress / PHASE_DURATION) * 0.5;
      targetRotation = 0;
    } else if (breathPhase === 'hold1') {
      targetScale = 1;
      targetRotation = (phaseProgress / PHASE_DURATION) * 90;
    } else if (breathPhase === 'exhale') {
      targetScale = 1 - (phaseProgress / PHASE_DURATION) * 0.5;
      targetRotation = 90 + (phaseProgress / PHASE_DURATION) * 90;
    } else {
      targetScale = 0.5;
      targetRotation = 180 + (phaseProgress / PHASE_DURATION) * 180;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnim, {
        toValue: targetRotation,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: breathPhase.includes('hold') ? 1 : 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [breathPhase, cycleTime, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const expectedCycles = Math.round(duration / TOTAL_CYCLE);
    const score = Math.min(100, (completedCycles.current / expectedCycles) * 120);

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
    }
  };

  const getPhaseEmoji = () => {
    switch (breathPhase) {
      case 'inhale': return '⬆️';
      case 'hold1': return '⏸️';
      case 'exhale': return '⬇️';
      case 'hold2': return '⏸️';
    }
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return '#6C63FF';
      case 'hold1': return '#8A85FF';
      case 'exhale': return '#5A54E0';
      case 'hold2': return '#8A85FF';
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 360],
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
            <Text style={styles.statLabel}>Cycles</Text>
            <Text style={[styles.statValue, { color: '#6C63FF' }]}>
              {completedCycles.current}
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
                backgroundColor: getPhaseColor(),
                opacity: glowOpacity,
                transform: [{ scale: scaleAnim }, { rotate: rotation }],
              },
            ]}
          />

          {/* Main breathing box */}
          <Animated.View
            style={[
              styles.breathBox,
              {
                backgroundColor: getPhaseColor(),
                transform: [{ scale: scaleAnim }, { rotate: rotation }],
              },
            ]}
          >
            <Text style={styles.phaseEmoji}>{getPhaseEmoji()}</Text>
            <Text style={styles.phaseText}>{getPhaseText()}</Text>
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Follow the box - 4 seconds each side
          </Text>
          <Text style={styles.phaseTimer}>
            {Math.ceil(PHASE_DURATION - (cycleTime % PHASE_DURATION))}s
          </Text>
          <Text style={styles.patternText}>
            4-4-4-4 Pattern
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.techniqueText}>Navy SEAL Technique</Text>
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
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
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
    backgroundColor: '#6C63FF',
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
    borderRadius: 16,
  },
  breathBox: {
    width: 220,
    height: 220,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    gap: 12,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  phaseEmoji: {
    fontSize: 40,
  },
  phaseText: {
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
  phaseTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: '#6C63FF',
  },
  patternText: {
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
  techniqueText: {
    fontSize: 12,
    color: 'rgba(108, 99, 255, 0.7)',
    fontWeight: '600',
  },
});
