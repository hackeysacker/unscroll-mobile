/**
 * Database operations with built-in retry logic
 * Wraps database.ts functions with automatic retry and offline queueing
 */

import * as db from './database';
import { withSupabaseRetry, queueOperation, processSyncQueue } from './supabase-retry';

// Re-export original functions for direct use if needed
export * from './database';

/**
 * Enhanced database operations with retry logic
 */

// ============================================
// GAME PROGRESS (with retry)
// ============================================

export async function getGameProgressWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getGameProgress(userId),
    'getGameProgress',
    { userId }
  );
}

export async function updateGameProgressWithRetry(userId: string, updates: Parameters<typeof db.updateGameProgress>[1]) {
  return withSupabaseRetry(
    () => db.updateGameProgress(userId, updates),
    'updateGameProgress',
    { userId, updates }
  );
}

// ============================================
// SKILL PROGRESS (with retry)
// ============================================

export async function getSkillProgressWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getSkillProgress(userId),
    'getSkillProgress',
    { userId }
  );
}

export async function updateSkillProgressWithRetry(userId: string, updates: Parameters<typeof db.updateSkillProgress>[1]) {
  return withSupabaseRetry(
    () => db.updateSkillProgress(userId, updates),
    'updateSkillProgress',
    { userId, updates }
  );
}

// ============================================
// CHALLENGE RESULTS (with retry)
// ============================================

export async function saveChallengeResultWithRetry(userId: string, result: Parameters<typeof db.saveChallengeResult>[1]) {
  return withSupabaseRetry(
    () => db.saveChallengeResult(userId, result),
    'saveChallengeResult',
    { userId, result }
  );
}

export async function getChallengeHistoryWithRetry(userId: string, limit?: number) {
  return withSupabaseRetry(
    () => db.getChallengeHistory(userId, limit),
    'getChallengeHistory',
    { userId, limit }
  );
}

export async function getChallengeStatsWithRetry(userId: string, challengeType: string) {
  return withSupabaseRetry(
    () => db.getChallengeStats(userId, challengeType),
    'getChallengeStats',
    { userId, challengeType }
  );
}

// ============================================
// DAILY SESSIONS (with retry)
// ============================================

export async function getDailySessionWithRetry(userId: string, date: string) {
  return withSupabaseRetry(
    () => db.getDailySession(userId, date),
    'getDailySession',
    { userId, date }
  );
}

export async function updateDailySessionWithRetry(userId: string, date: string, updates: Parameters<typeof db.updateDailySession>[2]) {
  return withSupabaseRetry(
    () => db.updateDailySession(userId, date, updates),
    'updateDailySession',
    { userId, date, updates }
  );
}

export async function getSessionHistoryWithRetry(userId: string, days?: number) {
  return withSupabaseRetry(
    () => db.getSessionHistory(userId, days),
    'getSessionHistory',
    { userId, days }
  );
}

// ============================================
// USER STATS (with retry)
// ============================================

export async function getUserStatsWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getUserStats(userId),
    'getUserStats',
    { userId }
  );
}

export async function updateUserStatsWithRetry(userId: string, updates: Parameters<typeof db.updateUserStats>[1]) {
  return withSupabaseRetry(
    () => db.updateUserStats(userId, updates),
    'updateUserStats',
    { userId, updates }
  );
}

// ============================================
// HEARTS SYSTEM (with retry)
// ============================================

export async function getHeartStateWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getHeartState(userId),
    'getHeartState',
    { userId }
  );
}

export async function updateHeartStateWithRetry(userId: string, updates: Parameters<typeof db.updateHeartState>[1]) {
  return withSupabaseRetry(
    () => db.updateHeartState(userId, updates),
    'updateHeartState',
    { userId, updates }
  );
}

export async function logHeartTransactionWithRetry(userId: string, changeAmount: number, reason: string) {
  return withSupabaseRetry(
    () => db.logHeartTransaction(userId, changeAmount, reason),
    'logHeartTransaction',
    { userId, changeAmount, reason }
  );
}

