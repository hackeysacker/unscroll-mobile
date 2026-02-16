/**
 * Mood Naming Exercise
 *
 * Label emotions precisely and locate them in the body
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface MoodNamingExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

const EMOTIONS = {
  joy: ['Happy', 'Excited', 'Content', 'Grateful'],
  sadness: ['Sad', 'Lonely', 'Disappointed', 'Hopeless'],
  anger: ['Angry', 'Frustrated', 'Irritated', 'Resentful'],
  fear: ['Anxious', 'Worried', 'Scared', 'Nervous'],
  surprise: ['Surprised', 'Confused', 'Curious', 'Amazed'],
  disgust: ['Disgusted', 'Uncomfortable', 'Awkward', 'Ashamed'],
};

const BODY_LOCATIONS = ['Head', 'Chest', 'Stomach', 'Throat', 'Shoulders', 'Whole Body'];

function MoodNamingContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [bodyLocation, setBodyLocation] = useState('');
  const [step, setStep] = useState<'emotion' | 'body' | 'complete'>('emotion');

  const config = getExerciseConfig('mood_naming');

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    helpers.vibrate('light');
    setTimeout(() => {
      setStep('body');
    }, 500);
  };

  const handleBodySelect = (location: string) => {
    setBodyLocation(location);
    helpers.vibrate('medium');
    setTimeout(() => {
      setStep('complete');
      helpers.completeExercise(100);
    }, 500);
  };

  if (step === 'complete') {
    return (
      <View style={styles.completeView}>
        <Text style={styles.completeEmoji}>🎭</Text>
        <Text style={styles.completeText}>Emotion Named</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>You are feeling:</Text>
          <Text style={[styles.emotionText, { color: config.colors.primary }]}>{selectedEmotion}</Text>
          <Text style={[styles.summaryLabel, { marginTop: 16 }]}>Located in your:</Text>
          <Text style={styles.bodyText}>{bodyLocation}</Text>
        </View>
        <Text style={styles.insightText}>
          💡 Naming the emotion creates distance from it. You have emotions, but you are not your emotions.
        </Text>
      </View>
    );
  }

  if (step === 'body') {
    return (
      <ScrollView style={styles.namingContainer} contentContainerStyle={styles.namingContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>🫀</Text>
          <Text style={styles.stepTitle}>Where do you feel it?</Text>
          <Text style={styles.stepSubtitle}>Locate the sensation in your body</Text>
        </View>

        <View style={styles.selectedEmotionReminder}>
          <Text style={styles.selectedEmotionLabel}>You're feeling:</Text>
          <Text style={[styles.selectedEmotionValue, { color: config.colors.primary }]}>
            {selectedEmotion}
          </Text>
        </View>

        <View style={styles.bodyGrid}>
          {BODY_LOCATIONS.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.bodyButton,
                {
                  backgroundColor: bodyLocation === location
                    ? config.colors.primary
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: config.colors.primary,
                },
              ]}
              onPress={() => handleBodySelect(location)}
            >
              <Text style={styles.bodyButtonText}>{location}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.namingContainer} contentContainerStyle={styles.namingContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>🎭</Text>
        <Text style={styles.stepTitle}>Name Your Emotion</Text>
        <Text style={styles.stepSubtitle}>What are you feeling right now?</Text>
      </View>

      <View style={styles.emotionsSection}>
        {Object.entries(EMOTIONS).map(([category, emotions]) => (
          <View key={category} style={styles.emotionCategory}>
            <View style={styles.emotionRow}>
              {emotions.map((emotion) => (
                <TouchableOpacity
                  key={emotion}
                  style={[
                    styles.emotionButton,
                    {
                      backgroundColor: selectedEmotion === emotion
                        ? config.colors.primary
                        : 'rgba(255, 255, 255, 0.05)',
                      borderColor: selectedEmotion === emotion
                        ? config.colors.primary
                        : '#374151',
                    },
                  ]}
                  onPress={() => handleEmotionSelect(emotion)}
                >
                  <Text style={styles.emotionButtonText}>{emotion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function MoodNamingExercise({ onComplete, onBack }: MoodNamingExerciseProps) {
  const config = getExerciseConfig('mood_naming');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <MoodNamingContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  namingContainer: {
    flex: 1,
  },
  namingContent: {
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
  emotionsSection: {
    gap: 16,
  },
  emotionCategory: {
    gap: 8,
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  emotionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedEmotionReminder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  selectedEmotionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  selectedEmotionValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  bodyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  bodyButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  bodyButtonText: {
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
  emotionText: {
    fontSize: 32,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 24,
    color: '#FFFFFF',
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
