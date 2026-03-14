/**
 * DISTRACTION LOG CHALLENGE
 * Notice and acknowledge distractions without judgment
 *
 * Used in Realm 7 (Resilience) - 120s distraction tracking
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { HapticPatterns as haptics } from '@/lib/haptic-patterns';

interface DistractionLogChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

const DISTRACTION_TYPES = [
  { type: 'Thought', emoji: '💭', color: '#9C27B0' },
  { type: 'Sound', emoji: '🔊', color: '#FF5722' },
  { type: 'Feeling', emoji: '💗', color: '#E91E63' },
  { type: 'Memory', emoji: '🧠', color: '#2196F3' },
  { type: 'Worry', emoji: '😟', color: '#FF9800' },
  { type: 'Planning', emoji: '📝', color: '#4CAF50' },
];

const config: ChallengeConfig = {
  name: 'Distraction Log',
  icon: '📋',
  description: 'Build awareness by noticing and logging distractions as they arise. This develops meta-cognitive awareness.',
  duration: 120,
  xpReward: 16,
  difficulty: 'medium',
  instructions: [
    'Focus on your breath or chosen anchor',
    'When distracted, notice what type it was',
    'Tap the appropriate distraction type',
    'Return focus to your anchor',
    'No judgment - just awareness',
  ],
  benefits: [
    'Increases meta-awareness',
    'Reduces reactivity to distractions',
    'Builds mindful observation',
    'Strengthens attention regulation',
  ],
  colors: {
    background: '#0a0a1a',
    primary: '#673AB7',
    secondary: '#9C27B0',
  },
};

export function DistractionLogChallenge({ duration, onComplete, onBack, level = 1 }: DistractionLogChallengeProps) {
  const themeStyles = useThemeStyles();

  // State
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [distractionCounts, setDistractionCounts] = useState<Record<string, number>>({});
  const [lastDistraction, setLastDistraction] = useState<string | null>(null);
  const [focusTime, setFocusTime] = useState(0);

  // Tracking refs
  const totalDistractions = useRef(0);
  const longestFocusStreak = useRef(0);
  const currentFocusStreak = useRef(0);
  const lastDistractionTime = useRef(Date.now());

  // Animations
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const logAnim = useRef(new Animated.Value(0)).current;

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

      // Track focus time
      setFocusTime(prev => {
        const newTime = prev + 1;
        currentFocusStreak.current = Date.now() - lastDistractionTime.current;
        if (currentFocusStreak.current > longestFocusStreak.current) {
          longestFocusStreak.current = currentFocusStreak.current;
        }
        return newTime;
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

  // Breathing animation for anchor
  useEffect(() => {
    if (!isActive) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  // Log animation
  useEffect(() => {
    if (lastDistraction) {
      Animated.sequence([
        Animated.timing(logAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setLastDistraction(null);
      });
    }
  }, [lastDistraction]);

  const handleDistractionLog = (distractionType: string) => {
    // Update counts
    setDistractionCounts(prev => ({
      ...prev,
      [distractionType]: (prev[distractionType] || 0) + 1,
    }));

    totalDistractions.current += 1;
    lastDistractionTime.current = Date.now();
    setLastDistraction(distractionType);

    // Gentle feedback
    haptics.impactLight();
    sound.click();
  };

  const handleComplete = () => {
    setIsActive(false);

    // Calculate score based on awareness (logging) vs. total focus time
    const awarenessScore = Math.min(totalDistractions.current * 10, 50);
    const focusScore = Math.min((longestFocusStreak.current / 1000) * 2, 50);
    const score = Math.min(100, awarenessScore + focusScore);

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const logScale = logAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1.2],
  });

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#0a0a1a', '#1a0a2a', '#0a0a1a']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Logged</Text>
            <Text style={[styles.statValue, { color: '#673AB7' }]}>
              {totalDistractions.current}
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
          {/* Breathing anchor */}
          <Animated.View
            style={[
              styles.breathingAnchor,
              {
                opacity: glowOpacity,
                transform: [{ scale: breatheAnim }],
              },
            ]}
          >
            <Text style={styles.anchorText}>🫁</Text>
            <Text style={styles.anchorLabel}>Focus Anchor</Text>
          </Animated.View>

          {/* Last distraction logged */}
          {lastDistraction && (
            <Animated.View
              style={[
                styles.loggedDistraction,
                {
                  transform: [{ scale: logScale }],
                  opacity: logAnim,
                },
              ]}
            >
              <Text style={styles.loggedText}>
                {DISTRACTION_TYPES.find(d => d.type === lastDistraction)?.emoji} Logged
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Distraction Buttons */}
        <View style={styles.distractionGrid}>
          {DISTRACTION_TYPES.map((distraction) => (
            <Pressable
              key={distraction.type}
              onPress={() => handleDistractionLog(distraction.type)}
              style={[
                styles.distractionButton,
                { backgroundColor: distraction.color + '20' },
              ]}
            >
              <Text style={styles.distractionEmoji}>{distraction.emoji}</Text>
              <Text style={[styles.distractionType, { color: distraction.color }]}>
                {distraction.type}
              </Text>
              <Text style={styles.distractionCount}>
                {distractionCounts[distraction.type] || 0}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            When you notice a distraction, tap its type and return to breathing
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.realmText}>Realm 7 - Resilience</Text>
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
    backgroundColor: 'rgba(103, 58, 183, 0.15)',
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
    backgroundColor: '#673AB7',
    borderRadius: 4,
  },

  // Challenge Area
  challengeArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  breathingAnchor: {
    alignItems: 'center',
    gap: 8,
  },
  anchorText: {
    fontSize: 48,
  },
  anchorLabel: {
    fontSize: 16,
    color: '#673AB7',
    fontWeight: '600',
  },
  loggedDistraction: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'rgba(103, 58, 183, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    top: 80,
  },
  loggedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Distraction Grid
  distractionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  distractionButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  distractionEmoji: {
    fontSize: 24,
  },
  distractionType: {
    fontSize: 12,
    fontWeight: '600',
  },
  distractionCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  realmText: {
    fontSize: 12,
    color: 'rgba(103, 58, 183, 0.7)',
    fontWeight: '600',
  },
});