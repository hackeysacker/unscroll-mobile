import { supabase } from './supabase';
import type { ExerciseStats } from '@/types';

// ============================================
// GAME PROGRESS
// ============================================

export async function getGameProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Handle case where table doesn't exist yet
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation') || error.code === '42P01') {
        console.warn('Game progress table not found. Returning null.');
        return null;
      }
      if (error.code !== 'PGRST116') {
        console.error('Error fetching game progress:', error);
      }
    }
    return data;
  } catch (err: any) {
    // Handle case where table doesn't exist
    if (err?.message?.includes('Could not find the table') || err?.message?.includes('relation') || err?.code === '42P01') {
      console.warn('Game progress table not found. Returning null.');
      return null;
    }
    console.error('Error fetching game progress:', err);
    return null;
  }
}

export async function updateGameProgress(userId: string, updates: {
  level?: number;
  xp?: number;
  total_xp?: number;
  streak?: number;
  longest_streak?: number;
  last_session_date?: string;
  streak_freeze_used?: boolean;
  total_sessions_completed?: number;
  total_challenges_completed?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('game_progress')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      // Handle case where table doesn't exist yet
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation') || error.code === '42P01') {
        console.warn('Game progress table not found. Update skipped.');
        return null;
      }
      console.error('Error updating game progress:', error.message, error.details);
    }
    return data;
  } catch (err: any) {
    // Handle case where table doesn't exist
    if (err?.message?.includes('Could not find the table') || err?.message?.includes('relation') || err?.code === '42P01') {
      console.warn('Game progress table not found. Update skipped.');
      return null;
    }
    console.error('Error updating game progress:', err);
    return null;
  }
}

// ============================================
// SKILL PROGRESS
// ============================================

export async function getSkillProgress(userId: string) {
  const { data, error } = await supabase
    .from('skill_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching skill progress:', error);
  }
  return data;
}

export async function updateSkillProgress(userId: string, updates: {
  focus_score?: number;
  impulse_control_score?: number;
  distraction_resistance_score?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('skill_progress')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating skill progress:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating skill progress:', err);
    return null;
  }
}

// ============================================
// CHALLENGE RESULTS
// ============================================

export async function saveChallengeResult(userId: string, result: {
  challenge_type: string;
  score: number;
  duration: number;
  xp_earned: number;
  is_perfect?: boolean;
  accuracy?: number;
  achievements?: string[];
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('challenge_results')
    .insert({
      user_id: userId,
      ...result,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving challenge result:', error);
  }
  return data;
}

export async function getChallengeHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('challenge_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching challenge history:', error);
  }
  return data || [];
}

export async function getChallengeStats(userId: string, challengeType: string) {
  const { data, error } = await supabase
    .from('challenge_results')
    .select('score, duration, xp_earned, is_perfect')
    .eq('user_id', userId)
    .eq('challenge_type', challengeType);

  if (error) {
    console.error('Error fetching challenge stats:', error);
  }

  if (!data || data.length === 0) return null;

  return {
    totalAttempts: data.length,
    averageScore: data.reduce((sum, r) => sum + r.score, 0) / data.length,
    highScore: Math.max(...data.map(r => r.score)),
    totalXP: data.reduce((sum, r) => sum + r.xp_earned, 0),
    perfectCount: data.filter(r => r.is_perfect).length,
  };
}

// ============================================
// DAILY SESSIONS
// ============================================

export async function getDailySession(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching daily session:', error);
  }
  return data;
}

export async function updateDailySession(userId: string, date: string, updates: {
  total_xp?: number;
  completed?: boolean;
  challenges_completed?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('daily_sessions')
      .upsert({
        user_id: userId,
        date,
        ...updates,
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      console.error('Error updating daily session:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating daily session:', err);
    return null;
  }
}

export async function getSessionHistory(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching session history:', error);
  }
  return data || [];
}

// ============================================
// USER STATS
// ============================================

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user stats:', error);
  }
  return data;
}

export async function updateUserStats(userId: string, updates: {
  total_attention_time?: number;
  longest_gaze_hold?: number;
  focus_accuracy?: number;
  impulse_control_score?: number;
  stability_rating?: number;
  total_exercises_completed?: number;
  average_score?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating user stats:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating user stats:', err);
    return null;
  }
}

// ============================================
// HEARTS SYSTEM
// ============================================

export async function getHeartState(userId: string) {
  const { data, error } = await supabase
    .from('heart_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching heart state:', error);
  }
  return data;
}

export async function updateHeartState(userId: string, updates: {
  current_hearts?: number;
  max_hearts?: number;
  last_heart_lost?: string;
  last_midnight_reset?: string;
  perfect_streak_count?: number;
  total_lost?: number;
  total_gained?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('heart_state')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating heart state:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating heart state:', err);
    return null;
  }
}

