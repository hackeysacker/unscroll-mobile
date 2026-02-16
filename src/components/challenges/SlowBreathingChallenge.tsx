/**
 * SLOW BREATHING CHALLENGE
 * Calm your nervous system with gentle, elongated breathing
 *
 * Pattern: Inhale (4s) → Exhale (6s)
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';

interface SlowBreathingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

type BreathPhase = 'inhale' | 'exhale';

const config: ChallengeConfig = {
  name: 'Slow Breathing',
  icon: '🫁',
  description: 'Calm your nervous system with gentle, elongated breathing. This simple practice reduces anxiety and improves focus.',
  duration: 120,
  xpReward: 12,
  difficulty: 'easy',
  instructions: [
    'Find a comfortable position',
    'Breathe in slowly for 4 seconds',
    'Breathe out slowly for 6 seconds',
    'Continue for 2 minutes',
  ],
  benefits: [
    'Reduces anxiety and stress',
    'Calms nervous system',
    'Improves focus and clarity',
    'Lowers heart rate',
  ],
  colors: {
    background: '#0a1a1a',
    primary: '#7DD3C0',
    secondary: '#4ECDC4',
  },
};

export function SlowBreathingChallenge({ duration, onComplete, onBack, level = 1 }: SlowBreathingChallengeProps) {
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
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const INHALE_DURATION = 4;
  const EXHALE_DURATION = 6;
  const TOTAL_CYCLE = INHALE_DURATION + EXHALE_DURATION;

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

        if (newTime < INHALE_DURATION) {
          setBreathPhase('inhale');
        } else {
          setBreathPhase('exhale');
        }

        if (newTime < 0.1) {
          completedCycles.current += 1;
          haptics.impactLight();
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

  // Breathing animation
  useEffect(() => {
    if (!isActive) return;

    let targetScale = 0.6;
    if (breathPhase === 'inhale') {
      targetScale = 0.6 + (cycleTime / INHALE_DURATION) * 0.4;
    } else {
      const exhaleProgress = (cycleTime - INHALE_DURATION) / EXHALE_DURATION;
      targetScale = 1 - exhaleProgress * 0.4;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: breathPhase === 'inhale' ? 1 : 0.4,
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
    return breathPhase === 'inhale' ? 'Breathe In' : 'Breathe Out';
  };

  const getPhaseEmoji = () => {
    return breathPhase === 'inhale' ? '⬆️' : '⬇️';
  };

  const getPhaseColor = () => {
    return breathPhase === 'inhale' ? '#7DD3C0' : '#4ECDC4';
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#0a1a1a', '#0a2520', '#0a1a1a']}
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
            <Text style={[styles.statValue, { color: '#7DD3C0' }]}>
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
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />

          {/* Main breathing circle */}
          <Animated.View
            style={[
              styles.breathCircle,
              {
                backgroundColor: getPhaseColor(),
                transform: [{ scale: scaleAnim }],
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
            Follow the circle - breathe slowly and gently
          </Text>
          <Text style={styles.phaseTimer}>
            {Math.ceil(
              breathPhase === 'inhale'
                ? INHALE_DURATION - cycleTime
                : TOTAL_CYCLE - cycleTime
            )}s
          </Text>
          <Text style={styles.patternText}>
            {breathPhase === 'inhale' ? '4s In' : '6s Out'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
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
    backgroundColor: 'rgba(125, 211, 192, 0.15)',
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
    backgroundColor: '#7DD3C0',
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
  breathCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    gap: 12,
    shadowColor: '#7DD3C0',
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
    color: '#7DD3C0',
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
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
