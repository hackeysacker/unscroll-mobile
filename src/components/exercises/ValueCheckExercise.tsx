/**
 * Value Check Exercise
 *
 * Align actions with core values
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface ValueCheckExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

type Step = 'values' | 'alignment' | 'action' | 'complete';

const COMMON_VALUES = [
  'Family', 'Health', 'Growth', 'Creativity',
  'Freedom', 'Connection', 'Impact', 'Authenticity'
];

function ValueCheckContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [step, setStep] = useState<Step>('values');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [alignment, setAlignment] = useState('');
  const [action, setAction] = useState('');

  const config = getExerciseConfig('value_check');

  const handleValueToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else if (selectedValues.length < 3) {
      setSelectedValues([...selectedValues, value]);
      helpers.vibrate('light');
    }
  };

  const handleNext = () => {
    helpers.vibrate('medium');
    if (step === 'values') setStep('alignment');
    else if (step === 'alignment') setStep('action');
  };

  const handleComplete = () => {
    setStep('complete');
    helpers.completeExercise(100);
  };

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🎯</Text>
        <Text style={styles.completeText}>Values Clarified</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Your top values:</Text>
          <View style={styles.valuesList}>
            {selectedValues.map((value, index) => (
              <View key={index} style={[styles.valueTag, { backgroundColor: config.colors.primary }]}>
                <Text style={styles.valueTagText}>{value}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.summaryLabel, { marginTop: 16 }]}>One aligned action:</Text>
          <Text style={[styles.summaryValue, { color: config.colors.primary }]}>{action}</Text>
        </View>
      </View>
    );
  }

  if (step === 'values') {
    return (
      <ScrollView style={styles.checkContainer} contentContainerStyle={styles.checkContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>🎯</Text>
          <Text style={styles.stepTitle}>What matters most to you?</Text>
          <Text style={styles.stepSubtitle}>Select up to 3 core values</Text>
        </View>

        <View style={styles.valuesGrid}>
          {COMMON_VALUES.map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.valueButton,
                {
                  backgroundColor: selectedValues.includes(value)
                    ? config.colors.primary
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: selectedValues.includes(value)
                    ? config.colors.primary
                    : '#374151',
                },
              ]}
              onPress={() => handleValueToggle(value)}
            >
              <Text style={styles.valueButtonText}>{value}</Text>
              {selectedValues.includes(value) && (
                <Text style={styles.checkMark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.selectedCount}>
          {selectedValues.length} / 3 selected
        </Text>

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: selectedValues.length > 0 ? config.colors.primary : '#374151',
            },
          ]}
          onPress={handleNext}
          disabled={selectedValues.length === 0}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 'alignment') {
    return (
      <ScrollView style={styles.checkContainer} contentContainerStyle={styles.checkContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>🔍</Text>
          <Text style={styles.stepTitle}>Are your actions aligned?</Text>
          <Text style={styles.stepSubtitle}>Reflect on how you spend your time</Text>
        </View>

        <View style={styles.valueReminder}>
          <Text style={styles.valueReminderLabel}>Your values:</Text>
          <View style={styles.valuesList}>
            {selectedValues.map((value, index) => (
              <View key={index} style={[styles.valueTag, { backgroundColor: config.colors.primary }]}>
                <Text style={styles.valueTagText}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <TextInput
          style={[styles.textArea, { borderColor: config.colors.primary }]}
          value={alignment}
          onChangeText={setAlignment}
          placeholder="Are your daily actions supporting these values? What's misaligned?"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: alignment.trim() ? config.colors.primary : '#374151',
            },
          ]}
          onPress={handleNext}
          disabled={!alignment.trim()}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // step === 'action'
  return (
    <ScrollView style={styles.checkContainer} contentContainerStyle={styles.checkContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>✨</Text>
        <Text style={styles.stepTitle}>One thing you can change</Text>
        <Text style={styles.stepSubtitle}>What action would better align with your values?</Text>
      </View>

      <TextInput
        style={[styles.textArea, { borderColor: config.colors.primary }]}
        value={action}
        onChangeText={setAction}
        placeholder="e.g., Spend 30 min daily with family, Start a creative project..."
        placeholderTextColor="#6B7280"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[
          styles.completeButton,
          {
            backgroundColor: action.trim() ? config.colors.primary : '#374151',
          },
        ]}
        onPress={handleComplete}
        disabled={!action.trim()}
      >
        <Text style={styles.completeButtonText}>Complete Check-In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function ValueCheckExercise({ onComplete, onBack }: ValueCheckExerciseProps) {
  const config = getExerciseConfig('value_check');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <ValueCheckContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  checkContainer: {
    flex: 1,
  },
  checkContent: {
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
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  valueButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkMark: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedCount: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  valueReminder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  valueReminderLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  valuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valueTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  valueTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
});
