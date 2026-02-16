import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import type {
  DistractionApp,
  WorstScrollTime,
  ImprovementReason,
  OnboardingData,
} from '@/types';
import { Button } from '@/components/ui/Button';

interface HabitIntakeProps {
  onNext: (data: Partial<OnboardingData>) => void;
}

type QuestionStep = 1 | 2 | 3 | 4 | 5;

const appOptions: Array<{ value: DistractionApp; label: string; emoji: string }> = [
  { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { value: 'instagram', label: 'Instagram', emoji: '📷' },
  { value: 'youtube', label: 'YouTube', emoji: '▶️' },
  { value: 'snapchat', label: 'Snapchat', emoji: '👻' },
  { value: 'other', label: 'Other', emoji: '📱' },
];

const timeOptions: Array<{ value: WorstScrollTime; label: string; emoji: string }> = [
  { value: 'morning_bed', label: 'Morning in bed', emoji: '🌅' },
  { value: 'work_breaks', label: 'Work breaks', emoji: '☕' },
  { value: 'after_school', label: 'After school', emoji: '⏰' },
  { value: 'evenings', label: 'Evenings', emoji: '🌆' },
  { value: 'late_night', label: 'Late night before sleep', emoji: '🌙' },
];

const reasonOptions: Array<{ value: ImprovementReason; label: string; emoji: string }> = [
  { value: 'more_focus', label: 'More focus', emoji: '🎯' },
  { value: 'better_sleep', label: 'Better sleep', emoji: '🌙' },
  { value: 'mental_clarity', label: 'Mental clarity', emoji: '🧠' },
  { value: 'productivity', label: 'Productivity', emoji: '📈' },
  { value: 'discipline', label: 'Discipline', emoji: '🏆' },
  { value: 'other', label: 'Other', emoji: '💡' },
];

export function HabitIntake({ onNext }: HabitIntakeProps) {
  const [currentStep, setCurrentStep] = useState<QuestionStep>(1);
  const [scrollHours, setScrollHours] = useState(3);
  const [primaryApp, setPrimaryApp] = useState<DistractionApp>('instagram');
  const [worstTime, setWorstTime] = useState<WorstScrollTime>('late_night');
  const [reason, setReason] = useState<ImprovementReason>('more_focus');
  const [autoTracking, setAutoTracking] = useState(false);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as QuestionStep);
    } else {
      onNext({
        dailyScrollHours: scrollHours,
        primaryDistractionApp: primaryApp,
        worstScrollTime: worstTime,
        improvementReason: reason,
        wantsAutoTracking: autoTracking,
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              step <= currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Question 1: Daily scroll hours */}
      {currentStep === 1 && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            How many hours a day do you honestly think you scroll?
          </Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.hoursDisplay}>{scrollHours}</Text>
            <Text style={styles.hoursLabel}>
              {scrollHours === 1 ? 'hour' : 'hours'} per day
            </Text>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={6}
              step={0.5}
              value={scrollHours}
              onValueChange={setScrollHours}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#374151"
              thumbTintColor="#6366f1"
            />

            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0h</Text>
              <Text style={styles.sliderLabel}>6h</Text>
            </View>
          </View>

          <Button onPress={handleNext} size="lg" style={styles.button}>
            Continue
          </Button>
        </View>
      )}

      {/* Question 2: Primary app */}
      {currentStep === 2 && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            What app steals your time the most?
          </Text>

          <View style={styles.optionsGrid}>
            {appOptions.map((app) => (
              <TouchableOpacity
                key={app.value}
                style={[
                  styles.optionCard,
                  primaryApp === app.value && styles.optionCardActive,
                ]}
                onPress={() => setPrimaryApp(app.value)}
              >
                <Text style={styles.optionEmoji}>{app.emoji}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    primaryApp === app.value && styles.optionLabelActive,
                  ]}
                >
                  {app.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button onPress={handleNext} size="lg" style={styles.button}>
            Continue
          </Button>
        </View>
      )}

      {/* Question 3: Worst scroll time */}
      {currentStep === 3 && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            When do you scroll the most?
          </Text>

          <View style={styles.optionsList}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time.value}
                style={[
                  styles.optionRow,
                  worstTime === time.value && styles.optionRowActive,
                ]}
                onPress={() => setWorstTime(time.value)}
              >
                <Text style={styles.optionRowEmoji}>{time.emoji}</Text>
                <Text
                  style={[
                    styles.optionRowLabel,
                    worstTime === time.value && styles.optionRowLabelActive,
                  ]}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button onPress={handleNext} size="lg" style={styles.button}>
            Continue
          </Button>
        </View>
      )}

      {/* Question 4: Improvement reason */}
      {currentStep === 4 && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            What do you want to improve most?
          </Text>

          <View style={styles.optionsGrid}>
            {reasonOptions.map((reasonOption) => (
              <TouchableOpacity
                key={reasonOption.value}
                style={[
                  styles.optionCard,
                  reason === reasonOption.value && styles.optionCardActive,
                ]}
                onPress={() => setReason(reasonOption.value)}
              >
                <Text style={styles.optionEmoji}>{reasonOption.emoji}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    reason === reasonOption.value && styles.optionLabelActive,
                  ]}
                >
                  {reasonOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button onPress={handleNext} size="lg" style={styles.button}>
            Continue
          </Button>
        </View>
      )}

      {/* Question 5: Auto tracking */}
      {currentStep === 5 && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            Enable automatic screen time tracking?
          </Text>
          <Text style={styles.questionDescription}>
            We can help you track your phone usage automatically (optional)
          </Text>

          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setAutoTracking(!autoTracking)}
          >
            <Text style={styles.toggleLabel}>
              {autoTracking ? 'Enabled' : 'Disabled'}
            </Text>
            <View
              style={[
                styles.toggle,
                autoTracking && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  autoTracking && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          <Button onPress={handleNext} size="lg" style={styles.button}>
            Continue
          </Button>
        </View>
      )}
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
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    flex: 1,
    height: 4,
    backgroundColor: '#1f2937',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#ffffff',
  },
  questionContainer: {
    gap: 24,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
  },
  sliderContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  hoursDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  hoursLabel: {
    fontSize: 20,
    color: '#9ca3af',
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  optionCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  optionLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  optionsList: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#374151',
  },
  optionRowActive: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  optionRowEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionRowLabel: {
    fontSize: 16,
    color: '#9ca3af',
    flex: 1,
  },
  optionRowLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#6366f1',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  button: {
    marginTop: 16,
  },
});

