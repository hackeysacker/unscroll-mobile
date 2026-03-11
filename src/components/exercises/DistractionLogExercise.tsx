/**
 * Distraction Log Exercise
 *
 * Track and understand distraction patterns
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface DistractionLogExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const COMMON_EMOTIONS = ['Bored', 'Anxious', 'Overwhelmed', 'Curious', 'Restless', 'Stressed'];

function DistractionLogContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [distraction, setDistraction] = useState('');
  const [previousActivity, setPreviousActivity] = useState('');
  const [emotion, setEmotion] = useState('');
  const [step, setStep] = useState<'distraction' | 'activity' | 'emotion' | 'complete'>('distraction');

  const config = getExerciseConfig('distraction_log');

  const handleNext = () => {
    helpers.vibrate('medium');
    if (step === 'distraction') setStep('activity');
    else if (step === 'activity') setStep('emotion');
  };

  const handleEmotionSelect = (selectedEmotion: string) => {
    setEmotion(selectedEmotion);
    helpers.vibrate('light');
    setTimeout(() => {
      setStep('complete');
      helpers.completeExercise(100);
    }, 500);
  };

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>📊</Text>
        <Text style={styles.completeText}>Pattern Logged</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Distraction:</Text>
            <Text style={[styles.summaryValue, { color: config.colors.primary }]}>{distraction}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Previous activity:</Text>
            <Text style={styles.summaryValue}>{previousActivity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Triggered by:</Text>
            <Text style={styles.summaryValue}>{emotion}</Text>
          </View>
        </View>
        <Text style={styles.insightText}>
          💡 Notice the pattern: {emotion} → {distraction}
        </Text>
      </View>
    );
  }

  if (step === 'emotion') {
    return (
      <ScrollView style={styles.logContainer} contentContainerStyle={styles.logContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>🎭</Text>
          <Text style={styles.stepTitle}>What emotion triggered it?</Text>
          <Text style={styles.stepSubtitle}>Select the feeling that led to the distraction</Text>
        </View>

        <View style={styles.emotionGrid}>
          {COMMON_EMOTIONS.map((emotionOption) => (
            <TouchableOpacity
              key={emotionOption}
              style={[
                styles.emotionButton,
                {
                  backgroundColor: emotion === emotionOption
                    ? config.colors.primary
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: config.colors.primary,
                },
              ]}
              onPress={() => handleEmotionSelect(emotionOption)}
            >
              <Text style={styles.emotionButtonText}>{emotionOption}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customEmotionContainer}>
          <Text style={styles.orText}>or describe it yourself:</Text>
          <TextInput
            style={[styles.customEmotionInput, { borderColor: config.colors.primary }]}
            value={emotion && !COMMON_EMOTIONS.includes(emotion) ? emotion : ''}
            onChangeText={setEmotion}
            placeholder="Type your emotion..."
            placeholderTextColor="#6B7280"
            onSubmitEditing={() => emotion && handleEmotionSelect(emotion)}
          />
          {emotion && !COMMON_EMOTIONS.includes(emotion) && (
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: config.colors.primary }]}
              onPress={() => handleEmotionSelect(emotion)}
            >
              <Text style={styles.continueButtonText}>Complete Log</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  const currentInput = step === 'distraction' ? distraction : previousActivity;
  const setCurrentInput = step === 'distraction' ? setDistraction : setPreviousActivity;
  const placeholder = step === 'distraction'
    ? 'e.g., Checked phone, Browsed social media...'
    : 'e.g., Working on report, Reading article...';
  const title = step === 'distraction'
    ? 'What distracted you?'
    : 'What were you doing before?';
  const emoji = step === 'distraction' ? '📱' : '💼';

  return (
    <ScrollView style={styles.logContainer} contentContainerStyle={styles.logContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>{emoji}</Text>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>

      <TextInput
        style={[styles.textArea, { borderColor: config.colors.primary }]}
        value={currentInput}
        onChangeText={setCurrentInput}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        multiline
        numberOfLines={3}
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
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.stepProgressContainer}>
        {['distraction', 'activity', 'emotion'].map((s, index) => (
          <View
            key={s}
            style={[
              styles.stepProgressDot,
              {
                backgroundColor: index <= ['distraction', 'activity', 'emotion'].indexOf(step)
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

export function DistractionLogExercise({ onComplete, onBack }: DistractionLogExerciseProps) {
  const config = getExerciseConfig('distraction_log');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <DistractionLogContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  logContainer: {
    flex: 1,
  },
  logContent: {
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
    minHeight: 100,
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
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  emotionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  emotionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  customEmotionContainer: {
    gap: 12,
  },
  orText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  customEmotionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
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
    fontSize: 12,
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  insightText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
});
