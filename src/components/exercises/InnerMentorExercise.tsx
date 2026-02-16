/**
 * Inner Mentor Exercise
 *
 * Channel your wisest future self for guidance
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface InnerMentorExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const PHASES = [
  { text: 'Close your eyes and breathe deeply...', duration: 8 },
  { text: 'Imagine your wisest future self...', duration: 10 },
  { text: '10 years from now, fully evolved...', duration: 10 },
  { text: 'They have solved what troubles you now...', duration: 10 },
  { text: 'They are ready to share their wisdom...', duration: 10 },
];

function InnerMentorContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [phase, setPhase] = useState(0);
  const [isVisualizationComplete, setIsVisualizationComplete] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [step, setStep] = useState<'visualize' | 'question' | 'answer' | 'complete'>('visualize');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const config = getExerciseConfig('inner_mentor');

  useEffect(() => {
    if (step === 'visualize' && phase < PHASES.length) {
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      const timer = setTimeout(() => {
        if (phase < PHASES.length - 1) {
          fadeAnim.setValue(0);
          setPhase(phase + 1);
        } else {
          setIsVisualizationComplete(true);
          setTimeout(() => setStep('question'), 1000);
        }
      }, PHASES[phase].duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [step, phase]);

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🧙</Text>
        <Text style={styles.completeText}>Inner Wisdom Received</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You asked:</Text>
            <Text style={styles.questionValue}>"{question}"</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Your inner mentor said:</Text>
            <Text style={[styles.answerValue, { color: config.colors.primary }]}>
              "{answer}"
            </Text>
          </View>
        </View>
        <Text style={styles.wisdomText}>
          This wisdom came from within you. Trust it.
        </Text>
      </View>
    );
  }

  if (step === 'answer') {
    return (
      <ScrollView style={styles.mentorContainer} contentContainerStyle={styles.mentorContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>💬</Text>
          <Text style={styles.stepTitle}>What do they tell you?</Text>
          <Text style={styles.stepSubtitle}>Listen deeply to their answer</Text>
        </View>

        <View style={styles.questionReminder}>
          <Text style={styles.questionReminderLabel}>Your question:</Text>
          <Text style={styles.questionReminderValue}>"{question}"</Text>
        </View>

        <TextInput
          style={[styles.textArea, { borderColor: config.colors.primary }]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Their wise advice..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          autoFocus
        />

        <TouchableOpacity
          style={[
            styles.completeButton,
            {
              backgroundColor: answer.trim() ? config.colors.primary : '#374151',
            },
          ]}
          onPress={() => {
            setStep('complete');
            helpers.completeExercise(100);
          }}
          disabled={!answer.trim()}
        >
          <Text style={styles.completeButtonText}>Receive Wisdom</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 'question') {
    return (
      <ScrollView style={styles.mentorContainer} contentContainerStyle={styles.mentorContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>❓</Text>
          <Text style={styles.stepTitle}>What do you need guidance on?</Text>
          <Text style={styles.stepSubtitle}>Ask your future self one question</Text>
        </View>

        <TextInput
          style={[styles.textArea, { borderColor: config.colors.primary }]}
          value={question}
          onChangeText={setQuestion}
          placeholder="e.g., How do I stop feeling stuck? What should I focus on? How did you overcome this?"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          autoFocus
        />

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: question.trim() ? config.colors.primary : '#374151',
            },
          ]}
          onPress={() => {
            setStep('answer');
            helpers.vibrate('medium');
          }}
          disabled={!question.trim()}
        >
          <Text style={styles.nextButtonText}>Ask Your Mentor</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // step === 'visualize'
  const currentPhase = PHASES[phase];
  const progress = ((phase + 1) / PHASES.length) * 100;
  helpers.updateProgress(progress);

  return (
    <View style={styles.visualizeContainer}>
      <Animated.View
        style={[
          styles.visualizeContent,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.mentorEmoji,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              }),
              transform: [{
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              }],
            },
          ]}
        >
          🧙
        </Animated.Text>
        <Text style={[styles.phaseText, { color: config.colors.primary }]}>
          {currentPhase.text}
        </Text>
      </Animated.View>

      <View style={styles.progressDots}>
        {PHASES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              { backgroundColor: i <= phase ? config.colors.primary : '#374151' },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function InnerMentorExercise({ onComplete, onBack }: InnerMentorExerciseProps) {
  const config = getExerciseConfig('inner_mentor');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <InnerMentorContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  visualizeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  visualizeContent: {
    alignItems: 'center',
    gap: 32,
  },
  mentorEmoji: {
    fontSize: 80,
  },
  phaseText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 34,
  },
  progressDots: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mentorContainer: {
    flex: 1,
  },
  mentorContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 24,
  },
  stepHeader: {
    alignItems: 'center',
    gap: 12,
  },
  stepEmoji: {
    fontSize: 56,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionReminder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  questionReminderLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  questionReminderValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  completeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  completeEmoji: {
    fontSize: 64,
  },
  completeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    gap: 20,
  },
  summaryRow: {
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  questionValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  answerValue: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  wisdomText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
