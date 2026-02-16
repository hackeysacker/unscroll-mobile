/**
 * WORD PUZZLE CHALLENGE
 *
 * Unscramble letters to form words
 * Tests vocabulary, pattern recognition, and quick thinking
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

interface WordPuzzleChallengeProps {
  duration: number;
  onComplete: (score: number, timeSpent: number) => void;
  onBack?: () => void;
  level?: number;
}

interface WordPuzzle {
  word: string;
  scrambled: string[];
  category: string;
}

// Word lists by difficulty
const WORD_LISTS = {
  easy: [
    { word: 'FOCUS', category: 'Attention' },
    { word: 'BRAIN', category: 'Mind' },
    { word: 'POWER', category: 'Strength' },
    { word: 'PEACE', category: 'Calm' },
    { word: 'HAPPY', category: 'Emotion' },
    { word: 'SMILE', category: 'Expression' },
    { word: 'DREAM', category: 'Mind' },
    { word: 'THINK', category: 'Cognition' },
    { word: 'LEARN', category: 'Growth' },
    { word: 'FRESH', category: 'Energy' },
  ],
  medium: [
    { word: 'ENERGY', category: 'Power' },
    { word: 'WISDOM', category: 'Knowledge' },
    { word: 'MEMORY', category: 'Mind' },
    { word: 'RHYTHM', category: 'Pattern' },
    { word: 'PUZZLE', category: 'Challenge' },
    { word: 'STRONG', category: 'Strength' },
    { word: 'MENTAL', category: 'Mind' },
    { word: 'BALANCE', category: 'Harmony' },
    { word: 'PATTERN', category: 'Design' },
    { word: 'COURAGE', category: 'Virtue' },
  ],
  hard: [
    { word: 'ATTENTION', category: 'Focus' },
    { word: 'CHALLENGE', category: 'Task' },
    { word: 'DISCIPLINE', category: 'Control' },
    { word: 'MINDFULNESS', category: 'Awareness' },
    { word: 'PERSISTENCE', category: 'Determination' },
    { word: 'CREATIVITY', category: 'Innovation' },
    { word: 'RESILIENCE', category: 'Strength' },
    { word: 'MEDITATION', category: 'Practice' },
    { word: 'STRATEGIC', category: 'Planning' },
    { word: 'BRILLIANT', category: 'Quality' },
  ],
};

export function WordPuzzleChallenge({
  duration,
  onComplete,
  onBack,
  level = 1,
}: WordPuzzleChallengeProps) {
  const themeStyles = useThemeStyles();
  const [solvedCount, setSolvedCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<WordPuzzle | null>(null);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const correctStreakRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Get difficulty based on level
  const getDifficulty = (): 'easy' | 'medium' | 'hard' => {
    if (level <= 3) return 'easy';
    if (level <= 7) return 'medium';
    return 'hard';
  };

  // Generate puzzle
  const generatePuzzle = (): WordPuzzle => {
    const difficulty = getDifficulty();
    const wordList = WORD_LISTS[difficulty];
    const selected = wordList[Math.floor(Math.random() * wordList.length)];

    // Scramble the word
    const letters = selected.word.split('');
    const scrambled = [...letters];

    // Fisher-Yates shuffle
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }

    // Make sure it's actually scrambled (not the same as original)
    if (scrambled.join('') === selected.word) {
      const temp = scrambled[0];
      scrambled[0] = scrambled[1];
      scrambled[1] = temp;
    }

    return {
      word: selected.word,
      scrambled,
      category: selected.category,
    };
  };

  // Initialize puzzle
  useEffect(() => {
    const puzzle = generatePuzzle();
    setCurrentPuzzle(puzzle);
    setAvailableLetters(puzzle.scrambled);
  }, []);

  const handleLetterTap = (index: number) => {
    if (showFeedback) return;

    haptics.impactLight();
    setSelectedLetters(prev => [...prev, index]);
  };

  const handleRemoveLetter = () => {
    if (showFeedback || selectedLetters.length === 0) return;

    haptics.impactLight();
    setSelectedLetters(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!currentPuzzle || showFeedback || selectedLetters.length === 0) return;

    const userWord = selectedLetters.map(i => availableLetters[i]).join('');
    const correct = userWord === currentPuzzle.word;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      // Correct!
      sound.tap();
      haptics.notificationSuccess();
      setSolvedCount(prev => prev + 1);
      correctStreakRef.current += 1;

      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
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

    // Move to next puzzle after delay
    setTimeout(() => {
      const newPuzzle = generatePuzzle();
      setCurrentPuzzle(newPuzzle);
      setAvailableLetters(newPuzzle.scrambled);
      setSelectedLetters([]);
      setShowFeedback(false);
      setIsCorrect(false);
    }, 1500);
  };

  const handleClear = () => {
    if (showFeedback) return;
    haptics.impactLight();
    setSelectedLetters([]);
  };

  const handleComplete = (timeSpent: number) => {
    const totalAttempts = solvedCount + incorrectCount;
    const accuracy = totalAttempts > 0 ? (solvedCount / totalAttempts) * 100 : 0;
    const speed = solvedCount / (duration / 60); // words per minute

    // Score: 70% accuracy + 30% speed (cap speed bonus at 30 points)
    const speedScore = Math.min(speed * 5, 30);
    const score = Math.min(100, Math.round(accuracy * 0.7 + speedScore));

    onComplete(score, timeSpent);
  };

  if (!currentPuzzle) {
    return null;
  }

  const currentWord = selectedLetters.map(i => availableLetters[i]).join('');

  return (
    <BaseChallengeWrapper
      title="Word Puzzle"
      description="Unscramble the letters to form a word"
      duration={duration}
      onComplete={handleComplete}
      onBack={onBack}
      stats={[
        { label: 'Solved', value: solvedCount },
        { label: 'Errors', value: incorrectCount },
      ]}
    >
      <View style={styles.container}>
        {/* Category Hint */}
        <View style={styles.categoryContainer}>
          <Text style={[styles.categoryLabel, { color: themeStyles.textSecondary }]}>
            Category:
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: themeStyles.surface }]}>
            <Text style={[styles.categoryText, { color: themeStyles.accent }]}>
              {currentPuzzle.category}
            </Text>
          </View>
        </View>

        {/* Answer Display */}
        <Animated.View
          style={[
            styles.answerContainer,
            {
              transform: [
                { scale: pulseAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <View style={styles.answerRow}>
            {currentPuzzle.word.split('').map((_, index) => {
              const letter = selectedLetters[index] !== undefined
                ? availableLetters[selectedLetters[index]]
                : '';

              return (
                <View
                  key={index}
                  style={[
                    styles.letterSlot,
                    {
                      backgroundColor: showFeedback
                        ? isCorrect
                          ? '#10B98155'
                          : '#EF444455'
                        : themeStyles.surface,
                      borderColor: themeStyles.border,
                    },
                  ]}
                >
                  <Text style={[styles.letterText, { color: themeStyles.textPrimary }]}>
                    {letter}
                  </Text>
                </View>
              );
            })}
          </View>

          {showFeedback && (
            <View style={styles.feedbackContainer}>
              <Text style={[styles.feedbackText, { color: isCorrect ? '#10B981' : '#EF4444' }]}>
                {isCorrect ? '✓ Correct!' : `✗ Answer: ${currentPuzzle.word}`}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Available Letters */}
        <View style={styles.lettersContainer}>
          <Text style={[styles.label, { color: themeStyles.textSecondary }]}>
            Tap letters to spell the word:
          </Text>

          <View style={styles.lettersGrid}>
            {availableLetters.map((letter, index) => {
              const isUsed = selectedLetters.includes(index);
              const usageCount = selectedLetters.filter(i => i === index).length;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLetterTap(index)}
                  disabled={showFeedback || isUsed}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isUsed ? ['#33415555', '#1E293B55'] : ['#6366F1', '#4F46E5']}
                    style={[
                      styles.letterButton,
                      isUsed && styles.letterButtonUsed,
                    ]}
                  >
                    <Text style={[styles.letterButtonText, isUsed && styles.letterButtonTextUsed]}>
                      {letter}
                    </Text>
                    {usageCount > 0 && (
                      <View style={styles.usedIndicator}>
                        <Text style={styles.usedIndicatorText}>{usageCount}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleRemoveLetter}
            disabled={showFeedback || selectedLetters.length === 0}
            activeOpacity={0.7}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={selectedLetters.length === 0 ? ['#33415555', '#1E293B55'] : ['#F59E0B', '#D97706']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>← Remove</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClear}
            disabled={showFeedback || selectedLetters.length === 0}
            activeOpacity={0.7}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={selectedLetters.length === 0 ? ['#33415555', '#1E293B55'] : ['#64748B', '#475569']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Clear</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={showFeedback || selectedLetters.length === 0}
            activeOpacity={0.7}
            style={[styles.actionButton, styles.submitButton]}
          >
            <LinearGradient
              colors={selectedLetters.length === 0 ? ['#33415555', '#1E293B55'] : ['#10B981', '#059669']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>Submit ✓</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  categoryLabel: {
    fontSize: 14,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  answerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  letterSlot: {
    width: 40,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 24,
    fontWeight: '700',
  },
  feedbackContainer: {
    marginTop: 12,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lettersContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  letterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  letterButtonUsed: {
    opacity: 0.3,
  },
  letterButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  letterButtonTextUsed: {
    opacity: 0.5,
  },
  usedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1.5,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
