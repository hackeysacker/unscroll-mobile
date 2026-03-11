import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  GameProgress,
  ChallengeResult,
  DailySession,
  SkillTreeProgress,
  UserStats,
  ChallengeType,
  ProgressTreeState,
  HeartState,
  HeartTransaction,
  HeartLossReason,
  HeartGainReason,
  HeartRefillActionType,
  BadgeProgress,
  Badge,
  WindDownSession,
  WindDownSettings,
  DeepAnalytics,
  PersonalizedTrainingPlan,
} from '@/types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/lib/storage';
import {
  XP_PER_SESSION,
  checkLevelUp,
  calculateXP,
  updateStreak,
  getChallengeSkillPath,
  calculateSkillProgress,
  generateProgressTree,
} from '@/lib/game-mechanics';
import * as db from '@/lib/database';
import {
  initializeHeartState,
  processMidnightReset,
  processScheduledRefills,
  loseHeart,
  gainHeart,
  incrementPerfectStreak,
  canStartChallenge,
} from '@/lib/heart-mechanics';
import {
  initializeBadgeProgress,
  checkAllBadges,
} from '@/lib/badge-mechanics';
import { generateUUID } from '@/lib/utils';
import { useAuth } from './AuthContext';

/**
 * Comprehensive Supabase sync helper for all game metrics
 * 
 * Syncs the following data types:
 * - GameProgress: level, XP, streaks, session counts
 * - SkillTreeProgress: focus, impulse control, distraction resistance scores
 * - UserStats: attention time, gaze holds, accuracy, stability ratings, challenges completed
 * - HeartState: current hearts, perfect streaks, refill timestamps, totals
 * - ChallengeResult: individual challenge completions with scores, duration, XP, perfect status
 * - BadgeProgress: unlocked badges (progress calculated dynamically from game state)
 * - ProgressTreeState: unlocked nodes array, current path/node ID
 * - ProgressNodes: individual node unlock/completion status (only unlocked nodes)
 * - DailySession: session XP, completion status, challenges count
 * - WindDownSession: completed wind down sessions with duration and exercises
 * - WindDownSettings: preferred duration, exercises, reminder settings
 * - DeepAnalytics: weekly/monthly trends, skill breakdown, improvement rates
 * - PersonalizedTrainingPlan: generated training plans with recommendations
 * 
 * All syncs are fire-and-forget (non-blocking) to prevent blocking game flow.
 * Errors are logged but don't affect gameplay - local storage remains the source of truth.
 */