// ============================================
// BADGES (with retry)
// ============================================

export async function getBadgesWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getBadges(userId),
    'getBadges',
    { userId }
  );
}

export async function unlockBadgeWithRetry(userId: string, badge: Parameters<typeof db.unlockBadge>[1]) {
  return withSupabaseRetry(
    () => db.unlockBadge(userId, badge),
    'unlockBadge',
    { userId, badge }
  );
}

export async function getBadgeProgressWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getBadgeProgress(userId),
    'getBadgeProgress',
    { userId }
  );
}

export async function updateBadgeProgressWithRetry(
  userId: string,
  badgeType: string,
  currentProgress: number,
  targetProgress: number
) {
  return withSupabaseRetry(
    () => db.updateBadgeProgress(userId, badgeType, currentProgress, targetProgress),
    'updateBadgeProgress',
    { userId, badgeType, currentProgress, targetProgress }
  );
}

// ============================================
// PROGRESS TREE (with retry)
// ============================================

export async function getProgressTreeStateWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getProgressTreeState(userId),
    'getProgressTreeState',
    { userId }
  );
}

export async function updateProgressTreeStateWithRetry(userId: string, updates: Parameters<typeof db.updateProgressTreeState>[1]) {
  return withSupabaseRetry(
    () => db.updateProgressTreeState(userId, updates),
    'updateProgressTreeState',
    { userId, updates }
  );
}

export async function getProgressNodesWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getProgressNodes(userId),
    'getProgressNodes',
    { userId }
  );
}

export async function updateProgressNodeWithRetry(userId: string, nodeId: string, updates: Parameters<typeof db.updateProgressNode>[2]) {
  return withSupabaseRetry(
    () => db.updateProgressNode(userId, nodeId, updates),
    'updateProgressNode',
    { userId, nodeId, updates }
  );
}

// ============================================
// SETTINGS (with retry)
// ============================================

export async function getUserSettingsWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.getUserSettings(userId),
    'getUserSettings',
    { userId }
  );
}

export async function updateUserSettingsWithRetry(userId: string, updates: Parameters<typeof db.updateUserSettings>[1]) {
  return withSupabaseRetry(
    () => db.updateUserSettings(userId, updates),
    'updateUserSettings',
    { userId, updates }
  );
}

// ============================================
// SYNC QUEUE PROCESSING
// ============================================

/**
 * Process all queued operations
 * Call this when the app comes online or on app startup
 */
export async function processQueuedOperations(userId: string) {
  const operationHandlers: Record<string, (params: any) => Promise<any>> = {
    updateGameProgress: (params) => db.updateGameProgress(params.userId, params.updates),
    updateSkillProgress: (params) => db.updateSkillProgress(params.userId, params.updates),
    saveChallengeResult: (params) => db.saveChallengeResult(params.userId, params.result),
    updateDailySession: (params) => db.updateDailySession(params.userId, params.date, params.updates),
    updateUserStats: (params) => db.updateUserStats(params.userId, params.updates),
    updateHeartState: (params) => db.updateHeartState(params.userId, params.updates),
    logHeartTransaction: (params) => db.logHeartTransaction(params.userId, params.changeAmount, params.reason),
    unlockBadge: (params) => db.unlockBadge(params.userId, params.badge),
    updateBadgeProgress: (params) =>
      db.updateBadgeProgress(params.userId, params.badgeType, params.currentProgress, params.targetProgress),
    updateProgressTreeState: (params) => db.updateProgressTreeState(params.userId, params.updates),
    updateProgressNode: (params) => db.updateProgressNode(params.userId, params.nodeId, params.updates),
    updateUserSettings: (params) => db.updateUserSettings(params.userId, params.updates),
  };

  return processSyncQueue(operationHandlers);
}

/**
 * Sync all user data with retry
 */
export async function syncAllUserDataWithRetry(userId: string) {
  return withSupabaseRetry(
    () => db.syncAllUserData(userId),
    'syncAllUserData',
    { userId }
  );
}
