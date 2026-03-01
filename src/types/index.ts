// Core type definitions for the FocusFlow app

export type GoalType = 'reduce_doomscrolling' | 'improve_focus' | 'build_impulse_control' | 'calm_mind';

export type ChallengeType =
  | 'focus_hold'              // Exercise 1: Focus Hold
  | 'finger_hold'             // Exercise 2: Finger Hold
  | 'slow_tracking'           // Exercise 3: Slow Tracking
  | 'tap_only_correct'        // Exercise 4: Tap Only When Correct
  | 'breath_pacing'           // Exercise 5: Breath Pacing
  | 'fake_notifications'      // Exercise 6: Fake Notifications
  | 'delay_unlock'            // Exercise 7: Delay Unlock
  | 'memory_flash'            // Exercise 8: Memory Flash
  | 'reaction_inhibition'     // Exercise 9: Reaction Inhibition
  | 'multi_object_tracking'   // Exercise 10: Multi Object Tracking
  | 'rhythm_tap'              // Exercise 11: Rhythm Tap
  | 'stillness_test'          // Exercise 12: Stillness Test
  | 'impulse_spike_test'      // Exercise 13: Impulse Spike Test
  | 'finger_tracing'          // Exercise 14: Finger Tracing
  | 'multi_task_tap'          // Exercise 15: Multi Task Tap
  | 'popup_ignore'            // Exercise 16: Pop-Up Ignore
  | 'controlled_breathing'    // Exercise 17: Controlled Breathing
  | 'look_away'               // Exercise 18: Look Away
  | 'anti_scroll_swipe'       // Exercise 19: Anti-Scroll Swipe
  | 'reset'                   // Exercise 20: Reset (Final Challenge)

  // Puzzle Challenges (NEW - 250 Level System)
  | 'pattern_matching'        // Puzzle 1: Pattern Matching
  | 'logic_puzzle'            // Puzzle 2: Logic Puzzles
  | 'memory_puzzle'           // Puzzle 3: Memory Puzzles
  | 'spatial_puzzle'          // Puzzle 4: Spatial Puzzles

  // Legacy challenge types (kept for backwards compatibility)
  | 'gaze_hold'
  | 'moving_target'
  | 'distraction_resistance'
  | 'tap_pattern'
  | 'audio_focus'
  | 'impulse_delay'
  | 'stability_hold';

export type SkillPath = 'focus' | 'impulseControl' | 'distractionResistance';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// Onboarding data types
export type DistractionApp = 'tiktok' | 'instagram' | 'youtube' | 'snapchat' | 'other';
export type WorstScrollTime = 'morning_bed' | 'work_breaks' | 'after_school' | 'evenings' | 'late_night';
export type ImprovementReason = 'more_focus' | 'better_sleep' | 'mental_clarity' | 'productivity' | 'discipline' | 'other';
export type UserPersonalityType = 'overthinker' | 'procrastinator' | 'night_scroller' | 'impulse_tapper' | 'work_distracter' | 'focus_beginner';
export type OnboardingGoalResult = 'better_sleep' | 'reduce_scrolling' | 'improve_focus' | 'build_discipline';

export interface OnboardingData {
  dailyScrollHours?: number; // 0-6
  primaryDistractionApp?: DistractionApp;
  worstScrollTime?: WorstScrollTime;
  improvementReason?: ImprovementReason;
  wantsAutoTracking?: boolean;
  attentionBaselineScore?: number; // 0-100 from 8-second test
  goalResult?: OnboardingGoalResult;
  dailyTrainingMinutes?: number; // 2, 5, 7, or custom
  userPersonalityType?: UserPersonalityType;
  hasAcceptedNotifications?: boolean;
  hasAcceptedScreenTime?: boolean;
  hasAcceptedDailyCheckIn?: boolean;
  completedOnboardingAt?: number;
}

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarEmoji?: string;
  createdAt: number;
  goal?: GoalType;
  isPremium: boolean;
  onboardingData?: OnboardingData;
}

export interface GameProgress {
  userId: string;
  level: number; // 1-30
  xp: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  lastSessionDate: number | null;
  streakFreezeUsed: boolean;
  totalSessionsCompleted: number;
  totalChallengesCompleted: number;
}

export interface ChallengeResult {
  id: string;
  userId: string;
  type: ChallengeType;
  timestamp: number;
  score: number; // 0-100
  duration: number; // milliseconds
  xpEarned: number;
  isPerfect: boolean;
}

