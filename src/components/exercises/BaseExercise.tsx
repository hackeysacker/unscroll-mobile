/**
 * BaseExercise Component
 *
 * Shared wrapper for all 25 exercises
 * Provides consistent UI, animations, and lifecycle management
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ExerciseConfig, ExerciseState } from '@/lib/exercise-types';

const { width, height } = Dimensions.get('window');

interface BaseExerciseProps {
  config: ExerciseConfig;
  onComplete: (result: { completed: boolean; duration: number; score?: number }) => void;
  onBack: () => void;
  children: (state: ExerciseState, helpers: ExerciseHelpers) => React.ReactNode;
}

export interface ExerciseHelpers {
  startExercise: () => void;
  completeExercise: (score?: number) => void;
  updateProgress: (progress: number) => void;
  vibrate: (type?: 'light' | 'medium' | 'heavy') => void;
}

export function BaseExercise({ config, onComplete, onBack, children }: BaseExerciseProps) {
  const [phase, setPhase] = useState<'intro' | 'active' | 'complete'>('intro');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(config.duration);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Fade in animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulse animation for active phase
  useEffect(() => {
    if (phase === 'active') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [phase]);

  // Timer management
  useEffect(() => {
    if (phase === 'active') {
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, config.duration - elapsed);
        const prog = Math.min(100, (elapsed / config.duration) * 100);

        setTimeElapsed(elapsed);
        setTimeRemaining(remaining);
        setProgress(prog);

        if (remaining === 0) {
          completeExercise();
        }
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [phase]);

  const startExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('active');
  };

  const completeExercise = (score?: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('complete');

    setTimeout(() => {
      onComplete({
        completed: true,
        duration: timeElapsed,
        score,
      });
    }, 2000);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
  };

  const vibrate = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    const typeMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(typeMap[type]);
  };

  const exerciseState: ExerciseState = {
    phase,
    progress,
    timeElapsed,
    timeRemaining,
  };

  const helpers: ExerciseHelpers = {
    startExercise,
    completeExercise,
    updateProgress,
    vibrate,
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[config.colors.background, '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onBack();
              }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            {phase === 'active' && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              </View>
            )}
          </View>

          {/* Intro Phase */}
          {phase === 'intro' && (
            <View style={styles.introContainer}>
              <Text style={styles.exerciseIcon}>{config.icon}</Text>
              <Text style={styles.exerciseName}>{config.name}</Text>
              <Text style={styles.exerciseDescription}>{config.description}</Text>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>⏱️ {Math.ceil(config.duration / 60)} min</Text>
                  </View>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>✨ +{config.xpReward} XP</Text>
                  </View>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>
                      {config.difficulty === 'easy' && '🟢'}
                      {config.difficulty === 'medium' && '🟡'}
                      {config.difficulty === 'hard' && '🔴'}
                      {' '}{config.difficulty}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>How it works:</Text>
                {config.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionRow}>
                    <Text style={styles.instructionNumber}>{index + 1}</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Benefits:</Text>
                <View style={styles.benefitsList}>
                  {config.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <Text style={styles.benefitBullet}>•</Text>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: config.colors.primary }]}
                onPress={startExercise}
              >
                <Text style={styles.startButtonText}>Begin Exercise</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Active Phase - Custom exercise content */}
          {phase === 'active' && (
            <Animated.View
              style={[
                styles.activeContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {children(exerciseState, helpers)}
            </Animated.View>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && (
            <View style={styles.completeContainer}>
              <Text style={styles.completeIcon}>✅</Text>
              <Text style={styles.completeTitle}>Exercise Complete!</Text>
              <Text style={styles.completeMessage}>
                +{config.xpReward} XP earned
              </Text>
              <Text style={styles.completeSubtext}>Great work! 🎉</Text>
            </View>
          )}

          {/* Progress Bar (shown during active phase) */}
          {phase === 'active' && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: config.colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  timerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // INTRO PHASE
  introContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  exerciseIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  benefitsList: {
    gap: 6,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitBullet: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 8,
    lineHeight: 22,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ACTIVE PHASE
  activeContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // COMPLETE PHASE
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completeIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  completeMessage: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  completeSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  // PROGRESS BAR
  progressBarContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 8,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
