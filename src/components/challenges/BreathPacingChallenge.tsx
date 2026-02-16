/**
 * BREATH PACING CHALLENGE
 * Follow breathing pattern to calm your mind
 *
 * Pattern: Inhale → Hold → Exhale (4-4-4 seconds)
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface BreathPacingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export function BreathPacingChallenge({ duration, onComplete, onBack, level = 1 }: BreathPacingChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('breath_pacing');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [cycleTime, setCycleTime] = useState(0);

  // Tracking refs
  const completedCycles = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const INHALE_DURATION = 4;
  const HOLD_DURATION = 4;
  const EXHALE_DURATION = 4;
  const TOTAL_CYCLE = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION;

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
        } else if (newTime < INHALE_DURATION + HOLD_DURATION) {
          setBreathPhase('hold');
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

    let targetScale = 0.5;
    if (breathPhase === 'inhale') {
      targetScale = 0.5 + (cycleTime / INHALE_DURATION) * 0.5;
    } else if (breathPhase === 'hold') {
      targetScale = 1;
    } else {
      const exhaleProgress = (cycleTime - INHALE_DURATION - HOLD_DURATION) / EXHALE_DURATION;
      targetScale = 1 - exhaleProgress * 0.5;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: breathPhase === 'hold' ? 1 : 0.5,
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
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  };

  const getPhaseEmoji = () => {
    switch (breathPhase) {
      case 'inhale': return '⬆️';
      case 'hold': return '⏸️';
      case 'exhale': return '⬇️';
    }
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return '#60a5fa';
      case 'hold': return '#a78bfa';
      case 'exhale': return '#34d399';
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
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
          <Text style={[styles.statValue, { color: '#10B981' }]}>
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
          Follow the circle - breathe with the rhythm
        </Text>
        <Text style={styles.phaseTimer}>
          {Math.ceil(
            breathPhase === 'inhale'
              ? INHALE_DURATION - cycleTime
              : breathPhase === 'hold'
              ? INHALE_DURATION + HOLD_DURATION - cycleTime
              : TOTAL_CYCLE - cycleTime
          )}s
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: '#10B981',
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
    width: 260,
    height: 260,
    borderRadius: 130,
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
    shadowColor: '#000',
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
    gap: 10,
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
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
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
