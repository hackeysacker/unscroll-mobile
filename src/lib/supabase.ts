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

// Database types for TypeScript - Updated to match new schema
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_name: string | null;
          created_at: string;
          updated_at: string;
          onboarding_completed: boolean;
          total_xp: number;
          current_level: number;
          streak_days: number;
          last_activity_date: string | null;
          hearts: number;
          gems: number;
          notifications_enabled: boolean;
          sound_enabled: boolean;
          haptics_enabled: boolean;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_name?: string | null;
          created_at?: string;
          updated_at?: string;
          onboarding_completed?: boolean;
          total_xp?: number;
          current_level?: number;
          streak_days?: number;
          last_activity_date?: string | null;
          hearts?: number;
          gems?: number;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          haptics_enabled?: boolean;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_name?: string | null;
          created_at?: string;
          updated_at?: string;
          onboarding_completed?: boolean;
          total_xp?: number;
          current_level?: number;
          streak_days?: number;
          last_activity_date?: string | null;
          hearts?: number;
          gems?: number;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          haptics_enabled?: boolean;
        };
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          referral_code: string;
          signup_source: string | null;
          marketing_source: string | null;
          marketing_campaign: string | null;
          referral_code_used: string | null;
          position: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          referral_code: string;
          signup_source?: string | null;
          marketing_source?: string | null;
          marketing_campaign?: string | null;
          referral_code_used?: string | null;
          position?: number | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          referral_code?: string;
          signup_source?: string | null;
          marketing_source?: string | null;
          marketing_campaign?: string | null;
          referral_code_used?: string | null;
          position?: number | null;
          joined_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          challenge_type: string;
          name: string;
          description: string | null;
          category: string;
          difficulty: string;
          base_xp: number;
          max_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_type: string;
          name: string;
          description?: string | null;
          category: string;
          difficulty?: string;
          base_xp?: number;
          max_level?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_type?: string;
          name?: string;
          description?: string | null;
          category?: string;
          difficulty?: string;
          base_xp?: number;
          max_level?: number;
          created_at?: string;
        };
      };
      challenge_attempts: {
        Row: {
          id: string;
          user_id: string;
          challenge_type: string;
          level: number;
          score: number;
          duration_ms: number;
          is_perfect: boolean;
          is_passed: boolean;
          xp_earned: number;
          accuracy: number | null;
          reaction_time_ms: number | null;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_type: string;
          level: number;
          score: number;
          duration_ms: number;
          is_perfect?: boolean;
          is_passed?: boolean;
          xp_earned: number;
          accuracy?: number | null;
          reaction_time_ms?: number | null;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_type?: string;
          level?: number;
          score?: number;
          duration_ms?: number;
          is_perfect?: boolean;
          is_passed?: boolean;
          xp_earned?: number;
          accuracy?: number | null;
          reaction_time_ms?: number | null;
          attempted_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          challenge_type: string;
          current_level: number;
          highest_score: number;
          total_attempts: number;
          total_perfect: number;
          total_passed: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_type: string;
          current_level?: number;
          highest_score?: number;
          total_attempts?: number;
          total_perfect?: number;
          total_passed?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_type?: string;
          current_level?: number;
          highest_score?: number;
          total_attempts?: number;
          total_perfect?: number;
          total_passed?: number;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          name: string;
          description: string;
          icon: string;
          tier: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          name: string;
          description: string;
          icon: string;
          tier?: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          name?: string;
          description?: string;
          icon?: string;
          tier?: string;
          unlocked_at?: string;
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
      daily_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          challenges_completed: number;
          total_xp_earned: number;
          perfect_challenges: number;
          total_practice_time_ms: number;
          best_score: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          challenges_completed?: number;
          total_xp_earned?: number;
          perfect_challenges?: number;
          total_practice_time_ms?: number;
          best_score?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          challenges_completed?: number;
          total_xp_earned?: number;
          perfect_challenges?: number;
          total_practice_time_ms?: number;
          best_score?: number;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          period: string;
          total_xp: number;
          rank: number | null;
          challenges_completed: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period: string;
          total_xp?: number;
          rank?: number | null;
          challenges_completed?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period?: string;
          total_xp?: number;
          rank?: number | null;
          challenges_completed?: number;
          updated_at?: string;
        };
      };
    };
  };
};
