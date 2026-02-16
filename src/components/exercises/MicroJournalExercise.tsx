/**
 * Micro Journal Exercise - Quick emotional check-in
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface MicroJournalExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const QUESTIONS = [
  { q: 'How do you feel right now?', emoji: '💭', placeholder: 'e.g., anxious, excited, tired...' },
  { q: 'What triggered this feeling?', emoji: '🔍', placeholder: 'e.g., an email I received...' },
  { q: 'What do you need in this moment?', emoji: '🎯', placeholder: 'e.g., a break, to talk to someone...' },
];

function MicroJournalContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const config = getExerciseConfig('micro_journal');

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      helpers.vibrate('light');
    } else {
      helpers.completeExercise(100);
    }
  };

  const updateAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = text;
    setAnswers(newAnswers);
  };

  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;
  helpers.updateProgress(progress);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>{QUESTIONS[currentQ].emoji}</Text>
      <Text style={styles.question}>{QUESTIONS[currentQ].q}</Text>

      <TextInput
        style={[styles.input, { borderColor: config.colors.primary }]}
        value={answers[currentQ]}
        onChangeText={updateAnswer}
        placeholder={QUESTIONS[currentQ].placeholder}
        placeholderTextColor="#6B7280"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: answers[currentQ].trim() ? config.colors.primary : '#374151' }]}
        onPress={handleNext}
        disabled={!answers[currentQ].trim()}
      >
        <Text style={styles.buttonText}>{currentQ < QUESTIONS.length - 1 ? 'Next' : 'Complete'}</Text>
      </TouchableOpacity>

      <View style={styles.progress}>
        {QUESTIONS.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i <= currentQ ? config.colors.primary : '#374151' }]} />
        ))}
      </View>
    </ScrollView>
  );
}

export function MicroJournalExercise({ onComplete, onBack }: MicroJournalExerciseProps) {
  return (
    <BaseExercise config={getExerciseConfig('micro_journal')} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <MicroJournalContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 20, paddingHorizontal: 24, gap: 24 },
  emoji: { fontSize: 56, textAlign: 'center' },
  question: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#FFFFFF', minHeight: 120 },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
