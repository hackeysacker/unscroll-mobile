/**
 * IMPULSE DELAY CHALLENGE
 * Resist the urge to tap the tempting button
 *
 * Tests impulse control by presenting a button that gets increasingly tempting
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';

interface ImpulseDelayChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

const config: ChallengeConfig = {
  name: 'Impulse Delay',
  icon: '⏸️',
  description: 'Resist the overwhelming urge to tap the button. Build willpower by sitting with impulses without acting on them.',
  duration: 60,
  xpReward: 20,
  difficulty: 'hard',
  instructions: [
    'A tempting button will appear',
    'DO NOT tap it - resist the urge',
    'The longer you resist, the higher your score',
    'Stay present with the discomfort',
  ],
  benefits: [
    'Builds impulse control',
    'Strengthens willpower',
    'Reduces impulsive behavior',
    'Improves self-discipline',
  ],
  colors: {
    background: '#1a0a14',
    primary: '#EF4444',
    secondary: '#DC2626',
  },
};

export function ImpulseDelayChallenge({ duration, onComplete, onBack, level = 1 }: ImpulseDelayChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [resistanceTime, setResistanceTime] = useState(0);
  const [failed, setFailed] = useState(false);
  const [temptationLevel, setTemptationLevel] = useState(1);

  const tapCountRef = useRef(0);
  const startTimeRef = useRef(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Timer countdown
  useEffect(() => {
    if (!isActive || failed) return;
    startTimeRef.current = Date.now();

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
  }, [isActive, failed]);

  // Resistance time tracker
  useEffect(() => {
    if (!isActive || failed) return;

    const interval = setInterval(() => {
      setResistanceTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, failed]);

  // Temptation level increases over time
  useEffect(() => {
    if (!isActive || failed) return;

    const interval = setInterval(() => {
      setTemptationLevel(prev => Math.min(10, prev + 1));
    }, duration * 100); // Increase every 10% of duration

    return () => clearInterval(interval);
  }, [isActive, failed, duration]);

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

  // Pulsing animation - gets faster as temptation increases
  useEffect(() => {
    if (!isActive || failed) return;

    const pulseDuration = Math.max(300, 1000 - (temptationLevel * 70));

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1 + (temptationLevel * 0.05),
          duration: pulseDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [isActive, temptationLevel, failed]);

  // Glow animation
  useEffect(() => {
    if (!isActive || failed) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: temptationLevel / 10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isActive, temptationLevel, failed]);

  const handleTap = () => {
    if (failed) return;

    tapCountRef.current += 1;
    setFailed(true);

    // Failure animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    haptics.notificationError();
    sound.targetMiss();

    setTimeout(() => handleComplete(), 1500);
  };

  const handleComplete = () => {
    setIsActive(false);

    let score = 0;
    if (!failed) {
      // Perfect resistance - full score
      score = 100;
    } else {
      // Score based on how long they resisted
      const resistancePercent = (resistanceTime / duration) * 100;
      score = Math.round(resistancePercent * 0.8); // Max 80 points for failed attempt
    }

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const getTemptationText = () => {
    if (temptationLevel <= 2) return "Don't tap...";
    if (temptationLevel <= 4) return "Just one tap...";
    if (temptationLevel <= 6) return "It won't hurt...";
    if (temptationLevel <= 8) return "Everyone taps...";
    return "TAP ME NOW!";
  };

  const getButtonColor = () => {
    const red = Math.min(255, 150 + (temptationLevel * 10));
    return `rgb(${red}, 68, 68)`;
  };

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a0a14', '#2a0a1a', '#1a0a14']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Resisted</Text>
            <Text style={[styles.statValue, { color: failed ? '#EF4444' : '#10B981' }]}>
              {resistanceTime}s
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

        {/* Temptation Level */}
        <View style={styles.temptationMeter}>
          <Text style={styles.temptationLabel}>Temptation Level</Text>
          <View style={styles.temptationBar}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.temptationSegment,
                  i < temptationLevel && { backgroundColor: '#EF4444' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Challenge Area */}
        <View style={styles.challengeArea}>
          {!failed ? (
            <>
              <Animated.View
                style={[
                  styles.glowEffect,
                  {
                    opacity: glowAnim,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <TouchableOpacity
                onPress={handleTap}
                activeOpacity={0.9}
                style={styles.buttonTouchArea}
              >
                <Animated.View
                  style={[
                    styles.temptationButton,
                    {
                      backgroundColor: getButtonColor(),
                      transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>{getTemptationText()}</Text>
                  <Text style={styles.buttonSubtext}>Resist the urge...</Text>
                </Animated.View>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.failedContainer}>
              <Text style={styles.failedIcon}>❌</Text>
              <Text style={styles.failedText}>You tapped!</Text>
              <Text style={styles.failedSubtext}>Impulse won this time</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {failed ? 'Better luck next time!' : 'Sit with the urge - DO NOT TAP'}
          </Text>
          <Text style={styles.subText}>
            Taps: {tapCountRef.current}
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

  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },

  temptationMeter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  temptationLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  temptationBar: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
    maxWidth: 300,
  },
  temptationSegment: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },

  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EF4444',
  },
  buttonTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  temptationButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  failedContainer: {
    alignItems: 'center',
    gap: 16,
  },
  failedIcon: {
    fontSize: 80,
  },
  failedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  failedSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  instructions: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

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
