/**
 * CONTROLLED BREATHING CHALLENGE
 * Follow complex breathing pattern (4-4-4-4)
 *
 * Pattern: Inhale → Hold → Exhale → Hold (4 seconds each)
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface ControlledBreathingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export function ControlledBreathingChallenge({ duration, onComplete, onBack, level = 1 }: ControlledBreathingChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('controlled_breathing');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Tracking refs
  const cyclesCompletedRef = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const phaseDurations: Record<BreathPhase, number> = {
    inhale: 4000,
    hold1: 4000,
    exhale: 4000,
    hold2: 4000,
  };

  const phaseSequence: BreathPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];

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

  // Phase timer
  useEffect(() => {
    if (!isActive) return;

    const phaseDuration = phaseDurations[phase];
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / phaseDuration) * 100;

      if (progress >= 100) {
        const currentIndex = phaseSequence.indexOf(phase);
        const nextIndex = (currentIndex + 1) % phaseSequence.length;
        const nextPhase = phaseSequence[nextIndex];

        if (nextPhase === 'inhale') {
          cyclesCompletedRef.current += 1;
          haptics.impactLight();
          sound.transition();
        }

        setPhase(nextPhase);
        setPhaseProgress(0);
      } else {
        setPhaseProgress(progress);
      }

      // Animate circle
      let targetScale = 0.5;
      if (phase === 'inhale') {
        targetScale = 0.5 + (progress / 100) * 0.5;
      } else if (phase === 'hold1') {
        targetScale = 1;
      } else if (phase === 'exhale') {
        targetScale = 1 - (progress / 100) * 0.5;
      } else {
        targetScale = 0.5;
      }

      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleComplete = () => {
    setIsActive(false);

    const expectedCycles = duration / 16;
    const score = Math.min(100, (cyclesCompletedRef.current / expectedCycles) * 100);

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
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return '#60a5fa';
      case 'hold1': return '#a78bfa';
      case 'exhale': return '#34d399';
      case 'hold2': return '#6b7280';
    }
  };

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
            {cyclesCompletedRef.current}
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
        <Animated.View
          style={[
            styles.breathCircle,
            {
              backgroundColor: getPhaseColor(),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
          <Text style={styles.phaseTime}>
            {Math.ceil((phaseDurations[phase] - (phaseProgress / 100) * phaseDurations[phase]) / 1000)}s
          </Text>
        </Animated.View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Follow the 4-4-4-4 breathing pattern
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
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  phaseTime: {
    fontSize: 18,
    color: '#FFFFFF',
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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
