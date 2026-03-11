import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxgpcsfwbzptlmwfddda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z3Bjc2Z3YnpwdGxtd2ZkZGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTI0NzYsImV4cCI6MjA3OTMyODQ3Nn0.kkQc632Gu8ozuCD5HoZVS35yGbxA4l2kmuq96bCBg4w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types - Matches supabase/schema.sql
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          goal: string | null;
          is_premium: boolean;
          updated_at: string;
          gems: number; // Gem currency balance
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
          goal?: string | null;
          is_premium?: boolean;
          updated_at?: string;
          gems?: number;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          goal?: string | null;
          is_premium?: boolean;
          updated_at?: string;
          gems?: number;
        };
      };
      user_onboarding: {
        Row: {
          user_id: string;
          daily_scroll_hours: number | null;
          primary_distraction_app: string | null;
          worst_scroll_time: string | null;
          improvement_reason: string | null;
          wants_auto_tracking: boolean | null;
          baseline_score: number | null;
          goal_result: string | null;
          daily_training_minutes: number | null;
          personality_type: string | null;
          notifications_accepted: boolean | null;
          screentime_accepted: boolean | null;
          daily_checkin_accepted: boolean | null;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          daily_scroll_hours?: number | null;
          primary_distraction_app?: string | null;
          worst_scroll_time?: string | null;
          improvement_reason?: string | null;
          wants_auto_tracking?: boolean | null;
          baseline_score?: number | null;
          goal_result?: string | null;
          daily_training_minutes?: number | null;
          personality_type?: string | null;
          notifications_accepted?: boolean | null;
          screentime_accepted?: boolean | null;
          daily_checkin_accepted?: boolean | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          daily_scroll_hours?: number | null;
          primary_distraction_app?: string | null;
          worst_scroll_time?: string | null;
          improvement_reason?: string | null;
          wants_auto_tracking?: boolean | null;
          baseline_score?: number | null;
          goal_result?: string | null;
          daily_training_minutes?: number | null;
          personality_type?: string | null;
          notifications_accepted?: boolean | null;
          screentime_accepted?: boolean | null;
          daily_checkin_accepted?: boolean | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      game_progress: {
        Row: {
          user_id: string;
          level: number;
          xp: number;
          total_xp: number;
          streak: number;
          longest_streak: number;
          last_session_date: string | null;
          streak_freeze_used: boolean;
          total_sessions_completed: number;
          total_challenges_completed: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          streak?: number;
          longest_streak?: number;
          last_session_date?: string | null;
          streak_freeze_used?: boolean;
          total_sessions_completed?: number;
          total_challenges_completed?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          level?: number;
          xp?: number;
          total_xp?: number;
          streak?: number;
          longest_streak?: number;
          last_session_date?: string | null;
          streak_freeze_used?: boolean;
          total_sessions_completed?: number;
          total_challenges_completed?: number;
          updated_at?: string;
        };
      };
      skill_progress: {
        Row: {
          user_id: string;
          focus_score: number;
          impulse_control_score: number;
          distraction_resistance_score: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          focus_score?: number;
          impulse_control_score?: number;
          distraction_resistance_score?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          focus_score?: number;
          impulse_control_score?: number;
          distraction_resistance_score?: number;
          updated_at?: string;
        };
      };
      challenge_results: {
        Row: {
          id: string;
          user_id: string;
          challenge_type: string;
          timestamp: string;
          score: number;
          duration: number;
          xp_earned: number;
          is_perfect: boolean;
          accuracy: number | null;
          achievements: string[] | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_type: string;
          timestamp?: string;
          score: number;
          duration: number;
          xp_earned: number;
          is_perfect?: boolean;
          accuracy?: number | null;
          achievements?: string[] | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_type?: string;
          timestamp?: string;
          score?: number;
          duration?: number;
          xp_earned?: number;
          is_perfect?: boolean;
          accuracy?: number | null;
          achievements?: string[] | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      daily_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_xp: number;
          completed: boolean;
          challenges_completed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_xp?: number;
          completed?: boolean;
          challenges_completed?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_xp?: number;
          completed?: boolean;
          challenges_completed?: number;
          created_at?: string;
        };
      };
      user_stats: {
        Row: {
          user_id: string;
          total_attention_time: number;
          longest_gaze_hold: number;
          focus_accuracy: number | null;
          impulse_control_score: number | null;
          stability_rating: number | null;
          total_exercises_completed: number;
          average_score: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_attention_time?: number;
          longest_gaze_hold?: number;
          focus_accuracy?: number | null;
          impulse_control_score?: number | null;
          stability_rating?: number | null;
          total_exercises_completed?: number;
          average_score?: number | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          total_attention_time?: number;
          longest_gaze_hold?: number;
          focus_accuracy?: number | null;
          impulse_control_score?: number | null;
          stability_rating?: number | null;
          total_exercises_completed?: number;
          average_score?: number | null;
          updated_at?: string;
        };
      };
      heart_state: {
        Row: {
          user_id: string;
          current_hearts: number;
          max_hearts: number;
          last_heart_lost: string | null;
          last_midnight_reset: string | null;
          perfect_streak_count: number;
          total_lost: number;
          total_gained: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_hearts?: number;
          max_hearts?: number;
          last_heart_lost?: string | null;
          last_midnight_reset?: string | null;
          perfect_streak_count?: number;
          total_lost?: number;
          total_gained?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          current_hearts?: number;
          max_hearts?: number;
          last_heart_lost?: string | null;
          last_midnight_reset?: string | null;
          perfect_streak_count?: number;
          total_lost?: number;
          total_gained?: number;
          updated_at?: string;
        };
      };
      heart_refill_slots: {
        Row: {
          id: string;
          user_id: string;
          slot_index: number;
          refill_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slot_index: number;
          refill_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slot_index?: number;
          refill_at?: string | null;
          created_at?: string;
        };
      };
      heart_transactions: {
        Row: {
          id: string;
          user_id: string;
          change_amount: number;
          reason: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          change_amount: number;
          reason: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          change_amount?: number;
          reason?: string;
          timestamp?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          unlocked_at: string;
          name: string;
          description: string;
          icon: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          unlocked_at?: string;
          name: string;
          description: string;
          icon: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          unlocked_at?: string;
          name?: string;
          description?: string;
          icon?: string;
        };
      };
      badge_progress: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          current_progress: number;
          target_progress: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          current_progress?: number;
          target_progress: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          current_progress?: number;
          target_progress?: number;
          updated_at?: string;
        };
      };
      progress_tree_state: {
        Row: {
          user_id: string;
          unlocked_nodes: string[];
          current_path: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          unlocked_nodes?: string[];
          current_path?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          unlocked_nodes?: string[];
          current_path?: string | null;
          updated_at?: string;
        };
      };
      progress_nodes: {
        Row: {
          id: string;
          user_id: string;
          node_id: string;
          unlocked: boolean;
          completed: boolean;
          unlocked_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          node_id: string;
          unlocked?: boolean;
          completed?: boolean;
          unlocked_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          node_id?: string;
          unlocked?: boolean;
          completed?: boolean;
          unlocked_at?: string | null;
          completed_at?: string | null;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          vibration_enabled: boolean;
          sound_enabled: boolean;
          dark_mode: boolean;
          notifications_enabled: boolean;
          daily_reminder_time: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          vibration_enabled?: boolean;
          sound_enabled?: boolean;
          dark_mode?: boolean;
          notifications_enabled?: boolean;
          daily_reminder_time?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          vibration_enabled?: boolean;
          sound_enabled?: boolean;
          dark_mode?: boolean;
          notifications_enabled?: boolean;
          daily_reminder_time?: string | null;
          updated_at?: string;
        };
      };
      user_themes: {
        Row: {
          user_id: string;
          theme_name: string;
          custom_colors: Record<string, unknown> | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme_name?: string;
          custom_colors?: Record<string, unknown> | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme_name?: string;
          custom_colors?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      training_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_type: string;
          exercises: string[];
          duration_days: number | null;
          started_at: string;
          completed_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type: string;
          exercises: string[];
          duration_days?: number | null;
          started_at?: string;
          completed_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: string;
          exercises?: string[];
          duration_days?: number | null;
          started_at?: string;
          completed_at?: string | null;
          is_active?: boolean;
        };
      };
      training_recommendations: {
        Row: {
          id: string;
          user_id: string;
          recommendation_type: string;
          challenge_types: string[] | null;
          reason: string | null;
          created_at: string;
          acted_on: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          recommendation_type: string;
          challenge_types?: string[] | null;
          reason?: string | null;
          created_at?: string;
          acted_on?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          recommendation_type?: string;
          challenge_types?: string[] | null;
          reason?: string | null;
          created_at?: string;
          acted_on?: boolean;
        };
      };
      wind_down_sessions: {
        Row: {
          id: string;
          user_id: string;
          duration: number;
          exercises_completed: string[] | null;
          mood_before: number | null;
          mood_after: number | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          duration: number;
          exercises_completed?: string[] | null;
          mood_before?: number | null;
          mood_after?: number | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          duration?: number;
          exercises_completed?: string[] | null;
          mood_before?: number | null;
          mood_after?: number | null;
          completed_at?: string;
        };
      };
      wind_down_settings: {
        Row: {
          user_id: string;
          preferred_duration: number;
          preferred_exercises: string[] | null;
          reminder_enabled: boolean;
          reminder_time: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          preferred_duration?: number;
          preferred_exercises?: string[] | null;
          reminder_enabled?: boolean;
          reminder_time?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          preferred_duration?: number;
          preferred_exercises?: string[] | null;
          reminder_enabled?: boolean;
          reminder_time?: string | null;
          updated_at?: string;
        };
      };
      deep_analytics: {
        Row: {
          user_id: string;
          weekly_summary: Record<string, unknown> | null;
          monthly_trends: Record<string, unknown> | null;
          skill_breakdown: Record<string, unknown> | null;
          improvement_rate: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          weekly_summary?: Record<string, unknown> | null;
          monthly_trends?: Record<string, unknown> | null;
          skill_breakdown?: Record<string, unknown> | null;
          improvement_rate?: number | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          weekly_summary?: Record<string, unknown> | null;
          monthly_trends?: Record<string, unknown> | null;
          skill_breakdown?: Record<string, unknown> | null;
          improvement_rate?: number | null;
          updated_at?: string;
        };
      };
      analytics_data_points: {
        Row: {
          id: string;
          user_id: string;
          metric_type: string;
          value: number;
          timestamp: string;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: string;
          value: number;
          timestamp?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: string;
          value?: number;
          timestamp?: string;
          metadata?: Record<string, unknown> | null;
        };
      };
    };
  };
};
