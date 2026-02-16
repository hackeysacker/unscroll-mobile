/**
 * Unlock State Management
 *
 * Manages the state machine for app blocking/unblocking:
 * - blocked (default)
 * - in_challenge (user attempting to unlock)
 * - unlocked (temporary window active)
 * - re_block_pending (window expiring)
 * - permissions_revoked (needs setup)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChallengeType, IntensityLevel } from './challenge-engine';

export type UnlockState =
  | 'blocked'
  | 'in_challenge'
  | 'unlocked'
  | 're_block_pending'
  | 'permissions_revoked';

export interface UnlockConfig {
  blockedApps: string[]; // Bundle IDs
  intensity: IntensityLevel;
  unlockWindowDuration: number; // seconds (120-300)
  extremeModeEnabled: boolean;
  autoReshield: boolean;
}

export interface UnlockSession {
  state: UnlockState;
  currentChallenge: ChallengeType | null;
  unlockEndsAt: number | null; // timestamp
  targetApp: string | null; // which app user is trying to open
  attemptHistory: ChallengeAttempt[];
}

export interface ChallengeAttempt {
  challengeType: ChallengeType;
  timestamp: number;
  success: boolean;
  duration: number; // actual time taken
}

const STORAGE_KEYS = {
  CONFIG: '@unlock_config',
  SESSION: '@unlock_session',
  ATTEMPT_HISTORY: '@unlock_attempt_history',
};

/**
 * Load unlock configuration from storage
 */
export async function loadUnlockConfig(): Promise<UnlockConfig> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    console.error('Failed to load unlock config:', error);
  }

  // Default config
  return {
    blockedApps: [],
    intensity: 'normal',
    unlockWindowDuration: 180, // 3 minutes default
    extremeModeEnabled: false,
    autoReshield: true,
  };
}

/**
 * Save unlock configuration
 */
export async function saveUnlockConfig(config: UnlockConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save unlock config:', error);
  }
}

/**
 * Load current unlock session
 */
export async function loadUnlockSession(): Promise<UnlockSession> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    console.error('Failed to load unlock session:', error);
  }

  // Default session - blocked state
  return {
    state: 'blocked',
    currentChallenge: null,
    unlockEndsAt: null,
    targetApp: null,
    attemptHistory: [],
  };
}

/**
 * Save unlock session
 */
export async function saveUnlockSession(session: UnlockSession): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save unlock session:', error);
  }
}

/**
 * Get attempt count in last N minutes
 */
export function getRecentAttemptCount(attempts: ChallengeAttempt[], minutes: number = 30): number {
  const cutoff = Date.now() - (minutes * 60 * 1000);
  return attempts.filter(a => a.timestamp >= cutoff).length;
}

/**
 * Get last N challenge types
 */
export function getLastChallengeTypes(attempts: ChallengeAttempt[], count: number = 3): ChallengeType[] {
  return attempts
    .slice(-count)
    .map(a => a.challengeType);
}

/**
 * Add attempt to history
 */
export async function addChallengeAttempt(attempt: ChallengeAttempt): Promise<void> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.ATTEMPT_HISTORY);
    let history: ChallengeAttempt[] = json ? JSON.parse(json) : [];

    // Add new attempt
    history.push(attempt);

    // Keep only last 50 attempts (prevent unlimited growth)
    if (history.length > 50) {
      history = history.slice(-50);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.ATTEMPT_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to add challenge attempt:', error);
  }
}

/**
 * Load full attempt history
 */
export async function loadAttemptHistory(): Promise<ChallengeAttempt[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.ATTEMPT_HISTORY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    console.error('Failed to load attempt history:', error);
  }
  return [];
}

/**
 * Clear attempt history (for testing or reset)
 */
export async function clearAttemptHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ATTEMPT_HISTORY);
  } catch (error) {
    console.error('Failed to clear attempt history:', error);
  }
}

/**
 * Check if unlock window has expired
 */
export function isUnlockExpired(session: UnlockSession): boolean {
  if (!session.unlockEndsAt) return true;
  return Date.now() >= session.unlockEndsAt;
}

/**
 * Get remaining unlock time in seconds
 */
export function getRemainingUnlockTime(session: UnlockSession): number {
  if (!session.unlockEndsAt) return 0;
  const remaining = Math.max(0, session.unlockEndsAt - Date.now());
  return Math.round(remaining / 1000);
}

/**
 * Transition to challenge state
 */
export async function startChallenge(challengeType: ChallengeType, targetApp?: string): Promise<UnlockSession> {
  const session = await loadUnlockSession();

  const newSession: UnlockSession = {
    ...session,
    state: 'in_challenge',
    currentChallenge: challengeType,
    targetApp: targetApp || null,
  };

  await saveUnlockSession(newSession);
  return newSession;
}

/**
 * Complete challenge successfully - transition to unlocked
 */
export async function completeChallenge(duration: number): Promise<UnlockSession> {
  const session = await loadUnlockSession();
  const config = await loadUnlockConfig();

  if (!session.currentChallenge) {
    throw new Error('No active challenge');
  }

  // Record attempt
  await addChallengeAttempt({
    challengeType: session.currentChallenge,
    timestamp: Date.now(),
    success: true,
    duration,
  });

  // Transition to unlocked state
  const unlockEndsAt = Date.now() + (config.unlockWindowDuration * 1000);

  const newSession: UnlockSession = {
    ...session,
    state: 'unlocked',
    currentChallenge: null,
    unlockEndsAt,
  };

  await saveUnlockSession(newSession);
  return newSession;
}

/**
 * Fail challenge - remain blocked
 */
export async function failChallenge(duration: number): Promise<UnlockSession> {
  const session = await loadUnlockSession();

  if (session.currentChallenge) {
    // Record attempt
    await addChallengeAttempt({
      challengeType: session.currentChallenge,
      timestamp: Date.now(),
      success: false,
      duration,
    });
  }

  // Transition back to blocked
  const newSession: UnlockSession = {
    ...session,
    state: 'blocked',
    currentChallenge: null,
  };

  await saveUnlockSession(newSession);
  return newSession;
}

/**
 * Cancel challenge - remain blocked
 */
export async function cancelChallenge(): Promise<UnlockSession> {
  const session = await loadUnlockSession();

  const newSession: UnlockSession = {
    ...session,
    state: 'blocked',
    currentChallenge: null,
  };

  await saveUnlockSession(newSession);
  return newSession;
}

/**
 * Expire unlock window - transition to blocked
 */
export async function expireUnlock(): Promise<UnlockSession> {
  const session = await loadUnlockSession();

  const newSession: UnlockSession = {
    ...session,
    state: 'blocked',
    unlockEndsAt: null,
    targetApp: null,
  };

  await saveUnlockSession(newSession);
  return newSession;
}

/**
 * Reset to initial blocked state
 */
export async function resetUnlockState(): Promise<UnlockSession> {
  const newSession: UnlockSession = {
    state: 'blocked',
    currentChallenge: null,
    unlockEndsAt: null,
    targetApp: null,
    attemptHistory: [],
  };

  await saveUnlockSession(newSession);
  return newSession;
}
