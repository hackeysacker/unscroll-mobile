import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Header } from '@/components/ui/Header';
import { GazeHoldChallenge } from '@/components/challenges/GazeHoldChallenge';
import { FocusHoldChallenge } from '@/components/challenges/FocusHoldChallenge';
import { TapOnlyCorrectChallenge } from '@/components/challenges/TapOnlyCorrectChallenge';
import { RhythmTapChallenge } from '@/components/challenges/RhythmTapChallenge';
import { MemoryFlashChallenge } from '@/components/challenges/MemoryFlashChallenge';
import { ReactionInhibitionChallenge } from '@/components/challenges/ReactionInhibitionChallenge';
import { FingerHoldChallenge } from '@/components/challenges/FingerHoldChallenge';
import { SlowTrackingChallenge } from '@/components/challenges/SlowTrackingChallenge';
import { BreathPacingChallenge } from '@/components/challenges/BreathPacingChallenge';
import { FakeNotificationsChallenge } from '@/components/challenges/FakeNotificationsChallenge';
import { DelayUnlockChallenge } from '@/components/challenges/DelayUnlockChallenge';
import { MultiObjectTrackingChallenge } from '@/components/challenges/MultiObjectTrackingChallenge';
import { StillnessTestChallenge } from '@/components/challenges/StillnessTestChallenge';
import { ImpulseSpikeTestChallenge } from '@/components/challenges/ImpulseSpikeTestChallenge';
import { FingerTracingChallenge } from '@/components/challenges/FingerTracingChallenge';
import { MultiTaskTapChallenge } from '@/components/challenges/MultiTaskTapChallenge';
import { PopupIgnoreChallenge } from '@/components/challenges/PopupIgnoreChallenge';
import { ControlledBreathingChallenge } from '@/components/challenges/ControlledBreathingChallenge';
import { LogicPuzzleChallenge } from '@/components/challenges/LogicPuzzleChallenge';
import { MemoryPuzzleChallenge } from '@/components/challenges/MemoryPuzzleChallenge';
import { PatternMatchingChallenge } from '@/components/challenges/PatternMatchingChallenge';
import { AntiScrollSwipeChallenge } from '@/components/challenges/AntiScrollSwipeChallenge';
import { ResetChallenge } from '@/components/challenges/ResetChallenge';
import { LookAwayChallenge } from '@/components/challenges/LookAwayChallenge';
import { ExerciseRouter } from '@/components/exercises/ExerciseRouter';
import { EXERCISE_CONFIGS, ExerciseType } from '@/lib/exercise-types';
import type { ChallengeType } from '@/types';

interface DevTestingModeProps {
  onBack: () => void;
}

interface ChallengeConfig {
  type: ChallengeType | ExerciseType;
  name: string;
  description: string;
  icon: string;
  duration?: number;
  category: 'challenge' | 'exercise';
}