export interface DailySession {
  id: string;
  userId: string;
  date: number;
  challenges: ChallengeResult[];
  totalXp: number;
  completed: boolean;
}

export interface SkillTreeProgress {
  userId: string;
  focus: number; // 0-100
  impulseControl: number; // 0-100
  distractionResistance: number; // 0-100
}

export interface UserStats {
  totalAttentionTime: number; // milliseconds
  longestGazeHold: number; // milliseconds
  focusAccuracy: number; // percentage
  impulseControlScore: number; // percentage
  stabilityRating: number; // 0-100
  challengesCompleted: number; // total challenges completed
  bestScore: number; // best score achieved (0-100)
  totalTrainingTime: number; // total time spent training (milliseconds)
  currentStreak: number; // current daily streak
  averageSessionDuration: number; // average session duration (milliseconds)
  lastSessionTimestamp: number | null; // timestamp of last session
  averageAccuracy: number; // average accuracy across all challenges (0-100)
}

export interface AppSettings {
  userId: string;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  notificationsEnabled: boolean;
  autoProgress?: boolean;
  reducedMotion?: boolean;
}

export interface BaselineTestResult {
  userId: string;
  score: number; // 0-100
  duration: number; // milliseconds
  timestamp: number;
  assignedLevel: number;
}

// Challenge configuration
export interface ChallengeConfig {
  type: ChallengeType;
  name: string;
  description: string;
  minLevel: number; // minimum level to unlock
  skillPath: SkillPath;
  difficulty: (level: number) => number; // function that returns difficulty based on user level
  duration: number; // milliseconds
}

// Notification types
export interface NotificationSchedule {
  userId: string;
  dailyReminderTime: string; // HH:mm format
  enabled: boolean;
}

// Progress Tree
export type ProgressNodeStatus = 'locked' | 'available' | 'completed' | 'perfect';
export type ProgressNodeType = 'exercise' | 'test';

export interface ProgressTreeNode {
  id: string;
  level: number; // Which level this node belongs to (1-30)
  position: number; // Position within the level (0-20: 0-19 are exercises, 20 is the test)
  nodeType: ProgressNodeType; // 'exercise' or 'test'
  challengeType: ChallengeType;
  testSequence?: ChallengeType[]; // For tests: sequence of challenges to complete
  status: ProgressNodeStatus;
  xpReward: number;
  starsEarned: number; // 0-3 stars based on performance
  completedAt?: number;
}

export interface ProgressTreeState {
  userId: string;
  nodes: ProgressTreeNode[];
  currentNodeId: string | null; // The next available challenge
  lastCompletedNodeId: string | null;
  version?: number; // Data structure version for migration
}

// Premium Features

// Personalized Training Plan
export interface TrainingPlanRecommendation {
  id: string;
  challengeType: ChallengeType;
  reason: string; // Why this challenge is recommended
  priority: 'high' | 'medium' | 'low';
}

export interface PersonalizedTrainingPlan {
  userId: string;
  generatedAt: number;
  recommendations: TrainingPlanRecommendation[];
  focusAreas: SkillPath[]; // Areas that need improvement
  streakBonus: boolean; // Whether user has good streak consistency
  lastUpdated: number;
}

// Deep Analytics
export interface AnalyticsDataPoint {
  timestamp: number;
  value: number;
}

export interface DeepAnalytics {
  userId: string;
  attentionScore: number; // 0-100
  impulseControlScore: number; // 0-100
  distractionResistanceScore: number; // 0-100
  weeklyProgress: AnalyticsDataPoint[];
  monthlyProgress: AnalyticsDataPoint[];
  lastCalculated: number;
}

// Wind-Down Mode
export interface WindDownSession {
  id: string;
  userId: string;
  startedAt: number;
  completedAt?: number;
  duration: number; // milliseconds
  breathingExercises: number; // count of exercises completed
  completed: boolean;
}

export interface WindDownSettings {
  userId: string;
  enabled: boolean;
  duration: number; // Default duration in minutes
  breathingPattern: 'box' | 'relaxing' | 'sleep'; // Different breathing patterns
}

// Theme System
export type ThemeType =
  | 'noir-cinema'             // Dramatic film noir with amber highlights
  | 'tokyo-neon'              // Cyberpunk electric pink & cyan
  | 'aura-glass'              // Ethereal frosted glass lavender
  | 'paper-craft'             // Artisanal warm off-white & terracotta
  | 'arctic-aurora'           // Deep arctic blues with aurora greens
  | 'rose-quartz'             // Luxurious dark with rose gold
  | 'matcha-zen'              // Japanese deep matcha & cream
  | 'cosmic-void'             // Ultra-deep space with nebula purples

