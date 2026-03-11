/**
 * MEMORY FLASH CHALLENGE
 * Remember and recall a sequence of numbers
 *
 * Difficulty Scaling:
 * - Sequence length: L1 = 3 numbers → L10 = 6 numbers
 * - Flash speed: L1 = 1s per number → L10 = 0.4s per number
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface MemoryFlashChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function MemoryFlashChallenge({ duration, onComplete, onBack, level = 1 }: MemoryFlashChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('memory_flash');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState<'show' | 'recall'>('show');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Refs for tracking
  const correctRecallsRef = useRef(0);
  const totalRoundsRef = useRef(0);
  const maxStreakRef = useRef(0);
  const currentStreakRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flashAnimations = useRef<Animated.Value[]>([]);

  // Difficulty scaling
  const getSequenceLength = () => Math.min(6, 3 + Math.floor((level - 1) / 3)); // 3-6
  const getFlashSpeed = () => Math.max(400, 1000 - (level * 60)); // 1000ms to 400ms

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

  // Progress bar animation
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

  // Start new round
  useEffect(() => {
    if (isActive && phase === 'show') {
      startNewRound();
    }
  }, [isActive]);

  const startNewRound = () => {
    const length = getSequenceLength();
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * 9));
    setSequence(newSequence);
    setUserSequence([]);
    setPhase('show');

    // Initialize flash animations
    flashAnimations.current = newSequence.map(() => new Animated.Value(1));

    // Flash sequence
    const flashSpeed = getFlashSpeed();
    newSequence.forEach((num, idx) => {
      setTimeout(() => {
        setHighlightedIndex(idx);
        haptics.impactLight();
        sound.targetAppear();

        Animated.sequence([
          Animated.timing(flashAnimations.current[idx], {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnimations.current[idx], {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => setHighlightedIndex(null), 500);
      }, idx * flashSpeed);
    });

    setTimeout(() => {
      setPhase('recall');
      haptics.impactMedium();
      sound.transition();
    }, newSequence.length * flashSpeed + 1000);
  };

  const handleNumberClick = (num: number) => {
    if (phase !== 'recall') return;

    const newUserSequence = [...userSequence, num];
    setUserSequence(newUserSequence);
    haptics.impactLight();

    if (newUserSequence.length === sequence.length) {
      setTimeout(() => checkAnswer(newUserSequence), 300);
    }
  };

  const checkAnswer = (answer: number[]) => {
    totalRoundsRef.current += 1;
    const isCorrect = JSON.stringify(answer) === JSON.stringify(sequence);

    if (isCorrect) {
      correctRecallsRef.current += 1;
      currentStreakRef.current += 1;
      if (currentStreakRef.current > maxStreakRef.current) {
        maxStreakRef.current = currentStreakRef.current;
      }
      haptics.notificationSuccess();
      sound.targetHit();
    } else {
      currentStreakRef.current = 0;
      haptics.notificationError();
      sound.targetMiss();
    }

    // Continue or complete
    if (totalRoundsRef.current < 3 && timeLeft > 3) {
      setTimeout(() => startNewRound(), 1000);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    const score = totalRoundsRef.current > 0
      ? (correctRecallsRef.current / totalRoundsRef.current) * 100
      : 0;

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const correctCount = correctRecallsRef.current;
  const accuracy = totalRoundsRef.current > 0
    ? Math.round((correctRecallsRef.current / totalRoundsRef.current) * 100)
    : 0;

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
      {/* Header with Stats */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Correct</Text>
          <Text style={[styles.statValue, { color: accuracy >= 80 ? '#10B981' : '#F59E0B' }]}>
            {correctCount}/{totalRoundsRef.current}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
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
        {phase === 'show' ? (
          <View style={styles.sequenceContainer}>
            <Text style={styles.phaseLabel}>Memorize:</Text>
            <View style={styles.sequenceRow}>
              {sequence.map((num, idx) => {
                const anim = flashAnimations.current[idx] || new Animated.Value(1);
                const isHighlighted = highlightedIndex === idx;
                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.sequenceNumber,
                      isHighlighted && styles.sequenceNumberHighlighted,
                      {
                        transform: [{ scale: anim }],
                      },
                    ]}
                  >
                    <Text style={styles.sequenceNumberText}>{num}</Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.recallContainer}>
            <Text style={styles.phaseLabel}>Recall the sequence:</Text>
            <View style={styles.numberGrid}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isSelected = userSequence.includes(num);
                const selectedIndex = userSequence.indexOf(num);
                const isCorrect = selectedIndex !== -1 && sequence[selectedIndex] === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.numberButton,
                      isSelected && (isCorrect ? styles.numberButtonCorrect : styles.numberButtonIncorrect),
                    ]}
                    onPress={() => handleNumberClick(num)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.numberButtonText}>{num}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {userSequence.length > 0 && (
              <View style={styles.userSequenceRow}>
                {userSequence.map((num, idx) => {
                  const isCorrect = sequence[idx] === num;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.userSequenceNumber,
                        isCorrect ? styles.userSequenceNumberCorrect : styles.userSequenceNumberIncorrect,
                      ]}
                    >
                      <Text style={styles.userSequenceNumberText}>{num}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {phase === 'show' ? 'Watch carefully...' : 'Tap numbers in order'}
        </Text>
      </View>

      {/* Level indicator */}
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
    paddingVertical: 40,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  sequenceContainer: {
    alignItems: 'center',
    gap: 20,
  },
  sequenceRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  sequenceNumber: {
    width: 70,
    height: 70,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#6366F1',
  },
  sequenceNumberHighlighted: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  sequenceNumberText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recallContainer: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
    paddingHorizontal: 24,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    maxWidth: 320,
  },
  numberButton: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  numberButtonCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  numberButtonIncorrect: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  numberButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userSequenceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  userSequenceNumber: {
    width: 50,
    height: 50,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  userSequenceNumberCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  userSequenceNumberIncorrect: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  userSequenceNumberText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
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