const CHALLENGES: ChallengeConfig[] = [
  // Core Focus Challenges
  {
    type: 'gaze_hold',
    name: 'Gaze Hold',
    description: 'Hold your gaze on the target',
    icon: '👁️',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'focus_hold',
    name: 'Focus Hold',
    description: 'Maintain sustained focus',
    icon: '🎯',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'finger_hold',
    name: 'Finger Hold',
    description: 'Hold your finger steady on target',
    icon: '👆',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'slow_tracking',
    name: 'Slow Tracking',
    description: 'Follow the slow-moving target',
    icon: '🐌',
    duration: 30,
    category: 'challenge',
  },
  // Impulse Control Challenges
  {
    type: 'tap_only_correct',
    name: 'Tap Only Correct',
    description: 'Tap correct targets, ignore distractors',
    icon: '✅',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'reaction_inhibition',
    name: 'Reaction Inhibition',
    description: 'Tap green, resist red and blue',
    icon: '🛑',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'impulse_spike_test',
    name: 'Impulse Spike Test',
    description: 'Resist sudden impulse triggers',
    icon: '⚡',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'delay_unlock',
    name: 'Delay Unlock',
    description: 'Wait patiently before unlocking',
    icon: '🔐',
    duration: 30,
    category: 'challenge',
  },
  // Memory & Cognitive Challenges
  {
    type: 'memory_flash',
    name: 'Memory Flash',
    description: 'Remember and recall number sequences',
    icon: '🧠',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'multi_object_tracking',
    name: 'Multi Object Tracking',
    description: 'Track multiple moving objects',
    icon: '🎱',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'multi_task_tap',
    name: 'Multi Task Tap',
    description: 'Handle multiple tasks at once',
    icon: '🔀',
    duration: 30,
    category: 'challenge',
  },
  // Distraction Resistance Challenges
  {
    type: 'fake_notifications',
    name: 'Fake Notifications',
    description: 'Ignore distracting notifications',
    icon: '🔔',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'popup_ignore',
    name: 'Popup Ignore',
    description: 'Resist clicking popups',
    icon: '🪟',
    duration: 30,
    category: 'challenge',
  },
  // Rhythm & Timing Challenges
  {
    type: 'rhythm_tap',
    name: 'Rhythm Tap',
    description: 'Tap in rhythm with the beat',
    icon: '🥁',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'finger_tracing',
    name: 'Finger Tracing',
    description: 'Trace patterns accurately',
    icon: '✍️',
    duration: 30,
    category: 'challenge',
  },
  // Breathing & Calm Challenges
  {
    type: 'breath_pacing',
    name: 'Breath Pacing',
    description: 'Follow breathing rhythm',
    icon: '🌬️',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'controlled_breathing',
    name: 'Controlled Breathing',
    description: 'Box breathing exercise',
    icon: '🧘',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'stillness_test',
    name: 'Stillness Test',
    description: 'Hold perfectly still',
    icon: '🗿',
    duration: 30,
    category: 'challenge',
  },
  // Puzzle Challenges
  {
    type: 'logic_puzzle',
    name: 'Logic Puzzle',
    description: 'Solve logic puzzles quickly',
    icon: '🧩',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'memory_puzzle',
    name: 'Memory Puzzle',
    description: 'Remember and match patterns',
    icon: '🎴',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'pattern_matching',
    name: 'Pattern Matching',
    description: 'Match patterns quickly',
    icon: '🔷',
    duration: 30,
    category: 'challenge',
  },
  // Shield/Anti-Distraction Challenges
  {
    type: 'anti_scroll_swipe',
    name: 'Anti-Scroll Swipe',
    description: 'Resist the urge to swipe',
    icon: '📱',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'reset_challenge',
    name: 'Reset Challenge',
    description: 'Resist resetting progress',
    icon: '🔄',
    duration: 30,
    category: 'challenge',
  },
  {
    type: 'look_away',
    name: 'Look Away',
    description: 'Look away from the screen',
    icon: '👀',
    duration: 30,
    category: 'challenge',
  },
];

// Generate exercise configs from EXERCISE_CONFIGS
const EXERCISES: ChallengeConfig[] = Object.values(EXERCISE_CONFIGS).map(config => ({
  type: config.id,
  name: config.name,
  description: config.description,
  icon: config.icon,
  duration: config.duration,
  category: 'exercise' as const,
}));

// Combine challenges and exercises
const ALL_ACTIVITIES = [...CHALLENGES, ...EXERCISES];

