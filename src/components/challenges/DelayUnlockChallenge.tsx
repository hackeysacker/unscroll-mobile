/**
 * DELAY UNLOCK CHALLENGE
 * Practice patience by holding to unlock multiple locks
 *
 * Difficulty Scaling:
 * - Longer hold times at higher levels
 * - More locks to unlock at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface DelayUnlockChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

interface Lock {
  id: number;
  status: 'locked' | 'unlocked';
  requiredHoldTime: number;
  scaleAnim: Animated.Value;
  rotateAnim: Animated.Value;
}

export function DelayUnlockChallenge({ duration, onComplete, onBack, level = 1 }: DelayUnlockChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('delay_unlock');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [locks, setLocks] = useState<Lock[]>([]);
  const [currentLockIndex, setCurrentLockIndex] = useState(0);

  // Tracking refs
  const holdTimeRef = useRef(0);
  const successfulUnlocksRef = useRef(0);
  const failedAttemptsRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const getHoldTime = () => 2000 + (level * 200); // 2s to 4s
  const getLockCount = () => Math.min(5, 3 + Math.floor(level / 3)); // 3 to 5 locks

  // Initialize locks
  useEffect(() => {
    if (isActive) {
      const lockCount = getLockCount();
      const holdTime = getHoldTime();
      const newLocks: Lock[] = Array.from({ length: lockCount }, (_, i) => ({
        id: i,
        status: 'locked',
        requiredHoldTime: holdTime,
        scaleAnim: new Animated.Value(1),
        rotateAnim: new Animated.Value(0),
      }));
      setLocks(newLocks);
    }
  }, [isActive, level]);

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

  // Hold progress tracking
  useEffect(() => {
    if (!isHolding) {
      // Released early
      if (holdTimeRef.current > 0 && holdTimeRef.current < locks[currentLockIndex]?.requiredHoldTime) {
        failedAttemptsRef.current += 1;
        haptics.notificationError();
        sound.targetMiss();

        // Shake animation
        const lock = locks[currentLockIndex];
        if (lock) {
          Animated.sequence([
            Animated.timing(lock.scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(lock.scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(lock.scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          ]).start();
        }
      }
      holdTimeRef.current = 0;
      setHoldProgress(0);
      return;
    }

    const currentLock = locks[currentLockIndex];
    if (!currentLock || currentLock.status === 'unlocked') return;

    const interval = setInterval(() => {
      holdTimeRef.current += 50;
      const progress = (holdTimeRef.current / currentLock.requiredHoldTime) * 100;
      setHoldProgress(Math.min(100, progress));

      if (holdTimeRef.current % 500 === 0) {
        haptics.impactLight();
      }

      if (holdTimeRef.current >= currentLock.requiredHoldTime) {
        handleUnlock();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isHolding, locks, currentLockIndex]);

  const handleUnlock = () => {
    const currentLock = locks[currentLockIndex];
    if (!currentLock) return;

    successfulUnlocksRef.current += 1;
    haptics.notificationSuccess();
    sound.targetHit();

    // Update lock status
    setLocks(prev => prev.map((lock, i) =>
      i === currentLockIndex ? { ...lock, status: 'unlocked' } : lock
    ));

    // Unlock animation
    Animated.parallel([
      Animated.spring(currentLock.scaleAnim, {
        toValue: 1.3,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(currentLock.rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Celebration
    Animated.sequence([
      Animated.spring(celebrationAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(celebrationAnim, { toValue: 0, duration: 500, delay: 500, useNativeDriver: true }),
    ]).start();

    // Reset and move to next
    holdTimeRef.current = 0;
    setHoldProgress(0);
    setIsHolding(false);

    if (currentLockIndex < locks.length - 1) {
      setTimeout(() => setCurrentLockIndex(prev => prev + 1), 300);
    }
  };

  const handleComplete = () => {
    setIsActive(false);

    const totalAttempts = successfulUnlocksRef.current + failedAttemptsRef.current;
    const accuracy = totalAttempts > 0 ? (successfulUnlocksRef.current / totalAttempts) * 100 : 0;
    const completionRate = (successfulUnlocksRef.current / getLockCount()) * 100;
    const score = Math.round((accuracy * 0.6) + (completionRate * 0.4));

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const currentLock = locks[currentLockIndex];
  const getLockColor = (lock: Lock) => lock.status === 'unlocked' ? '#10B981' : (lock.id === currentLockIndex ? '#6366F1' : '#6B7280');

  const LockIcon = ({ locked, size = 32, color = '#6366F1' }: { locked: boolean; size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {locked ? (
        <>
          <Rect x="6" y="10" width="12" height="10" rx="2" stroke={color} strokeWidth="2" fill="none" />
          <Path d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="12" cy="15" r="2" fill={color} />
        </>
      ) : (
        <>
          <Rect x="6" y="10" width="12" height="10" rx="2" stroke={color} strokeWidth="2" fill="none" />
          <Path d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Circle cx="12" cy="15" r="2" fill={color} />
        </>
      )}
    </Svg>
  );

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
          <Text style={styles.statLabel}>Unlocked</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {successfulUnlocksRef.current}/{getLockCount()}
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

      {/* Lock Status */}
      <View style={styles.locksStatus}>
        {locks.map((lock) => {
          const rotation = lock.rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '15deg'],
          });

          return (
            <View key={lock.id} style={styles.lockIndicator}>
              <Animated.View
                style={{
                  transform: [{ scale: lock.scaleAnim }, { rotate: rotation }],
                }}
              >
                <LockIcon
                  locked={lock.status === 'locked'}
                  size={36}
                  color={getLockColor(lock)}
                />
              </Animated.View>
              {lock.id === currentLockIndex && lock.status === 'locked' && (
                <View style={styles.currentIndicator} />
              )}
            </View>
          );
        })}
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        <TouchableOpacity
          style={styles.unlockButton}
          onPressIn={() => setIsHolding(true)}
          onPressOut={() => setIsHolding(false)}
          activeOpacity={1}
          disabled={!currentLock || currentLock.status === 'unlocked'}
        >
          <View style={[styles.unlockCircle, { backgroundColor: isHolding ? '#10B981' : '#6366F1' }]}>
            <View style={styles.unlockIconContainer}>
              {currentLock && currentLock.status === 'locked' ? (
                <LockIcon locked={true} size={64} color="#FFFFFF" />
              ) : (
                <LockIcon locked={false} size={64} color="#10B981" />
              )}
            </View>

            {currentLock && currentLock.status === 'locked' ? (
              <>
                <View style={styles.holdProgressContainer}>
                  <View style={[styles.holdProgressBar, { width: `${holdProgress}%` }]} />
                </View>
                <Text style={styles.holdText}>
                  {isHolding ? `Hold... ${Math.round(holdProgress)}%` : 'Press & Hold'}
                </Text>
                <Text style={styles.holdSubtext}>
                  {(getHoldTime() / 1000).toFixed(1)}s required
                </Text>
              </>
            ) : (
              <Text style={styles.allDoneText}>
                {successfulUnlocksRef.current === getLockCount() ? 'All Unlocked!' : 'Keep going!'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Celebration */}
      <Animated.View
        style={[
          styles.celebrationContainer,
          {
            opacity: celebrationAnim,
            transform: [{ scale: celebrationAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.celebrationText}>Unlocked!</Text>
      </Animated.View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Hold continuously - releasing early resets!
        </Text>
        <Text style={styles.subText}>
          Failed: {failedAttemptsRef.current}
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

  // Lock Status
  locksStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  lockIndicator: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  unlockButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  unlockCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  unlockIconContainer: {
    marginBottom: 4,
  },
  holdProgressContainer: {
    width: '90%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  holdProgressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  holdText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  holdSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  allDoneText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Celebration
  celebrationContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  celebrationText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
