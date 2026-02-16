/**
 * Activity Player - Unified player for both challenges and exercises
 *
 * Routes to either ChallengePlayer or ExerciseRouter based on activity type
 */

import { ChallengePlayer } from './ChallengePlayer';
import { ExerciseRouter } from './exercises/ExerciseRouter';
import type { ChallengeType } from '@/types';
import type { ExerciseType } from '@/lib/exercise-types';

// Helper to determine if activity is an exercise
const EXERCISE_TYPES: ExerciseType[] = [
  'slow_breathing',
  'box_breathing',
  'five_senses',
  'thought_reframe',
  'micro_journal',
  'body_scan',
  'dopamine_pause',
  'positive_self_talk',
  'focus_sprint',
  'distraction_log',
  'calm_visual',
  'value_check',
  'mental_reset',
  'urge_surfing',
  'mood_naming',
  'positive_action',
  'self_inquiry',
  'vision_moment',
  'mini_gratitude',
  'intent_setting',
  'ego_detach',
  'body_release',
  'ten_second_reflection',
  'compulsion_detector',
  'inner_mentor',
];

function isExerciseType(type: string): type is ExerciseType {
  return EXERCISE_TYPES.includes(type as ExerciseType);
}

interface ActivityPlayerProps {
  onBack: () => void;
  activityType: ChallengeType | ExerciseType;
  isTest?: boolean;
  testSequence?: (ChallengeType | ExerciseType)[];
  testLevel?: number;
  fixedLevel?: number; // For practices, use a fixed level for consistent durations
  onActivityComplete?: (score: number, duration: number) => void;
}

export function ActivityPlayer({
  onBack,
  activityType,
  isTest,
  testSequence,
  testLevel,
  fixedLevel,
  onActivityComplete,
}: ActivityPlayerProps) {
  // If it's an exercise, use ExerciseRouter
  if (isExerciseType(activityType)) {
    return (
      <ExerciseRouter
        exerciseType={activityType}
        onComplete={(result) => {
          // Exercise complete - convert to challenge-like completion
          if (onActivityComplete) {
            onActivityComplete(result.score || 100, result.duration);
          } else {
            onBack();
          }
        }}
        onBack={onBack}
      />
    );
  }

  // Otherwise, use ChallengePlayer for challenges
  // Use fixedLevel if provided (for practices), otherwise use testLevel
  return (
    <ChallengePlayer
      onBack={onBack}
      preSelectedChallenge={activityType as ChallengeType}
      isTest={isTest}
      testSequence={testSequence as ChallengeType[]}
      testLevel={fixedLevel || testLevel}
      onChallengeComplete={onActivityComplete}
    />
  );
}