export function DevTestingMode({ onBack }: DevTestingModeProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeConfig | null>(null);
  const [customDuration, setCustomDuration] = useState(15);
  const [testResults, setTestResults] = useState<Array<{
    type: string;
    score: number;
    duration: number;
    timestamp: number;
  }>>([]);

  const handleChallengeComplete = (score: number, duration: number) => {
    setTestResults(prev => [
      {
        type: selectedChallenge?.name || 'Unknown',
        score,
        duration,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, 20)); // Keep last 20 results
    setSelectedChallenge(null);
  };

  // Render active challenge or exercise
  if (selectedChallenge) {
    // Handle exercises
    if (selectedChallenge.category === 'exercise') {
      return (
        <ExerciseRouter
          exerciseType={selectedChallenge.type as ExerciseType}
          onComplete={(result) => handleChallengeComplete(result.score || 100, result.duration * 1000)}
          onBack={() => setSelectedChallenge(null)}
        />
      );
    }

    // Handle challenges
    switch (selectedChallenge.type) {
      case 'gaze_hold':
        return (
          <GazeHoldChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'focus_hold':
        return (
          <FocusHoldChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'finger_hold':
        return (
          <FingerHoldChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'slow_tracking':
        return (
          <SlowTrackingChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'tap_only_correct':
        return (
          <TapOnlyCorrectChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'reaction_inhibition':
        return (
          <ReactionInhibitionChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'impulse_spike_test':
        return (
          <ImpulseSpikeTestChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'delay_unlock':
        return (
          <DelayUnlockChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'memory_flash':
        return (
          <MemoryFlashChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'multi_object_tracking':
        return (
          <MultiObjectTrackingChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'multi_task_tap':
        return (
          <MultiTaskTapChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'fake_notifications':
        return (
          <FakeNotificationsChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'popup_ignore':
        return (
          <PopupIgnoreChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'rhythm_tap':
        return (
          <RhythmTapChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'finger_tracing':
        return (
          <FingerTracingChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'breath_pacing':
        return (
          <BreathPacingChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'controlled_breathing':
        return (
          <ControlledBreathingChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'stillness_test':
        return (
          <StillnessTestChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'logic_puzzle':
        return (
          <LogicPuzzleChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'memory_puzzle':
        return (
          <MemoryPuzzleChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'pattern_matching':
        return (
          <PatternMatchingChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'anti_scroll_swipe':
        return (
          <AntiScrollSwipeChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'reset_challenge':
        return (
          <ResetChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      case 'look_away':
        return (
          <LookAwayChallenge
            duration={customDuration}
            onComplete={handleChallengeComplete}
          />
        );
      default:
        return null;
    }
  }

  return (
    <View style={styles.container}>
      <Header title="🔧 Dev Testing Mode" onBack={onBack} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Warning banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Testing Mode - No XP or progress will be affected
          </Text>
        </View>

        {/* Duration selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationRow}>
            {[5, 10].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  customDuration === duration && styles.durationButtonActive,
                ]}
                onPress={() => setCustomDuration(duration)}
              >
                <Text style={[
                  styles.durationText,
                  customDuration === duration && styles.durationTextActive,
                ]}>
                  {duration}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Focus Challenges ({CHALLENGES.length})</Text>
          {CHALLENGES.map((challenge) => (
            <TouchableOpacity
              key={challenge.type}
              style={styles.challengeCard}
              onPress={() => setSelectedChallenge(challenge)}
            >
              <Text style={styles.challengeIcon}>{challenge.icon}</Text>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeDesc}>{challenge.description}</Text>
              </View>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘 Mindfulness Exercises ({EXERCISES.length})</Text>
          {EXERCISES.map((exercise) => (
            <TouchableOpacity
              key={exercise.type}
              style={[styles.challengeCard, styles.exerciseCard]}
              onPress={() => setSelectedChallenge(exercise)}
            >
              <Text style={styles.challengeIcon}>{exercise.icon}</Text>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{exercise.name}</Text>
                <Text style={styles.challengeDesc}>{exercise.description}</Text>
              </View>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Test results history */}
        {testResults.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Tests</Text>
              <TouchableOpacity onPress={() => setTestResults([])}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            </View>
            {testResults.map((result, index) => (
              <View key={result.timestamp} style={styles.resultRow}>
                <Text style={styles.resultType}>{result.type}</Text>
                <View style={styles.resultStats}>
                  <Text style={styles.resultScore}>
                    {Math.round(result.score)}%
                  </Text>
                  <Text style={styles.resultDuration}>
                    {Math.round(result.duration / 1000)}s
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick stats */}
        {testResults.length >= 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(
                    testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length
                  )}%
                </Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{testResults.length}</Text>
                <Text style={styles.statLabel}>Tests Run</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.max(...testResults.map(r => r.score)).toFixed(0)}%
                </Text>
                <Text style={styles.statLabel}>Best</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  warningBanner: {
    backgroundColor: '#7c2d12',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ea580c',
  },
  warningText: {
    fontSize: 14,
    color: '#fed7aa',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  durationButtonActive: {
    backgroundColor: '#312E81',
    borderColor: '#6366f1',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  durationTextActive: {
    color: '#A5B4FC',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  exerciseCard: {
    backgroundColor: '#1a1f2e',
    borderColor: '#3b4a5a',
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 13,
    color: '#94A3B8',
  },
  playIcon: {
    fontSize: 20,
    color: '#6366f1',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultType: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  resultStats: {
    flexDirection: 'row',
    gap: 12,
  },
  resultScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  resultDuration: {
    fontSize: 14,
    color: '#64748B',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
