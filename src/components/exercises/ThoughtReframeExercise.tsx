/**
 * Thought Reframe Exercise
 *
 * Cognitive reframing: identify negative thought, challenge it, rewrite balanced version
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface ThoughtReframeExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

type ReframeStep = 'identify' | 'challenge' | 'evidence' | 'rewrite' | 'complete';

function ThoughtReframeContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [step, setStep] = useState<ReframeStep>('identify');
  const [thought, setThought] = useState('');
  const [challenge, setChallenge] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reframe, setReframe] = useState('');

  const config = getExerciseConfig('thought_reframe');

  const handleNext = () => {
    helpers.vibrate('medium');

    if (step === 'identify') setStep('challenge');
    else if (step === 'challenge') setStep('evidence');
    else if (step === 'evidence') setStep('rewrite');
    else if (step === 'rewrite') {
      setStep('complete');
      helpers.completeExercise(100);
    }
  };

  const getCurrentInput = () => {
    if (step === 'identify') return thought;
    if (step === 'challenge') return challenge;
    if (step === 'evidence') return evidence;
    if (step === 'rewrite') return reframe;
    return '';
  };

  const setCurrentInput = (value: string) => {
    if (step === 'identify') setThought(value);
    else if (step === 'challenge') setChallenge(value);
    else if (step === 'evidence') setEvidence(value);
    else if (step === 'rewrite') setReframe(value);
  };

  const getStepContent = () => {
    switch (step) {
      case 'identify':
        return {
          emoji: '💭',
          title: 'Identify the Thought',
          prompt: 'What negative thought is bothering you?',
          placeholder: 'e.g., "I always mess everything up"',
        };
      case 'challenge':
        return {
          emoji: '❓',
          title: 'Challenge It',
          prompt: 'Is this thought 100% true in all situations?',
          placeholder: 'e.g., "No, I have succeeded at many things"',
        };
      case 'evidence':
        return {
          emoji: '🔍',
          title: 'Find Counter-Evidence',
          prompt: 'What evidence contradicts this thought?',
          placeholder: 'e.g., "I finished that project last week successfully"',
        };
      case 'rewrite':
        return {
          emoji: '✍️',
          title: 'Rewrite Balanced Version',
          prompt: 'Create a more balanced, realistic thought',
          placeholder: 'e.g., "Sometimes I make mistakes, but I also succeed at many things"',
        };
      default:
        return { emoji: '✅', title: '', prompt: '', placeholder: '' };
    }
  };

  const stepContent = getStepContent();
  const progress = step === 'identify' ? 25 : step === 'challenge' ? 50 : step === 'evidence' ? 75 : 100;
  helpers.updateProgress(progress);

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🧠</Text>
        <Text style={styles.completeText}>Thought Reframed!</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Original thought:</Text>
          <Text style={styles.summaryThought}>"{thought}"</Text>
          <Text style={[styles.summaryLabel, { marginTop: 16 }]}>New balanced thought:</Text>
          <Text style={[styles.summaryThought, { color: config.colors.primary }]}>"{reframe}"</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.reframeContainer} contentContainerStyle={styles.reframeContent}>
      {/* Step header */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>{stepContent.emoji}</Text>
        <Text style={styles.stepTitle}>{stepContent.title}</Text>
      </View>

      {/* Prompt */}
      <Text style={styles.promptText}>{stepContent.prompt}</Text>

      {/* Input */}
      <TextInput
        style={[styles.textArea, { borderColor: config.colors.primary }]}
        value={getCurrentInput()}
        onChangeText={setCurrentInput}
        placeholder={stepContent.placeholder}
        placeholderTextColor="#6B7280"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Next button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          {
            backgroundColor: getCurrentInput().trim() ? config.colors.primary : '#374151',
          },
        ]}
        onPress={handleNext}
        disabled={!getCurrentInput().trim()}
      >
        <Text style={styles.nextButtonText}>
          {step === 'rewrite' ? 'Complete Reframe' : 'Continue'}
        </Text>
      </TouchableOpacity>

      {/* Step progress */}
      <View style={styles.stepProgressContainer}>
        {['identify', 'challenge', 'evidence', 'rewrite'].map((s, index) => (
          <View
            key={s}
            style={[
              styles.stepProgressDot,
              {
                backgroundColor: index <= ['identify', 'challenge', 'evidence', 'rewrite'].indexOf(step)
                  ? config.colors.primary
                  : '#374151',
              },
            ]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export function ThoughtReframeExercise({ onComplete, onBack }: ThoughtReframeExerciseProps) {
  const config = getExerciseConfig('thought_reframe');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <ThoughtReframeContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  reframeContainer: {
    flex: 1,
  },
  reframeContent: {
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
  promptText: {
    fontSize: 16,
    color: '#D1D5DB',
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
  stepProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  stepProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  completeView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  summaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  summaryThought: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
