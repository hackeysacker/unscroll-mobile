/**
 * Five Senses Grounding Exercise
 *
 * Progressive grounding through 5 senses: 5 see, 4 touch, 3 hear, 2 smell, 1 taste
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface FiveSensesExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const SENSES = [
  { name: 'See', emoji: '👁️', count: 5, prompt: 'Name {count} things you can see' },
  { name: 'Touch', emoji: '✋', count: 4, prompt: 'Name {count} things you can touch' },
  { name: 'Hear', emoji: '👂', count: 3, prompt: 'Name {count} things you can hear' },
  { name: 'Smell', emoji: '👃', count: 2, prompt: 'Name {count} things you can smell' },
  { name: 'Taste', emoji: '👅', count: 1, prompt: 'Name {count} thing you can taste' },
];

function FiveSensesContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [currentSenseIndex, setCurrentSenseIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const config = getExerciseConfig('five_senses');
  const currentSense = SENSES[currentSenseIndex];
  const isComplete = currentSenseIndex >= SENSES.length;

  const handleSubmit = () => {
    if (!currentInput.trim()) return;

    const newAnswers = [...answers, currentInput.trim()];
    setAnswers(newAnswers);
    setCurrentInput('');
    helpers.vibrate('light');

    if (newAnswers.length >= currentSense.count) {
      // Move to next sense
      if (currentSenseIndex < SENSES.length - 1) {
        setTimeout(() => {
          setCurrentSenseIndex(currentSenseIndex + 1);
          setAnswers([]);
          helpers.vibrate('medium');
        }, 500);
      } else {
        // Exercise complete
        setTimeout(() => {
          helpers.completeExercise(100);
        }, 800);
      }
    }
  };

  if (isComplete) {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>✨</Text>
        <Text style={styles.completeText}>Grounded in the present</Text>
      </View>
    );
  }

  const progress = ((currentSenseIndex * 15 + answers.length) / 15) * 100;
  helpers.updateProgress(progress);

  return (
    <ScrollView style={styles.sensesContainer} contentContainerStyle={styles.sensesContent}>
      {/* Sense header */}
      <View style={styles.senseHeader}>
        <Text style={styles.senseEmoji}>{currentSense.emoji}</Text>
        <Text style={styles.senseName}>{currentSense.name}</Text>
      </View>

      {/* Prompt */}
      <Text style={styles.promptText}>
        {currentSense.prompt.replace('{count}', currentSense.count.toString())}
      </Text>

      {/* Progress */}
      <Text style={styles.progressText}>
        {answers.length} / {currentSense.count}
      </Text>

      {/* Answers list */}
      <View style={styles.answersList}>
        {answers.map((answer, index) => (
          <View key={index} style={[styles.answerItem, { backgroundColor: config.colors.primary + '20' }]}>
            <Text style={styles.answerNumber}>{index + 1}</Text>
            <Text style={styles.answerText}>{answer}</Text>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ))}
      </View>

      {/* Input */}
      {answers.length < currentSense.count && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { borderColor: config.colors.primary }]}
            value={currentInput}
            onChangeText={setCurrentInput}
            placeholder={`Type here...`}
            placeholderTextColor="#6B7280"
            onSubmitEditing={handleSubmit}
            autoFocus
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: config.colors.primary }]}
            onPress={handleSubmit}
            disabled={!currentInput.trim()}
          >
            <Text style={styles.submitButtonText}>✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sense progress indicators */}
      <View style={styles.senseProgressContainer}>
        {SENSES.map((sense, index) => (
          <View
            key={index}
            style={[
              styles.senseProgressDot,
              {
                backgroundColor: index < currentSenseIndex
                  ? config.colors.primary
                  : index === currentSenseIndex
                  ? config.colors.accent
                  : '#374151',
              },
            ]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export function FiveSensesExercise({ onComplete, onBack }: FiveSensesExerciseProps) {
  const config = getExerciseConfig('five_senses');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <FiveSensesContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  sensesContainer: {
    flex: 1,
  },
  sensesContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 24,
  },
  senseHeader: {
    alignItems: 'center',
    gap: 12,
  },
  senseEmoji: {
    fontSize: 56,
  },
  senseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promptText: {
    fontSize: 18,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '600',
  },
  answersList: {
    gap: 12,
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  answerNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  checkmark: {
    fontSize: 20,
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  submitButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  senseProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  senseProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  completeView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