export async function logHeartTransaction(userId: string, changeAmount: number, reason: string) {
  const { error } = await supabase
    .from('heart_transactions')
    .insert({
      user_id: userId,
      change_amount: changeAmount,
      reason,
    });

  if (error) {
    console.error('Error logging heart transaction:', error);
  }
}

// ============================================
// BADGES
// ============================================

export async function getBadges(userId: string) {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      // Handle case where table doesn't exist yet
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation') || error.code === '42P01') {
        console.warn('Badges table not found. Returning empty array.');
        return [];
      }
      console.error('Error fetching badges:', error);
    }
    return data || [];
  } catch (err: any) {
    // Handle case where table doesn't exist
    if (err?.message?.includes('Could not find the table') || err?.message?.includes('relation') || err?.code === '42P01') {
      console.warn('Badges table not found. Returning empty array.');
      return [];
    }
    console.error('Error fetching badges:', err);
    return [];
  }
}

export async function unlockBadge(userId: string, badge: {
  badge_type: string;
  name: string;
  description: string;
  icon: string;
}) {
  try {
    // Verify user is authenticated and get current session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn('User not authenticated. Badge unlock skipped:', badge.badge_type);
      return null;
    }

    // Ensure the userId matches the authenticated user (RLS requirement)
    if (user.id !== userId) {
      console.warn('User ID mismatch. Using authenticated user ID for badge unlock:', badge.badge_type);
      // Use the authenticated user's ID instead
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('badges')
      .upsert({
        user_id: userId,
        ...badge,
        unlocked_at: new Date().toISOString(),
      }, { onConflict: 'user_id,badge_type' })
      .select()
      .single();

    if (error) {
      // Handle case where table doesn't exist yet
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation') || error.code === '42P01') {
        console.warn('Badges table not found. Badge unlock skipped:', badge.badge_type);
        return null;
      }
      // Handle RLS policy violation
      if (error.message?.includes('row-level security') || error.code === '42501') {
        console.warn('RLS policy violation. User may not be authenticated. Badge unlock skipped:', badge.badge_type);
        return null;
      }
      console.error('Error unlocking badge:', error.message, error.details);
    }
    return data;
  } catch (err: any) {
    // Handle case where table doesn't exist
    if (err?.message?.includes('Could not find the table') || err?.message?.includes('relation') || err?.code === '42P01') {
      console.warn('Badges table not found. Badge unlock skipped:', badge.badge_type);
      return null;
    }
    // Handle RLS policy violation
    if (err?.message?.includes('row-level security') || err?.code === '42501') {
      console.warn('RLS policy violation. User may not be authenticated. Badge unlock skipped:', badge.badge_type);
      return null;
    }
    console.error('Error unlocking badge:', err);
    return null;
  }
}

export async function getBadgeProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('badge_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      // Handle case where table doesn't exist yet
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation') || error.code === '42P01') {
        console.warn('Badge progress table not found. Returning empty array.');
        return [];
      }
      console.error('Error fetching badge progress:', error);
    }
    return data || [];
  } catch (err: any) {
    // Handle case where table doesn't exist
    if (err?.message?.includes('Could not find the table') || err?.message?.includes('relation') || err?.code === '42P01') {
      console.warn('Badge progress table not found. Returning empty array.');
      return [];
    }
    console.error('Error fetching badge progress:', err);
    return [];
  }
}

export async function updateBadgeProgress(userId: string, badgeType: string, currentProgress: number, targetProgress: number) {
  try {
    const { data, error } = await supabase
      .from('badge_progress')
      .upsert({
        user_id: userId,
        badge_type: badgeType,
        current_progress: currentProgress,
        target_progress: targetProgress,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,badge_type' })
      .select()
      .single();

    if (error) {
      // Handle case where table doesn't exist yet
      if (error.message?.includes('Could not find the table') || error.message?.includes('relation') || error.code === '42P01') {
        console.warn('Badge progress table not found. Update skipped:', badgeType);
        return null;
      }
      console.error('Error updating badge progress:', error.message, error.details);
    }
    return data;
  } catch (err: any) {
    // Handle case where table doesn't exist
    if (err?.message?.includes('Could not find the table') || err?.message?.includes('relation') || err?.code === '42P01') {
      console.warn('Badge progress table not found. Update skipped:', badgeType);
      return null;
    }
    console.error('Error updating badge progress:', err);
    return null;
  }
}

// ============================================
// PROGRESS TREE
// ============================================

export async function getProgressTreeState(userId: string) {
  const { data, error } = await supabase
    .from('progress_tree_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching progress tree state:', error);
  }
  return data;
}

export async function updateProgressTreeState(userId: string, updates: {
  unlocked_nodes?: string[];
  current_path?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('progress_tree_state')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating progress tree state:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating progress tree state:', err);
    return null;
  }
}

export async function getProgressNodes(userId: string) {
  const { data, error } = await supabase
    .from('progress_nodes')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching progress nodes:', error);
  }
  return data || [];
}

