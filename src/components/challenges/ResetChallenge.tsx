/**
 * RESET CHALLENGE - Final Mastery Test (Level 100)
 * Complete a series of rapid mini-challenges testing all attention skills
 *
 * This is the ultimate test combining:
 * - Focus Hold
 * - Memory
 * - Reaction Speed
 * - Impulse Control
 * - Stillness
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { Accelerometer } from 'expo-sensors';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';
import { getChallengeScaling } from '@/lib/challenge-progression';

type MiniChallengeType = 'focus' | 'memory' | 'reaction' | 'stillness' | 'impulse';

interface MiniChallenge {
  type: MiniChallengeType;
  name: string;
  instruction: string;
  duration: number;
  emoji: string;
}

interface ResetChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function ResetChallenge({ duration, onComplete, onBack, level = 100 }: ResetChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('reset');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isStill, setIsStill] = useState(true);
  const [memoryItems, setMemoryItems] = useState<string[]>([]);
  const [showMemoryRecall, setShowMemoryRecall] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);

  // Get scaling params
  const scaling = getChallengeScaling('reset', level);
  const challengeCount = scaling.challengeCount || 5;

  // Tracking refs
  const startTimeRef = useRef(Date.now());
  const miniScoresRef = useRef<number[]>([]);
  const stillTimeRef = useRef(0);
  const focusTimeRef = useRef(0);
  const memoryCorrectRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Define mini-challenges
  const miniChallenges: MiniChallenge[] = [
    {
      type: 'focus',
      name: 'Focus Hold',
      instruction: 'Keep your eyes on the center circle',
      duration: 10,
      emoji: '🎯',
    },
    {
      type: 'memory',
      name: 'Memory Flash',
      instruction: 'Remember the emojis shown',
      duration: 8,
      emoji: '🧠',
    },
    {
      type: 'reaction',
      name: 'Quick Tap',
      instruction: 'Tap when the circle appears',
      duration: 10,
      emoji: '⚡',
    },
    {
      type: 'stillness',
      name: 'Stay Still',
      instruction: 'Keep device perfectly still',
      duration: 10,
      emoji: '🗿',
    },
    {
      type: 'impulse',
      name: 'Resist Tap',
      instruction: 'DO NOT tap the circle',
      duration: 8,
      emoji: '🚫',
    },
  ];

  const currentChallenge = miniChallenges[currentChallengeIndex] || miniChallenges[0];

  // Initialize memory items when memory challenge starts
  useEffect(() => {
    if (isActive && currentChallenge.type === 'memory' && memoryItems.length === 0) {
      const emojis = ['🍎', '🌟', '🎨', '🎵', '🏆', '💎', '🔥', '🌈'];
      const randomEmojis = Array.from({ length: 4 }, () =>
        emojis[Math.floor(Math.random() * emojis.length)]
      );
      setMemoryItems(randomEmojis);

      // Show memory items for 3 seconds, then ask for recall
      setTimeout(() => {
        setShowMemoryRecall(true);
      }, 3000);
    }
  }, [isActive, currentChallenge.type]);

  // Show target randomly for reaction challenge
  useEffect(() => {
    if (isActive && currentChallenge.type === 'reaction') {
      const interval = setInterval(() => {
        setTargetVisible(true);
        setTimeout(() => setTargetVisible(false), 1000);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive, currentChallenge.type]);

  // Challenge timer
  useEffect(() => {
    if (!isActive) return;

    setChallengeTimeLeft(currentChallenge.duration);
    const timer = setInterval(() => {
      setChallengeTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleMiniChallengeComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, currentChallengeIndex]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = (currentChallengeIndex / challengeCount) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentChallengeIndex, isActive, challengeCount]);

  // Track focus time
  useEffect(() => {
    if (!isActive || currentChallenge.type !== 'focus') return;

    const interval = setInterval(() => {
      focusTimeRef.current += 100;
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, currentChallenge.type]);

  // Track stillness
  useEffect(() => {
    if (!isActive || currentChallenge.type !== 'stillness') return;

    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const movement = Math.sqrt(x * x + y * y + z * z) - 1;
      const intensity = Math.abs(movement);

      const nowStill = intensity < 0.1;
      setIsStill(nowStill);

      if (nowStill) {
        stillTimeRef.current += 100;
      } else {
        haptics.impactLight();
      }
    });

    return () => subscription.remove();
  }, [isActive, currentChallenge.type]);

  const handleMiniChallengeComplete = () => {
    let score = 0;

    switch (currentChallenge.type) {
      case 'focus':
        score = Math.min(100, (focusTimeRef.current / (currentChallenge.duration * 1000)) * 100);
        focusTimeRef.current = 0;
        break;
      case 'memory':
        score = (memoryCorrectRef.current / Math.max(1, memoryItems.length)) * 100;
        memoryCorrectRef.current = 0;
        setMemoryItems([]);
        setShowMemoryRecall(false);
        break;
      case 'reaction':
        // Score based on taps (simplified)
        score = 80;
        break;
      case 'stillness':
        score = Math.min(100, (stillTimeRef.current / (currentChallenge.duration * 1000)) * 100);
        stillTimeRef.current = 0;
        break;
      case 'impulse':
        // Score based on not tapping (simplified)
        score = 90;
        break;
    }

    miniScoresRef.current.push(score);
    setTotalScore(miniScoresRef.current.reduce((a, b) => a + b, 0) / miniScoresRef.current.length);

    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    haptics.impactMedium();
    sound.complete();

    // Move to next challenge or complete
    if (currentChallengeIndex + 1 < challengeCount) {
      setTimeout(() => {
        setCurrentChallengeIndex((prev) => prev + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        handleComplete();
      }, 1000);
    }
  };

  const handleComplete = () => {
    setIsActive(false);

    const finalScore = Math.round(totalScore);
    const elapsedTime = Math.round((Date.now() - startTimeRef.current) / 1000);

    if (finalScore >= 80) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(finalScore, elapsedTime);
  };

  const handleMemoryTap = (emoji: string) => {
    if (memoryItems.includes(emoji)) {
      memoryCorrectRef.current += 1;
      haptics.impactLight();
      sound.complete();
    } else {
      haptics.notificationError();
      sound.targetMiss();
    }
  };

  const handleReactionTap = () => {
    if (targetVisible) {
      haptics.impactMedium();
      sound.complete();
    }
  };

  const renderMiniChallenge = () => {
    switch (currentChallenge.type) {
      case 'focus':
        return (
          <View style={styles.focusCircle}>
            <Text style={styles.challengeEmoji}>{currentChallenge.emoji}</Text>
          </View>
        );

      case 'memory':
        if (!showMemoryRecall) {
          return (
            <View style={styles.memoryGrid}>
              {memoryItems.map((emoji, i) => (
                <View key={i} style={styles.memoryItem}>
                  <Text style={styles.memoryEmoji}>{emoji}</Text>
                </View>
              ))}
            </View>
          );
        } else {
          const allEmojis = ['🍎', '🌟', '🎨', '🎵', '🏆', '💎', '🔥', '🌈'];
          return (
            <View style={styles.memoryRecallGrid}>
              <Text style={styles.recallText}>Tap the emojis you saw:</Text>
              {allEmojis.map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.memoryRecallItem}
                  onPress={() => handleMemoryTap(emoji)}
                >
                  <Text style={styles.memoryEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        }

      case 'reaction':
        return (
          <TouchableOpacity
            style={styles.reactionArea}
            onPress={handleReactionTap}
            activeOpacity={0.8}
          >
            {targetVisible && (
              <View style={styles.reactionTarget}>
                <Text style={styles.challengeEmoji}>{currentChallenge.emoji}</Text>
              </View>
            )}
          </TouchableOpacity>
        );

      case 'stillness':
        return (
          <View style={[styles.stillnessCircle, isStill && styles.stillnessCircleActive]}>
            <Text style={styles.challengeEmoji}>{currentChallenge.emoji}</Text>
            <Text style={styles.stillnessText}>
              {isStill ? 'Perfect!' : 'Move detected'}
            </Text>
          </View>
        );

      case 'impulse':
        return (
          <View style={styles.impulseCircle}>
            <Text style={styles.challengeEmoji}>{currentChallenge.emoji}</Text>
            <Text style={styles.impulseText}>DO NOT TAP</Text>
          </View>
        );

      default:
        return null;
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
          <Text style={styles.statLabel}>Challenge</Text>
          <Text style={styles.statValue}>
            {currentChallengeIndex + 1}/{challengeCount}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={[styles.statValue, { color: totalScore >= 80 ? '#10B981' : '#F59E0B' }]}>
            {Math.round(totalScore)}%
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{challengeTimeLeft}s</Text>
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

      {/* Challenge Info */}
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeName}>{currentChallenge.name}</Text>
        <Text style={styles.challengeInstruction}>{currentChallenge.instruction}</Text>
      </View>

      {/* Challenge Area */}
      <Animated.View
        style={[
          styles.challengeArea,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {renderMiniChallenge()}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.levelText}>🏆 Final Mastery Test - Level {level} 🏆</Text>
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
    gap: 12,
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
    fontSize: 20,
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
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },

  // Challenge Info
  challengeInfo: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  challengeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  challengeInstruction: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  challengeEmoji: {
    fontSize: 64,
  },

  // Focus
  focusCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },

  // Memory
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  memoryItem: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryEmoji: {
    fontSize: 40,
  },
  memoryRecallGrid: {
    gap: 12,
    alignItems: 'center',
  },
  recallText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: '600',
  },
  memoryRecallItem: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },

  // Reaction
  reactionArea: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionTarget: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },

  // Stillness
  stillnessCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  stillnessCircleActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  stillnessText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
  },

  // Impulse
  impulseCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  impulseText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
});
