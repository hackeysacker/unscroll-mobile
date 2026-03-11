/**
 * Focus Sprint Exercise
 *
 * 3-minute deep focus session with distraction counter
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, useRef } from 'react-native';
import { BaseExercise, ExerciseHelpers } from './BaseExercise';
import { getExerciseConfig } from '@/lib/exercise-types';
import { ExerciseState } from '@/lib/exercise-types';

interface FocusSprintExerciseProps {
  onComplete: (result: { completed: boolean; duration: number }) => void;
  onBack: () => void;
}

function FocusSprintContent({ state, helpers }: { state: ExerciseState; helpers: ExerciseHelpers }) {
  const [taskName, setTaskName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const config = getExerciseConfig('focus_sprint');

  const handleStartSprint = () => {
    if (taskName.trim()) {
      setHasStarted(true);
      helpers.vibrate('medium');
    }
  };

  const handleDistraction = () => {
    setDistractionCount(distractionCount + 1);
    helpers.vibrate('light');

    // Pulse animation when distraction is logged
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getFocusScore = () => {
    const maxDistractions = 10;
    const score = Math.max(0, 100 - (distractionCount / maxDistractions) * 100);
    return Math.round(score);
  };

  const getFocusQuality = () => {
    const score = getFocusScore();
    if (score >= 90) return { text: 'Excellent Focus!', emoji: '🎯', color: '#10B981' };
    if (score >= 70) return { text: 'Good Focus', emoji: '👍', color: '#3B82F6' };
    if (score >= 50) return { text: 'Moderate Focus', emoji: '🤔', color: '#F59E0B' };
    return { text: 'Keep Practicing', emoji: '💪', color: '#EF4444' };
  };

  if (!hasStarted) {
    return (
      <View style={styles.setupContainer}>
        <Text style={styles.setupEmoji}>⚡</Text>
        <Text style={styles.setupTitle}>What will you focus on?</Text>
        <Text style={styles.setupSubtitle}>Choose one simple task for this 3-minute sprint</Text>

        <TextInput
          style={[styles.taskInput, { borderColor: config.colors.primary }]}
          value={taskName}
          onChangeText={setTaskName}
          placeholder="e.g., Read one article, Write 3 paragraphs..."
          placeholderTextColor="#6B7280"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleStartSprint}
        />

        <TouchableOpacity
          style={[
            styles.startSprintButton,
            {
              backgroundColor: taskName.trim() ? config.colors.primary : '#374151',
            },
          ]}
          onPress={handleStartSprint}
          disabled={!taskName.trim()}
        >
          <Text style={styles.startSprintButtonText}>Begin Focus Sprint</Text>
        </TouchableOpacity>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Tip: When your mind wanders, gently note it and return to your task. Each return builds focus.
          </Text>
        </View>
      </View>
    );
  }

  const quality = getFocusQuality();

  return (
    <View style={styles.sprintContainer}>
      {/* Task name */}
      <View style={styles.taskSection}>
        <Text style={styles.taskLabel}>Focusing on:</Text>
        <Text style={[styles.taskText, { color: config.colors.primary }]}>{taskName}</Text>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>Time remaining</Text>
        <Text style={styles.timerValue}>
          {Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      {/* Focus indicator */}
      <View style={styles.focusIndicator}>
        <View style={[styles.focusRing, { borderColor: config.colors.primary }]}>
          <Text style={styles.focusEmoji}>🎯</Text>
        </View>
        <Text style={styles.focusText}>Stay focused</Text>
      </View>

      {/* Distraction counter */}
      <View style={styles.distractionSection}>
        <Text style={styles.distractionLabel}>Got distracted?</Text>
        <TouchableOpacity
          style={[styles.distractionButton, { backgroundColor: config.colors.accent }]}
          onPress={handleDistraction}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.distractionButtonText}>Tap to Note It</Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.distractionCountBox}>
          <Text style={styles.distractionCountLabel}>Distractions noted:</Text>
          <Text style={[styles.distractionCountValue, { color: config.colors.primary }]}>
            {distractionCount}
          </Text>
        </View>

        <Text style={styles.distractionGuidance}>
          No judgment - just notice and return to your task
        </Text>
      </View>

      {/* Focus quality preview */}
      {state.timeRemaining < 60 && (
        <View style={styles.qualityPreview}>
          <Text style={styles.qualityEmoji}>{quality.emoji}</Text>
          <Text style={[styles.qualityText, { color: quality.color }]}>
            {quality.text}
          </Text>
          <Text style={styles.qualityScore}>Focus Score: {getFocusScore()}%</Text>
        </View>
      )}
    </View>
  );
}

export function FocusSprintExercise({ onComplete, onBack }: FocusSprintExerciseProps) {
  const config = getExerciseConfig('focus_sprint');

  return (
    <BaseExercise config={config} onComplete={onComplete} onBack={onBack}>
      {(state, helpers) => <FocusSprintContent state={state} helpers={helpers} />}
    </BaseExercise>
  );
}

const styles = StyleSheet.create({
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  setupEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  setupSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  taskInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  startSprintButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startSprintButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  sprintContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  taskSection: {
    alignItems: 'center',
    gap: 8,
  },
  taskLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  taskText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerSection: {
    alignItems: 'center',
    gap: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  focusIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  focusRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusEmoji: {
    fontSize: 48,
  },
  focusText: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  distractionSection: {
    alignItems: 'center',
    gap: 12,
  },
  distractionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  distractionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  distractionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  distractionCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distractionCountLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  distractionCountValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  distractionGuidance: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  qualityPreview: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  qualityEmoji: {
    fontSize: 32,
  },
  qualityText: {
    fontSize: 18,
    fontWeight: '600',
  },
  qualityScore: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
