import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useTheme } from '@/contexts/ThemeContext';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';
import { createPersonalizedProgram } from '@/lib/onboarding-personalization';
import { Settings } from '@/components/Settings';
import { LevelPage } from '@/components/LevelPage';
import { ChallengePlayer } from '@/components/ChallengePlayer';
import { ActivityPlayer } from '@/components/ActivityPlayer';
import { ChallengeInsights } from '@/components/ChallengeInsights';
import { Insights } from '@/components/Insights';
import { Premium } from '@/components/Premium';
import { WindDownMode } from '@/components/WindDownMode';
import { AvatarScreen } from '@/components/AvatarScreen';
import { VerticalProgressPath } from '@/components/VerticalProgressPath';
import { SkillTree } from '@/components/SkillTree';
import { PersonalizedTrainingPlanComponent } from '@/components/PersonalizedTrainingPlan';
import { DevTestingMode } from '@/components/DevTestingMode';
import { FocusJourneyPage } from '@/components/FocusJourneyPage';
import { ActivityDetailScreen } from '@/components/ActivityDetailScreen';
import { PracticeScreen } from '@/components/PracticeScreen';
import { LeaderboardScreen } from '@/components/LeaderboardScreen';
import { ProfileScreen } from '@/components/ProfileScreen';
import { AchievementsScreen } from '@/components/AchievementsScreen';
import { PracticeOverview } from '@/components/PracticeOverview';
import { FocusShieldScreen } from '@/components/FocusShieldScreen';
import { HomeScreen } from '@/components/HomeScreen';

type ViewMode = 'home' | 'progress-tree' | 'settings' | 'level' | 'challenge' | 'insights-screen' | 'insights' | 'premium' | 'winddown' | 'skill-tree' | 'training-plan' | 'dev-testing' | 'avatar' | 'focus-journey' | 'activity-detail' | 'practice' | 'practice-overview' | 'practice-session' | 'leaderboard' | 'profile-screen' | 'achievements' | 'focus-shield';

