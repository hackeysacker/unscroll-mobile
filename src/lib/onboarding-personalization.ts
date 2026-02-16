/**
 * Onboarding Personalization Logic
 *
 * Combines user habit data, motivation, and baseline test results
 * to create a personalized training program.
 */

export interface OnboardingData {
  // Habit data
  screenTime: number;
  peakDistraction: string;
  problemApps: string[];
  bedtimeScrolling: boolean;

  // Motivation data
  primaryGoal: string;
  motivation: string;
  commitmentLevel: number;

  // Baseline test results
  baselineScore: number;
  reactionTime: number;
  stability: number;
  focusDuration: number;
}

export interface PersonalizedProgram {
  // Program structure
  programName: string;
  durationDays: number;
  dailySessionMinutes: number;
  sessionsPerDay: number;

  // Difficulty settings
  startingLevel: number;
  difficultyMultiplier: number;
  progressionSpeed: 'slow' | 'normal' | 'fast';

  // Focus areas (prioritized)
  focusAreas: {
    area: string;
    priority: number;
    percentage: number;
  }[];

  // Recommended times
  recommendedTimes: string[];

  // Challenge preferences
  challengeTypes: string[];
  exerciseDuration: number;

  // Goals
  weeklyGoal: number;
  streakTarget: number;

  // Personalized messages
  welcomeMessage: string;
  motivationMessage: string;
}

export function createPersonalizedProgram(data: OnboardingData): PersonalizedProgram {
  // Calculate difficulty based on multiple factors
  const difficultyScore = calculateDifficultyScore(data);
  const focusAreas = determineFocusAreas(data);
  const recommendedTimes = determineRecommendedTimes(data);
  const challengeTypes = selectChallengeTypes(data);

  // Determine program intensity
  const intensity = determineIntensity(data.commitmentLevel, data.screenTime);

  // Calculate starting level (always start easy)
  const startingLevel = Math.max(1, Math.min(3, Math.floor(data.baselineScore / 40)));

  // Progression speed based on baseline and commitment
  const progressionSpeed = determineProgressionSpeed(data);

  return {
    programName: getProgramName(data.primaryGoal),
    durationDays: 7, // Always start with 7-day reset
    dailySessionMinutes: intensity.sessionMinutes,
    sessionsPerDay: intensity.sessionsPerDay,

    startingLevel,
    difficultyMultiplier: difficultyScore,
    progressionSpeed,

    focusAreas,
    recommendedTimes,
    challengeTypes,
    exerciseDuration: getExerciseDuration(data.baselineScore),

    weeklyGoal: intensity.weeklyGoal,
    streakTarget: Math.min(7, data.commitmentLevel + 2),

    welcomeMessage: generateWelcomeMessage(data),
    motivationMessage: generateMotivationMessage(data),
  };
}

function calculateDifficultyScore(data: OnboardingData): number {
  // Start with base difficulty of 0.6 (easier)
  let difficulty = 0.6;

  // Adjust based on baseline score
  if (data.baselineScore >= 80) difficulty += 0.2;
  else if (data.baselineScore >= 60) difficulty += 0.1;
  else if (data.baselineScore < 40) difficulty -= 0.1;

  // Adjust based on commitment
  if (data.commitmentLevel >= 4) difficulty += 0.1;
  else if (data.commitmentLevel <= 2) difficulty -= 0.1;

  // Clamp between 0.4 and 1.0
  return Math.max(0.4, Math.min(1.0, difficulty));
}

function determineFocusAreas(data: OnboardingData): PersonalizedProgram['focusAreas'] {
  const areas: PersonalizedProgram['focusAreas'] = [];

  // Primary focus based on goal
  switch (data.primaryGoal) {
    case 'work':
    case 'school':
      areas.push(
        { area: 'sustained_attention', priority: 1, percentage: 40 },
        { area: 'impulse_control', priority: 2, percentage: 35 },
        { area: 'distraction_resistance', priority: 3, percentage: 25 }
      );
      break;
    case 'creativity':
      areas.push(
        { area: 'focus_flexibility', priority: 1, percentage: 35 },
        { area: 'sustained_attention', priority: 2, percentage: 35 },
        { area: 'impulse_control', priority: 3, percentage: 30 }
      );
      break;
    case 'mental-health':
      areas.push(
        { area: 'impulse_control', priority: 1, percentage: 40 },
        { area: 'mindfulness', priority: 2, percentage: 35 },
        { area: 'distraction_resistance', priority: 3, percentage: 25 }
      );
      break;
    case 'self-discipline':
    default:
      areas.push(
        { area: 'impulse_control', priority: 1, percentage: 45 },
        { area: 'sustained_attention', priority: 2, percentage: 30 },
        { area: 'distraction_resistance', priority: 3, percentage: 25 }
      );
  }

  // Adjust if bedtime scrolling is a problem
  if (data.bedtimeScrolling) {
    const impulseIndex = areas.findIndex(a => a.area === 'impulse_control');
    if (impulseIndex >= 0) {
      areas[impulseIndex].percentage += 10;
      areas[areas.length - 1].percentage -= 10;
    }
  }

  return areas;
}

function determineRecommendedTimes(data: OnboardingData): string[] {
  const times: string[] = [];

  // Opposite of peak distraction time
  switch (data.peakDistraction) {
    case 'morning':
      times.push('7:00 AM', '8:00 PM');
      break;
    case 'afternoon':
      times.push('7:00 AM', '6:00 PM');
      break;
    case 'evening':
      times.push('7:00 AM', '12:00 PM');
      break;
    case 'night':
      times.push('7:00 AM', '5:00 PM');
      break;
    default:
      times.push('7:00 AM', '7:00 PM');
  }

  return times;
}

