/**
 * Self Inquiry Exercise
 *
 * Question limiting beliefs through deep inquiry
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface SelfInquiryExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const QUESTIONS = [
  { emoji: '🔍', q: 'What belief is limiting me?', placeholder: 'e.g., "I\'m not good enough"' },
  { emoji: '📖', q: 'Where did this belief come from?', placeholder: 'e.g., "My parents always compared me to my sibling"' },
  { emoji: '⚖️', q: 'Is it serving me now?', placeholder: 'e.g., "No, it holds me back from trying new things"' },
  { emoji: '✨', q: 'What would I believe instead?', placeholder: 'e.g., "I am capable of learning and growing"' },
];

function SelfInquiryContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);

  const config = getExerciseConfig('self_inquiry');

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      helpers.vibrate('medium');
    } else {
      helpers.completeExercise(100);
    }
  };

  const updateAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = text;
    setAnswers(newAnswers);
  };

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  helpers.updateProgress(progress);

  return (
    <ScrollView style={styles.inquiryContainer} contentContainerStyle={styles.inquiryContent}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionEmoji}>{question.emoji}</Text>
        <Text style={styles.questionNumber}>Question {currentQ + 1} of {QUESTIONS.length}</Text>
        <Text style={styles.questionText}>{question.q}</Text>
      </View>

      <TextInput
        style={[styles.answerInput, { borderColor: config.colors.primary }]}
        value={answers[currentQ]}
        onChangeText={updateAnswer}
        placeholder={question.placeholder}
        placeholderTextColor="#6B7280"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        autoFocus
      />

      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: answers[currentQ].trim() ? config.colors.primary : '#374151' },
        ]}
        onPress={handleNext}
        disabled={!answers[currentQ].trim()}
      >
        <Text style={styles.continueButtonText}>
          {currentQ < QUESTIONS.length - 1 ? 'Next Question' : 'Complete Inquiry'}
        </Text>
      </TouchableOpacity>

      <View style={styles.progressDots}>
        {QUESTIONS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              { backgroundColor: i <= currentQ ? config.colors.primary : '#374151' },
            ]}
          />
        ))}
      </View>

      {currentQ > 0 && (
        <View style={styles.previousAnswers}>
          <Text style={styles.previousLabel}>Previous answers:</Text>
          {answers.slice(0, currentQ).map((answer, i) => (
            answer && (
              <View key={i} style={styles.previousAnswer}>
                <Text style={styles.previousQuestion}>{QUESTIONS[i].q}</Text>
                <Text style={styles.previousText}>{answer}</Text>
              </View>
            )
          ))}
        </View>
      )}
    </ScrollView>
  );
}

export function SelfInquiryExercise({ onComplete, onBack }: SelfInquiryExerciseProps) {
  const config = getExerciseConfig('self_inquiry');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <SelfInquiryContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  inquiryContainer: {
    flex: 1,
  },
  inquiryContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 24,
  },
  questionHeader: {
    alignItems: 'center',
    gap: 12,
  },
  questionEmoji: {
    fontSize: 56,
  },
  questionNumber: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
  },
  answerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 150,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  previousAnswers: {
    gap: 12,
    marginTop: 8,
  },
  previousLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  previousAnswer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  previousQuestion: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  previousText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
});
