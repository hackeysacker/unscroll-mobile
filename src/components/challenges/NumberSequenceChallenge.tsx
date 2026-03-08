/**
 * NUMBER SEQUENCE CHALLENGE
 *
 * Identify the next number in mathematical sequences
 * Tests pattern recognition and mathematical reasoning
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { hapticPatterns as haptics } from '@/lib/haptic-patterns';

const { width } = Dimensions.get('window');

interface NumberSequenceChallengeProps {
  duration: number;
  onComplete: (score: number, timeSpent: number) => void;
  onBack?: () => void;
  level?: number;
}

interface Sequence {
  numbers: number[];
  answer: number;
  options: number[];
  pattern: string; // Description of the pattern
  type: 'arithmetic' | 'geometric' | 'fibonacci' | 'square' | 'cube' | 'prime' | 'complex';
}

export function NumberSequenceChallenge({
  duration,
  onComplete,
  onBack,
  level = 1,
}: NumberSequenceChallengeProps) {
  const themeStyles = useThemeStyles();
  const [solvedCount, setSolvedCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<Sequence | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const correctStreakRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Generate sequence based on level
  const generateSequence = (): Sequence => {
    const difficulty = Math.min(level, 15);

    // Choose sequence type based on difficulty
    const types: Sequence['type'][] = ['arithmetic', 'geometric'];
    if (difficulty >= 3) types.push('fibonacci');
    if (difficulty >= 5) types.push('square');
    if (difficulty >= 7) types.push('cube');
    if (difficulty >= 10) types.push('complex');
    if (difficulty >= 12) types.push('prime');

    const type = types[Math.floor(Math.random() * types.length)];

    let numbers: number[] = [];
    let answer = 0;
    let pattern = '';

    switch (type) {
      case 'arithmetic': {
        // Add or subtract constant: 2, 5, 8, 11, ?
        const start = Math.floor(Math.random() * 20) + 1;
        const step = Math.floor(Math.random() * (difficulty + 3)) + 1;
        const subtract = Math.random() < 0.3 && difficulty >= 3;

        numbers = [];
        for (let i = 0; i < 4; i++) {
          numbers.push(subtract ? start - (step * i) : start + (step * i));
        }
        answer = subtract ? start - (step * 4) : start + (step * 4);
        pattern = subtract ? `Subtract ${step}` : `Add ${step}`;
        break;
      }

      case 'geometric': {
        // Multiply or divide: 2, 6, 18, 54, ?
        const start = Math.floor(Math.random() * 5) + 2;
        const multiplier = Math.floor(Math.random() * 3) + 2;

        numbers = [start];
        for (let i = 1; i < 4; i++) {
          numbers.push(numbers[i - 1] * multiplier);
        }
        answer = numbers[3] * multiplier;
        pattern = `Multiply by ${multiplier}`;
        break;
      }

      case 'fibonacci': {
        // Sum of previous two: 1, 1, 2, 3, 5, 8, ?
        const start1 = Math.floor(Math.random() * 3) + 1;
        const start2 = Math.floor(Math.random() * 3) + 1;

        numbers = [start1, start2];
        for (let i = 2; i < 5; i++) {
          numbers.push(numbers[i - 1] + numbers[i - 2]);
        }
        answer = numbers[4] + numbers[3];
        numbers = numbers.slice(0, 5);
        pattern = 'Sum of previous two';
        break;
      }

      case 'square': {
        // Perfect squares: 1, 4, 9, 16, 25, ?
        const start = Math.floor(Math.random() * 3) + 1;
        numbers = [];
        for (let i = 0; i < 4; i++) {
          const n = start + i;
          numbers.push(n * n);
        }
        const next = start + 4;
        answer = next * next;
        pattern = 'Perfect squares';
        break;
      }

      case 'cube': {
        // Perfect cubes: 1, 8, 27, 64, ?
        const start = Math.floor(Math.random() * 2) + 1;
        numbers = [];
        for (let i = 0; i < 4; i++) {
          const n = start + i;
          numbers.push(n * n * n);
        }
        const next = start + 4;
        answer = next * next * next;
        pattern = 'Perfect cubes';
        break;
      }

      case 'prime': {
        // Prime numbers: 2, 3, 5, 7, 11, ?
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        const startIdx = Math.floor(Math.random() * 5);
        numbers = primes.slice(startIdx, startIdx + 4);
        answer = primes[startIdx + 4];
        pattern = 'Prime numbers';
        break;
      }

      case 'complex': {
        // Alternating operations: 2, 4, 3, 6, 4, 8, ?
        const start = Math.floor(Math.random() * 5) + 2;
        numbers = [start];
        let isMultiply = true;
        for (let i = 1; i < 5; i++) {
          if (isMultiply) {
            numbers.push(numbers[i - 1] * 2);
          } else {
            numbers.push(numbers[i - 1] - 1);
          }
          isMultiply = !isMultiply;
        }
        answer = numbers[4] * 2;
        pattern = 'Alternating pattern';
        break;
      }
    }

    // Generate 4 options with wrong answers
    const options = [answer];

    // Add plausible wrong answers
    const diff = numbers[numbers.length - 1] - numbers[numbers.length - 2];
    const possibleWrong = [
      answer + diff,
      answer - diff,
      answer * 2,
      Math.floor(answer / 2),
      answer + 1,
      answer - 1,
      numbers[numbers.length - 1] + 1,
      numbers[numbers.length - 1] * 2,
    ];

    while (options.length < 4) {
      const wrongAnswer = possibleWrong[Math.floor(Math.random() * possibleWrong.length)];
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    return { numbers, answer, options, pattern, type };
  };

  // Initialize first sequence
  useEffect(() => {
    setCurrentSequence(generateSequence());
  }, []);

  const handleAnswer = (selectedAnswer: number) => {
    if (!currentSequence || showFeedback) return;

    setSelectedAnswer(selectedAnswer);
    setShowFeedback(true);

    if (selectedAnswer === currentSequence.answer) {
      // Correct!
      sound.tap();
      haptics.notificationSuccess();
      setSolvedCount(prev => prev + 1);
      correctStreakRef.current += 1;

      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Wrong!
      sound.error();
      haptics.notificationError();
      setIncorrectCount(prev => prev + 1);
      correctStreakRef.current = 0;

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Move to next sequence after delay
    setTimeout(() => {
      setCurrentSequence(generateSequence());
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1000);
  };

  const handleComplete = (timeSpent: number) => {
    const totalAttempts = solvedCount + incorrectCount;
    const accuracy = totalAttempts > 0 ? (solvedCount / totalAttempts) * 100 : 0;
    const speed = solvedCount / (duration / 60); // sequences per minute

    // Score: 70% accuracy + 30% speed (cap speed bonus at 30 points)
    const speedScore = Math.min(speed * 3, 30);
    const score = Math.min(100, Math.round(accuracy * 0.7 + speedScore));

    onComplete(score, timeSpent);
  };

  if (!currentSequence) {
    return null;
  }

  return (
    <BaseChallengeWrapper
      title="Number Sequence"
      description="Find the next number in the sequence"
      duration={duration}
      onComplete={handleComplete}
      onBack={onBack || (() => {})}
      stats={[
        { label: 'Solved', value: solvedCount },
        { label: 'Errors', value: incorrectCount },
      ]}
    >
      <View style={styles.container}>
        {/* Sequence Display */}
        <Animated.View
          style={[
            styles.sequenceContainer,
            {
              transform: [
                { scale: pulseAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <Text style={[styles.label, { color: themeStyles.colors.mutedForeground }]}>
            Find the pattern:
          </Text>

          <View style={styles.sequenceRow}>
            {currentSequence.numbers.map((num, index) => (
              <React.Fragment key={index}>
                <View style={[styles.numberBox, { backgroundColor: themeStyles.colors.card }]}>
                  <Text style={[styles.number, { color: themeStyles.colors.foreground }]}>
                    {num}
                  </Text>
                </View>
                {index < currentSequence.numbers.length - 1 && (
                  <Text style={[styles.comma, { color: themeStyles.colors.mutedForeground }]}>,</Text>
                )}
              </React.Fragment>
            ))}

            <Text style={[styles.comma, { color: themeStyles.colors.mutedForeground }]}>,</Text>

            <View style={[styles.numberBox, styles.questionBox, { borderColor: themeStyles.colors.primary }]}>
              <Text style={[styles.question, { color: themeStyles.colors.primary }]}>?</Text>
            </View>
          </View>

          {showFeedback && (
            <Text style={[styles.patternHint, { color: themeStyles.colors.mutedForeground }]}>
              {currentSequence.pattern}
            </Text>
          )}
        </Animated.View>

        {/* Answer Options */}
        <View style={styles.optionsGrid}>
          {currentSequence.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentSequence.answer;
            const showCorrect = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswer(option)}
                disabled={showFeedback}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    showCorrect
                      ? ['#10B981', '#059669']
                      : showWrong
                      ? ['#EF4444', '#DC2626']
                      : ['#6366F1', '#4F46E5']
                  }
                  style={[
                    styles.optionButton,
                    showFeedback && !isSelected && !isCorrect && styles.optionDisabled,
                  ]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                  {showCorrect && <Text style={styles.checkmark}>✓</Text>}
                  {showWrong && <Text style={styles.cross}>✗</Text>}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Streak Indicator */}
        {correctStreakRef.current >= 3 && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>
              🔥 {correctStreakRef.current} streak!
            </Text>
          </View>
        )}
      </View>
    </BaseChallengeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sequenceContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '500',
  },
  sequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  numberBox: {
    minWidth: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  questionBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  number: {
    fontSize: 20,
    fontWeight: '700',
  },
  question: {
    fontSize: 28,
    fontWeight: '700',
  },
  comma: {
    fontSize: 24,
    marginHorizontal: 4,
  },
  patternHint: {
    marginTop: 16,
    fontSize: 14,
    fontStyle: 'italic',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionButton: {
    width: (width - 64) / 2,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 20,
    color: '#FFFFFF',
  },
  cross: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 20,
    color: '#FFFFFF',
  },
  streakContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
