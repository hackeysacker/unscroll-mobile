/**
 * Compulsion Detector Exercise
 *
 * Identify automatic behaviors without judgment
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface CompulsionDetectorExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const COMMON_COMPULSIONS = [
  'Checked phone',
  'Scrolled social media',
  'Grabbed snack',
  'Bit nails',
  'Picked at skin',
  'Refreshed email',
];

function CompulsionDetectorContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [behavior, setBehavior] = useState('');
  const [trigger, setTrigger] = useState('');
  const [step, setStep] = useState<'behavior' | 'trigger' | 'complete'>('behavior');

  const config = getExerciseConfig('compulsion_detector');

  const handleBehaviorSelect = (selected: string) => {
    setBehavior(selected);
    helpers.vibrate('light');
  };

  const handleNext = () => {
    helpers.vibrate('medium');
    setStep('trigger');
  };

  const handleTriggerSubmit = () => {
    setStep('complete');
    helpers.completeExercise(100);
  };

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🔍</Text>
        <Text style={styles.completeText}>Compulsion Detected</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Automatic behavior:</Text>
            <Text style={[styles.summaryValue, { color: config.colors.primary }]}>
              {behavior}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Triggered by:</Text>
            <Text style={styles.summaryValue}>{trigger}</Text>
          </View>
        </View>
        <View style={styles.insightBox}>
          <Text style={styles.insightEmoji}>💡</Text>
          <Text style={styles.insightText}>
            Awareness is the first step. You caught yourself on autopilot - that's progress.
          </Text>
        </View>
        <Text style={styles.noJudgmentText}>No judgment. Just notice.</Text>
      </View>
    );
  }

  if (step === 'trigger') {
    return (
      <ScrollView style={styles.detectorContainer} contentContainerStyle={styles.detectorContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>❓</Text>
          <Text style={styles.stepTitle}>What triggered it?</Text>
          <Text style={styles.stepSubtitle}>What happened right before?</Text>
        </View>

        <View style={styles.behaviorReminder}>
          <Text style={styles.behaviorReminderLabel}>You did:</Text>
          <Text style={[styles.behaviorReminderValue, { color: config.colors.primary }]}>
            {behavior}
          </Text>
        </View>

        <TextInput
          style={[styles.textArea, { borderColor: config.colors.primary }]}
          value={trigger}
          onChangeText={setTrigger}
          placeholder="e.g., Felt bored, Got stressed, Wanted to avoid work..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          autoFocus
        />

        <TouchableOpacity
          style={[
            styles.completeButton,
            {
              backgroundColor: trigger.trim() ? config.colors.primary : '#374151',
            },
          ]}
          onPress={handleTriggerSubmit}
          disabled={!trigger.trim()}
        >
          <Text style={styles.completeButtonText}>Log Compulsion</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // step === 'behavior'
  return (
    <ScrollView style={styles.detectorContainer} contentContainerStyle={styles.detectorContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>🔍</Text>
        <Text style={styles.stepTitle}>What did you just do automatically?</Text>
        <Text style={styles.stepSubtitle}>Choose or describe the automatic behavior</Text>
      </View>

      <View style={styles.commonBehaviors}>
        <Text style={styles.commonLabel}>Common automatic behaviors:</Text>
        {COMMON_COMPULSIONS.map((compulsion) => (
          <TouchableOpacity
            key={compulsion}
            style={[
              styles.behaviorButton,
              {
                backgroundColor: behavior === compulsion
                  ? config.colors.primary
                  : 'rgba(255, 255, 255, 0.05)',
                borderColor: behavior === compulsion
                  ? config.colors.primary
                  : '#374151',
              },
            ]}
            onPress={() => handleBehaviorSelect(compulsion)}
          >
            <Text style={styles.behaviorButtonText}>{compulsion}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customBehaviorSection}>
        <Text style={styles.orText}>Or describe your own:</Text>
        <TextInput
          style={[styles.customBehaviorInput, { borderColor: config.colors.primary }]}
          value={!COMMON_COMPULSIONS.includes(behavior) ? behavior : ''}
          onChangeText={setBehavior}
          placeholder="Type what you did..."
          placeholderTextColor="#6B7280"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          {
            backgroundColor: behavior.trim() ? config.colors.primary : '#374151',
          },
        ]}
        onPress={handleNext}
        disabled={!behavior.trim()}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function CompulsionDetectorExercise({ onComplete, onBack }: CompulsionDetectorExerciseProps) {
  const config = getExerciseConfig('compulsion_detector');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <CompulsionDetectorContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  detectorContainer: {
    flex: 1,
  },
  detectorContent: {
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
  commonBehaviors: {
    gap: 12,
  },
  commonLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  behaviorButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  behaviorButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  customBehaviorSection: {
    gap: 12,
  },
  orText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  customBehaviorInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  behaviorReminder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  behaviorReminderLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  behaviorReminderValue: {
    fontSize: 20,
    fontWeight: '600',
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
    gap: 16,
  },
  summaryRow: {
    gap: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  insightEmoji: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  noJudgmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
