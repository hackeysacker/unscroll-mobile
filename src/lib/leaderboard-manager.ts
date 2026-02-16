/**
 * Leaderboard Manager
 * Handles leaderboard data fetching, caching, and updates
 */

import { supabase } from './supabase';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
  isCurrentUser?: boolean;
  rankChange?: number;
}

export interface LeaderboardStats {
  totalPlayers: number;
  topPercentile: number; // User's percentile (0-100)
  daysUntilReset?: number; // For weekly leaderboards
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime';
export type LeaderboardType = 'xp' | 'streak' | 'level';

/**
 * Fetch leaderboard entries
 */
export async function fetchLeaderboard(
  period: LeaderboardPeriod,
  type: LeaderboardType = 'xp',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_period: period,
      p_type: type,
      p_limit: limit,
    });

    if (error) throw error;

    return (data || []).map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user_id,
      name: entry.display_name || entry.email?.split('@')[0] || 'Anonymous',
      xp: entry.total_xp || 0,
      level: entry.level || 1,
      streak: entry.streak || 0,
      avatar: entry.avatar_emoji || '😊',
      rankChange: entry.rank_change || 0,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Fetch user's leaderboard stats
 */
export async function fetchUserLeaderboardStats(
  userId: string,
  period: LeaderboardPeriod
): Promise<{
  rank: number;
  totalPlayers: number;
  percentile: number;
  rankChange: number;
}> {
  try {
    const { data, error } = await supabase.rpc('get_user_leaderboard_rank', {
      p_user_id: userId,
      p_period: period,
    });

    if (error) throw error;

    return {
      rank: data?.rank || 0,
      totalPlayers: data?.total_players || 0,
      percentile: data?.percentile || 0,
      rankChange: data?.rank_change || 0,
    };
  } catch (error) {
    console.error('Error fetching user leaderboard stats:', error);
    return {
      rank: 0,
      totalPlayers: 0,
      percentile: 0,
      rankChange: 0,
    };
  }
}

/**
 * Fetch friends leaderboard
 */
export async function fetchFriendsLeaderboard(
  userId: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_friends_leaderboard', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) throw error;

    return (data || []).map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user_id,
      name: entry.display_name || entry.email?.split('@')[0] || 'Friend',
      xp: entry.total_xp || 0,
      level: entry.level || 1,
      streak: entry.streak || 0,
      avatar: entry.avatar_emoji || '😊',
      rankChange: entry.rank_change || 0,
    }));
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    return [];
  }
}

/**
 * Update user's leaderboard data
 * Called after challenge completion to keep leaderboard fresh
 */
export async function updateLeaderboardEntry(
  userId: string,
  updates: {
    totalXp?: number;
    level?: number;
    streak?: number;
    weeklyXp?: number;
    monthlyXp?: number;
  }
): Promise<void> {
  try {
    const { error } = await supabase.from('leaderboard_cache').upsert({
      user_id: userId,
      total_xp: updates.totalXp,
      level: updates.level,
      streak: updates.streak,
      weekly_xp: updates.weeklyXp,
      monthly_xp: updates.monthlyXp,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating leaderboard entry:', error);
  }
}

/**
 * Get nearby players (players ranked close to the user)
 */
export async function fetchNearbyPlayers(
  userId: string,
  period: LeaderboardPeriod,
  range: number = 5
): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_nearby_players', {
      p_user_id: userId,
      p_period: period,
      p_range: range,
    });

    if (error) throw error;

    return (data || []).map((entry: any) => ({
      rank: entry.rank,
      userId: entry.user_id,
      name: entry.display_name || entry.email?.split('@')[0] || 'Player',
      xp: entry.total_xp || 0,
      level: entry.level || 1,
      streak: entry.streak || 0,
      avatar: entry.avatar_emoji || '😊',
      isCurrentUser: entry.user_id === userId,
      rankChange: entry.rank_change || 0,
    }));
  } catch (error) {
    console.error('Error fetching nearby players:', error);
    return [];
  }
}

/**
 * Leaderboard cache manager
 * Provides local caching with automatic refresh
 */
export class LeaderboardCache {
  private cache: Map<string, { data: LeaderboardEntry[]; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(period: LeaderboardPeriod, type: LeaderboardType): string {
    return `${period}_${type}`;
  }

  async getLeaderboard(
    period: LeaderboardPeriod,
    type: LeaderboardType = 'xp',
    forceRefresh: boolean = false
  ): Promise<LeaderboardEntry[]> {
    const key = this.getCacheKey(period, type);
    const cached = this.cache.get(key);

    // Return cached data if fresh
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Fetch fresh data
    const data = await fetchLeaderboard(period, type);

    // Update cache
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  clearCache() {
    this.cache.clear();
  }

  invalidateCache(period?: LeaderboardPeriod) {
    if (period) {
      // Invalidate specific period
      const keys = Array.from(this.cache.keys()).filter(key => key.startsWith(period));
      keys.forEach(key => this.cache.delete(key));
    } else {
      // Invalidate all
      this.clearCache();
    }
  }
}

// Singleton instance
export const leaderboardCache = new LeaderboardCache();

/**
 * Calculate days until weekly reset
 */
export function getDaysUntilWeeklyReset(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return daysUntilMonday;
}

/**
 * Calculate days until monthly reset
 */
export function getDaysUntilMonthlyReset(): number {
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  return lastDayOfMonth - currentDay + 1;
}

/**
 * Format leaderboard rank with suffix (1st, 2nd, 3rd, etc.)
 */
export function formatRank(rank: number): string {
  if (rank === 0) return 'Unranked';

  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  return rank + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

/**
 * Get rank color
 */
export function getRankColor(rank: number): string {
  if (rank === 1) return '#FFD700'; // Gold
  if (rank === 2) return '#C0C0C0'; // Silver
  if (rank === 3) return '#CD7F32'; // Bronze
  if (rank <= 10) return '#6366F1'; // Top 10 - Purple
  if (rank <= 100) return '#10B981'; // Top 100 - Green
  return '#9CA3AF'; // Others - Gray
}

/**
 * Get rank badge emoji
 */
export function getRankBadge(rank: number): string {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '⭐';
  if (rank <= 100) return '🏅';
  return '';
}
