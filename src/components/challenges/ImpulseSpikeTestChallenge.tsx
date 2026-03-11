/**
 * Impulse Spike Test Challenge - REWORKED
 *
 * Test your ability to resist tempting clickbait, notifications, and distractions.
 * Features realistic baits with animations, difficulty scaling, and a resistance meter.
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { Button } from '@/components/ui/Button';
import { ExerciseOverview, type ExerciseStats } from '@/components/ExerciseOverview';

const CHALLENGE_COLORS = {
  background: '#030712',
  cardBg: '#111827',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  accentPrimary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  progressBg: '#1F2937',
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold' as const, color: CHALLENGE_COLORS.textPrimary },
  body: { fontSize: 14, color: CHALLENGE_COLORS.textSecondary },
};

const getAccessibilityLabel = (title: string, status: string) => `${title}: ${status}`;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImpulseSpikeTestChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  level?: number;
}

type BaitCategory = 'notification' | 'ad' | 'clickbait' | 'urgency' | 'social' | 'video';

interface BaitContent {
  title: string;
  subtitle?: string;
  action?: string;
  color: string;
  icon: string;
}

interface Bait {
  id: number;
  x: number;
  y: number;
  category: BaitCategory;
  content: BaitContent;
  scaleAnim: Animated.Value;
  pulseAnim: Animated.Value;
}

// Realistic bait content library
const BAIT_LIBRARY: Record<BaitCategory, BaitContent[]> = {
  notification: [
    { title: 'New Message', subtitle: 'Sarah sent you a photo', action: 'OPEN', color: '#3B82F6', icon: '💬' },
    { title: '3 New Likes', subtitle: 'Your post is trending!', action: 'VIEW', color: '#EC4899', icon: '❤️' },
    { title: 'Friend Request', subtitle: '2 people want to connect', action: 'ACCEPT', color: '#8B5CF6', icon: '👥' },
    { title: 'You\'re mentioned!', subtitle: '5 people tagged you', action: 'SEE', color: '#10B981', icon: '🔔' },
    { title: 'Breaking News', subtitle: 'Something major just happened!', action: 'READ', color: '#F59E0B', icon: '📰' },
  ],
  ad: [
    { title: 'LIMITED OFFER', subtitle: '90% OFF - Ends in 5 minutes!', action: 'SHOP NOW', color: '#DC2626', icon: '🛍️' },
    { title: 'FREE GIFT', subtitle: 'Click to claim your reward', action: 'CLAIM', color: '#16A34A', icon: '🎁' },
    { title: 'Win $1000!', subtitle: 'You\'re our lucky visitor!', action: 'ENTER', color: '#D97706', icon: '💰' },
    { title: 'Hot Singles Near You', subtitle: '12 matches waiting...', action: 'MEET', color: '#BE123C', icon: '💋' },
  ],
  clickbait: [
    { title: 'You Won\'t Believe...', subtitle: 'What happened next will shock you!', action: 'CLICK', color: '#EA580C', icon: '😱' },
    { title: 'Doctors HATE This', subtitle: 'One weird trick discovered...', action: 'LEARN', color: '#7C3AED', icon: '🩺' },
    { title: '#1 Secret Revealed', subtitle: 'They don\'t want you to know...', action: 'DISCOVER', color: '#0891B2', icon: '🔓' },
    { title: 'Is This You?', subtitle: 'Someone shared your photo...', action: 'CHECK', color: '#DC2626', icon: '📸' },
  ],
  urgency: [
    { title: '⚠️ URGENT', subtitle: 'Your account expires in 1 hour!', action: 'RENEW', color: '#991B1B', icon: '⏰' },
    { title: 'Act Now!', subtitle: 'Last chance - Only 2 left!', action: 'BUY', color: '#B91C1C', icon: '🔥' },
    { title: 'FINAL WARNING', subtitle: 'Payment failed - Update now!', action: 'UPDATE', color: '#7F1D1D', icon: '⚠️' },
    { title: 'Hurry Up!', subtitle: 'Deal ends in 3... 2... 1...', action: 'GRAB', color: '#DC2626', icon: '⚡' },
  ],
  social: [
    { title: 'Trending Now', subtitle: 'Everyone is talking about this!', action: 'JOIN', color: '#0EA5E9', icon: '🔥' },
    { title: 'You Have 99+ Updates', subtitle: 'See what you missed', action: 'CATCH UP', color: '#6366F1', icon: '📱' },
    { title: 'Group Invite', subtitle: '15 friends are waiting for you', action: 'ACCEPT', color: '#8B5CF6', icon: '👋' },
    { title: 'Comment Reply', subtitle: 'Someone disagreed with you!', action: 'RESPOND', color: '#EF4444', icon: '💬' },
  ],
  video: [
    { title: '▶️ Recommended', subtitle: 'This video is going viral!', action: 'WATCH', color: '#DC2626', icon: '🎬' },
    { title: 'Live Stream', subtitle: '12,453 people are watching', action: 'JOIN LIVE', color: '#BE123C', icon: '📺' },
    { title: 'New Episode', subtitle: 'Your favorite show just dropped!', action: 'BINGE', color: '#7C2D12', icon: '🍿' },
    { title: 'Viral Clip', subtitle: '5M views in 1 hour!', action: 'SEE IT', color: '#F97316', icon: '🔥' },
  ],
};

export function ImpulseSpikeTestChallenge({
  duration,
  onComplete,
  onNextLesson,
  hasNextLesson,
  level = 1,
}: ImpulseSpikeTestChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  const [isActive, setIsActive] = useState(false); // Auto-start since we now have ActivityDetailScreen
  const [timeLeft, setTimeLeft] = useState(duration);
  const [baits, setBaits] = useState<Bait[]>([]);
  const [showOverview, setShowOverview] = useState(false);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats | null>(null);
  const [resistanceScore, setResistanceScore] = useState(100);

  const clickedBaitsRef = useRef(0);
  const totalBaitsRef = useRef(0);
  const consecutiveResistsRef = useRef(0);
  const maxStreakRef = useRef(0);

  const resistanceAnim = useRef(new Animated.Value(100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate difficulty-based spawn rate
  // Level 1: 1 bait every 3s (easy)
  // Level 10: 1 bait every 0.5s (overwhelming)
  const getSpawnInterval = () => {
    const baseInterval = 3000; // 3 seconds
    const levelMultiplier = 1 - (level / 15); // Gets faster with higher levels
    return Math.max(500, baseInterval * levelMultiplier);
  };

  const getBaitLifetime = () => {
    return 3000 - (level * 100); // Faster disappear at higher levels
  };

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = ((duration - timeLeft) / duration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, duration]);

  // Bait generation
  useEffect(() => {
    if (!isActive) return;

    const generateBait = () => {
      const categories: BaitCategory[] = ['notification', 'ad', 'clickbait', 'urgency', 'social', 'video'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const contentOptions = BAIT_LIBRARY[category];
      const content = contentOptions[Math.floor(Math.random() * contentOptions.length)];

      const scaleAnim = new Animated.Value(0);
      const pulseAnim = new Animated.Value(1);

      const newBait: Bait = {
        id: Date.now() + Math.random(),
        x: Math.random() * (SCREEN_WIDTH - 200) + 20,
        y: Math.random() * (SCREEN_HEIGHT * 0.5 - 150) + 50,
        category,
        content,
        scaleAnim,
        pulseAnim,
      };

      // Entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      setBaits(prev => [...prev, newBait]);
      totalBaitsRef.current += 1;

      // Auto-remove after lifetime
      setTimeout(() => {
        // Exit animation
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setBaits(prev => prev.filter(b => b.id !== newBait.id));
          // Successfully resisted!
          consecutiveResistsRef.current += 1;
          if (consecutiveResistsRef.current > maxStreakRef.current) {
            maxStreakRef.current = consecutiveResistsRef.current;
          }
          updateResistanceScore(5); // Gain resistance
        });
      }, getBaitLifetime());
    };

    const interval = setInterval(generateBait, getSpawnInterval());
    return () => clearInterval(interval);
  }, [isActive, level]);

  const updateResistanceScore = (change: number) => {
    setResistanceScore(prev => {
      const newScore = Math.max(0, Math.min(100, prev + change));
      Animated.spring(resistanceAnim, {
        toValue: newScore,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
      return newScore;
    });
  };

  const handleBaitClick = (bait: Bait) => {
    clickedBaitsRef.current += 1;
    consecutiveResistsRef.current = 0; // Reset streak
    updateResistanceScore(-15); // Lose resistance

    haptics.notificationError();
    sound.targetMiss();

    // Explosion animation
    Animated.parallel([
      Animated.spring(bait.scaleAnim, {
        toValue: 1.5,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(bait.scaleAnim, {
        toValue: 0,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBaits(prev => prev.filter(b => b.id !== bait.id));
    });
  };

  const handleComplete = () => {
    const resistedBaits = totalBaitsRef.current - clickedBaitsRef.current;
    const score = totalBaitsRef.current > 0
      ? (resistedBaits / totalBaitsRef.current) * 100
      : 100;

    // Calculate achievements
    const achievements: string[] = [];
    if (clickedBaitsRef.current === 0 && totalBaitsRef.current >= 5) {
      achievements.push('🛡️ Iron Will');
    }
    if (score === 100 && totalBaitsRef.current >= 10) achievements.push('👑 Impulse Master');
    if (score >= 90) achievements.push('🎯 Self Control');
    if (maxStreakRef.current >= 10) achievements.push('⚡ Resistance Streak');
    if (resistedBaits >= 15) achievements.push('💎 Bait Destroyer');
    if (resistanceScore >= 90) achievements.push('💪 Strong Will');

    // Calculate XP
    const baseXP = Math.round(score * 0.6);
    const resistBonus = resistedBaits * 4;
    const streakBonus = maxStreakRef.current * 2;
    const achievementXP = achievements.length * 6;
    const perfectBonus = clickedBaitsRef.current === 0 ? 30 : 0;
    const xpEarned = baseXP + resistBonus + streakBonus + achievementXP + perfectBonus;

    const stats: ExerciseStats = {
      score,
      duration: duration * 1000,
      correctActions: resistedBaits,
      totalActions: totalBaitsRef.current,
      maxStreak: maxStreakRef.current,
      accuracy: totalBaitsRef.current > 0 ? (resistedBaits / totalBaitsRef.current) * 100 : 0,
      xpEarned,
      achievements,
    };

    setExerciseStats(stats);
    setShowOverview(true);

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }
  };

  const handleOverviewContinue = () => {
    if (exerciseStats) {
      onComplete(exerciseStats.score, exerciseStats.duration);
    }
  };

  const handleStart = () => {
    setIsActive(true);
    haptics.impactMedium();
  };

  if (showOverview && exerciseStats) {
    return (
      <ExerciseOverview
        challengeType="impulse_spike_test"
        stats={exerciseStats}
        onContinue={handleOverviewContinue}
        showHeartLoss={true}
        onNextLesson={onNextLesson}
        hasNextLesson={hasNextLesson}
      />
    );
  }

  // Removed intro screen - challenge starts immediately

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const resistanceWidth = resistanceAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const resistanceColor = resistanceScore >= 70 ? CHALLENGE_COLORS.success :
                          resistanceScore >= 40 ? CHALLENGE_COLORS.warning :
                          CHALLENGE_COLORS.error;

  return (
    <View style={styles.container} accessibilityLabel={getAccessibilityLabel('Impulse Spike Test', 'In progress')}>
      {/* Progress Card */}
      <View style={styles.card}>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Time Remaining</Text>
              <Text style={styles.statsText}>
                Resisted: {totalBaitsRef.current - clickedBaitsRef.current} • Clicked: {clickedBaitsRef.current}
              </Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.progressValue}>{timeLeft}</Text>
              <Text style={styles.timeUnit}>s</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressWidth }
              ]}
            />
          </View>

          {/* Resistance Meter */}
          <View style={styles.resistanceSection}>
            <Text style={styles.resistanceLabel}>
              🛡️ Resistance: {Math.round(resistanceScore)}%
            </Text>
            <View style={styles.resistanceMeterContainer}>
              <Animated.View
                style={[
                  styles.resistanceMeter,
                  {
                    width: resistanceWidth,
                    backgroundColor: resistanceColor,
                  }
                ]}
              />
            </View>
          </View>

          {maxStreakRef.current >= 5 && (
            <Text style={styles.streakText}>
              🔥 Streak: {consecutiveResistsRef.current} (Best: {maxStreakRef.current})
            </Text>
          )}
        </View>
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        {baits.map((bait) => (
          <Animated.View
            key={bait.id}
            style={[
              styles.baitContainer,
              {
                left: bait.x,
                top: bait.y,
                transform: [
                  { scale: bait.scaleAnim },
                  { scale: bait.pulseAnim },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.bait}
              onPress={() => handleBaitClick(bait)}
              activeOpacity={0.9}
              accessibilityLabel={`Tempting ${bait.category} bait - resist clicking!`}
            >
              <LinearGradient
                colors={[bait.content.color, bait.content.color + 'CC']}
                style={styles.baitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.baitContent}>
                <Text style={styles.baitIcon}>{bait.content.icon}</Text>
                <Text style={styles.baitTitle} numberOfLines={1}>{bait.content.title}</Text>
                {bait.content.subtitle && (
                  <Text style={styles.baitSubtitle} numberOfLines={1}>{bait.content.subtitle}</Text>
                )}
                {bait.content.action && (
                  <View style={styles.baitActionButton}>
                    <Text style={styles.baitActionText}>{bait.content.action}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {baits.length === 0 && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingEmoji}>🧘</Text>
            <Text style={styles.waitingText}>Stay calm... resist when baits appear</Text>
          </View>
        )}
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>
          🛡️ Don't click the baits! Let them disappear naturally to build resistance.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHALLENGE_COLORS.background,
    padding: 16,
  },
  card: {
    backgroundColor: CHALLENGE_COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  introContent: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    ...TEXT_STYLES.h1,
  },
  description: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  tipsContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: CHALLENGE_COLORS.accentPrimary,
    gap: 8,
    width: '100%',
  },
  tipText: {
    fontSize: 14,
    color: CHALLENGE_COLORS.textSecondary,
    textAlign: 'left',
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CHALLENGE_COLORS.accentPrimary + '20',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CHALLENGE_COLORS.accentPrimary,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: CHALLENGE_COLORS.accentPrimary,
  },
  startButton: {
    width: '100%',
    backgroundColor: CHALLENGE_COLORS.accentPrimary,
  },
  progressSection: {
    gap: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: CHALLENGE_COLORS.textSecondary,
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    color: CHALLENGE_COLORS.textSecondary,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CHALLENGE_COLORS.textPrimary,
    letterSpacing: -1,
  },
  timeUnit: {
    fontSize: 18,
    color: CHALLENGE_COLORS.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: CHALLENGE_COLORS.progressBg,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: CHALLENGE_COLORS.accentPrimary,
    borderRadius: 5,
    shadowColor: CHALLENGE_COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  resistanceSection: {
    marginTop: 8,
  },
  resistanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CHALLENGE_COLORS.textPrimary,
    marginBottom: 8,
  },
  resistanceMeterContainer: {
    height: 24,
    backgroundColor: CHALLENGE_COLORS.progressBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resistanceMeter: {
    height: '100%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    fontSize: 13,
    color: CHALLENGE_COLORS.warning,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  challengeArea: {
    flex: 1,
    backgroundColor: CHALLENGE_COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 400,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1f2937',
    overflow: 'hidden',
  },
  baitContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  bait: {
    width: 280,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  baitGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  baitContent: {
    padding: 14,
    gap: 6,
  },
  baitIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  baitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  baitSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  baitActionButton: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  baitActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  waitingEmoji: {
    fontSize: 48,
  },
  waitingText: {
    fontSize: 16,
    color: CHALLENGE_COLORS.textSecondary,
    fontWeight: '500',
  },
  instructionContainer: {
    paddingHorizontal: 8,
  },
  instruction: {
    fontSize: 14,
    color: CHALLENGE_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
