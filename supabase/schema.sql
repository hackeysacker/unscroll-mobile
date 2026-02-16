-- Unscroll Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  goal TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Onboarding Data
CREATE TABLE IF NOT EXISTS user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_scroll_hours INTEGER,
  primary_distraction_app TEXT,
  worst_scroll_time TEXT,
  improvement_reason TEXT,
  wants_auto_tracking BOOLEAN,
  baseline_score INTEGER,
  goal_result TEXT,
  daily_training_minutes INTEGER,
  personality_type TEXT,
  notifications_accepted BOOLEAN,
  screentime_accepted BOOLEAN,
  daily_checkin_accepted BOOLEAN,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMEPLAY TABLES
-- ============================================

-- Game Progress (level, XP, streaks)
CREATE TABLE IF NOT EXISTS game_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  streak_freeze_used BOOLEAN DEFAULT FALSE,
  total_sessions_completed INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Progress (focus, impulse control, distraction resistance)
CREATE TABLE IF NOT EXISTS skill_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_score INTEGER DEFAULT 0,
  impulse_control_score INTEGER DEFAULT 0,
  distraction_resistance_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Results (individual exercise completions)
CREATE TABLE IF NOT EXISTS challenge_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  is_perfect BOOLEAN DEFAULT FALSE,
  accuracy REAL,
  achievements TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Sessions
CREATE TABLE IF NOT EXISTS daily_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  challenges_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- User Stats (aggregate performance metrics)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_attention_time INTEGER DEFAULT 0,
  longest_gaze_hold INTEGER DEFAULT 0,
  focus_accuracy REAL DEFAULT 0,
  impulse_control_score REAL DEFAULT 0,
  stability_rating REAL DEFAULT 0,
  total_exercises_completed INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEARTS SYSTEM
-- ============================================

-- Heart State
CREATE TABLE IF NOT EXISTS heart_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_hearts INTEGER DEFAULT 5,
  max_hearts INTEGER DEFAULT 5,
  last_heart_lost TIMESTAMPTZ,
  last_midnight_reset DATE,
  perfect_streak_count INTEGER DEFAULT 0,
  total_lost INTEGER DEFAULT 0,
  total_gained INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heart Refill Slots
CREATE TABLE IF NOT EXISTS heart_refill_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_index INTEGER NOT NULL,
  refill_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slot_index)
);

-- Heart Transactions (audit log)
CREATE TABLE IF NOT EXISTS heart_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS & BADGES
-- ============================================

-- Badges (unlocked achievements)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  UNIQUE(user_id, badge_type)
);

-- Badge Progress (progress toward unlocking)
CREATE TABLE IF NOT EXISTS badge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- ============================================
-- PROGRESS TREE
-- ============================================

-- Progress Tree State
CREATE TABLE IF NOT EXISTS progress_tree_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_nodes TEXT[] DEFAULT '{}',
  current_path TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual Progress Nodes
CREATE TABLE IF NOT EXISTS progress_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, node_id)
);

-- ============================================
-- SETTINGS & PREFERENCES
-- ============================================

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  daily_reminder_time TIME,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Themes
CREATE TABLE IF NOT EXISTS user_themes (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_name TEXT DEFAULT 'default',
  custom_colors JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PREMIUM FEATURES
-- ============================================

-- Training Plans
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  exercises TEXT[] NOT NULL,
  duration_days INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Training Recommendations
CREATE TABLE IF NOT EXISTS training_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  challenge_types TEXT[],
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acted_on BOOLEAN DEFAULT FALSE
);

-- Wind Down Sessions
CREATE TABLE IF NOT EXISTS wind_down_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  exercises_completed TEXT[],
  mood_before INTEGER,
  mood_after INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wind Down Settings
CREATE TABLE IF NOT EXISTS wind_down_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_duration INTEGER DEFAULT 10,
  preferred_exercises TEXT[],
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_time TIME,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS
-- ============================================

-- Deep Analytics (aggregated insights)
CREATE TABLE IF NOT EXISTS deep_analytics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_summary JSONB,
  monthly_trends JSONB,
  skill_breakdown JSONB,
  improvement_rate REAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Data Points
