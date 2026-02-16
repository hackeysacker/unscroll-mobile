/**
 * Positive Action Exercise
 *
 * Choose one tiny action to break paralysis and shift energy
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface PositiveActionExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const SUGGESTED_ACTIONS = [
  'Drink a glass of water',
  'Do 10 jumping jacks',
  'Text a friend',
  'Make your bed',
  'Step outside for 30 seconds',
  'Do one push-up',
];

function PositiveActionContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [action, setAction] = useState('');
  const [energyBefore, setEnergyBefore] = useState(30);
  const [energyAfter, setEnergyAfter] = useState(30);
  const [step, setStep] = useState<'choose' | 'before' | 'commit' | 'after' | 'complete'>('choose');

  const config = getExerciseConfig('positive_action');

  const handleSelectAction = (selectedAction: string) => {
    setAction(selectedAction);
    helpers.vibrate('light');
  };

  const handleNext = () => {
    helpers.vibrate('medium');
    if (step === 'choose') setStep('before');
    else if (step === 'before') setStep('commit');
    else if (step === 'commit') setStep('after');
    else if (step === 'after') {
      setStep('complete');
      helpers.completeExercise(100);
    }
  };

  if (step === 'complete') {
    const energyShift = energyAfter - energyBefore;
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🎬</Text>
        <Text style={styles.completeText}>Action Completed!</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Your action:</Text>
          <Text style={[styles.actionValue, { color: config.colors.primary }]}>{action}</Text>
          <Text style={[styles.summaryLabel, { marginTop: 16 }]}>Energy shift:</Text>
          <Text style={[
            styles.energyShift,
            { color: energyShift > 0 ? '#10B981' : energyShift < 0 ? '#EF4444' : '#9CA3AF' }
          ]}>
            {energyShift > 0 ? '+' : ''}{energyShift} points
          </Text>
        </View>
        <Text style={styles.insightText}>
          💡 One small action creates momentum. This is how you break paralysis.
        </Text>
      </View>
    );
  }

  if (step === 'after') {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>⚡</Text>
          <Text style={styles.stepTitle}>How do you feel now?</Text>
          <Text style={styles.stepSubtitle}>Rate your energy after taking action</Text>
        </View>

        <View style={styles.actionReminder}>
          <Text style={styles.actionReminderLabel}>You did:</Text>
          <Text style={[styles.actionReminderValue, { color: config.colors.primary }]}>
            {action}
          </Text>
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Energy Level:</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={energyAfter}
            onValueChange={setEnergyAfter}
            minimumTrackTintColor={config.colors.primary}
            maximumTrackTintColor="#374151"
            thumbTintColor={config.colors.accent}
          />
          <Text style={styles.energyValue}>{Math.round(energyAfter)}%</Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: config.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>See Results</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'commit') {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>✅</Text>
          <Text style={styles.stepTitle}>Take Action Now</Text>
          <Text style={styles.stepSubtitle}>Do it immediately - no waiting</Text>
        </View>

        <View style={styles.commitBox}>
          <Text style={styles.commitAction}>"{action}"</Text>
          <Text style={styles.commitInstruction}>
            Tap the button only after you've completed the action
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.commitButton, { backgroundColor: config.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.commitButtonText}>I Did It!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'before') {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>📊</Text>
          <Text style={styles.stepTitle}>How's your energy right now?</Text>
          <Text style={styles.stepSubtitle}>Rate your current state before taking action</Text>
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Energy Level:</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={energyBefore}
            onValueChange={setEnergyBefore}
            minimumTrackTintColor={config.colors.primary}
            maximumTrackTintColor="#374151"
            thumbTintColor={config.colors.accent}
          />
          <Text style={styles.energyValue}>{Math.round(energyBefore)}%</Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: config.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // step === 'choose'
  return (
    <ScrollView style={styles.chooseContainer} contentContainerStyle={styles.chooseContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>🎬</Text>
        <Text style={styles.stepTitle}>Pick One Tiny Action</Text>
        <Text style={styles.stepSubtitle}>Something you can do right now in under 2 minutes</Text>
      </View>

      <View style={styles.suggestedActions}>
        <Text style={styles.suggestedLabel}>Suggested actions:</Text>
        {SUGGESTED_ACTIONS.map((suggestedAction) => (
          <TouchableOpacity
            key={suggestedAction}
            style={[
              styles.actionButton,
              {
                backgroundColor: action === suggestedAction
                  ? config.colors.primary
                  : 'rgba(255, 255, 255, 0.05)',
                borderColor: action === suggestedAction
                  ? config.colors.primary
                  : '#374151',
              },
            ]}
            onPress={() => handleSelectAction(suggestedAction)}
          >
            <Text style={styles.actionButtonText}>{suggestedAction}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customActionSection}>
        <Text style={styles.orText}>Or create your own:</Text>
        <TextInput
          style={[styles.customActionInput, { borderColor: config.colors.primary }]}
          value={!SUGGESTED_ACTIONS.includes(action) ? action : ''}
          onChangeText={setAction}
          placeholder="Type your own action..."
          placeholderTextColor="#6B7280"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          {
            backgroundColor: action.trim() ? config.colors.primary : '#374151',
          },
        ]}
        onPress={handleNext}
        disabled={!action.trim()}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function PositiveActionExercise({ onComplete, onBack }: PositiveActionExerciseProps) {
  const config = getExerciseConfig('positive_action');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <PositiveActionContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  chooseContainer: {
    flex: 1,
  },
  chooseContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
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
  suggestedActions: {
    gap: 12,
  },
  suggestedLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  customActionSection: {
    gap: 12,
  },
  orText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  customActionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  sliderSection: {
    gap: 16,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  energyValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  commitBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  commitAction: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  commitInstruction: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  commitButton: {
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  commitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionReminder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionReminderLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionReminderValue: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
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
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  actionValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  energyShift: {
    fontSize: 32,
    fontWeight: '700',
  },
  insightText: {
    fontSize: 13,
    color: '#D1D5DB',
    textAlign: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    lineHeight: 20,
  },
});
