/**
 * Unlock Challenge Screen - Viral Real-World Challenges
 *
 * Main screen for the unlock flow:
 * 1. Shows current unlock state
 * 2. Presents challenge when user wants to unlock
 * 3. Shows unlock window timer
 * 4. Handles challenge completion/failure
 *
 * Keep UI minimal - single card challenge screen
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import FocusShield from '../modules/FocusShield';
import { selectChallenge, getTimeSegment, type ChallengeType } from '../lib/challenge-engine';
import {
  loadUnlockSession,
  loadUnlockConfig,
  loadAttemptHistory,
  startChallenge,
  completeChallenge,
  failChallenge,
  cancelChallenge,
  expireUnlock,
  getRemainingUnlockTime,
  getRecentAttemptCount,
  getLastChallengeTypes,
  type UnlockState,
} from '../lib/unlock-state';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UnlockChallengeScreenProps {
  onBack: () => void;
  onSettings: () => void; // Small gear icon
}

export function UnlockChallengeScreen({ onBack, onSettings }: UnlockChallengeScreenProps) {
  const insets = useSafeAreaInsets();

  // State
  const [unlockState, setUnlockState] = useState<UnlockState>('blocked');
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeType | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [challengeDuration, setChallengeDuration] = useState(15);

  // Timer for unlock window countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial state
  useEffect(() => {
    loadInitialState();
  }, []);

  // Update unlock window timer
  useEffect(() => {
    if (unlockState === 'unlocked') {
      timerRef.current = setInterval(() => {
        updateUnlockTimer();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [unlockState]);

  async function loadInitialState() {
    const session = await loadUnlockSession();
    setUnlockState(session.state);
    setCurrentChallenge(session.currentChallenge);

    if (session.state === 'unlocked') {
      const remaining = getRemainingUnlockTime(session);
      setRemainingTime(remaining);
    }
  }

  async function updateUnlockTimer() {
    const session = await loadUnlockSession();
    const remaining = getRemainingUnlockTime(session);

    if (remaining <= 0) {
      // Window expired - re-block
      await handleUnlockExpired();
    } else {
      setRemainingTime(remaining);
    }
  }

  async function handleUnlockExpired() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Re-shield apps
    const config = await loadUnlockConfig();
    if (config.autoReshield && config.blockedApps.length > 0) {
      await FocusShield.reshield({
        blockedApps: config.blockedApps,
      });
    }

    // Update state
    await expireUnlock();
    setUnlockState('blocked');
    setRemainingTime(0);

    Alert.alert('Locked', 'Apps are blocked again.');
  }

  async function handleRequestUnlock() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get context for challenge selection
    const config = await loadUnlockConfig();
    const history = await loadAttemptHistory();
    const attemptCount = getRecentAttemptCount(history, 30);
    const lastChallenges = getLastChallengeTypes(history, 3);
    const timeSegment = getTimeSegment();

    // Select challenge
    const challengeConfig = selectChallenge({
      attemptCount,
      lastChallenges,
      intensity: config.intensity,
      timeSegment,
      availablePermissions: ['MOTION'], // TODO: Check actual permissions
      extremeModeEnabled: config.extremeModeEnabled,
    });

    setCurrentChallenge(challengeConfig.type);
    setChallengeDuration(challengeConfig.duration);

    // Transition to challenge state
    await startChallenge(challengeConfig.type);
    setUnlockState('in_challenge');
  }

  async function handleChallengeComplete() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Complete challenge
    await completeChallenge(challengeDuration);

    // Unshield apps
    const config = await loadUnlockConfig();
    if (config.blockedApps.length > 0) {
      await FocusShield.temporarilyUnshield(config.blockedApps, config.unlockWindowDuration);
    }

    // Update state
    setUnlockState('unlocked');
    setCurrentChallenge(null);
    setRemainingTime(config.unlockWindowDuration);

    Alert.alert('Unlocked', `Apps available for ${config.unlockWindowDuration / 60} minutes.`);
  }

  async function handleChallengeFail() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    // Fail challenge
    await failChallenge(challengeDuration);

    // Back to blocked
    setUnlockState('blocked');
    setCurrentChallenge(null);

    Alert.alert('Failed', 'Challenge not completed. Apps remain blocked.');
  }

  async function handleChallengeCancel() {
    await Haptics.selectionAsync();

    // Cancel challenge
    await cancelChallenge();

    // Back to blocked
    setUnlockState('blocked');
    setCurrentChallenge(null);
  }

  // Render different UI based on state
  if (unlockState === 'in_challenge' && currentChallenge) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A1A1A', '#0F0F0F']}
          style={StyleSheet.absoluteFill}
        />

        {/* Challenge Card */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>Before scrolling</Text>

          <Text style={styles.challengeInstruction}>
            {getChallengeInstruction(currentChallenge)}
          </Text>

          <Text style={styles.challengeDuration}>{challengeDuration}s</Text>

          {/* TODO: Render actual challenge component here */}
          {/* For MVP, just show "Wait" challenge */}
          <WaitChallengeSimple
            duration={challengeDuration}
            onComplete={handleChallengeComplete}
            onFail={handleChallengeFail}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleChallengeCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (unlockState === 'unlocked') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F4C35', '#0A2F21']}
          style={StyleSheet.absoluteFill}
        />

        {/* Unlocked State */}
        <View style={styles.unlockedCard}>
          <Text style={styles.unlockedTitle}>Unlocked</Text>
          <Text style={styles.unlockedSubtitle}>Apps available</Text>

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
          </View>

          <Text style={styles.timerLabel}>remaining</Text>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Blocked state (default)
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2D1B1B', '#1A0F0F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Settings Icon */}
      <TouchableOpacity style={styles.settingsButton} onPress={onSettings}>
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      {/* Blocked State */}
      <View style={styles.blockedCard}>
        <Text style={styles.blockedIcon}>🔒</Text>
        <Text style={styles.blockedTitle}>Apps Blocked</Text>
        <Text style={styles.blockedSubtitle}>Complete a challenge to unlock</Text>

        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleRequestUnlock}
        >
          <Text style={styles.unlockButtonText}>Unlock</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Simple Wait Challenge (MVP)
 * Just a countdown timer that fails if touched
 */