export interface UserTheme {
  userId: string;
  selectedTheme: ThemeType;
  unlocked: ThemeType[]; // Premium users unlock all themes
}

// Heart System (Focus Health)
export type HeartRefillActionType = 'breathing_exercise' | 'micro_focus' | 'invite_friend' | 'watch_tip';

export interface HeartState {
  userId: string;
  currentHearts: number; // 0-5 (max)
  maxHearts: number; // Always 5 for free users
  lastHeartLost: number | null; // timestamp
  lastMidnightReset: number | null; // timestamp of last midnight reset
  heartRefillSlots: HeartRefillSlot[]; // Track when hearts will refill
  perfectStreakCount: number; // Count of consecutive perfect challenges (resets on error)
  totalHeartsLost: number; // Lifetime stat
  totalHeartsGained: number; // Lifetime stat
}

export interface HeartRefillSlot {
  id: string;
  scheduledRefillTime: number; // timestamp when this heart will refill
  isRefilled: boolean;
}

export interface HeartTransaction {
  id: string;
  userId: string;
  timestamp: number;
  type: 'loss' | 'gain' | 'refill';
  amount: number; // usually 1, but can be more for bonuses
  reason: HeartLossReason | HeartGainReason;
  challengeId?: string; // Link to specific challenge if applicable
}

export type HeartLossReason =
  | 'focus_break' // Lost focus during hold challenge
  | 'wrong_tap' // Tapped wrong object
  | 'distraction_fail' // Failed distraction test
  | 'early_quit' // Quit challenge before completion
  | 'test_fail'; // Failed a test

export type HeartGainReason =
  | 'daily_session_complete' // Completed full daily session
  | 'perfect_streak_3' // 3 challenges in a row without errors
  | 'focus_reset_animation' // Watched calming focus reset
  | 'breathing_exercise' // Completed breathing exercise
  | 'micro_focus' // Completed micro-focus challenge
  | 'invite_friend' // Invited a friend
  | 'watch_tip' // Watched a tip lesson
  | 'midnight_reset' // Daily reset at midnight
  | 'hourly_refill'; // 1 heart every 4 hours

// ============================================
// GEMS SYSTEM
// ============================================

export interface GemsState {
  userId: string;
  balance: number; // Current gem balance
  totalEarned: number; // Lifetime gems earned
  totalSpent: number; // Lifetime gems spent
}

export interface GemTransaction {
  id: string;
  userId: string;
  timestamp: number;
  amount: number; // positive for earned, negative for spent
  reason: string;
}

export type GemGainReason =
  | 'daily_challenge_complete' // Completed daily challenge
  | 'daily_challenge_perfect' // Perfect score on daily challenge
  | 'daily_challenge_speed' // Speed bonus on daily challenge
  | 'streak_reward' // Streak milestone bonus
  | 'achievement_reward' // Badge unlock bonus
  | 'premium_bonus' // Premium user bonus
  | 'gift'; // Gifted gems

export type GemSpendReason =
  | 'unlock_premium' // Unlock premium features
  | 'unlock_avatar' // Unlock avatar item
  | 'unlock_theme' // Unlock theme
  | 'streak_freeze' // Use streak freeze
  | 'heart_refill' // Instant heart refill
  | 'boost'; // Activity boost

// ============================================
// ATTENTION AVATAR SYSTEM
// ============================================

export type AvatarEvolutionStage =
  | 'spark'           // Level 1-2: Tiny floating light
  | 'ember'           // Level 3-5: Warm glowing ember
  | 'orb'             // Level 6-9: Defined orb with personality
  | 'sprite'          // Level 10-14: Small creature form
  | 'guardian'        // Level 15-19: Defined creature with features
  | 'sentinel'        // Level 20-24: Radiant attention being
  | 'master'          // Level 25-29: Powerful evolved form
  | 'transcendent';   // Level 30: Final mastery form

export type AvatarMood =
  | 'idle'            // Default state
  | 'happy'           // Good performance
  | 'excited'         // Milestone reached
  | 'proud'           // Perfect score
  | 'focused'         // During challenge
  | 'encouraging'     // After fail, motivating
  | 'sad'             // Lost hearts
  | 'sleepy'          // Missed days
  | 'celebrating';    // Big achievement

