import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import type { OnboardingGoalResult } from '@/types';

interface PersonalGoalBuilderProps {
  onNext: (goal: OnboardingGoalResult, minutes: number) => void;
}

const goalOptions: Array<{
  value: OnboardingGoalResult;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    value: 'better_sleep',
    label: 'Better sleep',
    emoji: '🌙',
    description: 'Reduce late-night scrolling and improve sleep quality',
  },
  {
    value: 'reduce_scrolling',
    label: 'Reduce daily scrolling',
    emoji: '📉',
    description: 'Cut down overall screen time and scrolling habits',
  },
  {
    value: 'improve_focus',
    label: 'Improve focus',
    emoji: '🎯',
    description: 'Build sustained attention and concentration',
  },
  {
    value: 'build_discipline',
    label: 'Build discipline',
    emoji: '🏆',
    description: 'Develop mental resilience and self-control',
  },
];

const minuteOptions = [2, 5, 7, 10];

export function PersonalGoalBuilder({ onNext }: PersonalGoalBuilderProps) {
  const [step, setStep] = useState<'goal' | 'minutes'>('goal');
  const [selectedGoal, setSelectedGoal] = useState<OnboardingGoalResult>('improve_focus');
  const [selectedMinutes, setSelectedMinutes] = useState(5);

  const handleGoalNext = () => {
    setStep('minutes');
  };

  const handleComplete = () => {
    onNext(selectedGoal, selectedMinutes);
  };

  if (step === 'goal') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>What result do you want in 21 days?</Text>
          <Text style={styles.subtitle}>Choose your primary focus for the next three weeks</Text>
        </View>

        <View style={styles.optionsContainer}>
          {goalOptions.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[
                styles.goalCard,
                selectedGoal === goal.value && styles.goalCardActive,
              ]}
              onPress={() => setSelectedGoal(goal.value)}
            >
              <View style={styles.goalContent}>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <View style={styles.goalText}>
                  <Text
                    style={[
                      styles.goalLabel,
                      selectedGoal === goal.value && styles.goalLabelActive,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  <Text
                    style={[
                      styles.goalDescription,
                      selectedGoal === goal.value && styles.goalDescriptionActive,
                    ]}
                  >
                    {goal.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Button onPress={handleGoalNext} size="lg" style={styles.button}>
          Continue
        </Button>
      </ScrollView>
    );
  }

  // Minutes selection
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>How many minutes a day do you want to train?</Text>
        <Text style={styles.subtitle}>Short, consistent sessions work best</Text>
      </View>

      <View style={styles.minutesGrid}>
        {minuteOptions.map((minutes) => (
          <TouchableOpacity
            key={minutes}
            style={[
              styles.minuteCard,
              selectedMinutes === minutes && styles.minuteCardActive,
            ]}
            onPress={() => setSelectedMinutes(minutes)}
          >
            <Text
              style={[
                styles.minuteValue,
                selectedMinutes === minutes && styles.minuteValueActive,
              ]}
            >
              {minutes}
            </Text>
            <Text
              style={[
                styles.minuteLabel,
                selectedMinutes === minutes && styles.minuteLabelActive,
              ]}
            >
              {minutes === 2 && 'Quick'}
              {minutes === 5 && 'Balanced'}
              {minutes === 7 && 'Intensive'}
              {minutes === 10 && 'Deep'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationText}>
          <Text style={styles.recommendationBold}>Recommended:</Text> Start with 5 minutes and adjust based on your schedule.
        </Text>
      </View>

      <Button onPress={handleComplete} size="lg" style={styles.button}>
        Continue
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  goalCardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  goalEmoji: {
    fontSize: 28,
  },
  goalText: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  goalLabelActive: {
    color: '#000000',
  },
  goalDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  goalDescriptionActive: {
    color: '#000000',
    opacity: 0.8,
  },
  minutesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  minuteCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  minuteCardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  minuteValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  minuteValueActive: {
    color: '#000000',
  },
  minuteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  minuteLabelActive: {
    color: '#000000',
  },
  recommendationCard: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  recommendationText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  recommendationBold: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  button: {
    width: '100%',
  },
});

