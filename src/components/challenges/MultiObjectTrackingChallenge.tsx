/**
 * MULTI OBJECT TRACKING CHALLENGE
 * Track multiple moving targets and select them after they stop
 *
 * Difficulty Scaling:
 * - More objects at higher levels
 * - Faster movement at higher levels
 * - Longer tracking duration at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface MultiObjectTrackingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

interface TrackingObject {
  id: number;
  x: number;
  y: number;
  isTarget: boolean;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
}

type Phase = 'show' | 'track' | 'select';

export function MultiObjectTrackingChallenge({ duration, onComplete, onBack, level = 1 }: MultiObjectTrackingChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('multi_object_tracking');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState<Phase>('show');
  const [objects, setObjects] = useState<TrackingObject[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [roundNumber, setRoundNumber] = useState(1);

  // Tracking refs
  const correctSelectionsRef = useRef(0);
  const totalSelectionsRef = useRef(0);
  const totalRoundsRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;

  const objectCount = Math.min(8, 6 + Math.floor(level / 3)); // 6-8 objects
  const targetCount = Math.min(3, 2 + Math.floor(level / 5)); // 2-3 targets
  const trackingDuration = Math.min(6000, 3000 + (level * 100)); // 3s-6s tracking

  // Timer countdown
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
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, duration]);

  // Initialize round
  useEffect(() => {
    if (isActive && phase === 'show') {
      initializeRound();
    }
  }, [isActive, phase]);

  const initializeRound = () => {
    const newObjects: TrackingObject[] = Array.from({ length: objectCount }, (_, i) => ({
      id: i,
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15,
      isTarget: i < targetCount,
      scaleAnim: new Animated.Value(0),
      opacityAnim: new Animated.Value(0),
    }));

    // Shuffle
    for (let i = newObjects.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newObjects[i], newObjects[j]] = [newObjects[j], newObjects[i]];
    }

    // Animate appearance
    newObjects.forEach((obj, idx) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(obj.scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(obj.opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, idx * 100);
    });

    setObjects(newObjects);
    setSelectedIds(new Set());
    haptics.impactLight();
    sound.targetAppear();

    // Show targets briefly, then start tracking
    setTimeout(() => {
      setPhase('track');
      haptics.impactMedium();
      sound.transition();

      // Animate objects moving
      const moveInterval = setInterval(() => {
        setObjects(prev => prev.map(obj => ({
          ...obj,
          x: Math.random() * 70 + 15,
          y: Math.random() * 70 + 15,
        })));
      }, 500);

      setTimeout(() => {
        clearInterval(moveInterval);
        setPhase('select');
        haptics.impactMedium();
        sound.transition();
      }, trackingDuration);
    }, 2000);
  };

  const handleObjectSelect = (obj: TrackingObject) => {
    if (phase !== 'select' || selectedIds.has(obj.id)) return;

    const newSelectedIds = new Set(selectedIds);
    newSelectedIds.add(obj.id);
    setSelectedIds(newSelectedIds);

    totalSelectionsRef.current += 1;

    if (obj.isTarget) {
      correctSelectionsRef.current += 1;
      haptics.notificationSuccess();
      sound.targetHit();
    } else {
      haptics.notificationError();
      sound.targetMiss();
    }

    // Animate selection
    Animated.sequence([
      Animated.timing(obj.scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(obj.scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if all targets selected
    const targetsSelected = objects.filter(o => o.isTarget && newSelectedIds.has(o.id)).length;
    if (targetsSelected === targetCount) {
      totalRoundsRef.current += 1;
      setTimeout(() => {
        if (totalRoundsRef.current >= 3 || timeLeft <= 5) {
          handleComplete();
        } else {
          setRoundNumber(prev => prev + 1);
          setPhase('show');
        }
      }, 1000);
    }
  };

  const handleComplete = () => {
    setIsActive(false);

    const totalTargets = totalRoundsRef.current * targetCount;
    const accuracy = totalTargets > 0 ? (correctSelectionsRef.current / totalTargets) * 100 : 0;
    const score = Math.min(100, Math.max(0, accuracy));

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const accuracy = totalSelectionsRef.current > 0
    ? Math.round((correctSelectionsRef.current / totalSelectionsRef.current) * 100)
    : 0;

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={[styles.statValue, { color: accuracy >= 70 ? '#10B981' : '#F59E0B' }]}>
            {accuracy}%
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
      </View>

      {/* Phase indicator */}
      <View style={styles.phaseContainer}>
        <Text style={styles.phaseText}>
          {phase === 'show' ? '👀 Memorize the GREEN targets' :
           phase === 'track' ? '👁️ Track them as they move...' :
           '✋ Select the targets you tracked!'}
        </Text>
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        {objects.map((obj) => {
          const isSelected = selectedIds.has(obj.id);
          const showAsTarget = phase === 'show' && obj.isTarget;
          const showResult = phase === 'select' && isSelected;

          return (
            <TouchableOpacity
              key={obj.id}
              style={[
                styles.object,
                {
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  backgroundColor: showAsTarget ? '#10B981' : '#6366F1',
                  transform: [{ scale: obj.scaleAnim }],
                  opacity: obj.opacityAnim,
                  borderWidth: showResult ? 4 : 2,
                  borderColor: showResult
                    ? (obj.isTarget ? '#10B981' : '#EF4444')
                    : 'rgba(255, 255, 255, 0.3)',
                },
              ]}
              onPress={() => handleObjectSelect(obj)}
              disabled={phase !== 'select' || isSelected}
              activeOpacity={0.8}
            >
              {showAsTarget && (
                <Text style={styles.targetMarker}>★</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Round {roundNumber}
        </Text>
        <Text style={styles.subText}>
          Correct: {correctSelectionsRef.current}/{totalRoundsRef.current * targetCount}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.levelText}>Level {level}</Text>
      </View>
    </LinearGradient>
    </BaseChallengeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },

  // Phase
  phaseContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  object: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    marginLeft: -35,
    marginTop: -35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  targetMarker: {
    fontSize: 24,
    color: '#FFFFFF',
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
