/**
 * Leaderboard Context
 * Manages leaderboard data and real-time updates
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  type LeaderboardEntry,
  type LeaderboardPeriod,
  fetchLeaderboard,
  fetchUserLeaderboardStats,
  fetchFriendsLeaderboard,
  updateLeaderboardEntry,
  leaderboardCache,
  getDaysUntilWeeklyReset,
  getDaysUntilMonthlyReset,
} from '@/lib/leaderboard-manager';
import { useAuth } from './AuthContext';
import { useGame } from './GameContext';

interface LeaderboardContextValue {
  // Leaderboard data
  weeklyLeaderboard: LeaderboardEntry[];
  monthlyLeaderboard: LeaderboardEntry[];
  alltimeLeaderboard: LeaderboardEntry[];
  friendsLeaderboard: LeaderboardEntry[];

  // User stats
  userRank: {
    weekly: number;
    monthly: number;
    alltime: number;
  };
  userPercentile: {
    weekly: number;
    monthly: number;
    alltime: number;
  };
  rankChange: {
    weekly: number;
    monthly: number;
    alltime: number;
  };

  // Metadata
  daysUntilWeeklyReset: number;
  daysUntilMonthlyReset: number;
  isLoading: boolean;
  lastUpdated: Date | null;

  // Actions
  refreshLeaderboard: (period?: LeaderboardPeriod) => Promise<void>;
  updateUserLeaderboardData: () => Promise<void>;
}

const LeaderboardContext = createContext<LeaderboardContextValue | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { progress } = useGame();

  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [alltimeLeaderboard, setAlltimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [userRank, setUserRank] = useState({ weekly: 0, monthly: 0, alltime: 0 });
  const [userPercentile, setUserPercentile] = useState({ weekly: 0, monthly: 0, alltime: 0 });
  const [rankChange, setRankChange] = useState({ weekly: 0, monthly: 0, alltime: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Calculate days until resets
  const [daysUntilWeeklyReset, setDaysUntilWeeklyReset] = useState(getDaysUntilWeeklyReset());
  const [daysUntilMonthlyReset, setDaysUntilMonthlyReset] = useState(getDaysUntilMonthlyReset());

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setDaysUntilWeeklyReset(getDaysUntilWeeklyReset());
      setDaysUntilMonthlyReset(getDaysUntilMonthlyReset());
    }, 60 * 60 * 1000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  // Load leaderboards on mount
  useEffect(() => {
    if (user) {
      refreshLeaderboard();
    }
  }, [user]);

  // Refresh leaderboard data
  const refreshLeaderboard = async (period?: LeaderboardPeriod) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Fetch leaderboards
      const [weekly, monthly, alltime, friends] = await Promise.all([
        period === 'weekly' || !period
          ? leaderboardCache.getLeaderboard('weekly', 'xp', false)
          : Promise.resolve(weeklyLeaderboard),
        period === 'monthly' || !period
          ? leaderboardCache.getLeaderboard('monthly', 'xp', false)
          : Promise.resolve(monthlyLeaderboard),
        period === 'alltime' || !period
          ? leaderboardCache.getLeaderboard('alltime', 'xp', false)
          : Promise.resolve(alltimeLeaderboard),
        !period ? fetchFriendsLeaderboard(user.id, 50) : Promise.resolve(friendsLeaderboard),
      ]);

      // Update state
      if (period === 'weekly' || !period) setWeeklyLeaderboard(weekly);
      if (period === 'monthly' || !period) setMonthlyLeaderboard(monthly);
      if (period === 'alltime' || !period) setAlltimeLeaderboard(alltime);
      if (!period) setFriendsLeaderboard(friends);

      // Fetch user stats
      const [weeklyStats, monthlyStats, alltimeStats] = await Promise.all([
        fetchUserLeaderboardStats(user.id, 'weekly'),
        fetchUserLeaderboardStats(user.id, 'monthly'),
        fetchUserLeaderboardStats(user.id, 'alltime'),
      ]);

      setUserRank({
        weekly: weeklyStats.rank,
        monthly: monthlyStats.rank,
        alltime: alltimeStats.rank,
      });

      setUserPercentile({
        weekly: weeklyStats.percentile,
        monthly: monthlyStats.percentile,
        alltime: alltimeStats.percentile,
      });

      setRankChange({
        weekly: weeklyStats.rankChange,
        monthly: monthlyStats.rankChange,
        alltime: alltimeStats.rankChange,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user's leaderboard data after challenge completion
  const updateUserLeaderboardData = async () => {
    if (!user || !progress) return;

    try {
      await updateLeaderboardEntry(user.id, {
        totalXp: progress.totalXp,
        level: progress.level,
        streak: progress.streak,
        // Note: weekly and monthly XP should be tracked separately
        // This is a simplified version
        weeklyXp: progress.xp,
        monthlyXp: progress.xp,
      });

      // Invalidate cache to force refresh on next view
      leaderboardCache.invalidateCache();
    } catch (error) {
      console.error('Error updating user leaderboard data:', error);
    }
  };

  return (
    <LeaderboardContext.Provider
      value={{
        weeklyLeaderboard,
        monthlyLeaderboard,
        alltimeLeaderboard,
        friendsLeaderboard,
        userRank,
        userPercentile,
        rankChange,
        daysUntilWeeklyReset,
        daysUntilMonthlyReset,
        isLoading,
        lastUpdated,
        refreshLeaderboard,
        updateUserLeaderboardData,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within LeaderboardProvider');
  }
  return context;
}