function WaitChallengeSimple({
  duration,
  onComplete,
  onFail
}: {
  duration: number;
  onComplete: () => void;
  onFail: () => void;
}) {
  const [remaining, setRemaining] = useState(duration);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    if (touched) {
      setRemaining(duration);
      setTouched(false);
      onFail();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining(r => r - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining, touched]);

  return (
    <TouchableOpacity
      style={styles.waitChallenge}
      onPress={() => setTouched(true)}
      activeOpacity={1}
    >
      <Text style={styles.waitText}>Do not touch</Text>
      <Text style={styles.waitTimer}>{remaining}s</Text>
    </TouchableOpacity>
  );
}

// Helper functions
function getChallengeInstruction(type: ChallengeType): string {
  const instructions = {
    face_down: 'Put your phone face down. 30 seconds.',
    hold_still: 'Hold your phone still. 20 seconds.',
    wait: 'Do nothing. 15 seconds. Do not touch.',
    say_it: 'Say why you're opening this app.',
    stand_up: 'Stand up. Stay upright for 15 seconds.',
    walk: 'Walk 20 steps.',
    lights_on: 'Turn the lights on.',
    leave_room: 'Leave the room. Move for 20 seconds.',
    step_outside: 'Step outside.',
  };
  return instructions[type] || 'Complete the challenge.';
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  // Blocked state
  blockedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
  },
  blockedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  blockedTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  blockedSubtitle: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 32,
  },
  unlockButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  unlockButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // Challenge state
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AAA',
    marginBottom: 16,
  },
  challengeInstruction: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  challengeDuration: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6366F1',
    marginBottom: 32,
  },
  waitChallenge: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  waitText: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 12,
  },
  waitTimer: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFF',
  },
  cancelButton: {
    marginTop: 24,
    padding: 12,
  },
  cancelText: {
    color: '#AAA',
    fontSize: 16,
  },
  // Unlocked state
  unlockedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  unlockedTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  unlockedSubtitle: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 32,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 4,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
  },
  timerLabel: {
    fontSize: 14,
    color: '#AAA',
  },
  // Common
  backButton: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  backText: {
    color: '#AAA',
    fontSize: 16,
  },
});