CREATE TABLE IF NOT EXISTS analytics_data_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_challenge_results_user_id ON challenge_results(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_results_timestamp ON challenge_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_challenge_results_type ON challenge_results(challenge_type);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date ON daily_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_transactions_user_id ON heart_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_user_id ON analytics_data_points(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_timestamp ON analytics_data_points(timestamp);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE heart_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE heart_refill_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE heart_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tree_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wind_down_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wind_down_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data_points ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (users can only access their own data)

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Onboarding
CREATE POLICY "Users can view own onboarding" ON user_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON user_onboarding FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding" ON user_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game Progress
CREATE POLICY "Users can view own game progress" ON game_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own game progress" ON game_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game progress" ON game_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Skill Progress
CREATE POLICY "Users can view own skill progress" ON skill_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own skill progress" ON skill_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skill progress" ON skill_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Challenge Results
CREATE POLICY "Users can view own challenge results" ON challenge_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenge results" ON challenge_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Sessions
CREATE POLICY "Users can view own daily sessions" ON daily_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own daily sessions" ON daily_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily sessions" ON daily_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Stats
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Heart State
CREATE POLICY "Users can view own heart state" ON heart_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own heart state" ON heart_state FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own heart state" ON heart_state FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Heart Refill Slots
CREATE POLICY "Users can view own refill slots" ON heart_refill_slots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own refill slots" ON heart_refill_slots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own refill slots" ON heart_refill_slots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own refill slots" ON heart_refill_slots FOR DELETE USING (auth.uid() = user_id);

-- Heart Transactions
CREATE POLICY "Users can view own heart transactions" ON heart_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own heart transactions" ON heart_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges
CREATE POLICY "Users can view own badges" ON badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badge Progress
CREATE POLICY "Users can view own badge progress" ON badge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own badge progress" ON badge_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badge progress" ON badge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Progress Tree State
CREATE POLICY "Users can view own progress tree" ON progress_tree_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress tree" ON progress_tree_state FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress tree" ON progress_tree_state FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Progress Nodes
CREATE POLICY "Users can view own progress nodes" ON progress_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress nodes" ON progress_nodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress nodes" ON progress_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Themes
CREATE POLICY "Users can view own themes" ON user_themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own themes" ON user_themes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own themes" ON user_themes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Training Plans
CREATE POLICY "Users can view own training plans" ON training_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own training plans" ON training_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own training plans" ON training_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Training Recommendations
CREATE POLICY "Users can view own recommendations" ON training_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON training_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendations" ON training_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wind Down Sessions
CREATE POLICY "Users can view own wind down sessions" ON wind_down_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wind down sessions" ON wind_down_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wind Down Settings
CREATE POLICY "Users can view own wind down settings" ON wind_down_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wind down settings" ON wind_down_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wind down settings" ON wind_down_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deep Analytics
CREATE POLICY "Users can view own deep analytics" ON deep_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own deep analytics" ON deep_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deep analytics" ON deep_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics Data Points
CREATE POLICY "Users can view own analytics data" ON analytics_data_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics data" ON analytics_data_points FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_game_progress_updated_at BEFORE UPDATE ON game_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_skill_progress_updated_at BEFORE UPDATE ON skill_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_heart_state_updated_at BEFORE UPDATE ON heart_state FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_badge_progress_updated_at BEFORE UPDATE ON badge_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_progress_tree_state_updated_at BEFORE UPDATE ON progress_tree_state FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_themes_updated_at BEFORE UPDATE ON user_themes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_wind_down_settings_updated_at BEFORE UPDATE ON wind_down_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_deep_analytics_updated_at BEFORE UPDATE ON deep_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- HELPER FUNCTION: Create new user profile
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO game_progress (user_id) VALUES (NEW.id);
  INSERT INTO skill_progress (user_id) VALUES (NEW.id);
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  INSERT INTO heart_state (user_id) VALUES (NEW.id);
  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  INSERT INTO progress_tree_state (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
