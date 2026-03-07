import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { getAvailableChallenges, getChallengeDifficultyConfig, type ChallengeDifficultyConfig } from '@/lib/game-mechanics';
import { FocusHoldChallenge } from './challenges/FocusHoldChallenge';
import { FingerHoldChallenge } from './challenges/FingerHoldChallenge';
import { SlowTrackingChallenge } from './challenges/SlowTrackingChallenge';
import { BreathPacingChallenge } from './challenges/BreathPacingChallenge';
import { TapOnlyCorrectChallenge } from './challenges/TapOnlyCorrectChallenge';
import { FakeNotificationsChallenge } from './challenges/FakeNotificationsChallenge';
import { MemoryFlashChallenge } from './challenges/MemoryFlashChallenge';
import { ReactionInhibitionChallenge } from './challenges/ReactionInhibitionChallenge';
import { DelayUnlockChallenge } from './challenges/DelayUnlockChallenge';
import { RhythmTapChallenge } from './challenges/RhythmTapChallenge';
import { StillnessTestChallenge } from './challenges/StillnessTestChallenge';
import { MultiObjectTrackingChallenge } from './challenges/MultiObjectTrackingChallenge';
import { FingerTracingChallenge } from './challenges/FingerTracingChallenge';
import { PopupIgnoreChallenge } from './challenges/PopupIgnoreChallenge';
import { ControlledBreathingChallenge } from './challenges/ControlledBreathingChallenge';
import { MultiTaskTapChallenge } from './challenges/MultiTaskTapChallenge';
import { ImpulseSpikeTestChallenge } from './challenges/ImpulseSpikeTestChallenge';
import { GazeHoldChallenge } from './challenges/GazeHoldChallenge';
import { MovingTargetChallenge } from './challenges/MovingTargetChallenge';
import { TapPatternChallenge } from './challenges/TapPatternChallenge';
import { LookAwayChallenge } from './challenges/LookAwayChallenge';
import { AntiScrollSwipeChallenge } from './challenges/AntiScrollSwipeChallenge';
import { ResetChallenge } from './challenges/ResetChallenge';
import type { ChallengeType } from '@/types';

interface ChallengePlayerProps {
  onBack: () => void;
  preSelectedChallenge?: ChallengeType | null;
  isTest?: boolean;
  testSequence?: ChallengeType[];
  testLevel?: number;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  onChallengeComplete?: (score: number, duration: number) => void;
}

