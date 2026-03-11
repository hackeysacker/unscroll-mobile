/**
 * Mini Gratitude Exercise
 *
 * List 3 things you're grateful for
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface MiniGratitudeExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function MiniGratitudeContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [gratitudes, setGratitudes] = useState<string[]>(['', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);

  const config = getExerciseConfig('mini_gratitude');

  const handleAdd = () => {
    if (gratitudes[currentIndex].trim()) {
      helpers.vibrate('light');
      if (currentIndex < 2) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setTimeout(() => {
          helpers.completeExercise(100);
        }, 500);
      }
    }
  };

  const updateGratitude = (text: string) => {
    const newGratitudes = [...gratitudes];
    newGratitudes[currentIndex] = text;
    setGratitudes(newGratitudes);
  };

  const progress = ((currentIndex + 1) / 3) * 100;
  helpers.updateProgress(progress);

  return (
    <ScrollView style={styles.gratitudeContainer} contentContainerStyle={styles.gratitudeContent}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🙏</Text>
        <Text style={styles.headerTitle}>What are you grateful for?</Text>
        <Text style={styles.headerSubtitle}>Even tiny things count</Text>
      </View>

      <View style={styles.gratitudesList}>
        {gratitudes.map((gratitude, index) => (
          <View key={index} style={styles.gratitudeItem}>
            <View
              style={[
                styles.numberBadge,
                {
                  backgroundColor: index < currentIndex
                    ? config.colors.primary
                    : index === currentIndex
                    ? config.colors.accent
                    : '#374151',
                },
              ]}
            >
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>

            {index < currentIndex ? (
              <View style={styles.completedGratitude}>
                <Text style={styles.completedText}>{gratitude}</Text>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ) : index === currentIndex ? (
              <TextInput
                style={[styles.gratitudeInput, { borderColor: config.colors.primary }]}
                value={gratitude}
                onChangeText={updateGratitude}
                placeholder="I'm grateful for..."
                placeholderTextColor="#6B7280"
                multiline
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
            ) : (
              <View style={styles.pendingGratitude}>
                <Text style={styles.pendingText}>...</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {gratitudes[currentIndex].trim() && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: config.colors.primary }]}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>
            {currentIndex < 2 ? 'Add Gratitude' : 'Complete'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.progressDots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              { backgroundColor: i <= currentIndex ? config.colors.primary : '#374151' },
            ]}
          />
        ))}
      </View>

      <Text style={styles.tipText}>
        💡 Tip: Be specific. "My warm coffee" is better than "coffee"
      </Text>
    </ScrollView>
  );
}

export function MiniGratitudeExercise({ onComplete, onBack }: MiniGratitudeExerciseProps) {
  const config = getExerciseConfig('mini_gratitude');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <MiniGratitudeContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  gratitudeContainer: {
    flex: 1,
  },
  gratitudeContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 56,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  gratitudesList: {
    gap: 16,
  },
  gratitudeItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gratitudeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 60,
  },
  completedGratitude: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  completedText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  checkmark: {
    fontSize: 20,
    color: '#10B981',
  },
  pendingGratitude: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    justifyContent: 'center',
  },
  pendingText: {
    fontSize: 16,
    color: '#374151',
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
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
  tipText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