function AppContent() {
  const { user, isOnboarded, isLoading, completeOnboarding, updateOnboardingData } = useAuth();
  const { progress, initializeProgress } = useGame();
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedChallenge, setSelectedChallenge] = useState<{
    type: string;
    isTest?: boolean;
    sequence?: string[];
    duration?: number;
    xpReward?: number;
    difficultyLevel?: number;
  } | null>(null);
  const [challengeResult, setChallengeResult] = useState<{
    challengeType: string;
    level: number;
    score: number;
    duration: number;
    isPerfect: boolean;
    xpEarned: number;
  } | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<{
    id: string;
    title: string;
    description: string;
    activities: string[];
    totalXP: number;
    duration: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
    colors: [string, string];
  } | null>(null);
  const [practiceSession, setPracticeSession] = useState<{
    activities: string[];
    currentIndex: number;
    scores: number[];
    totalXP: number;
  } | null>(null);

  // Show splash screen first
  if (showSplash) {
    return <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Loading state - only show when actually loading
  if (!user && isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading FocusFlow...</Text>
      </View>
    );
  }

  // No user yet (guest mode) - show onboarding to get started
  if (!user) {
    return (
      <OnboardingFlow
        onComplete={async (data) => {
          // Create personalized program from onboarding data
          const program = createPersonalizedProgram(data);

          // Save onboarding data
          await updateOnboardingData({
            dailyScrollHours: data.screenTime,
            attentionBaselineScore: data.baselineScore,
            dailyTrainingMinutes: data.commitmentLevel >= 7 ? 7 : data.commitmentLevel >= 5 ? 5 : 2,
          });

          // Initialize game progress based on baseline
          const startingLevel = program.startingLevel;
          await initializeProgress(startingLevel);

          // Complete onboarding
          await completeOnboarding('improve_focus');
        }}
      />
    );
  }

  // Onboarding (for signed-in users who haven't completed onboarding)
  if (!isOnboarded) {
    return (
      <OnboardingFlow
        onComplete={async (data) => {
          // Create personalized program from onboarding data
          const program = createPersonalizedProgram(data);

          // Save onboarding data
          await updateOnboardingData({
            dailyScrollHours: data.screenTime,
            attentionBaselineScore: data.baselineScore,
            dailyTrainingMinutes: data.commitmentLevel >= 7 ? 7 : data.commitmentLevel >= 5 ? 5 : 2,
          });

          // Initialize game progress based on baseline
          const startingLevel = program.startingLevel;
          await initializeProgress(startingLevel);

          // Complete onboarding
          await completeOnboarding('improve_focus');
        }}
      />
    );
  }

  // Initialize progress if needed
  if (user && !progress) {
    initializeProgress(1);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Setting up your dashboard...</Text>
      </View>
    );
  }

  // Settings view
  if (viewMode === 'settings') {
    return (
      <Settings
        onBack={() => setViewMode('home')}
        onNavigate={(route) => setViewMode(route as ViewMode)}
      />
    );
  }

  // Insights view
  if (viewMode === 'insights') {
    return <Insights onBack={() => setViewMode('home')} />;
  }

  // Premium view
  if (viewMode === 'premium') {
    return <Premium onBack={() => setViewMode('home')} />;
  }

  // WindDown view
  if (viewMode === 'winddown') {
    return <WindDownMode onBack={() => setViewMode('home')} />;
  }

  // Practice view
  if (viewMode === 'practice') {
    return (
      <PracticeScreen
        onBack={() => setViewMode('home')}
        onSelectPractice={(practiceId) => {
          // Find the practice option to get its details
          const { PRACTICE_OPTIONS } = require('@/components/PracticeScreen');
          const practice = PRACTICE_OPTIONS.find((p: any) => p.id === practiceId);
          
          if (practice) {
            setSelectedPractice({
              id: practice.id,
              title: practice.title,
              description: practice.description,
              activities: practice.activities,
              totalXP: practice.xp,
              duration: practice.duration,
              difficulty: practice.difficulty,
              colors: practice.color,
            });
            setViewMode('practice-overview');
          }
        }}
      />
    );
  }

  // Practice overview view
  if (viewMode === 'practice-overview' && selectedPractice) {
    return (
      <PracticeOverview
        practiceTitle={selectedPractice.title}
        practiceDescription={selectedPractice.description}
        activities={selectedPractice.activities as any}
        totalXP={selectedPractice.totalXP}
        estimatedDuration={selectedPractice.duration}
        difficulty={selectedPractice.difficulty}
        practiceColors={selectedPractice.colors}
        onStart={() => {
          // Initialize practice session
          setPracticeSession({
            activities: selectedPractice.activities,
            currentIndex: 0,
            scores: [],
            totalXP: 0,
          });
          setViewMode('practice-session');
        }}
        onBack={() => {
          setSelectedPractice(null);
          setViewMode('practice');
        }}
      />
    );
  }

  // Practice session view - runs through all activities
  if (viewMode === 'practice-session' && practiceSession) {
    const currentActivity = practiceSession.activities[practiceSession.currentIndex];
    const isLastActivity = practiceSession.currentIndex === practiceSession.activities.length - 1;

    if (!currentActivity) {
      // Practice complete - go back to practice screen
      setPracticeSession(null);
      setSelectedPractice(null);
      setViewMode('practice');
      return null;
    }

    return (
      <ActivityPlayer
        onBack={() => {
          setPracticeSession(null);
          setSelectedPractice(null);
          setViewMode('practice');
        }}
        activityType={currentActivity as any}
        isTest={false}
        fixedLevel={3}
        onActivityComplete={(score: number, duration: number) => {
          // Calculate XP for this activity (base 10 + bonus for score)
          const isPerfect = score >= 95;
          const baseXP = 10;
          const perfectBonus = isPerfect ? 10 : 0;
          const scoreBonus = Math.round((score / 100) * 5);
          const xpEarned = baseXP + perfectBonus + scoreBonus;

          const newScores = [...practiceSession.scores, score];
          const newTotalXP = practiceSession.totalXP + xpEarned;

          // Show insights for each challenge
          const challengeResult = {
            challengeType: currentActivity,
            level: 5, // Fixed level for practices
            score,
            duration,
            isPerfect,
            xpEarned,
          };
          setChallengeResult(challengeResult);
          setViewMode('insights-screen');
          
          // Update practice session state after showing insights
          // We'll handle the continuation in the insights screen
        }}
      />
    );
  }

  // Leaderboard view
  if (viewMode === 'leaderboard') {
    return <LeaderboardScreen onBack={() => setViewMode('home')} />;
  }

  // Profile screen view
  if (viewMode === 'profile-screen') {
    return (
      <ProfileScreen
        onBack={() => setViewMode('home')}
        onNavigate={(route) => {
          if (route === 'settings') {
            setViewMode('settings');
          } else if (route === 'insights') {
            setViewMode('insights');
          } else if (route === 'premium') {
            setViewMode('premium');
          } else if (route === 'achievements') {
            setViewMode('achievements');
          }
        }}
      />
    );
  }

  // Achievements screen view
  if (viewMode === 'achievements') {
    return (
      <AchievementsScreen
        onBack={() => setViewMode('profile-screen')}
      />
    );
  }

  // Focus Shield screen view
  if (viewMode === 'focus-shield') {
    return (
      <FocusShieldScreen
        onBack={() => setViewMode('home')}
      />
    );
  }

  // Home view - Stop Scrolling challenges
  if (viewMode === 'home') {
    return (
      <HomeScreen
        onNavigate={(route) => {
          if (route === 'progress-tree') {
            setViewMode('progress-tree');
          } else if (route === 'practice') {
            setViewMode('practice');
          } else if (route === 'focus-shield') {
            setViewMode('focus-shield');
          } else if (route === 'premium') {
            setViewMode('premium');
          } else if (route === 'profile-screen') {
            setViewMode('profile-screen');
          }
        }}
      />
    );
  }

  // ProgressTree view - Vertical Focus Journey with Duolingo elements (Path Screen)
  if (viewMode === 'progress-tree') {
    return (
      <VerticalProgressPath
        onBack={() => setViewMode('home')}
        onLevelSelect={(level) => {
          setSelectedLevel(level);
          setViewMode('focus-journey');
        }}
        onNavigate={(route) => {
          if (route === 'home') {
            setViewMode('home');
          } else if (route === 'practice') {
            setViewMode('practice');
          } else if (route === 'focus-shield') {
            setViewMode('focus-shield');
          } else if (route === 'leaderboard') {
            setViewMode('leaderboard');
          } else if (route === 'profile-screen') {
            setViewMode('profile-screen');
          } else if (route === 'premium') {
            setViewMode('premium');
          }
        }}
      />
    );
  }

  // Focus Journey view - Shows activities for a specific level
  if (viewMode === 'focus-journey') {
    return (
      <FocusJourneyPage
        level={selectedLevel}
        onBack={() => setViewMode('progress-tree')}
        onSelectActivity={(activityType, isTest, testSequence) => {
          // Get activity details from NEW journey-levels system
          const { getJourneyLevel } = require('@/lib/journey-levels');
          const journeyLevel = getJourneyLevel(selectedLevel, progress?.level || 1);
          const activity = journeyLevel.activities.find((a: any) => a.type === activityType);

          setSelectedChallenge({
            type: activityType,
            isTest,
            sequence: testSequence as any,
            duration: activity?.scaledDuration || 60,
            xpReward: activity?.scaledXP || 10,
            difficultyLevel: activity?.difficultyLevel || 1,
          });
          setViewMode('challenge'); // Skip ActivityDetailScreen, go straight to challenge
        }}
      />
    );
  }

  // SkillTree view
  if (viewMode === 'skill-tree') {
    return (
      <SkillTree
        onBack={() => setViewMode('home')}
      />
    );
  }

  // PersonalizedTrainingPlan view
  if (viewMode === 'training-plan') {
    return (
      <PersonalizedTrainingPlanComponent
        onBack={() => setViewMode('home')}
        onStartChallenge={(challengeType) => {
          setSelectedChallenge({
            type: challengeType,
            isTest: false,
            sequence: undefined,
          });
          setViewMode('challenge');
        }}
      />
    );
  }

  // DevTestingMode view
  if (viewMode === 'dev-testing') {
    return <DevTestingMode onBack={() => setViewMode('home')} />;
  }

  // Avatar view
  if (viewMode === 'avatar') {
    return <AvatarScreen onBack={() => setViewMode('home')} />;
  }

  // Activity Detail view - Shows detailed info before starting challenge
  if (viewMode === 'activity-detail' && selectedChallenge) {
    return (
      <ActivityDetailScreen
        activityType={selectedChallenge.type as any}
        duration={selectedChallenge.duration || 60}
        xpReward={selectedChallenge.xpReward || 10}
        difficultyLevel={selectedChallenge.difficultyLevel || 1}
        onStart={() => {
          setViewMode('challenge');
        }}
        onBack={() => {
          setViewMode('focus-journey');
        }}
      />
    );
  }

  // Challenge insights view
  if (viewMode === 'insights-screen' && challengeResult) {
    return (
      <ChallengeInsights
        challengeType={challengeResult.challengeType as any}
        level={challengeResult.level}
        score={challengeResult.score}
        duration={challengeResult.duration}
        isPerfect={challengeResult.isPerfect}
        xpEarned={challengeResult.xpEarned}
        onContinue={() => {
          // Check if we're in a practice session
          if (practiceSession) {
            const newScores = [...practiceSession.scores, challengeResult.score];
            const newTotalXP = practiceSession.totalXP + challengeResult.xpEarned;
            const isLastActivity = practiceSession.currentIndex === practiceSession.activities.length - 1;

            setChallengeResult(null);

            if (isLastActivity) {
              // Practice complete - go back to practice screen
              setPracticeSession(null);
              setSelectedPractice(null);
              setViewMode('practice');
            } else {
              // Move to next activity in practice
              setPracticeSession({
                ...practiceSession,
                currentIndex: practiceSession.currentIndex + 1,
                scores: newScores,
                totalXP: newTotalXP,
              });
              setViewMode('practice-session');
            }
          } else {
            // Regular challenge completion
            setChallengeResult(null);
            setSelectedChallenge(null);
            setViewMode('progress-tree');
          }
        }}
        onRetry={() => {
          // Keep the challenge selected and go back to retry
          setChallengeResult(null);
          if (practiceSession) {
            setViewMode('practice-session');
          } else {
            setViewMode('challenge');
          }
        }}
        onBack={() => {
          setChallengeResult(null);
          if (practiceSession) {
            // Cancel practice session
            setPracticeSession(null);
            setSelectedPractice(null);
            setViewMode('practice');
          } else {
            setSelectedChallenge(null);
            setViewMode('progress-tree');
          }
        }}
      />
    );
  }

  // Challenge view
  if (viewMode === 'challenge' && selectedChallenge) {
    return (
      <ActivityPlayer
        onBack={() => {
          setViewMode('progress-tree');
          setSelectedChallenge(null);
        }}
        activityType={selectedChallenge.type as any}
        isTest={selectedChallenge.isTest}
        testSequence={selectedChallenge.sequence as any}
        testLevel={selectedLevel}
        onActivityComplete={(score: number, duration: number) => {
          // Calculate result data for insights screen
          const isPerfect = score >= 95;
          const baseXP = 10;
          const perfectBonus = isPerfect ? 10 : 0;
          const streakBonus = Math.min((progress?.streak || 0) * 0.5, 5);
          const xpEarned = Math.round(baseXP + perfectBonus + streakBonus);

          // Store result and show insights (keep selectedChallenge for retry)
          setChallengeResult({
            challengeType: selectedChallenge.type,
            level: selectedLevel,
            score,
            duration,
            isPerfect,
            xpEarned,
          });
          setViewMode('insights-screen');
        }}
      />
    );
  }

  // Level view
  if (viewMode === 'level') {
    return (
      <LevelPage
        level={selectedLevel}
        onBack={() => setViewMode('progress-tree')}
        onSelectChallenge={(challengeType, isTest, sequence) => {
          setSelectedChallenge({
            type: challengeType,
            isTest,
            sequence,
          });
          setViewMode('challenge');
        }}
      />
    );
  }

  // Fallback - return to home (should not reach here normally)
  return (
    <HomeScreen
      onNavigate={(route) => {
        if (route === 'progress-tree') {
          setViewMode('progress-tree');
        } else if (route === 'practice') {
          setViewMode('practice');
        } else if (route === 'focus-shield') {
          setViewMode('focus-shield');
        } else if (route === 'premium') {
          setViewMode('premium');
        } else if (route === 'profile-screen') {
          setViewMode('profile-screen');
        }
      }}
    />
  );
}

export default function Index() {
  return <AppContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

