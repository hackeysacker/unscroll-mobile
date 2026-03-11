/**
 * FINGER TRACING CHALLENGE
 * Trace the curved path with your finger
 *
 * Difficulty Scaling:
 * - Longer paths at higher levels
 * - More complex curves at higher levels
 * - Stricter path tolerance at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import Svg, { Path, Circle } from 'react-native-svg';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface FingerTracingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

interface Point {
  x: number;
  y: number;
}

export function FingerTracingChallenge({ duration, onComplete, onBack, level = 1 }: FingerTracingChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('finger_tracing');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isTracing, setIsTracing] = useState(false);
  const [tracePath, setTracePath] = useState<Point[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Point | null>(null);

  // Tracking refs
  const traceTimeRef = useRef(0);
  const offPathCountRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;

  const pathWidth = 300;
  const pathHeight = 200;
  const pathThickness = Math.max(15, 25 - level); // Stricter at higher levels

  // Create curved path
  const createPath = (): Point[] => {
    const points: Point[] = [];
    const complexity = Math.min(3, 1 + Math.floor(level / 3)); // More waves at higher levels
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = 50 + (t * pathWidth);
      const y = 100 + Math.sin(t * Math.PI * complexity) * 60;
      points.push({ x, y });
    }
    return points;
  };

  const targetPath = useRef(createPath()).current;

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

  // Track time on path
  useEffect(() => {
    if (!isTracing || !isActive) return;

    const interval = setInterval(() => {
      if (currentPosition && isOnPath(currentPosition)) {
        traceTimeRef.current += 100;
      } else if (currentPosition) {
        offPathCountRef.current += 1;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isTracing, isActive, currentPosition]);

  const isOnPath = (point: Point): boolean => {
    // Check if point is near the target path
    const closest = targetPath.reduce((prev, curr) => {
      const prevDist = Math.sqrt(Math.pow(prev.x - point.x, 2) + Math.pow(prev.y - point.y, 2));
      const currDist = Math.sqrt(Math.pow(curr.x - point.x, 2) + Math.pow(curr.y - point.y, 2));
      return currDist < prevDist ? curr : prev;
    });

    const distance = Math.sqrt(
      Math.pow(closest.x - point.x, 2) + Math.pow(closest.y - point.y, 2)
    );

    return distance <= pathThickness;
  };

  // Pan responder for finger tracking
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setIsTracing(true);
        setCurrentPosition({ x: locationX, y: locationY });
        setTracePath([{ x: locationX, y: locationY }]);
        haptics.impactLight();
        // No sound on trace start - just haptic feedback
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPosition({ x: locationX, y: locationY });
        setTracePath(prev => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setIsTracing(false);
        setCurrentPosition(null);
      },
    })
  ).current;

  const handleComplete = () => {
    setIsActive(false);

    const totalMs = duration * 1000;
    const accuracy = (traceTimeRef.current / totalMs) * 100;
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

  const tracePercentage = Math.round((traceTimeRef.current / (duration * 1000)) * 100);

  // Create SVG path string
  const pathString = targetPath.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

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
          <Text style={styles.statLabel}>On Path</Text>
          <Text style={[styles.statValue, { color: tracePercentage >= 70 ? '#10B981' : '#F59E0B' }]}>
            {tracePercentage}%
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

      {/* Challenge Area */}
      <View style={styles.challengeArea} {...panResponder.panHandlers}>
        <Svg width={400} height={300}>
          {/* Target path */}
          <Path
            d={pathString}
            stroke="#6366F1"
            strokeWidth={pathThickness * 2}
            fill="none"
            opacity={0.3}
          />
          <Path
            d={pathString}
            stroke="#10B981"
            strokeWidth={3}
            fill="none"
          />

          {/* User's trace */}
          {tracePath.length > 1 && (
            <Path
              d={tracePath.map((p, i) =>
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ')}
              stroke="#F59E0B"
              strokeWidth={2}
              fill="none"
              opacity={0.6}
            />
          )}

          {/* Current finger position */}
          {currentPosition && (
            <Circle
              cx={currentPosition.x}
              cy={currentPosition.y}
              r={10}
              fill={isOnPath(currentPosition) ? '#10B981' : '#EF4444'}
              opacity={0.8}
            />
          )}
        </Svg>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isTracing ? (isOnPath(currentPosition!) ? '✓ On path!' : '⚠️ Off path!') : '👆 Trace the green line'}
        </Text>
        <Text style={styles.subText}>
          Stay within the blue guide
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

  // Challenge Area
  challengeArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
