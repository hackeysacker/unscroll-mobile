/**
 * Daily Login Rewards System
 *
 * Provides daily login bonuses to reward consistent engagement.
 * Streak-based multipliers encourage daily app usage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage';

// ============================================
// TYPES
// ============================================

export interface DailyLoginReward {
  day: number; // 1-7
  gems: number;
  xp: number;
  isBonus: boolean;
  description: string;
}

export interface DailyLoginState {
  lastLoginDate: string; // ISO date string (YYYY-MM-DD)
  currentStreak: number; // consecutive days
  totalClaimed: number; // total rewards ever claimed
  canClaimToday: boolean;
}

// ============================================
// REWARD TABLE (7-day cycle)
// ============================================

const DAILY_REWARDS: DailyLoginReward[] = [
  { day: 1, gems: 5, xp: 50, isBonus: false, description: 'Welcome Back!' },
  { day: 2, gems: 8, xp: 75, isBonus: false, description: 'Keep Going!' },
  { day: 3, gems: 12, xp: 100, isBonus: false, description: 'On Fire!' },
  { day: 4, gems: 15, xp: 125, isBonus: false, description: 'Building Habit!' },
  { day: 5, gems: 20, xp: 150, isBonus: false, description: 'Almost There!' },
  { day: 6, gems: 25, xp: 175, isBonus: false, description: 'So Close!' },
  { day: 7, gems: 50, xp: 300, isBonus: true, description: 'Weekly BONUS!' },
];

// Streak milestone bonuses (beyond 7 days)
const STREAK_MILESTONES: Record<number, { gems: number; xp: number }> = {
  14: { gems: 30, xp: 200 },
  21: { gems: 40, xp: 250 },
  30: { gems: 60, xp: 350 },
  60: { gems: 100, xp: 500 },
  100: { gems: 200, xp: 1000 },
};

// ============================================
// HELPERS
// ============================================

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 === dateStr2;
}

function isYesterday(dateStr: string): boolean {
  return dateStr === getYesterdayString();
}

// ============================================
// STATE MANAGEMENT
// ============================================

export async function getDailyLoginState(): Promise<DailyLoginState> {
  try {
    const [lastLogin, claimed, streak] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN_DATE),
      AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGIN_CLAIMED),
      AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGIN_STREAK),
    ]);

    const today = getTodayString();
    const yesterday = getYesterdayString();

    const lastDate = lastLogin || '';
    const prevStreak = streak ? parseInt(streak, 10) : 0;

    // Determine if user can claim today
    let canClaimToday = false;
    let currentStreak = prevStreak;

    if (lastDate === '') {
      // Never logged in
      canClaimToday = true;
      currentStreak = 0;
    } else if (isSameDay(lastDate, today)) {
      // Already logged in today
      canClaimToday = false;
      currentStreak = prevStreak;
    } else if (isYesterday(lastDate)) {
      // Logged in yesterday - streak continues
      canClaimToday = true;
      currentStreak = prevStreak;
    } else {
      // Missed a day - streak broken
      canClaimToday = true;
      currentStreak = 0;
    }

    return {
      lastLoginDate: lastDate,
      currentStreak,
      totalClaimed: claimed ? parseInt(claimed, 10) : 0,
      canClaimToday,
    };
  } catch (error) {
    console.error('Error getting daily login state:', error);
    return {
      lastLoginDate: '',
      currentStreak: 0,
      totalClaimed: 0,
      canClaimToday: true,
    };
  }
}

export async function claimDailyReward(): Promise<DailyLoginReward | null> {
  try {
    const state = await getDailyLoginState();

    if (!state.canClaimToday) {
      console.log('Daily reward already claimed today');
      return null;
    }

    const today = getTodayString();

    // Calculate new streak
    let newStreak: number;
    if (state.lastLoginDate === '' || isYesterday(state.lastLoginDate)) {
      newStreak = state.currentStreak + 1;
    } else {
      newStreak = 1; // Streak broken, restart
    }

    // Get reward for current day in cycle (1-7)
    const cycleDay = ((newStreak - 1) % 7) + 1;
    const baseReward = DAILY_REWARDS[cycleDay - 1];

    // Check for streak milestone bonus
    const milestone = STREAK_MILESTONES[newStreak];
    const hasMilestone = !!milestone;
    const milestoneReward = milestone || { gems: 0, xp: 0 };

    // Calculate total reward
    const reward: DailyLoginReward = {
      day: cycleDay,
      gems: baseReward.gems + milestoneReward.gems,
      xp: baseReward.xp + milestoneReward.xp,
      isBonus: baseReward.isBonus || hasMilestone,
      description: hasMilestone
        ? `Streak ${newStreak} Milestone Bonus!`
        : baseReward.description,
    };

    // Save updated state
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN_DATE, today),
      AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGIN_CLAIMED, String(state.totalClaimed + 1)),
      AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGIN_STREAK, String(newStreak)),
    ]);

    console.log(`Daily reward claimed! Day ${cycleDay}, streak ${newStreak}: ${reward.gems} gems, ${reward.xp} XP`);

    return reward;
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    return null;
  }
}

export async function checkAndClaimIfNeeded(): Promise<DailyLoginReward | null> {
  const state = await getDailyLoginState();

  if (state.canClaimToday) {
    return claimDailyReward();
  }

  return null;
}

export async function getRewardForDay(day: number): Promise<DailyLoginReward> {
  return DAILY_REWARDS[((day - 1) % 7)] || DAILY_REWARDS[0];
}

export async function getNextReward(): Promise<{
  day: number;
  gems: number;
  xp: number;
  description: string;
}> {
  const state = await getDailyLoginState();
  const nextDay = ((state.currentStreak) % 7) + 1;
  const reward = await getRewardForDay(nextDay);

  return {
    day: nextDay,
    gems: reward.gems,
    xp: reward.xp,
    description: reward.description,
  };
}

// Get streak display info
export async function getStreakInfo(): Promise<{
  currentStreak: number;
  nextMilestone: number | null;
  progressToMilestone: number; // 0-100
}> {
  const state = await getDailyLoginState();

  // Find next milestone
  const milestones = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b);
  const nextMilestone = milestones.find(m => m > state.currentStreak) || null;

  let progressToMilestone = 100;
  if (nextMilestone) {
    const prevMilestone = milestones.filter(m => m <= state.currentStreak).pop() || 0;
    const range = nextMilestone - prevMilestone;
    const progress = state.currentStreak - prevMilestone;
    progressToMilestone = Math.round((progress / range) * 100);
  }

  return {
    currentStreak: state.currentStreak,
    nextMilestone,
    progressToMilestone,
  };
}