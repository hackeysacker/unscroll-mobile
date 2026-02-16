/**
 * Positive Self Talk Exercise
 *
 * Replace negative self-talk with compassionate alternatives
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface PositiveSelfTalkExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

type Step = 'negative' | 'friend' | 'positive' | 'repeat' | 'complete';

function PositiveSelfTalkContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [step, setStep] = useState<Step>('negative');
  const [negativeThought, setNegativeThought] = useState('');
  const [friendResponse, setFriendResponse] = useState('');
  const [positiveThought, setPositiveThought] = useState('');
  const [repeatCount, setRepeatCount] = useState(0);

  const config = getExerciseConfig('positive_self_talk');

  const handleNext = () => {
    helpers.vibrate('medium');

    if (step === 'negative') setStep('friend');
    else if (step === 'friend') setStep('positive');
    else if (step === 'positive') {
      setStep('repeat');
      setRepeatCount(0);
    }
  };

  const handleRepeat = () => {
    const newCount = repeatCount + 1;
    setRepeatCount(newCount);
    helpers.vibrate('light');

    if (newCount >= 3) {
      setTimeout(() => {
        setStep('complete');
        helpers.completeExercise(100);
      }, 500);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 'negative':
        return {
          emoji: '😔',
          title: 'Notice Negative Self-Talk',
          prompt: 'What harsh thing are you saying to yourself?',
          placeholder: 'e.g., "I\'m so stupid" or "I never do anything right"',
        };
      case 'friend':
        return {
          emoji: '❓',
          title: 'The Friend Test',
          prompt: 'Would you say this to a friend in the same situation?',
          placeholder: 'e.g., "No, I would be much kinder to them"',
        };
      case 'positive':
        return {
          emoji: '💚',
          title: 'Rewrite with Compassion',
          prompt: 'What would you say to a friend instead?',
          placeholder: 'e.g., "Everyone makes mistakes. You\'re doing your best."',
        };
      default:
        return { emoji: '', title: '', prompt: '', placeholder: '' };
    }
  };

  const stepContent = getStepContent();
  const progress = step === 'negative' ? 25 : step === 'friend' ? 50 : step === 'positive' ? 75 : 100;
  helpers.updateProgress(progress);

  if (step === 'repeat') {
    return (
      <View style={styles.repeatContainer}>
        <Text style={styles.repeatEmoji}>✨</Text>
        <Text style={styles.repeatTitle}>Repeat Your New Thought</Text>
        <Text style={styles.repeatSubtitle}>Say it 3 times to rewire your brain</Text>

        <View style={[styles.thoughtBox, { borderColor: config.colors.primary }]}>
          <Text style={styles.thoughtText}>"{positiveThought}"</Text>
        </View>

        <TouchableOpacity
          style={[styles.repeatButton, { backgroundColor: config.colors.primary }]}
          onPress={handleRepeat}
        >
          <Text style={styles.repeatButtonText}>
            {repeatCount === 0 ? 'Say it again (1/3)' : repeatCount === 1 ? 'Say it again (2/3)' : 'Say it one more time (3/3)'}
          </Text>
        </TouchableOpacity>

        <View style={styles.repeatDots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.repeatDot,
                { backgroundColor: i < repeatCount ? config.colors.primary : '#374151' },
              ]}
            />
          ))}
        </View>

        <Text style={styles.repeatGuidance}>Tap the button and repeat the thought out loud or in your mind</Text>
      </View>
    );
  }

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🌟</Text>
        <Text style={styles.completeText}>Self-Compassion Activated</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>You replaced:</Text>
          <Text style={styles.summaryNegative}>"{negativeThought}"</Text>
          <Text style={[styles.summaryLabel, { marginTop: 16 }]}>With:</Text>
          <Text style={[styles.summaryPositive, { color: config.colors.primary }]}>"{positiveThought}"</Text>
        </View>
      </View>
    );
  }

  const getCurrentInput = () => {
    if (step === 'negative') return negativeThought;
    if (step === 'friend') return friendResponse;
    if (step === 'positive') return positiveThought;
    return '';
  };

  const setCurrentInput = (value: string) => {
    if (step === 'negative') setNegativeThought(value);
    else if (step === 'friend') setFriendResponse(value);
    else if (step === 'positive') setPositiveThought(value);
  };

  return (
    <ScrollView style={styles.selfTalkContainer} contentContainerStyle={styles.selfTalkContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>{stepContent.emoji}</Text>
        <Text style={styles.stepTitle}>{stepContent.title}</Text>
      </View>

      <Text style={styles.promptText}>{stepContent.prompt}</Text>

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
          {step === 'positive' ? 'Continue to Practice' : 'Continue'}
        </Text>
      </TouchableOpacity>

      <View style={styles.stepProgressContainer}>
        {['negative', 'friend', 'positive'].map((s, index) => (
          <View
            key={s}
            style={[
              styles.stepProgressDot,
              {
                backgroundColor: index <= ['negative', 'friend', 'positive'].indexOf(step)
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

export function PositiveSelfTalkExercise({ onComplete, onBack }: PositiveSelfTalkExerciseProps) {
  const config = getExerciseConfig('positive_self_talk');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <PositiveSelfTalkContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  selfTalkContainer: {
    flex: 1,
  },
  selfTalkContent: {
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
  repeatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  repeatEmoji: {
    fontSize: 64,
  },
  repeatTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  repeatSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  thoughtBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  thoughtText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
  },
  repeatButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  repeatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  repeatDots: {
    flexDirection: 'row',
    gap: 12,
  },
  repeatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  repeatGuidance: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
  summaryNegative: {
    fontSize: 16,
    color: '#EF4444',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  summaryPositive: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});
