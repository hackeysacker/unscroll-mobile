/**
 * Intent Setting Exercise
 *
 * Set clear intention before acting to prevent autopilot
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface IntentSettingExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function IntentSettingContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [intention, setIntention] = useState('');
  const [step, setStep] = useState<'action' | 'reason' | 'intention' | 'complete'>('action');

  const config = getExerciseConfig('intent_setting');

  const handleNext = () => {
    helpers.vibrate('medium');
    if (step === 'action') setStep('reason');
    else if (step === 'reason') setStep('intention');
    else if (step === 'intention') {
      setStep('complete');
      helpers.completeExercise(100);
    }
  };

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🎯</Text>
        <Text style={styles.completeText}>Intention Set</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>What:</Text>
            <Text style={styles.summaryValue}>{action}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Why:</Text>
            <Text style={styles.summaryValue}>{reason}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Intention:</Text>
            <Text style={[styles.summaryValue, { color: config.colors.primary }]}>
              {intention}
            </Text>
          </View>
        </View>
        <Text style={styles.proceedText}>Proceed with awareness</Text>
      </View>
    );
  }

  const currentInput = step === 'action' ? action : step === 'reason' ? reason : intention;
  const setCurrentInput = step === 'action' ? setAction : step === 'reason' ? setReason : setIntention;

  const stepData = {
    action: {
      emoji: '📝',
      title: 'What are you about to do?',
      placeholder: 'e.g., Check social media, Work on project, Call a friend...',
    },
    reason: {
      emoji: '❓',
      title: 'Why are you doing it?',
      placeholder: 'e.g., To connect with others, To make progress, To avoid work...',
    },
    intention: {
      emoji: '🎯',
      title: 'Set your intention',
      placeholder: 'e.g., Stay focused for 10 minutes, Connect authentically, Be present...',
    },
  };

  const current = stepData[step];
  const progress = step === 'action' ? 33 : step === 'reason' ? 66 : 100;
  helpers.updateProgress(progress);

  return (
    <ScrollView style={styles.settingContainer} contentContainerStyle={styles.settingContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>{current.emoji}</Text>
        <Text style={styles.stepTitle}>{current.title}</Text>
      </View>

      <TextInput
        style={[styles.textArea, { borderColor: config.colors.primary }]}
        value={currentInput}
        onChangeText={setCurrentInput}
        placeholder={current.placeholder}
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
            backgroundColor: currentInput.trim() ? config.colors.primary : '#374151',
          },
        ]}
        onPress={handleNext}
        disabled={!currentInput.trim()}
      >
        <Text style={styles.nextButtonText}>
          {step === 'intention' ? 'Set Intention' : 'Continue'}
        </Text>
      </TouchableOpacity>

      <View style={styles.progressDots}>
        {['action', 'reason', 'intention'].map((s, index) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              {
                backgroundColor: index <= ['action', 'reason', 'intention'].indexOf(step)
                  ? config.colors.primary
                  : '#374151',
              },
            ]}
          />
        ))}
      </View>

      {step !== 'action' && (
        <View style={styles.previousAnswers}>
          {action && (
            <View style={styles.previousItem}>
              <Text style={styles.previousLabel}>What:</Text>
              <Text style={styles.previousValue}>{action}</Text>
            </View>
          )}
          {reason && step === 'intention' && (
            <View style={styles.previousItem}>
              <Text style={styles.previousLabel}>Why:</Text>
              <Text style={styles.previousValue}>{reason}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

export function IntentSettingExercise({ onComplete, onBack }: IntentSettingExerciseProps) {
  const config = getExerciseConfig('intent_setting');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <IntentSettingContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  settingContainer: {
    flex: 1,
  },
  settingContent: {
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
  },
  previousItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  previousLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  previousValue: {
    fontSize: 14,
    color: '#D1D5DB',
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
    gap: 16,
  },
  summaryRow: {
    gap: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  proceedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
});
