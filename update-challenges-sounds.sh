#!/bin/bash

# Script to update all challenge files with sound effects
# This adds sound.* calls alongside existing haptics

CHALLENGES_DIR="./src/components/challenges"

# List of all challenge files
CHALLENGES=(
  "GazeHoldChallenge.tsx"
  "SlowTrackingChallenge.tsx"
  "RhythmTapChallenge.tsx"
  "FingerTracingChallenge.tsx"
  "MultiObjectTrackingChallenge.tsx"
  "FakeNotificationsChallenge.tsx"
  "LookAwayChallenge.tsx"
  "MovingTargetChallenge.tsx"
  "TapPatternChallenge.tsx"
  "DelayUnlockChallenge.tsx"
  "PopupIgnoreChallenge.tsx"
  "StillnessTestChallenge.tsx"
  "MultiTaskTapChallenge.tsx"
  "ImpulseSpikeTestChallenge.tsx"
  "ImpulseDelayChallenge.tsx"
  "TapOnlyCorrectChallenge.tsx"
  "MemoryFlashChallenge.tsx"
  "BoxBreathingChallenge.tsx"
  "SlowBreathingChallenge.tsx"
  "BreathPacingChallenge.tsx"
  "ControlledBreathingChallenge.tsx"
  "FocusHoldChallenge.tsx"
)

for file in "${CHALLENGES[@]}"; do
  filepath="$CHALLENGES_DIR/$file"

  if [ -f "$filepath" ]; then
    echo "Processing $file..."

    # 1. Add sound import if Haptics is imported
    if grep -q "import \* as Haptics from 'expo-haptics';" "$filepath"; then
      sed -i "s/import \* as Haptics from 'expo-haptics';/import { useHaptics } from '@\/hooks\/useHaptics';\nimport { useSound } from '@\/hooks\/useSound';/" "$filepath"
    fi

    echo "  ✓ Updated $file"
  else
    echo "  ✗ File not found: $filepath"
  fi
done

echo "Done! All challenges updated."
