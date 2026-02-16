/**
 * TAP PATTERN CHALLENGE
 * Remember and repeat the color pattern
 *
 * Difficulty Scaling:
 * - Shorter patterns at lower levels
 * - Longer patterns at higher levels
 * - Faster pattern display at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface TapPatternChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function TapPatternChallenge({ duration, onComplete, onBack, level = 1 }: TapPatternChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('tap_pattern');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showPattern, setShowPattern] = useState(true);
  const [round, setRound] = useState(1);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Tracking refs
  const successCountRef = useRef(0);
  const totalRoundsRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flashAnimations = useRef<Animated.Value[]>([]).current;

  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];

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

  // Generate initial pattern
  useEffect(() => {
    if (isActive && pattern.length === 0) {
      generateNewPattern();
    }
  }, [isActive]);

  // Check user input
  useEffect(() => {
    if (!showPattern && userPattern.length > 0) {
      const currentIndex = userPattern.length - 1;
      if (userPattern[currentIndex] !== pattern[currentIndex]) {
        // Wrong tap
        haptics.notificationError();
        sound.targetMiss();
        totalRoundsRef.current += 1;
        setTimeout(() => {
          setUserPattern([]);
          setShowPattern(true);
          generateNewPattern();
        }, 500);
      } else if (userPattern.length === pattern.length) {
        // Completed pattern correctly
        successCountRef.current += 1;
        totalRoundsRef.current += 1;
        haptics.notificationSuccess();
        sound.streak(); // Use streak sound for completing a round (not full challenge)
        setTimeout(() => {
          setUserPattern([]);
          setShowPattern(true);
          setRound(prev => prev + 1);
          generateNewPattern();
        }, 800);
      } else {
        // Correct tap, continue
        haptics.impactLight();
        sound.targetHit();
      }
    }
  }, [userPattern, showPattern]);

  const generateNewPattern = () => {
    const baseLength = Math.min(3, 2 + Math.floor(level / 3));
    const roundBonus = Math.min(4, Math.floor(round / 2));
    const length = Math.min(baseLength + roundBonus, 7);
    const newPattern = Array.from({ length }, () => Math.floor(Math.random() * 4));
    setPattern(newPattern);

    // Initialize flash animations
    flashAnimations.length = 0;
    for (let i = 0; i < newPattern.length; i++) {
      flashAnimations.push(new Animated.Value(1));
    }

    // Flash pattern
    const flashDelay = Math.max(300, 500 - (level * 20));
    newPattern.forEach((colorIndex, idx) => {
      setTimeout(() => {
        setHighlightedIndex(idx);
        const anim = flashAnimations[idx] || new Animated.Value(1);
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => setHighlightedIndex(null), 400);
      }, idx * flashDelay);
    });

    setTimeout(() => {
      setShowPattern(false);
      haptics.impactMedium();
      sound.transition();
    }, newPattern.length * flashDelay + 500);
  };

  const handleColorTap = (index: number) => {
    if (showPattern) return;
    setUserPattern(prev => [...prev, index]);
  };

  const handleComplete = () => {
    setIsActive(false);

    const accuracy = totalRoundsRef.current > 0
      ? (successCountRef.current / totalRoundsRef.current) * 100
      : 0;
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

  const accuracy = totalRoundsRef.current > 0
    ? Math.round((successCountRef.current / totalRoundsRef.current) * 100)
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

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        {showPattern ? (
          <View style={styles.patternContainer}>
            <Text style={styles.patternLabel}>👀 Watch the pattern</Text>
            <View style={styles.patternRow}>
              {pattern.map((colorIndex, idx) => {
                const anim = flashAnimations[idx] || new Animated.Value(1);
                const isHighlighted = highlightedIndex === idx;
                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.patternColor,
                      {
                        backgroundColor: colors[colorIndex],
                        transform: [{ scale: anim }],
                        shadowColor: isHighlighted ? colors[colorIndex] : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isHighlighted ? 0.8 : 0,
                        shadowRadius: isHighlighted ? 20 : 0,
                        elevation: isHighlighted ? 20 : 0,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.recallContainer}>
            <Text style={styles.recallLabel}>✍️ Repeat the pattern</Text>
            <View style={styles.colorGrid}>
              {colors.map((color, index) => {
                const isInUserPattern = userPattern.includes(index);
                const userPatternIndex = userPattern.indexOf(index);
                const isCorrect = userPatternIndex !== -1 && pattern[userPatternIndex] === index;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      isInUserPattern && (isCorrect ? styles.colorButtonCorrect : styles.colorButtonIncorrect),
                    ]}
                    onPress={() => handleColorTap(index)}
                    activeOpacity={0.7}
                  >
                    {isInUserPattern && (
                      <View style={styles.colorButtonIndicator}>
                        <Text style={styles.colorButtonIndicatorText}>
                          {userPatternIndex + 1}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {userPattern.length > 0 && (
              <View style={styles.userPatternContainer}>
                <Text style={styles.userPatternLabel}>Your pattern:</Text>
                <View style={styles.userPatternRow}>
                  {userPattern.map((colorIndex, idx) => {
                    const isCorrect = pattern[idx] === colorIndex;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.userPatternColor,
                          {
                            backgroundColor: colors[colorIndex],
                            borderColor: isCorrect ? '#10B981' : '#EF4444',
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {showPattern ? 'Watch carefully!' : 'Tap the colors in order'}
        </Text>
        <Text style={styles.subText}>
          Round {round} • {successCountRef.current}/{totalRoundsRef.current} correct
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
    padding: 24,
  },
  patternContainer: {
    alignItems: 'center',
    gap: 32,
  },
  patternLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  patternColor: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  recallContainer: {
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
  recallLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    maxWidth: 300,
  },
  colorButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  colorButtonCorrect: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  colorButtonIncorrect: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  colorButtonIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#030712',
  },
  userPatternContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  userPatternLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  userPatternRow: {
    flexDirection: 'row',
    gap: 12,
  },
  userPatternColor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
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