export async function updateProgressNode(userId: string, nodeId: string, updates: {
  unlocked?: boolean;
  completed?: boolean;
}) {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('progress_nodes')
      .upsert({
        user_id: userId,
        node_id: nodeId,
        ...updates,
        unlocked_at: updates.unlocked ? now : undefined,
        completed_at: updates.completed ? now : undefined,
      }, { onConflict: 'user_id,node_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating progress node:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating progress node:', err);
    return null;
  }
}

// ============================================
// SETTINGS
// ============================================

export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user settings:', error);
  }
  return data;
}

export async function updateUserSettings(userId: string, updates: {
  vibration_enabled?: boolean;
  sound_enabled?: boolean;
  dark_mode?: boolean;
  notifications_enabled?: boolean;
  daily_reminder_time?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating user settings:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating user settings:', err);
    return null;
  }
}

// ============================================
// THEMES
// ============================================

export async function getUserTheme(userId: string) {
  const { data, error } = await supabase
    .from('user_themes')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user theme:', error);
  }
  return data;
}

export async function updateUserTheme(userId: string, updates: {
  theme_name?: string;
  custom_colors?: Record<string, string>;
}) {
  try {
    const { data, error } = await supabase
      .from('user_themes')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating user theme:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating user theme:', err);
    return null;
  }
}

// ============================================
// ANALYTICS
// ============================================

export async function getDeepAnalytics(userId: string) {
  const { data, error } = await supabase
    .from('deep_analytics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching deep analytics:', error);
  }
  return data;
}

export async function updateDeepAnalytics(userId: string, updates: {
  weekly_summary?: Record<string, any>;
  monthly_trends?: Record<string, any>;
  skill_breakdown?: Record<string, any>;
  improvement_rate?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('deep_analytics')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating deep analytics:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating deep analytics:', err);
    return null;
  }
}

export async function logAnalyticsDataPoint(userId: string, metricType: string, value: number, metadata?: Record<string, any>) {
  const { error } = await supabase
    .from('analytics_data_points')
    .insert({
      user_id: userId,
      metric_type: metricType,
      value,
      metadata,
    });

  if (error) {
    console.error('Error logging analytics data point:', error);
  }
}

// ============================================
// WIND DOWN SESSIONS
// ============================================

export async function saveWindDownSession(userId: string, session: {
  duration: number;
  exercises_completed?: string[];
  mood_before?: number;
  mood_after?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('wind_down_sessions')
      .insert({
        user_id: userId,
        duration: session.duration,
        exercises_completed: session.exercises_completed || [],
        mood_before: session.mood_before || null,
        mood_after: session.mood_after || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving wind down session:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error saving wind down session:', err);
    return null;
  }
}

export async function getWindDownSessions(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('wind_down_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching wind down sessions:', error);
  }
  return data || [];
}

// ============================================
// WIND DOWN SETTINGS
// ============================================

export async function getWindDownSettings(userId: string) {
  const { data, error } = await supabase
    .from('wind_down_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching wind down settings:', error);
  }
  return data;
}

export async function updateWindDownSettings(userId: string, updates: {
  preferred_duration?: number;
  preferred_exercises?: string[];
  reminder_enabled?: boolean;
  reminder_time?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('wind_down_settings')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating wind down settings:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating wind down settings:', err);
    return null;
  }
}

// ============================================
// TRAINING PLANS
// ============================================

export async function saveTrainingPlan(userId: string, plan: {
  plan_type: string;
  exercises: string[];
  duration_days?: number;
  is_active?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('training_plans')
      .insert({
        user_id: userId,
        plan_type: plan.plan_type,
        exercises: plan.exercises,
        duration_days: plan.duration_days || null,
        is_active: plan.is_active ?? true,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving training plan:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error saving training plan:', err);
    return null;
  }
}

export async function getTrainingPlans(userId: string, activeOnly = true) {
  let query = supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching training plans:', error);
  }
  return data || [];
}

export async function updateTrainingPlan(planId: string, updates: {
  completed_at?: string;
  is_active?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('training_plans')
      .update({
        ...updates,
        completed_at: updates.completed_at ? new Date(updates.completed_at).toISOString() : undefined,
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error updating training plan:', error.message, error.details);
    }
    return data;
  } catch (err) {
    console.error('Error updating training plan:', err);
    return null;
  }
}

// ============================================
// SYNC HELPER
// ============================================

export async function syncAllUserData(userId: string) {
  const [
    gameProgress,
    skillProgress,
    userStats,
    heartState,
    badges,
    settings,
    theme,
  ] = await Promise.all([
    getGameProgress(userId),
    getSkillProgress(userId),
    getUserStats(userId),
    getHeartState(userId),
    getBadges(userId),
    getUserSettings(userId),
    getUserTheme(userId),
  ]);

  return {
    gameProgress,
    skillProgress,
    userStats,
    heartState,
    badges,
    settings,
    theme,
  };
}
