/**
 * PATTERN MATCHING PUZZLE
 * Match the displayed pattern by selecting the correct tiles
 *
 * Difficulty Scaling:
 * - Larger grids at higher levels (3x3 to 6x6)
 * - More colors and complex patterns
 * - Less time to complete
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';
import { getChallengeScaling } from '@/lib/challenge-progression';

interface PatternMatchingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function PatternMatchingChallenge({ duration, onComplete, onBack, level = 1 }: PatternMatchingChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // Get scaling params
  const scaling = getChallengeScaling('pattern_matching', level);
  const gridSize = scaling.gridSize || 3;
  const colors = scaling.colors || 3;
  const timeLimit = scaling.timeLimit || 60;

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('pattern_matching');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [targetPattern, setTargetPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showTarget, setShowTarget] = useState(true);
  const [matchesFound, setMatchesFound] = useState(0);

  // Refs
  const startTimeRef = useRef(Date.now());
  const mistakesRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate random pattern
  useEffect(() => {
    if (isActive && targetPattern.length === 0) {
      const totalTiles = gridSize * gridSize;
      const pattern = Array.from({ length: totalTiles }, () =>
        Math.floor(Math.random() * colors)
      );
      setTargetPattern(pattern);
      setUserPattern(Array(totalTiles).fill(-1));

      // Show target pattern for 3-5 seconds based on difficulty
      const displayTime = Math.max(3000, 5000 - level * 50);
      setTimeout(() => {
        setShowTarget(false);
      }, displayTime);
    }
  }, [isActive, gridSize, colors, level]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || showTarget) return;

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
  }, [isActive, showTarget]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = ((timeLimit - timeLeft) / timeLimit) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, timeLimit]);

  // Check if pattern matches
  useEffect(() => {
    if (!isActive || showTarget) return;

    let matches = 0;
    userPattern.forEach((color, i) => {
      if (color !== -1 && color === targetPattern[i]) {
        matches++;
      }
    });
    setMatchesFound(matches);

    // Check if completed
    if (matches === targetPattern.length) {
      handleComplete();
    }
  }, [userPattern, targetPattern, isActive, showTarget]);

  const handleTileTap = (index: number) => {
    if (showTarget || !isActive) return;

    setUserPattern((prev) => {
      const newPattern = [...prev];
      // Cycle through colors
      newPattern[index] = (newPattern[index] + 1) % colors;

      // Check if correct
      if (newPattern[index] === targetPattern[index]) {
        haptics.impactLight();
        sound.complete();
      } else {
        mistakesRef.current += 1;
        haptics.impactLight();
      }

      return newPattern;
    });
  };

  const handleComplete = () => {
    setIsActive(false);

    const elapsedTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    const accuracy = (matchesFound / targetPattern.length) * 100;
    const speedBonus = Math.max(0, (timeLeft / timeLimit) * 20);
    const mistakePenalty = Math.min(30, mistakesRef.current * 2);
    const score = Math.min(100, Math.max(0, accuracy + speedBonus - mistakePenalty));

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, elapsedTime);
  };

  const getTileColor = (index: number) => {
    if (showTarget) {
      return COLORS[targetPattern[index]] || '#9CA3AF';
    } else {
      const userColor = userPattern[index];
      return userColor === -1 ? '#374151' : COLORS[userColor];
    }
  };

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => {
        setIsActive(true);
        startTimeRef.current = Date.now();
      }}
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
            <Text style={styles.statLabel}>Matched</Text>
            <Text style={[styles.statValue, { color: matchesFound >= targetPattern.length * 0.8 ? '#10B981' : '#F59E0B' }]}>
              {matchesFound}/{targetPattern.length}
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

        {/* Instructions */}
        <View style={styles.instructions}>
          {showTarget ? (
            <>
              <Text style={styles.instructionText}>📝 Memorize the Pattern</Text>
              <Text style={styles.subText}>Pattern will disappear soon...</Text>
            </>
          ) : (
            <>
              <Text style={styles.instructionText}>🎨 Recreate the Pattern</Text>
              <Text style={styles.subText}>Tap tiles to cycle through colors</Text>
            </>
          )}
        </View>

        {/* Challenge Area - Grid */}
        <View style={styles.challengeArea}>
          <View style={[styles.grid, { opacity: showTarget ? 1 : 0.9 }]}>
            {targetPattern.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tile,
                  {
                    width: `${90 / gridSize}%`,
                    aspectRatio: 1,
                    backgroundColor: getTileColor(index),
                  },
                ]}
                onPress={() => handleTileTap(index)}
                disabled={showTarget}
              >
                {!showTarget && userPattern[index] === targetPattern[index] && userPattern[index] !== -1 && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level} • {gridSize}x{gridSize} Grid • {colors} Colors</Text>
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
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    maxWidth: 400,
  },
  tile: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkMark: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