function selectChallengeTypes(data: OnboardingData): string[] {
  const challenges: string[] = [];

  // Base challenges everyone gets
  challenges.push('focus_hold', 'finger_hold', 'tap_only_correct');

  // Add based on problem apps
  if (data.problemApps.includes('tiktok') || data.problemApps.includes('youtube')) {
    challenges.push('anti_scroll_swipe', 'impulse_spike_test');
  }
  if (data.problemApps.includes('instagram') || data.problemApps.includes('twitter')) {
    challenges.push('fake_notifications', 'popup_ignore');
  }
  if (data.problemApps.includes('games')) {
    challenges.push('reaction_inhibition', 'multi_object_tracking');
  }

  // Add based on goal
  switch (data.primaryGoal) {
    case 'work':
    case 'school':
      challenges.push('memory_flash', 'multi_task_tap');
      break;
    case 'mental-health':
      challenges.push('breath_pacing', 'controlled_breathing', 'stillness_test');
      break;
    case 'self-discipline':
      challenges.push('delay_unlock', 'look_away');
      break;
  }

  // Add rhythm-based challenges if baseline is good
  if (data.baselineScore >= 60) {
    challenges.push('rhythm_tap', 'slow_tracking');
  }

  return [...new Set(challenges)]; // Remove duplicates
}

function determineIntensity(commitment: number, screenTime: number): {
  sessionMinutes: number;
  sessionsPerDay: number;
  weeklyGoal: number;
} {
  // Higher commitment = more sessions
  // Higher screen time = more need for training

  if (commitment >= 4 && screenTime >= 6) {
    return { sessionMinutes: 7, sessionsPerDay: 2, weeklyGoal: 10 };
  } else if (commitment >= 3) {
    return { sessionMinutes: 5, sessionsPerDay: 1, weeklyGoal: 7 };
  } else {
    return { sessionMinutes: 3, sessionsPerDay: 1, weeklyGoal: 5 };
  }
}

function determineProgressionSpeed(data: OnboardingData): 'slow' | 'normal' | 'fast' {
  if (data.baselineScore >= 80 && data.commitmentLevel >= 4) {
    return 'fast';
  } else if (data.baselineScore < 50 || data.commitmentLevel <= 2) {
    return 'slow';
  }
  return 'normal';
}

function getExerciseDuration(baselineScore: number): number {
  // Lower baseline = shorter initial exercises
  if (baselineScore < 40) return 15; // 15 seconds
  if (baselineScore < 60) return 20;
  if (baselineScore < 80) return 25;
  return 30;
}

function getProgramName(goal: string): string {
  switch (goal) {
    case 'work':
      return 'Productivity Focus';
    case 'school':
      return 'Study Focus';
    case 'creativity':
      return 'Creative Flow';
    case 'mental-health':
      return 'Mindful Attention';
    case 'self-discipline':
      return 'Impulse Mastery';
    default:
      return 'Focus Foundation';
  }
}

function generateWelcomeMessage(data: OnboardingData): string {
  const goalMessages: Record<string, string> = {
    'work': "Ready to crush your work goals? Let's build the focus you need.",
    'school': "Your study sessions are about to get way more effective.",
    'creativity': "Let's unlock that creative flow state you've been chasing.",
    'mental-health': "Your mind is about to feel calmer and clearer.",
    'self-discipline': "You're about to gain control over your impulses.",
  };

  return goalMessages[data.primaryGoal] || "Let's start building real focus.";
}

function generateMotivationMessage(data: OnboardingData): string {
  const { motivation, commitmentLevel, baselineScore } = data;

  if (commitmentLevel >= 4) {
    return "Your commitment level is high. That's the most important factor for success.";
  }

  if (baselineScore >= 70) {
    return "Your baseline is solid. With consistent practice, you'll see big improvements.";
  }

  const motivationMessages: Record<string, string> = {
    'career': "Every minute of training is an investment in your career.",
    'relationships': "Better focus means being more present with the people you love.",
    'health': "Your mental clarity starts here.",
    'personal-growth': "This is where real growth happens.",
  };

  return motivationMessages[motivation] || "Small daily practice leads to lasting change.";
}

// Analytics events for onboarding
export const OnboardingAnalytics = {
  screenView: (screen: string) => ({
    event: 'onboarding_screen_view',
    params: { screen_name: screen, timestamp: Date.now() },
  }),

  questionAnswered: (question: string, answer: any) => ({
    event: 'onboarding_question_answered',
    params: { question, answer, timestamp: Date.now() },
  }),

  baselineTestCompleted: (score: number, duration: number) => ({
    event: 'onboarding_baseline_completed',
    params: { score, duration, timestamp: Date.now() },
  }),

  onboardingCompleted: (data: OnboardingData, program: PersonalizedProgram) => ({
    event: 'onboarding_completed',
    params: {
      baseline_score: data.baselineScore,
      primary_goal: data.primaryGoal,
      commitment_level: data.commitmentLevel,
      program_name: program.programName,
      starting_level: program.startingLevel,
      timestamp: Date.now(),
    },
  }),

  screenSkipped: (screen: string) => ({
    event: 'onboarding_screen_skipped',
    params: { screen_name: screen, timestamp: Date.now() },
  }),

  dropOff: (screen: string) => ({
    event: 'onboarding_drop_off',
    params: { screen_name: screen, timestamp: Date.now() },
  }),
};