async function syncToSupabase(
  userId: string,
  session: any,
  data: {
    progress?: GameProgress;
    skillTree?: SkillTreeProgress;
    stats?: UserStats;
    heartState?: HeartState;
    challengeResult?: ChallengeResult;
    badgeProgress?: BadgeProgress;
    progressTree?: ProgressTreeState;
    dailySession?: DailySession;
    windDownSession?: WindDownSession;
    windDownSettings?: WindDownSettings;
    deepAnalytics?: DeepAnalytics;
    trainingPlan?: PersonalizedTrainingPlan;
  }
) {
  if (!session) return; // Not authenticated with Supabase

  try {
    const promises: Promise<any>[] = [];

    if (data.progress) {
      promises.push(db.updateGameProgress(userId, {
        level: data.progress.level,
        xp: data.progress.xp,
        total_xp: data.progress.totalXp,
        streak: data.progress.streak,
        longest_streak: data.progress.longestStreak,
        last_session_date: data.progress.lastSessionDate
          ? new Date(data.progress.lastSessionDate).toISOString().split('T')[0]
          : undefined,
        streak_freeze_used: data.progress.streakFreezeUsed,
        total_sessions_completed: data.progress.totalSessionsCompleted,
        total_challenges_completed: data.progress.totalChallengesCompleted,
      }));
    }

    if (data.skillTree) {
      promises.push(db.updateSkillProgress(userId, {
        focus_score: data.skillTree.focus,
        impulse_control_score: data.skillTree.impulseControl,
        distraction_resistance_score: data.skillTree.distractionResistance,
      }));
    }

    if (data.stats) {
      promises.push(db.updateUserStats(userId, {
        total_attention_time: data.stats.totalAttentionTime,
        longest_gaze_hold: data.stats.longestGazeHold,
        focus_accuracy: data.stats.focusAccuracy,
        impulse_control_score: data.stats.impulseControlScore,
        stability_rating: data.stats.stabilityRating,
        total_exercises_completed: data.stats.challengesCompleted || 0,
        // Note: average_score can be calculated from challenge_results if needed
      }));
    }

    if (data.heartState) {
      promises.push(db.updateHeartState(userId, {
        current_hearts: data.heartState.currentHearts,
        max_hearts: data.heartState.maxHearts,
        last_heart_lost: data.heartState.lastHeartLost
          ? new Date(data.heartState.lastHeartLost).toISOString()
          : undefined,
        last_midnight_reset: data.heartState.lastMidnightReset
          ? new Date(data.heartState.lastMidnightReset).toISOString().split('T')[0]
          : undefined,
        perfect_streak_count: data.heartState.perfectStreakCount,
        total_lost: data.heartState.totalHeartsLost,
        total_gained: data.heartState.totalHeartsGained,
      }));
    }

    if (data.challengeResult) {
      promises.push(db.saveChallengeResult(userId, {
        challenge_type: data.challengeResult.type,
        score: data.challengeResult.score,
        duration: data.challengeResult.duration,
        xp_earned: data.challengeResult.xpEarned,
        is_perfect: data.challengeResult.isPerfect,
      }));

      // Also log analytics data point for tracking metrics over time
      promises.push(db.logAnalyticsDataPoint(userId, 'challenge_score', data.challengeResult.score, {
        challenge_type: data.challengeResult.type,
        duration: data.challengeResult.duration,
        is_perfect: data.challengeResult.isPerfect,
      }).catch((err) => {
        // Don't fail entire sync if analytics logging fails
        console.error('Failed to log analytics data point:', err);
      }));
    }

    // Sync badge progress and unlocked badges
    if (data.badgeProgress) {
      // Sync all unlocked badges - only sync badges that aren't already in the database
      // (in production, you'd want to check which badges are already synced to avoid duplicates)
      for (const badge of data.badgeProgress.unlockedBadges) {
        promises.push(db.unlockBadge(userId, {
          badge_type: badge.type,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
        }).catch((err) => {
          // Ignore duplicate key errors (badge already unlocked)
          if (err?.code !== '23505') {
            console.error(`Error syncing badge ${badge.type}:`, err);
          }
        }));
      }
    }

    // Sync progress tree state and nodes
    if (data.progressTree) {
      // Sync tree state (unlocked nodes, current path)
      const unlockedNodeIds = data.progressTree.nodes
        .filter(n => n.status !== 'locked')
        .map(n => n.id);
      
      promises.push(db.updateProgressTreeState(userId, {
        unlocked_nodes: unlockedNodeIds,
        current_path: data.progressTree.currentNodeId || null,
      }));

      // Sync individual node states (only sync nodes that are unlocked or completed to reduce DB writes)
      for (const node of data.progressTree.nodes) {
        // Only sync nodes that have been unlocked (not locked)
        if (node.status !== 'locked') {
          promises.push(db.updateProgressNode(userId, node.id, {
            unlocked: true,
            completed: node.status === 'completed' || node.status === 'perfect',
          }).catch((err) => {
            // Log but don't fail entire sync if one node fails
            console.error(`Error syncing progress node ${node.id}:`, err);
          }));
        }
      }
    }

    // Sync daily session
    if (data.dailySession) {
      const sessionDate = new Date(data.dailySession.date).toISOString().split('T')[0];
      promises.push(db.updateDailySession(userId, sessionDate, {
        total_xp: data.dailySession.totalXp,
        completed: data.dailySession.completed,
        challenges_completed: data.dailySession.challenges.length,
      }));
    }

    // Sync wind down session
    if (data.windDownSession && data.windDownSession.completed) {
      promises.push(db.saveWindDownSession(userId, {
        duration: data.windDownSession.duration,
        exercises_completed: data.windDownSession.breathingExercises > 0 ? ['breathing'] : [],
      }));
    }

    // Sync wind down settings
    if (data.windDownSettings) {
      promises.push(db.updateWindDownSettings(userId, {
        preferred_duration: data.windDownSettings.duration,
        preferred_exercises: data.windDownSettings.breathingPattern ? [data.windDownSettings.breathingPattern] : [],
        reminder_enabled: data.windDownSettings.enabled,
      }));
    }

    // Sync deep analytics
    if (data.deepAnalytics) {
      promises.push(db.updateDeepAnalytics(userId, {
        weekly_summary: {
          attentionScore: data.deepAnalytics.attentionScore,
          impulseControlScore: data.deepAnalytics.impulseControlScore,
          distractionResistanceScore: data.deepAnalytics.distractionResistanceScore,
          weeklyProgress: data.deepAnalytics.weeklyProgress,
        },
        monthly_trends: {
          monthlyProgress: data.deepAnalytics.monthlyProgress,
        },
        skill_breakdown: {
          focus: data.deepAnalytics.attentionScore,
          impulseControl: data.deepAnalytics.impulseControlScore,
          distractionResistance: data.deepAnalytics.distractionResistanceScore,
        },
        improvement_rate: 0, // Can be calculated from trends
      }));
    }

    // Sync training plan
    if (data.trainingPlan) {
      promises.push(db.saveTrainingPlan(userId, {
        plan_type: 'personalized',
        exercises: data.trainingPlan.recommendations.map(r => r.challengeType),
        is_active: true,
      }));
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
    // Don't throw - local storage is the source of truth
  }
}


interface GameContextType {
  progress: GameProgress | null;
  skillTree: SkillTreeProgress | null;
  stats: UserStats | null;
  todaySession: DailySession | null;
  progressTree: ProgressTreeState | null;
  heartState: HeartState | null;
  badgeProgress: BadgeProgress | null;
  newlyUnlockedBadges: Badge[];
  completeChallenge: (type: ChallengeType, score: number, duration: number) => Promise<void>;
  completeSession: () => Promise<void>;
  initializeProgress: (baselineLevel: number) => Promise<void>;
  loseHeartForReason: (reason: HeartLossReason, challengeId?: string) => Promise<boolean>;
  gainHeartForReason: (reason: HeartGainReason, challengeId?: string) => Promise<void>;
  canStartChallenge: (isDifficult?: boolean) => { canStart: boolean; reason?: string };
  completeRefillAction: (action: HeartRefillActionType) => Promise<void>;
  clearNewBadges: () => void;
  setCurrentNodeId: (nodeId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [skillTree, setSkillTree] = useState<SkillTreeProgress | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [todaySession, setTodaySession] = useState<DailySession | null>(null);
  const [progressTree, setProgressTree] = useState<ProgressTreeState | null>(null);
  const [heartState, setHeartState] = useState<HeartState | null>(null);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress | null>(null);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load game data from storage
  useEffect(() => {
    async function loadGameData() {
      if (!user) {
        setProgress(null);
        setSkillTree(null);
        setStats(null);
        setTodaySession(null);
        setProgressTree(null);
        setHeartState(null);
        setBadgeProgress(null);
        setIsLoading(false);
        return;
      }

      try {
        const savedProgress = await loadFromStorage<GameProgress>(STORAGE_KEYS.GAME_PROGRESS);
        const savedSkillTree = await loadFromStorage<SkillTreeProgress>(STORAGE_KEYS.SKILL_TREE);
        const savedStats = await loadFromStorage<UserStats>(STORAGE_KEYS.USER_STATS);
        const savedSessions = await loadFromStorage<DailySession[]>(STORAGE_KEYS.DAILY_SESSIONS) || [];
        const savedProgressTree = await loadFromStorage<ProgressTreeState>(STORAGE_KEYS.PROGRESS_TREE);
        const savedHeartState = await loadFromStorage<HeartState>(STORAGE_KEYS.HEART_STATE);

        if (savedProgress && savedProgress.userId === user.id) {
          setProgress(savedProgress);

          // Check if progress tree needs regeneration
          const needsRegeneration =
            !savedProgressTree ||
            savedProgressTree.userId !== user.id ||
            !savedProgressTree.version ||
            savedProgressTree.version < 3 ||
            !Array.isArray(savedProgressTree.nodes) ||
            savedProgressTree.nodes.length === 0;

          if (needsRegeneration) {
            console.log('Regenerating progress tree...');
            const newProgressTree = generateProgressTree(user.id, savedProgress.level);
            setProgressTree(newProgressTree);
            await saveToStorage(STORAGE_KEYS.PROGRESS_TREE, newProgressTree);
          } else {
            setProgressTree(savedProgressTree);
          }
        }

        if (savedSkillTree && savedSkillTree.userId === user.id) {
          setSkillTree(savedSkillTree);
        }

        if (savedStats) {
          setStats(savedStats);
        }

        // Find today's session
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const session = savedSessions.find(s => {
          const sessionDate = new Date(s.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === today.getTime() && s.userId === user.id;
        });

        if (session) {
          setTodaySession(session);
        }

        // Load and process heart state
        if (savedHeartState && savedHeartState.userId === user.id) {
          let updatedHeartState = { ...savedHeartState };

          // Check for midnight reset
          const { updatedHeartState: afterMidnight, transaction: midnightTransaction } = processMidnightReset(
            updatedHeartState,
            user.isPremium
          );
          updatedHeartState = afterMidnight;

          if (midnightTransaction) {
            const allTransactions = await loadFromStorage<HeartTransaction[]>(STORAGE_KEYS.HEART_TRANSACTIONS) || [];
            allTransactions.push(midnightTransaction);
            await saveToStorage(STORAGE_KEYS.HEART_TRANSACTIONS, allTransactions);
          }

          // Check for scheduled refills
          const { updatedHeartState: afterRefills, transactions: refillTransactions } = processScheduledRefills(
            updatedHeartState,
            user.isPremium
          );
          updatedHeartState = afterRefills;

          if (refillTransactions.length > 0) {
            const allTransactions = await loadFromStorage<HeartTransaction[]>(STORAGE_KEYS.HEART_TRANSACTIONS) || [];
            allTransactions.push(...refillTransactions);
            await saveToStorage(STORAGE_KEYS.HEART_TRANSACTIONS, allTransactions);
          }

          setHeartState(updatedHeartState);
          await saveToStorage(STORAGE_KEYS.HEART_STATE, updatedHeartState);
        } else if (user) {
          // Initialize heart state for new user
          const newHeartState = initializeHeartState(user.id);
          setHeartState(newHeartState);
          await saveToStorage(STORAGE_KEYS.HEART_STATE, newHeartState);
        }

        // Load and process badge progress
        const savedBadgeProgress = await loadFromStorage<BadgeProgress>(STORAGE_KEYS.BADGE_PROGRESS);
        if (savedBadgeProgress && savedBadgeProgress.userId === user.id) {
          setBadgeProgress(savedBadgeProgress);
        } else if (user) {
          // Initialize badge progress for new user
          const newBadgeProgress = initializeBadgeProgress(user.id);
          setBadgeProgress(newBadgeProgress);
          await saveToStorage(STORAGE_KEYS.BADGE_PROGRESS, newBadgeProgress);
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGameData();
  }, [user]);

  const initializeProgress = async (baselineLevel: number) => {
    if (!user) return;

    const newProgress: GameProgress = {
      userId: user.id,
      level: baselineLevel,
      xp: 0,
      totalXp: 0,
      streak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      streakFreezeUsed: false,
      totalSessionsCompleted: 0,
      totalChallengesCompleted: 0,
    };

    const newSkillTree: SkillTreeProgress = {
      userId: user.id,
      focus: 0,
      impulseControl: 0,
      distractionResistance: 0,
    };

    const newStats: UserStats = {
      totalAttentionTime: 0,
      longestGazeHold: 0,
      focusAccuracy: 0,
      impulseControlScore: 0,
      stabilityRating: 0,
    };

    const newProgressTree = generateProgressTree(user.id, baselineLevel);
    const newHeartState = initializeHeartState(user.id);
    const newBadgeProgress = initializeBadgeProgress(user.id);

    setProgress(newProgress);
    setSkillTree(newSkillTree);
    setStats(newStats);
    setProgressTree(newProgressTree);
    setHeartState(newHeartState);
    setBadgeProgress(newBadgeProgress);

    await saveToStorage(STORAGE_KEYS.GAME_PROGRESS, newProgress);
    await saveToStorage(STORAGE_KEYS.SKILL_TREE, newSkillTree);
    await saveToStorage(STORAGE_KEYS.USER_STATS, newStats);
    await saveToStorage(STORAGE_KEYS.PROGRESS_TREE, newProgressTree);
    await saveToStorage(STORAGE_KEYS.HEART_STATE, newHeartState);
    await saveToStorage(STORAGE_KEYS.BADGE_PROGRESS, newBadgeProgress);

    // Sync to Supabase
    syncToSupabase(user.id, session, {
      progress: newProgress,
      skillTree: newSkillTree,
      stats: newStats,
      heartState: newHeartState,
    }).catch((error) => {
      console.error('Failed to sync initial progress to Supabase:', error);
    });
  };

  const resetProgress = async () => {
    if (!user) return;
    
    // Reset to baseline level 1 - this will update all state
    await initializeProgress(1);
    
    // Clear challenge results and daily sessions
    await saveToStorage(STORAGE_KEYS.CHALLENGE_RESULTS, []);
    await saveToStorage(STORAGE_KEYS.DAILY_SESSIONS, []);
    await saveToStorage(STORAGE_KEYS.DEEP_ANALYTICS, null);
    await saveToStorage(STORAGE_KEYS.WIND_DOWN_SESSIONS, []);
    
    // Clear heart transactions
    await saveToStorage(STORAGE_KEYS.HEART_TRANSACTIONS, []);
    
    // Reset today's session - this is already done in initializeProgress
    // but we ensure it's null
    setTodaySession(null);
    
    // Ensure loading is false after reset
    setIsLoading(false);
  };

  const completeChallenge = async (type: ChallengeType, score: number, duration: number) => {
    if (!user || !progress || !skillTree || !stats || !progressTree || !heartState) return;

    const isPerfect = score >= 95;
    const baseXP = calculateXP(10, isPerfect, progress.streak);

    // Handle perfect streak and heart rewards
    if (isPerfect && heartState) {
      const { updatedHeartState, shouldAwardHeart } = incrementPerfectStreak(heartState, user.isPremium);

      if (shouldAwardHeart) {
        // Award a heart for 3 perfect challenges in a row
        await gainHeartForReason('perfect_streak_3');
      } else {
        // Just update the streak count
        setHeartState(updatedHeartState);
        await saveToStorage(STORAGE_KEYS.HEART_STATE, updatedHeartState);
      }
    }

    const result: ChallengeResult = {
      id: generateUUID(),
      userId: user.id,
      type,
      timestamp: Date.now(),
      score,
      duration,
      xpEarned: baseXP,
      isPerfect,
    };

    // Update skill tree
    const skillPath = getChallengeSkillPath(type);
    const currentSkillProgress = skillTree[skillPath];
    const newSkillProgress = calculateSkillProgress(type, score, currentSkillProgress);
    const updatedSkillTree = { ...skillTree, [skillPath]: newSkillProgress };

    // Update stats
    const updatedStats = { ...stats };
    updatedStats.totalAttentionTime += duration;

    if (type === 'gaze_hold' && duration > updatedStats.longestGazeHold) {
      updatedStats.longestGazeHold = duration;
    }

    // Update progress tree
    const updatedProgressTree = { ...progressTree };
    
    // Check if there's a current node
    if (!updatedProgressTree.currentNodeId) {
      // No current node - find the first available or locked node to set as current
      const firstAvailableNode = updatedProgressTree.nodes.find(
        n => n.status === 'available' || n.status === 'locked'
      );
      if (firstAvailableNode) {
        if (firstAvailableNode.status === 'locked') {
          // Unlock it
          const nodeIndex = updatedProgressTree.nodes.findIndex(n => n.id === firstAvailableNode.id);
          if (nodeIndex >= 0) {
            updatedProgressTree.nodes[nodeIndex] = {
              ...firstAvailableNode,
              status: 'available',
            };
          }
        }
        updatedProgressTree.currentNodeId = firstAvailableNode.id;
      }
    }
    
    const currentNodeIndex = updatedProgressTree.nodes.findIndex(n => n.id === updatedProgressTree.currentNodeId);

    if (currentNodeIndex >= 0) {
      const currentNode = updatedProgressTree.nodes[currentNodeIndex];

      // Calculate stars based on score
      let stars = 1;
      if (score >= 95) stars = 3;
      else if (score >= 80) stars = 2;

      // Update current node - allow re-playing for better scores
      const newStatus = score >= 95 ? 'perfect' : 'completed';
      const shouldUpdateStars = !currentNode.starsEarned || stars > currentNode.starsEarned;
      
      updatedProgressTree.nodes[currentNodeIndex] = {
        ...currentNode,
        status: newStatus,
        starsEarned: shouldUpdateStars ? stars : currentNode.starsEarned,
        completedAt: Date.now(),
      };

      updatedProgressTree.lastCompletedNodeId = currentNode.id;

      // Check if this was a test
      if (currentNode.nodeType === 'test') {
        // Test completed - check if passed (need 80+ score to pass)
        if (score >= 80) {
          // Unlock first exercise of next level
          const nextLevelFirstExercise = updatedProgressTree.nodes.find(
            n => n.level === currentNode.level + 1 && n.position === 0 && n.nodeType === 'exercise'
          );

          if (nextLevelFirstExercise) {
            const nextLevelFirstIndex = updatedProgressTree.nodes.findIndex(n => n.id === nextLevelFirstExercise.id);
            updatedProgressTree.nodes[nextLevelFirstIndex] = {
              ...nextLevelFirstExercise,
              status: 'available',
            };
            updatedProgressTree.currentNodeId = nextLevelFirstExercise.id;
          } else {
            // No more levels
            updatedProgressTree.currentNodeId = null;
          }
        } else {
          // Failed test - stay on same test
          updatedProgressTree.nodes[currentNodeIndex] = {
            ...currentNode,
            status: 'available',
            starsEarned: 0,
            completedAt: undefined,
          };
          updatedProgressTree.currentNodeId = currentNode.id;
        }
      } else {
        // This was an exercise
          // Check if this was the last exercise (position 19)
          if (currentNode.position === 19) {
            // Unlock the test for this level
            const testNode = updatedProgressTree.nodes.find(
              n => n.level === currentNode.level && n.nodeType === 'test'
            );

            if (testNode) {
              const testIndex = updatedProgressTree.nodes.findIndex(n => n.id === testNode.id);
              if (testIndex >= 0) {
                // Unlock test if locked, otherwise just set as current
                if (testNode.status === 'locked') {
                  updatedProgressTree.nodes[testIndex] = {
                    ...testNode,
                    status: 'available',
                  };
                }
                updatedProgressTree.currentNodeId = testNode.id;
              }
            }
          } else {
            // Unlock next exercise in the same level (position + 1)
            const nextNode = updatedProgressTree.nodes.find(
              n => n.level === currentNode.level 
                && n.position === currentNode.position + 1 
                && n.nodeType === 'exercise'
            );

            if (nextNode) {
              const nextNodeIndex = updatedProgressTree.nodes.findIndex(n => n.id === nextNode.id);
              if (nextNodeIndex >= 0) {
                // Unlock next exercise if it's locked
                if (nextNode.status === 'locked') {
                  updatedProgressTree.nodes[nextNodeIndex] = {
                    ...nextNode,
                    status: 'available',
                  };
                }
                // Set as current node
                updatedProgressTree.currentNodeId = nextNode.id;
              }
            } else {
              // No next exercise found - this shouldn't happen but handle gracefully
              // Try to find next available node in the tree
              const nextAvailableNode = updatedProgressTree.nodes.find(
                n => (n.level > currentNode.level || (n.level === currentNode.level && n.position > currentNode.position)) &&
                     (n.status === 'available' || n.status === 'locked')
              );
              if (nextAvailableNode) {
                if (nextAvailableNode.status === 'locked') {
                  const unlockIndex = updatedProgressTree.nodes.findIndex(n => n.id === nextAvailableNode.id);
                  if (unlockIndex >= 0) {
                    updatedProgressTree.nodes[unlockIndex] = {
                      ...nextAvailableNode,
                      status: 'available',
                    };
                  }
                }
                updatedProgressTree.currentNodeId = nextAvailableNode.id;
              } else {
                updatedProgressTree.currentNodeId = null;
              }
            }
          }
        }
    } else {
      // Current node not found - try to find next available node
      const nextAvailableNode = updatedProgressTree.nodes.find(
        n => n.status === 'available' || n.status === 'locked'
      );
      if (nextAvailableNode) {
        if (nextAvailableNode.status === 'locked') {
          const unlockIndex = updatedProgressTree.nodes.findIndex(n => n.id === nextAvailableNode.id);
          if (unlockIndex >= 0) {
            updatedProgressTree.nodes[unlockIndex] = {
              ...nextAvailableNode,
              status: 'available',
            };
          }
        }
        updatedProgressTree.currentNodeId = nextAvailableNode.id;
      }
    }

    // Update today's session
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let session = todaySession;
    if (!session) {
      session = {
        id: generateUUID(),
        userId: user.id,
        date: today.getTime(),
        challenges: [],
        totalXp: 0,
        completed: false,
      };
    }

    session.challenges.push(result);
    session.totalXp += baseXP;

    // Update progress with XP immediately (not waiting for session completion)
    const newTotalXP = progress.xp + baseXP;
    const { newLevel, remainingXP } = checkLevelUp(newTotalXP, progress.level);

    const updatedProgress: GameProgress = {
      ...progress,
      level: newLevel,
      xp: remainingXP,
      totalXp: progress.totalXp + baseXP,
      totalChallengesCompleted: progress.totalChallengesCompleted + 1,
    };

    // Save challenge result
    const allResults = await loadFromStorage<ChallengeResult[]>(STORAGE_KEYS.CHALLENGE_RESULTS) || [];
    allResults.push(result);
    await saveToStorage(STORAGE_KEYS.CHALLENGE_RESULTS, allResults);

    // Save session
    const allSessions = await loadFromStorage<DailySession[]>(STORAGE_KEYS.DAILY_SESSIONS) || [];
    const sessionIndex = allSessions.findIndex(s => s.id === session.id);
    if (sessionIndex >= 0) {
      allSessions[sessionIndex] = session;
    } else {
      allSessions.push(session);
    }
    await saveToStorage(STORAGE_KEYS.DAILY_SESSIONS, allSessions);

    // Save all state to storage first
    await Promise.all([
      saveToStorage(STORAGE_KEYS.GAME_PROGRESS, updatedProgress),
      saveToStorage(STORAGE_KEYS.SKILL_TREE, updatedSkillTree),
      saveToStorage(STORAGE_KEYS.USER_STATS, updatedStats),
      saveToStorage(STORAGE_KEYS.PROGRESS_TREE, updatedProgressTree),
    ]);

    // Update state after successful save
    setProgress(updatedProgress);
    setTodaySession(session);
    setSkillTree(updatedSkillTree);
    setStats(updatedStats);
    setProgressTree(updatedProgressTree);

    // Check for newly unlocked badges
    let updatedBadgeProgress = badgeProgress;
    if (badgeProgress) {
      const newBadges = checkAllBadges(badgeProgress, updatedProgress, updatedSkillTree, allResults, heartState);
      if (newBadges.length > 0) {
        updatedBadgeProgress = {
          ...badgeProgress,
          unlockedBadges: [...badgeProgress.unlockedBadges, ...newBadges],
        };
        setBadgeProgress(updatedBadgeProgress);
        await saveToStorage(STORAGE_KEYS.BADGE_PROGRESS, updatedBadgeProgress);
        setNewlyUnlockedBadges(newBadges);
      }
    }

    // Sync to Supabase (fire and forget - don't block on sync)
    syncToSupabase(user.id, session, {
      progress: updatedProgress,
      skillTree: updatedSkillTree,
      stats: updatedStats,
      challengeResult: result,
      badgeProgress: updatedBadgeProgress || undefined,
      progressTree: updatedProgressTree,
      dailySession: session,
    }).catch((error) => {
      console.error('Failed to sync to Supabase:', error);
      // Don't throw - allow the challenge completion to proceed even if sync fails
    });
  };

  const completeSession = async () => {
    if (!user || !progress || !todaySession || !heartState) return;

    if (todaySession.challenges.length < 3) {
      console.warn('Session requires 3 challenges to complete');
      return;
    }

    // Mark session as completed
    const completedSession = { ...todaySession, completed: true };

    // Award a heart for completing daily session
    await gainHeartForReason('daily_session_complete');

    // Calculate session XP
    const sessionXP = calculateXP(XP_PER_SESSION, false, progress.streak);
    // Total XP = current XP + all challenge XP from session + session bonus XP
    const totalXP = progress.xp + todaySession.totalXp + sessionXP;

    // Update streak
    const streakUpdate = updateStreak(progress.lastSessionDate, Date.now());
    let newStreak = progress.streak;
    let streakFreezeUsed = progress.streakFreezeUsed;

    if (streakUpdate.newStreak > 0) {
      newStreak += streakUpdate.newStreak;
    } else if (streakUpdate.shouldFreeze && !progress.streakFreezeUsed) {
      // Use freeze
      streakFreezeUsed = true;
    } else if (!streakUpdate.shouldFreeze && streakUpdate.newStreak === 0) {
      // Reset streak
      newStreak = 1;
      streakFreezeUsed = false;
    }

    // Check for level up
    const { newLevel, remainingXP } = checkLevelUp(totalXP, progress.level);

    // Calculate new totalXp correctly: add only the new XP earned (session bonus)
    // The challenge XP was already added to totalXp in completeChallenge
    const updatedProgress: GameProgress = {
      ...progress,
      level: newLevel,
      xp: remainingXP,
      totalXp: progress.totalXp + sessionXP, // Only add session bonus, challenge XP already added
      streak: newStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak),
      lastSessionDate: Date.now(),
      streakFreezeUsed,
      totalSessionsCompleted: progress.totalSessionsCompleted + 1,
      totalChallengesCompleted: progress.totalChallengesCompleted + todaySession.challenges.length,
    };

    // Save everything
    const allSessions = await loadFromStorage<DailySession[]>(STORAGE_KEYS.DAILY_SESSIONS) || [];
    const sessionIndex = allSessions.findIndex(s => s.id === completedSession.id);
    if (sessionIndex >= 0) {
      allSessions[sessionIndex] = completedSession;
    }
    await saveToStorage(STORAGE_KEYS.DAILY_SESSIONS, allSessions);

    setProgress(updatedProgress);
    setTodaySession(completedSession);
    await saveToStorage(STORAGE_KEYS.GAME_PROGRESS, updatedProgress);

    // Sync to Supabase
    syncToSupabase(user.id, session, {
      progress: updatedProgress,
      dailySession: completedSession,
    }).catch((error) => {
      console.error('Failed to sync session completion to Supabase:', error);
    });
  };

  // Heart System Methods
  const loseHeartForReason = async (reason: HeartLossReason, challengeId?: string): Promise<boolean> => {
    if (!user || !heartState) return false;

    const { updatedHeartState, transaction, canContinue } = loseHeart(
      heartState,
      reason,
      user.isPremium,
      challengeId
    );

    setHeartState(updatedHeartState);
    await saveToStorage(STORAGE_KEYS.HEART_STATE, updatedHeartState);

    if (transaction) {
      const allTransactions = await loadFromStorage<HeartTransaction[]>(STORAGE_KEYS.HEART_TRANSACTIONS) || [];
      allTransactions.push(transaction);
      await saveToStorage(STORAGE_KEYS.HEART_TRANSACTIONS, allTransactions);
    }

    // Sync to Supabase
    syncToSupabase(user.id, session, { heartState: updatedHeartState }).catch((error) => {
      console.error('Failed to sync heart loss to Supabase:', error);
    });
    if (session && transaction) {
      db.logHeartTransaction(user.id, transaction.change, transaction.reason).catch((error) => {
        console.error('Failed to log heart transaction:', error);
      });
    }

    return canContinue;
  };

  const gainHeartForReason = async (reason: HeartGainReason, challengeId?: string): Promise<void> => {
    if (!user || !heartState) return;

    const { updatedHeartState, transaction } = gainHeart(heartState, reason, user.isPremium, challengeId);

    setHeartState(updatedHeartState);
    await saveToStorage(STORAGE_KEYS.HEART_STATE, updatedHeartState);

    if (transaction) {
      const allTransactions = await loadFromStorage<HeartTransaction[]>(STORAGE_KEYS.HEART_TRANSACTIONS) || [];
      allTransactions.push(transaction);
      await saveToStorage(STORAGE_KEYS.HEART_TRANSACTIONS, allTransactions);
    }

    // Sync to Supabase
    syncToSupabase(user.id, session, { heartState: updatedHeartState }).catch((error) => {
      console.error('Failed to sync heart gain to Supabase:', error);
    });
    if (session && transaction) {
      db.logHeartTransaction(user.id, transaction.change, transaction.reason).catch((error) => {
        console.error('Failed to log heart transaction:', error);
      });
    }
  };

  const canStartChallengeCheck = (isDifficult = false): { canStart: boolean; reason?: string } => {
    if (!user || !heartState) {
      return { canStart: false, reason: 'Loading...' };
    }

    return canStartChallenge(heartState, user.isPremium, isDifficult);
  };

  const completeRefillAction = async (action: HeartRefillActionType): Promise<void> => {
    // For now, all refill actions give 1 heart
    const reasonMap: Record<HeartRefillActionType, HeartGainReason> = {
      breathing_exercise: 'breathing_exercise',
      micro_focus: 'micro_focus',
      invite_friend: 'invite_friend',
      watch_tip: 'watch_tip',
    };

    await gainHeartForReason(reasonMap[action]);
  };

  const clearNewBadges = (): void => {
    setNewlyUnlockedBadges([]);
  };

  const setCurrentNodeId = async (nodeId: string): Promise<void> => {
    if (!progressTree || !user) return;

    const updatedProgressTree = { ...progressTree };
    updatedProgressTree.currentNodeId = nodeId;
    
    setProgressTree(updatedProgressTree);
    await saveToStorage(STORAGE_KEYS.PROGRESS_TREE, updatedProgressTree);

    // Sync to Supabase
    syncToSupabase(user.id, session, {
      progressTree: updatedProgressTree,
    }).catch((error) => {
      console.error('Failed to sync progress tree update to Supabase:', error);
    });
  };

  // Show loading state while initializing
  if (isLoading) {
    return null; // Or return a loading component
  }

  return (
    <GameContext.Provider
      value={{
        progress,
        skillTree,
        stats,
        todaySession,
        progressTree,
        heartState,
        badgeProgress,
        newlyUnlockedBadges,
        completeChallenge,
        completeSession,
        initializeProgress,
        loseHeartForReason,
        gainHeartForReason,
        canStartChallenge: canStartChallengeCheck,
        completeRefillAction,
        clearNewBadges,
        setCurrentNodeId,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

