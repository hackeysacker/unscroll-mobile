/**
 * Exercise Router
 *
 * Routes to the appropriate exercise component based on exercise type
 */

import React from 'react';
import { ExerciseType } from '@/lib/exercise-types';
import { SlowBreathingExercise } from './SlowBreathingExercise';
import { BoxBreathingExercise } from './BoxBreathingExercise';
import { FiveSensesExercise } from './FiveSensesExercise';
import { ThoughtReframeExercise } from './ThoughtReframeExercise';
import { MicroJournalExercise } from './MicroJournalExercise';
import { BodyScanExercise } from './BodyScanExercise';
import { DopaminePauseExercise } from './DopaminePauseExercise';
import { PositiveSelfTalkExercise } from './PositiveSelfTalkExercise';
import { FocusSprintExercise } from './FocusSprintExercise';
import { DistractionLogExercise } from './DistractionLogExercise';
import { CalmVisualExercise } from './CalmVisualExercise';
import { ValueCheckExercise } from './ValueCheckExercise';
import { MentalResetExercise } from './MentalResetExercise';
import { UrgeSurfingExercise } from './UrgeSurfingExercise';
import { MoodNamingExercise } from './MoodNamingExercise';
import { PositiveActionExercise } from './PositiveActionExercise';
import { SelfInquiryExercise } from './SelfInquiryExercise';
import { VisionMomentExercise } from './VisionMomentExercise';
import { MiniGratitudeExercise } from './MiniGratitudeExercise';
import { IntentSettingExercise } from './IntentSettingExercise';
import { EgoDetachExercise } from './EgoDetachExercise';
import { BodyReleaseExercise } from './BodyReleaseExercise';
import { TenSecondReflectionExercise } from './TenSecondReflectionExercise';
import { CompulsionDetectorExercise } from './CompulsionDetectorExercise';
import { InnerMentorExercise } from './InnerMentorExercise';

interface ExerciseRouterProps {
  exerciseType: ExerciseType;
  onComplete: (result: { completed: boolean; duration: number; score?: number }) => void;
  onBack: () => void;
}

export function ExerciseRouter({ exerciseType, onComplete, onBack }: ExerciseRouterProps) {
  switch (exerciseType) {
    case 'slow_breathing':
      return <SlowBreathingExercise onComplete={onComplete} onBack={onBack} />;
    case 'box_breathing':
      return <BoxBreathingExercise onComplete={onComplete} onBack={onBack} />;
    case 'five_senses':
      return <FiveSensesExercise onComplete={onComplete} onBack={onBack} />;
    case 'thought_reframe':
      return <ThoughtReframeExercise onComplete={onComplete} onBack={onBack} />;
    case 'micro_journal':
      return <MicroJournalExercise onComplete={onComplete} onBack={onBack} />;
    case 'body_scan':
      return <BodyScanExercise onComplete={onComplete} onBack={onBack} />;
    case 'dopamine_pause':
      return <DopaminePauseExercise onComplete={onComplete} onBack={onBack} />;
    case 'positive_self_talk':
      return <PositiveSelfTalkExercise onComplete={onComplete} onBack={onBack} />;
    case 'focus_sprint':
      return <FocusSprintExercise onComplete={onComplete} onBack={onBack} />;
    case 'distraction_log':
      return <DistractionLogExercise onComplete={onComplete} onBack={onBack} />;
    case 'calm_visual':
      return <CalmVisualExercise onComplete={onComplete} onBack={onBack} />;
    case 'value_check':
      return <ValueCheckExercise onComplete={onComplete} onBack={onBack} />;
    case 'mental_reset':
      return <MentalResetExercise onComplete={onComplete} onBack={onBack} />;
    case 'urge_surfing':
      return <UrgeSurfingExercise onComplete={onComplete} onBack={onBack} />;
    case 'mood_naming':
      return <MoodNamingExercise onComplete={onComplete} onBack={onBack} />;
    case 'positive_action':
      return <PositiveActionExercise onComplete={onComplete} onBack={onBack} />;
    case 'self_inquiry':
      return <SelfInquiryExercise onComplete={onComplete} onBack={onBack} />;
    case 'vision_moment':
      return <VisionMomentExercise onComplete={onComplete} onBack={onBack} />;
    case 'mini_gratitude':
      return <MiniGratitudeExercise onComplete={onComplete} onBack={onBack} />;
    case 'intent_setting':
      return <IntentSettingExercise onComplete={onComplete} onBack={onBack} />;
    case 'ego_detach':
      return <EgoDetachExercise onComplete={onComplete} onBack={onBack} />;
    case 'body_release':
      return <BodyReleaseExercise onComplete={onComplete} onBack={onBack} />;
    case 'ten_second_reflection':
      return <TenSecondReflectionExercise onComplete={onComplete} onBack={onBack} />;
    case 'compulsion_detector':
      return <CompulsionDetectorExercise onComplete={onComplete} onBack={onBack} />;
    case 'inner_mentor':
      return <InnerMentorExercise onComplete={onComplete} onBack={onBack} />;
    default:
      return <SlowBreathingExercise onComplete={onComplete} onBack={onBack} />;
  }
}