export type AvatarSkin =
  | 'default'         // Base appearance
  | 'cosmic'          // Stars and space theme
  | 'nature'          // Forest/earth theme
  | 'ocean'           // Water/wave theme
  | 'fire'            // Flame theme
  | 'crystal'         // Gem/mineral theme
  | 'shadow'          // Dark/mysterious theme
  | 'rainbow';        // Colorful premium theme

export type AvatarAccessory =
  | 'none'
  | 'halo'            // Ring above head
  | 'wings_small'     // Tiny wings
  | 'wings_large'     // Full wings
  | 'crown'           // Achievement crown
  | 'aura_fire'       // Fire aura effect
  | 'aura_electric'   // Electric sparks
  | 'trail_stars';    // Star trail when moving

export interface AvatarState {
visitorId: string;
  avatarName: string;
  evolutionStage: AvatarEvolutionStage;
  mood: AvatarMood;
  skin: AvatarSkin;
  accessory: AvatarAccessory;
  unlockedSkins: AvatarSkin[];
  unlockedAccessories: AvatarAccessory[];
  brightness: number;        // 0-100, based on recent performance
  energy: number;            // 0-100, based on streak
  size: number;              // Growth within current stage
  personality: 'calm' | 'energetic' | 'wise' | 'playful';
  createdAt: number;
  lastInteraction: number;
  totalEvolutions: number;
  hasPremiumEffects: boolean;
  customColors?: {
    primary: string;
    secondary: string;
    glow: string;
  };
}

export interface AvatarReaction {
  type: 'nod' | 'shake' | 'bounce' | 'spin' | 'glow' | 'dim' | 'grow' | 'shrink' | 'wave' | 'sleep' | 'wake' | 'celebrate' | 'cry' | 'sparkle';
  intensity: 'subtle' | 'normal' | 'intense';
  duration: number;
}

