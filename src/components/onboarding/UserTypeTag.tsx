import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import type { UserPersonalityType } from '@/types';

interface UserTypeTagProps {
  onNext: (personalityType: UserPersonalityType) => void;
}

const personalityTypes: Array<{
  value: UserPersonalityType;
  label: string;
  emoji: string;
}> = [
  { value: 'overthinker', label: 'Overthinker', emoji: '🧠' },
  { value: 'procrastinator', label: 'Procrastinator', emoji: '⏰' },
  { value: 'night_scroller', label: 'Night scroller', emoji: '🌙' },
  { value: 'impulse_tapper', label: 'Impulse tapper', emoji: '⚡' },
  { value: 'work_distracter', label: 'Work distracter', emoji: '💼' },
  { value: 'focus_beginner', label: 'Focus beginner', emoji: '🎯' },
];

export function UserTypeTag({ onNext }: UserTypeTagProps) {
  const [selectedType, setSelectedType] = useState<UserPersonalityType>('focus_beginner');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Which type describes you?</Text>
        <Text style={styles.subtitle}>This helps us adapt your training plan</Text>
      </View>

      <View style={styles.grid}>
        {personalityTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeCard,
              selectedType === type.value && styles.typeCardActive,
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Text style={styles.typeEmoji}>{type.emoji}</Text>
            <Text
              style={[
                styles.typeLabel,
                selectedType === type.value && styles.typeLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        onPress={() => onNext(selectedType)}
        size="lg"
        style={styles.button}
      >
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  typeCardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  typeLabelActive: {
    color: '#000000',
  },
  button: {
    width: '100%',
  },
});

