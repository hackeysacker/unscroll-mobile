// Heart System mechanics and utilities

import type { HeartState, HeartRefillSlot, HeartTransaction, HeartLossReason, HeartGainReason } from '@/types';
import { generateUUID } from './utils';

// Constants
export const MAX_HEARTS = 5;
export const HEART_REFILL_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
export const PERFECT_STREAK_REQUIREMENT = 3; // 3 perfect challenges in a row earns a heart

// Initialize heart state for a new user
export function initializeHeartState(userId: string): HeartState {
  return {
    userId,
    currentHearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    lastHeartLost: null,
    lastMidnightReset: getMidnightTimestamp(Date.now()),
    heartRefillSlots: [],
    perfectStreakCount: 0,
    totalHeartsLost: 0,
    totalHeartsGained: 0,
  };
}

// Get midnight timestamp for a given time
export function getMidnightTimestamp(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// Check if it's a new day (midnight has passed)
export function isNewDay(lastMidnightReset: number | null, currentTime: number): boolean {
  if (!lastMidnightReset) return true;

  const currentMidnight = getMidnightTimestamp(currentTime);
  return currentMidnight > lastMidnightReset;
}

// Process midnight reset (refill all hearts)
export function processMidnightReset(heartState: HeartState, isPremium: boolean): {
  updatedHeartState: HeartState;
  transaction: HeartTransaction | null;
} {
  const currentTime = Date.now();
  const heartsToAdd = MAX_HEARTS - heartState.currentHearts;

  if (heartsToAdd <= 0) {
    // Already at max hearts
    return {
      updatedHeartState: {
        ...heartState,
        lastMidnightReset: getMidnightTimestamp(currentTime),
        heartRefillSlots: [], // Clear refill slots on reset
      },
      transaction: null,
    };
  }

  const transaction: HeartTransaction = {
    id: generateUUID(),
    userId: heartState.userId,
    timestamp: currentTime,
    type: 'refill',
    amount: heartsToAdd,
    reason: 'midnight_reset',
  };

  return {
    updatedHeartState: {
      ...heartState,
      currentHearts: MAX_HEARTS,
      lastMidnightReset: getMidnightTimestamp(currentTime),
      heartRefillSlots: [], // Clear refill slots on reset
      totalHeartsGained: heartState.totalHeartsGained + heartsToAdd,
    },
    transaction,
  };
}

// Process scheduled heart refills (1 heart every 4 hours)
export function processScheduledRefills(heartState: HeartState, isPremium: boolean): {
  updatedHeartState: HeartState;
  transactions: HeartTransaction[];
} {
  const currentTime = Date.now();
  const transactions: HeartTransaction[] = [];
  let updatedHeartState = { ...heartState };

  // Check if we're at max hearts already
  if (updatedHeartState.currentHearts >= MAX_HEARTS) {
    return { updatedHeartState, transactions };
  }

  // Process any refill slots that are due
  const updatedSlots = updatedHeartState.heartRefillSlots.map(slot => {
    if (!slot.isRefilled && slot.scheduledRefillTime <= currentTime) {
      // This heart is ready to refill
      if (updatedHeartState.currentHearts < MAX_HEARTS) {
        updatedHeartState.currentHearts++;
        updatedHeartState.totalHeartsGained++;

        const transaction: HeartTransaction = {
          id: crypto.randomUUID(),
          userId: heartState.userId,
          timestamp: currentTime,
          type: 'refill',
          amount: 1,
          reason: 'hourly_refill',
        };
        transactions.push(transaction);

        return { ...slot, isRefilled: true };
      }
    }
    return slot;
  });

  // Remove refilled slots
  const activeSlots = updatedSlots.filter(slot => !slot.isRefilled);

  return {
    updatedHeartState: {
      ...updatedHeartState,
      heartRefillSlots: activeSlots,
    },
    transactions,
  };
}

// Lose a heart
export function loseHeart(
  heartState: HeartState,
  reason: HeartLossReason,
  isPremium: boolean,
  challengeId?: string,
  isTestMode = false
): {
  updatedHeartState: HeartState;
  transaction: HeartTransaction | null;
  canContinue: boolean;
} {
  // Don't lose hearts during test mode - tests are practice and shouldn't penalize
  if (isTestMode) {
    return {
      updatedHeartState: heartState,
      transaction: null,
      canContinue: true,
    };
  }

  // Can't lose hearts if already at 0
  if (heartState.currentHearts <= 0) {
    return {
      updatedHeartState: heartState,
      transaction: null,
      canContinue: false,
    };
  }

  const currentTime = Date.now();
  const newHeartCount = heartState.currentHearts - 1;

  // Create a refill slot for 4 hours from now
  const refillSlot: HeartRefillSlot = {
    id: generateUUID(),
    scheduledRefillTime: currentTime + HEART_REFILL_INTERVAL_MS,
    isRefilled: false,
  };

  const transaction: HeartTransaction = {
    id: generateUUID(),
    userId: heartState.userId,
    timestamp: currentTime,
    type: 'loss',
    amount: 1,
    reason,
    challengeId,
  };

  return {
    updatedHeartState: {
      ...heartState,
      currentHearts: newHeartCount,
      lastHeartLost: currentTime,
      heartRefillSlots: [...heartState.heartRefillSlots, refillSlot],
      perfectStreakCount: 0, // Reset perfect streak
      totalHeartsLost: heartState.totalHeartsLost + 1,
    },
    transaction,
    canContinue: newHeartCount > 0,
  };
}

// Gain a heart
export function gainHeart(
  heartState: HeartState,
  reason: HeartGainReason,
  isPremium: boolean,
  challengeId?: string
): {
  updatedHeartState: HeartState;
  transaction: HeartTransaction | null;
} {
  // Can't gain hearts if already at max
  if (heartState.currentHearts >= MAX_HEARTS) {
    return {
      updatedHeartState: heartState,
      transaction: null,
    };
  }

  const currentTime = Date.now();

  const transaction: HeartTransaction = {
    id: generateUUID(),
    userId: heartState.userId,
    timestamp: currentTime,
    type: 'gain',
    amount: 1,
    reason,
    challengeId,
  };

  // Remove the oldest refill slot if we're gaining a heart early
  const updatedSlots = heartState.heartRefillSlots.slice(1);

  return {
    updatedHeartState: {
      ...heartState,
      currentHearts: heartState.currentHearts + 1,
      heartRefillSlots: updatedSlots,
      totalHeartsGained: heartState.totalHeartsGained + 1,
    },
    transaction,
  };
}

// Increment perfect streak and check if heart should be awarded
export function incrementPerfectStreak(heartState: HeartState, isPremium: boolean): {
  updatedHeartState: HeartState;
  shouldAwardHeart: boolean;
} {
  const newStreakCount = heartState.perfectStreakCount + 1;

  // Check if we hit the streak requirement
  const shouldAwardHeart = newStreakCount >= PERFECT_STREAK_REQUIREMENT && heartState.currentHearts < MAX_HEARTS && !isPremium;

  return {
    updatedHeartState: {
      ...heartState,
      perfectStreakCount: shouldAwardHeart ? 0 : newStreakCount, // Reset if awarded
    },
    shouldAwardHeart,
  };
}

// Get time until next heart refill
export function getTimeUntilNextRefill(heartState: HeartState, isPremium: boolean): number | null {
  if (heartState.currentHearts >= MAX_HEARTS) {
    return null;
  }

  const currentTime = Date.now();
  const nextRefillSlot = heartState.heartRefillSlots
    .filter(slot => !slot.isRefilled)
    .sort((a, b) => a.scheduledRefillTime - b.scheduledRefillTime)[0];

  if (!nextRefillSlot) {
    return null;
  }

  const timeRemaining = nextRefillSlot.scheduledRefillTime - currentTime;
  return Math.max(0, timeRemaining);
}

// Format time remaining as human-readable string
export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Check if user can start a challenge
export function canStartChallenge(heartState: HeartState, isPremium: boolean, isDifficult: boolean): {
  canStart: boolean;
  reason?: string;
} {
  // Need at least 1 heart for any challenge
  if (heartState.currentHearts <= 0) {
    return {
      canStart: false,
      reason: 'You lost focus today. Come back when your mind resets.',
    };
  }

  // For difficult challenges (tests), might need more hearts
  // Currently allowing all challenges with 1+ hearts
  return { canStart: true };
}

// Get hearts display for premium users
export function getPremiumHeartsDisplay(): string {
  return '∞'; // Infinity symbol for unlimited hearts
}