// Badge System
export type BadgeType =
  // === GETTING STARTED (Easy wins) ===
  | 'first_focus'           // Complete first challenge
  | 'first_perfect'         // First perfect score
  | 'first_session'         // Complete first daily session
  | 'first_streak'          // Get a 2-day streak
  | 'onboarding_complete'   // Finish onboarding

  // === CHALLENGE MILESTONES ===
  | 'challenges_10'         // Complete 10 challenges
  | 'challenges_25'         // Complete 25 challenges
  | 'challenges_50'         // Complete 50 challenges
  | 'challenges_100'        // Complete 100 challenges
  | 'challenges_250'        // Complete 250 challenges
  | 'challenges_500'        // Complete 500 challenges
  | 'challenges_1000'       // Complete 1000 challenges

  // === PERFECT SCORE MILESTONES ===
  | 'perfect_5'             // 5 perfect scores total
  | 'perfect_10'            // 10 perfect scores
  | 'perfect_25'            // 25 perfect scores
  | 'perfect_50'            // 50 perfect scores
  | 'perfect_100'           // 100 perfect scores
  | 'perfect_250'           // 250 perfect scores
  | 'perfect_500'           // 500 perfect scores

  // === STREAK ACHIEVEMENTS ===
  | 'streak_3'              // 3-day streak
  | 'streak_7'              // 7-day streak (1 week)
  | 'streak_14'             // 14-day streak (2 weeks)
  | 'streak_30'             // 30-day streak (1 month)
  | 'streak_60'             // 60-day streak (2 months)
  | 'streak_90'             // 90-day streak (3 months)
  | 'streak_180'            // 180-day streak (6 months)
  | 'streak_365'            // 365-day streak (1 year!)

  // === PERFECT STREAK (Consecutive) ===
  | 'hot_streak_3'          // 3 perfect in a row
  | 'hot_streak_5'          // 5 perfect in a row
  | 'hot_streak_10'         // 10 perfect in a row
  | 'hot_streak_20'         // 20 perfect in a row
  | 'hot_streak_50'         // 50 perfect in a row

  // === LEVEL MILESTONES ===
  | 'level_2'               // Reach level 2
  | 'level_5'               // Reach level 5
  | 'level_10'              // Reach level 10
  | 'level_15'              // Reach level 15
  | 'level_20'              // Reach level 20
  | 'level_25'              // Reach level 25
  | 'level_30'              // Reach level 30 (max)

  // === XP MILESTONES ===
  | 'xp_100'                // Earn 100 XP
  | 'xp_500'                // Earn 500 XP
  | 'xp_1000'               // Earn 1,000 XP
  | 'xp_5000'               // Earn 5,000 XP
  | 'xp_10000'              // Earn 10,000 XP
  | 'xp_25000'              // Earn 25,000 XP
  | 'xp_50000'              // Earn 50,000 XP

  // === SKILL MASTERY ===
  | 'focus_apprentice'      // Focus skill reaches 25
  | 'focus_journeyman'      // Focus skill reaches 50
  | 'focus_expert'          // Focus skill reaches 75
  | 'focus_master'          // Focus skill reaches 100
  | 'impulse_apprentice'    // Impulse control reaches 25
  | 'impulse_journeyman'    // Impulse control reaches 50
  | 'impulse_expert'        // Impulse control reaches 75
  | 'impulse_master'        // Impulse control reaches 100
  | 'distraction_apprentice'// Distraction resistance reaches 25
  | 'distraction_journeyman'// Distraction resistance reaches 50
  | 'distraction_expert'    // Distraction resistance reaches 75
  | 'distraction_master'    // Distraction resistance reaches 100
  | 'triple_master'         // All three skills at 100

  // === CHALLENGE TYPE SPECIALISTS ===
  | 'breath_beginner'       // 5 breathing exercises
  | 'breath_master'         // 25 breathing exercises
  | 'tracking_beginner'     // 5 tracking exercises
  | 'tracking_master'       // 25 tracking exercises
  | 'tap_beginner'          // 5 tap exercises
  | 'tap_master'            // 25 tap exercises
  | 'stillness_beginner'    // 5 stillness exercises
  | 'stillness_master'      // 25 stillness exercises
  | 'notification_blocker'  // 10 notification/popup exercises
  | 'notification_immune'   // 50 notification/popup exercises

  // === TIME-BASED ACHIEVEMENTS ===
  | 'early_bird'            // Complete before 7 AM
  | 'morning_person'        // 10 sessions before 9 AM
  | 'night_owl'             // Complete after 10 PM
  | 'midnight_warrior'      // Complete after midnight
  | 'weekend_warrior'       // Complete on Saturday & Sunday
  | 'consistent_time'       // Same hour for 7 days

  // === SESSION ACHIEVEMENTS ===
  | 'daily_3'               // Complete 3 daily sessions
  | 'daily_7'               // Complete 7 daily sessions
  | 'daily_30'              // Complete 30 daily sessions
  | 'daily_100'             // Complete 100 daily sessions

  // === SPEED ACHIEVEMENTS ===
  | 'quick_reflexes'        // Complete challenge in <10s with 90+ score
  | 'speed_demon'           // 5 challenges in <10s with 90+ score
  | 'lightning_fast'        // 10 challenges in <15s with perfect score

  // === SCORE ACHIEVEMENTS ===
  | 'high_scorer'           // Score 90+ on any challenge
  | 'consistent_90'         // 10 challenges with 90+ score
  | 'never_below_80'        // 20 consecutive challenges 80+
  | 'score_collector'       // Total score across all challenges hits 10,000

  // === HEART SYSTEM ===
  | 'heart_saver'           // Never lose a heart in a session
  | 'heart_collector'       // Gain 10 hearts total
  | 'heart_guardian'        // Maintain full hearts for 3 days
  | 'comeback_king'         // Recover from 1 heart to full

  // === SPECIAL ACHIEVEMENTS ===
  | 'explorer'              // Try every challenge type at least once
  | 'variety_seeker'        // 5 different challenge types in one day
  | 'specialist'            // Complete same challenge type 50 times
  | 'no_skip'               // Complete 10 sessions without skipping
  | 'improvement'           // Beat your personal best score
  | 'double_up'             // Complete 2 sessions in one day
  | 'triple_threat'         // Complete 3 sessions in one day

  // === RARE/LEGENDARY ===
  | 'flawless_week'         // 7 days of only perfect scores
  | 'flawless_month'        // 30 days of only perfect scores
  | 'centurion'             // 100 perfect in a row (legendary)
  | 'true_master'           // Level 30 + all skills 100 + 365 streak
  | 'unscroll_legend';      // 1000 challenges + 500 perfect + level 30

export interface Badge {
  id: string;
  type: BadgeType;
  unlockedAt: number;
  name: string;
  description: string;
  icon: string;
}

export interface BadgeProgress {
  userId: string;
  unlockedBadges: Badge[];
  progress: Partial<Record<BadgeType, number>>; // Track progress toward each badge
}