export function ChallengePlayer({
  onBack,
  preSelectedChallenge,
  isTest,
  testSequence,
  testLevel,
  onNextLesson,
  hasNextLesson,
  onChallengeComplete,
}: ChallengePlayerProps) {
  const { progress, todaySession, completeChallenge, completeSession } = useGame();
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeType | null>(preSelectedChallenge || null);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [showTestMode, setShowTestMode] = useState<boolean>(!!isTest && !!testSequence && testSequence.length > 0);
  const [testIndex, setTestIndex] = useState<number>(0);

  useEffect(() => {
    if (todaySession) {
      setChallengesCompleted(todaySession.challenges.length);
    }
  }, [todaySession]);

  // Initialize first test challenge outside of render to avoid state changes during render
  useEffect(() => {
    if (currentChallenge === null && showTestMode && testSequence && testSequence.length > 0) {
      setCurrentChallenge(testSequence[0]);
      setTestIndex(0);
    }
  }, [currentChallenge, showTestMode, testSequence]);

  // Prevent navigation loop - use ref to track if we've already navigated
  const hasNavigatedRef = useRef(false);

  if (!progress) {
    return (
      <View style={styles.loadingContainer} accessibilityLabel="Loading challenge">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText} accessibilityLabel="Loading">Loading...</Text>
      </View>
    );
  }

  const handleChallengeComplete = async (score: number, duration: number) => {
    if (!currentChallenge || hasNavigatedRef.current) return;

    await completeChallenge(currentChallenge, score, duration);
    setChallengesCompleted((prev) => prev + 1);

    // Check if session is complete
    if (challengesCompleted + 1 >= 3) {
      await completeSession();
    }

    // Test mode: advance through sequence instead of exiting
    if (showTestMode && testSequence && testIndex < testSequence.length - 1) {
      const nextIndex = testIndex + 1;
      setTestIndex(nextIndex);
      setCurrentChallenge(testSequence[nextIndex]);
      return;
    }

    // Call onChallengeComplete if provided, otherwise go back
    if (onChallengeComplete) {
      hasNavigatedRef.current = true;
      onChallengeComplete(score, duration);
    } else {
      hasNavigatedRef.current = true;
      onBack();
    }
  };

  // If no challenge is selected, go back (but only once)
  useEffect(() => {
    if (currentChallenge === null && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      // Use setTimeout to avoid calling onBack during render
      setTimeout(() => {
        onBack();
      }, 0);
    }
  }, [currentChallenge, onBack]);

  // Get difficulty configuration based on current level
  const currentLevel = testLevel || progress?.level || 1;
  const difficultyConfig = getChallengeDifficultyConfig(currentLevel);

  // Get challenge duration based on type and difficulty level
  const getChallengeDuration = (type: ChallengeType): number => {
    // Use the difficulty config for durations
    // Each challenge type maps to specific config properties
    switch (type) {
      case 'focus_hold':
      case 'finger_hold':
      case 'gaze_hold':
      case 'stability_hold':
        return difficultyConfig.holdDuration;

      case 'slow_tracking':
      case 'moving_target':
        return Math.round(difficultyConfig.holdDuration * 0.8);

      case 'memory_flash':
        return Math.round(difficultyConfig.itemsToRemember * 3 + 5);

      case 'tap_only_correct':
      case 'reaction_inhibition':
        return Math.round(difficultyConfig.targetCount * difficultyConfig.timePerTarget);

      case 'breath_pacing':
      case 'controlled_breathing':
        return Math.round(difficultyConfig.breathCycle * 3);

      case 'fake_notifications':
      case 'popup_ignore':
        return Math.round(difficultyConfig.notificationCount * 2);

      case 'delay_unlock':
        return difficultyConfig.delayDuration;

      case 'multi_object_tracking':
        return Math.round(difficultyConfig.holdDuration * 0.7);

      case 'rhythm_tap':
        return Math.round((60 / difficultyConfig.tempo) * difficultyConfig.patternLength * 2);

      case 'stillness_test':
        return difficultyConfig.stillnessDuration;

      case 'impulse_spike_test':
        return Math.round(difficultyConfig.notificationCount * 1.5);

      case 'finger_tracing':
        return Math.round(difficultyConfig.pathLength / 20);

      case 'multi_task_tap':
        return Math.round(difficultyConfig.simultaneousTargets * 5);

      // Legacy challenges
      case 'tap_pattern':
        return Math.round(difficultyConfig.patternLength * 3);

      case 'distraction_resistance':
      case 'audio_focus':
        return Math.round(difficultyConfig.notificationCount * 2);

      case 'impulse_delay':
        return difficultyConfig.delayDuration;

      case 'look_away':
        return Math.round(difficultyConfig.stillnessDuration * 0.6);

      case 'anti_scroll_swipe':
        return Math.round(difficultyConfig.notificationCount * 1.5);

      case 'reset':
        return Math.round(difficultyConfig.holdDuration * 3);

      default:
        return difficultyConfig.holdDuration;
    }
  };

  // Render challenge based on type
  const renderChallenge = () => {
    if (!currentChallenge) return null;
    
    const challengeDuration = getChallengeDuration(currentChallenge);

    // Common props for all challenges
    const commonProps = {
      duration: challengeDuration,
      onComplete: handleChallengeComplete,
      onBack,
      onNextLesson,
      hasNextLesson,
      level: currentLevel,
    };

    switch (currentChallenge) {
      case 'focus_hold':
        return <FocusHoldChallenge {...commonProps} />;
      case 'finger_hold':
        return <FingerHoldChallenge {...commonProps} />;
      case 'slow_tracking':
        return <SlowTrackingChallenge {...commonProps} />;
      case 'breath_pacing':
        return <BreathPacingChallenge {...commonProps} />;
      case 'tap_only_correct':
        return <TapOnlyCorrectChallenge {...commonProps} />;
      case 'fake_notifications':
        return <FakeNotificationsChallenge {...commonProps} />;
      case 'memory_flash':
        return <MemoryFlashChallenge {...commonProps} />;
      case 'reaction_inhibition':
        return <ReactionInhibitionChallenge {...commonProps} />;
      case 'delay_unlock':
        return <DelayUnlockChallenge {...commonProps} />;
      case 'rhythm_tap':
        return <RhythmTapChallenge {...commonProps} />;
      case 'stillness_test':
        return <StillnessTestChallenge {...commonProps} />;
      case 'multi_object_tracking':
        return <MultiObjectTrackingChallenge {...commonProps} />;
      case 'finger_tracing':
        return <FingerTracingChallenge {...commonProps} />;
      case 'popup_ignore':
        return <PopupIgnoreChallenge {...commonProps} />;
      case 'controlled_breathing':
        return <ControlledBreathingChallenge {...commonProps} />;
      case 'multi_task_tap':
        return <MultiTaskTapChallenge {...commonProps} />;
      case 'impulse_spike_test':
        return <ImpulseSpikeTestChallenge {...commonProps} />;
      case 'gaze_hold':
        return <GazeHoldChallenge {...commonProps} />;
      case 'moving_target':
        return <MovingTargetChallenge {...commonProps} />;
      case 'tap_pattern':
        return <TapPatternChallenge {...commonProps} />;
      case 'look_away':
        return <LookAwayChallenge {...commonProps} />;
      case 'anti_scroll_swipe':
        return <AntiScrollSwipeChallenge {...commonProps} />;
      case 'reset':
        return <ResetChallenge {...commonProps} />;
      default:
        // Fallback to FocusHoldChallenge for unimplemented challenges
        return <FocusHoldChallenge {...commonProps} />;
    }
  };

  if (currentChallenge === null) {
    return (
      <View style={styles.loadingContainer} accessibilityLabel="Preparing challenge">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText} accessibilityLabel="Preparing">Preparing challenge...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityLabel={`Playing ${currentChallenge} challenge`} accessibilityRole="none">
      {renderChallenge()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
  },
  loadingText: {
    marginTop: 16,
    color: '#9ca3af',
    fontSize: 16,
  },
});

