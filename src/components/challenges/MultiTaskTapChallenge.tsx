import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { Button } from '@/components/ui/Button';
import { ExerciseOverview, type ExerciseStats } from '@/components/ExerciseOverview';

const { width, height } = Dimensions.get('window');

interface MultiTaskTapChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  level?: number;
}

interface TapTarget {
  id: number;
  x: number;
  y: number;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
  pulseAnim: Animated.Value;
  color: string;
}

// Design system constants
const CHALLENGE_COLORS = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#030712',
  cardBg: '#111827',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  holdButton: '#6366F1',
  holdButtonActive: '#10B981',
  target1: '#F59E0B',
  target2: '#EC4899',
  target3: '#8B5CF6',
};

const TEXT_STYLES = {
  title: { fontSize: 24, fontWeight: 'bold' as const, color: CHALLENGE_COLORS.textPrimary },
  subtitle: { fontSize: 16, color: CHALLENGE_COLORS.textSecondary },
  body: { fontSize: 14, color: CHALLENGE_COLORS.textSecondary },
  stat: { fontSize: 20, fontWeight: '600' as const, color: CHALLENGE_COLORS.textPrimary },
};

export function MultiTaskTapChallenge({
  duration,
  onComplete,
  onNextLesson,
  hasNextLesson,
  level = 1
}: MultiTaskTapChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  const [isActive, setIsActive] = useState(false); // Auto-start since we now have ActivityDetailScreen
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isHolding, setIsHolding] = useState(false);
  const [targets, setTargets] = useState<TapTarget[]>([]);
  const [showOverview, setShowOverview] = useState(false);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats | null>(null);
  const [holdScore, setHoldScore] = useState(100);
  const [tapScore, setTapScore] = useState(100);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const holdTimeRef = useRef(0);
  const totalTimeRef = useRef(0);
  const tappedTargetsRef = useRef(0);
  const totalTargetsRef = useRef(0);
  const consecutiveTapsRef = useRef(0);
  const holdButtonScale = useRef(new Animated.Value(1)).current;
  const holdGlowAnim = useRef(new Animated.Value(0)).current;

  // Difficulty scaling
  const getSpawnInterval = () => {
    const baseInterval = 2000;
    const levelMultiplier = 1 - (level / 15);
    return Math.max(1000, baseInterval * levelMultiplier);
  };

  const getTargetDuration = () => {
    const baseDuration = 2500;
    const levelMultiplier = 1 - (level / 20);
    return Math.max(1500, baseDuration * levelMultiplier);
  };

  const getMaxTargets = () => {
    return Math.min(5, 2 + Math.floor(level / 3));
  };

  const getTargetColor = () => {
    const colors = [CHALLENGE_COLORS.target1, CHALLENGE_COLORS.target2, CHALLENGE_COLORS.target3];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Hold button animation
  const animateHoldButton = (holding: boolean) => {
    if (holding) {
      Animated.parallel([
        Animated.spring(holdButtonScale, {
          toValue: 1.15,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(holdGlowAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(holdGlowAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(holdButtonScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      holdGlowAnim.setValue(0);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      totalTimeRef.current += 100;
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

  // Hold tracking effect
  useEffect(() => {
    if (!isHolding || !isActive) return;

    const interval = setInterval(() => {
      holdTimeRef.current += 100;
    }, 100);

    return () => clearInterval(interval);
  }, [isHolding, isActive]);

  // Update hold score
  useEffect(() => {
    if (!isActive || totalTimeRef.current === 0) return;

    const interval = setInterval(() => {
      const currentHoldAccuracy = (holdTimeRef.current / totalTimeRef.current) * 100;
      setHoldScore(Math.round(currentHoldAccuracy));

      if (currentHoldAccuracy < 50) {
        haptics.notificationWarning();
        sound.warning();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Target spawner
  useEffect(() => {
    if (!isActive) return;

    const generateTarget = () => {
      if (targets.length >= getMaxTargets()) return;

      const challengeAreaHeight = height - 400; // Account for header, footer, and hold button
      const safeMargin = 80; // Keep targets away from hold button

      const newTarget: TapTarget = {
        id: Date.now() + Math.random(),
        x: Math.random() * (width - 100) + 20,
        y: Math.random() * (challengeAreaHeight - 100) + 200,
        scaleAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(0),
        pulseAnim: new Animated.Value(1),
        color: getTargetColor(),
      };

      setTargets(prev => [...prev, newTarget]);
      totalTargetsRef.current += 1;
      haptics.impactLight();
      sound.targetAppear();

      // Entrance animation
      Animated.parallel([
        Animated.spring(newTarget.scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(newTarget.opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(newTarget.pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(newTarget.pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto-remove target after duration (missed target)
      setTimeout(() => {
        setTargets(prev => {
          const stillExists = prev.find(t => t.id === newTarget.id);
          if (stillExists) {
            consecutiveTapsRef.current = 0;
            setStreak(0);
            const missedPenalty = 5;
            setTapScore(prev => Math.max(0, prev - missedPenalty));
            haptics.notificationError();
            sound.targetMiss();
          }
          return prev.filter(t => t.id !== newTarget.id);
        });
      }, getTargetDuration());
    };

    const interval = setInterval(generateTarget, getSpawnInterval());
    generateTarget(); // Spawn first target immediately

    return () => clearInterval(interval);
  }, [isActive, level, targets.length]);

  const handleTargetTap = (target: TapTarget) => {
    tappedTargetsRef.current += 1;
    consecutiveTapsRef.current += 1;
    setStreak(consecutiveTapsRef.current);
    setBestStreak(prev => Math.max(prev, consecutiveTapsRef.current));

    haptics.impactMedium();
    sound.targetHit();

    // Explosion animation
    Animated.parallel([
      Animated.timing(target.scaleAnim, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(target.opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTargets(prev => prev.filter(t => t.id !== target.id));
    });
  };

  const handleHoldPress = () => {
    setIsHolding(true);
    animateHoldButton(true);
    haptics.impactLight();
  };

  const handleHoldRelease = () => {
    setIsHolding(false);
    animateHoldButton(false);
    haptics.impactLight();
  };

  const handleComplete = () => {
    const totalMs = duration * 1000;
    const holdAccuracy = totalMs > 0 ? (holdTimeRef.current / totalMs) * 100 : 0;
    const tapAccuracy = totalTargetsRef.current > 0
      ? (tappedTargetsRef.current / totalTargetsRef.current) * 100
      : 100;

    const score = (holdAccuracy * 0.5 + tapAccuracy * 0.5);

    // Calculate achievements
    const achievements: string[] = [];
    if (holdAccuracy >= 90 && tapAccuracy >= 90) achievements.push('🎯 Multi-Tasker');
    if (tappedTargetsRef.current === totalTargetsRef.current && totalTargetsRef.current >= 5) achievements.push('⚡ Perfect Tapper');
    if (holdAccuracy >= 95) achievements.push('💪 Iron Grip');
    if (score >= 90) achievements.push('👑 Dual Focus');
    if (bestStreak >= 10) achievements.push('🔥 Streak Master');
    if (holdAccuracy >= 80 && tapAccuracy >= 80) achievements.push('🧠 Balanced Mind');

    // Calculate XP
    const baseXP = Math.round(score * 0.5);
    const tapBonus = tappedTargetsRef.current * 3;
    const holdBonus = holdAccuracy >= 80 ? 15 : 0;
    const streakBonus = bestStreak * 2;
    const achievementXP = achievements.length * 5;
    const perfectBonus = (holdAccuracy >= 95 && tapAccuracy >= 95) ? 25 : 0;
    const xpEarned = baseXP + tapBonus + holdBonus + streakBonus + achievementXP + perfectBonus;

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    const stats: ExerciseStats = {
      score,
      duration: duration * 1000,
      accuracy: score,
      correctActions: tappedTargetsRef.current,
      totalActions: totalTargetsRef.current,
      xpEarned,
      achievements,
    };

    setExerciseStats(stats);
    setShowOverview(true);
  };

  const handleOverviewContinue = () => {
    if (exerciseStats) {
      onComplete(exerciseStats.score, exerciseStats.duration);
    }
  };

  if (showOverview && exerciseStats) {
    return (
      <ExerciseOverview
        challengeType="multi_task_tap"
        stats={exerciseStats}
        onContinue={handleOverviewContinue}
        showHeartLoss={true}
        onNextLesson={onNextLesson}
        hasNextLesson={hasNextLesson}
      />
    );
  }

  // Removed intro screen - challenge starts immediately

  const progress = (timeLeft / duration) * 100;
  const holdColor = holdScore >= 70 ? CHALLENGE_COLORS.success : holdScore >= 40 ? CHALLENGE_COLORS.warning : CHALLENGE_COLORS.danger;
  const tapColor = tapScore >= 70 ? CHALLENGE_COLORS.success : tapScore >= 40 ? CHALLENGE_COLORS.warning : CHALLENGE_COLORS.danger;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a0a2e', '#0a0a0a']} style={styles.gradient}>
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Hold</Text>
            <Text style={[styles.statValue, { color: holdColor }]}>
              {holdScore}%
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Taps</Text>
            <Text style={[styles.statValue, { color: tapColor }]}>
              {tappedTargetsRef.current}/{totalTargetsRef.current}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={[styles.statValue, { color: streak >= 5 ? CHALLENGE_COLORS.success : CHALLENGE_COLORS.warning }]}>
              {streak} 🔥
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Challenge Area */}
        <View style={styles.challengeArea}>
          {/* Hold Button */}
          <Animated.View
            style={{
              transform: [{ scale: holdButtonScale }],
            }}
          >
            <TouchableOpacity
              style={styles.holdButtonTouchable}
              onPressIn={handleHoldPress}
              onPressOut={handleHoldRelease}
              activeOpacity={1}
            >
              <LinearGradient
                colors={isHolding
                  ? [CHALLENGE_COLORS.holdButtonActive, '#059669', CHALLENGE_COLORS.holdButtonActive]
                  : [CHALLENGE_COLORS.holdButton, '#4F46E5', CHALLENGE_COLORS.holdButton]
                }
                style={styles.holdButton}
              >
                {isHolding && (
                  <Animated.View
                    style={[
                      styles.holdGlow,
                      {
                        opacity: holdGlowAnim,
                      },
                    ]}
                  />
                )}
                <Text style={styles.holdText}>
                  {isHolding ? 'HOLDING ✓' : 'HOLD ME'}
                </Text>
                <Text style={styles.holdSubtext}>
                  {isHolding ? 'Keep holding!' : 'Press & hold'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Targets */}
          {targets.map((target) => (
            <Animated.View
              key={target.id}
              style={[
                styles.targetContainer,
                {
                  left: target.x,
                  top: target.y,
                  opacity: target.opacityAnim,
                  transform: [
                    { scale: target.scaleAnim },
                    { scale: target.pulseAnim },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.targetTouchable}
                onPress={() => handleTargetTap(target)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[target.color, target.color + 'CC']}
                  style={styles.target}
                >
                  <Text style={styles.targetText}>TAP</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Bottom Instruction */}
        <View style={styles.instructionFooter}>
          <Text style={styles.instructionFooterText}>
            {isHolding
              ? '✓ Holding! Now tap the targets!'
              : '⚠️ You must HOLD the button!'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHALLENGE_COLORS.background,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  introCard: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLarge: {
    fontSize: 56,
  },
  centered: {
    textAlign: 'center',
  },
  instructionsBox: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    marginTop: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CHALLENGE_COLORS.textPrimary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: CHALLENGE_COLORS.textSecondary,
    lineHeight: 20,
  },
  levelBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A5B4FC',
  },
  startButton: {
    width: '100%',
    marginTop: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: CHALLENGE_COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CHALLENGE_COLORS.textPrimary,
  },
  progressCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CHALLENGE_COLORS.primary,
    borderRadius: 4,
  },
  challengeArea: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdButtonTouchable: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  holdButton: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  holdGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    top: -10,
    left: -10,
  },
  holdText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  holdSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  targetContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  targetTouchable: {
    width: '100%',
    height: '100%',
  },
  target: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  targetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructionFooter: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  instructionFooterText: {
    fontSize: 16,
    fontWeight: '600',
    color: CHALLENGE_COLORS.textPrimary,
  },
});
