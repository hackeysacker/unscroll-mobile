/**
 * CALM VISUAL CHALLENGE
 * Visual meditation using calming imagery and colors
 *
 * Used in Realm 5 (Flow) - 120s visual meditation
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { hapticPatterns as haptics } from '@/lib/haptic-patterns';

interface CalmVisualChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

const VISUAL_SCENES = [
  {
    name: 'Ocean Waves',
    emoji: '🌊',
    description: 'Gentle waves rolling onto a peaceful beach',
    colors: ['#006994', '#47B5FF', '#DDF2FD'],
    duration: 24,
  },
  {
    name: 'Forest Path',
    emoji: '🌲',
    description: 'Sunlight filtering through tall forest trees',
    colors: ['#2E7D32', '#66BB6A', '#C8E6C9'],
    duration: 24,
  },
  {
    name: 'Mountain Lake',
    emoji: '🏔️',
    description: 'Crystal clear lake reflecting mountain peaks',
    colors: ['#1565C0', '#42A5F5', '#E3F2FD'],
    duration: 24,
  },
  {
    name: 'Sunset Sky',
    emoji: '🌅',
    description: 'Warm colors painting the evening horizon',
    colors: ['#E65100', '#FF9800', '#FFF3E0'],
    duration: 24,
  },
  {
    name: 'Garden Bloom',
    emoji: '🌸',
    description: 'Cherry blossoms dancing in spring breeze',
    colors: ['#AD1457', '#EC407A', '#FCE4EC'],
    duration: 24,
  },
];

const config: ChallengeConfig = {
  name: 'Calm Visual',
  icon: '🎨',
  description: 'Enter a state of visual meditation by focusing on calming imagery. Let peaceful scenes wash over your mind.',
  duration: 120,
  xpReward: 14,
  difficulty: 'easy',
  instructions: [
    'Focus on the visual scene presented',
    'Let your mind absorb the calming colors',
    'Breathe naturally and stay present',
    'Immerse yourself in the peaceful imagery',
  ],
  benefits: [
    'Reduces visual overstimulation',
    'Calms the nervous system',
    'Enhances focus through imagery',
    'Promotes mental relaxation',
  ],
  colors: {
    background: '#0a0f1a',
    primary: '#00BCD4',
    secondary: '#4DD0E1',
  },
};

export function CalmVisualChallenge({ duration, onComplete, onBack, level = 1 }: CalmVisualChallengeProps) {
  const themeStyles = useThemeStyles();

  // State
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneTimeLeft, setSceneTimeLeft] = useState(VISUAL_SCENES[0].duration);

  // Tracking refs
  const completedScenes = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const currentScene = VISUAL_SCENES[currentSceneIndex];

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

  // Scene timer
  useEffect(() => {
    if (!isActive) return;

    const sceneTimer = setInterval(() => {
      setSceneTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next scene
          const nextIndex = (currentSceneIndex + 1) % VISUAL_SCENES.length;
          setCurrentSceneIndex(nextIndex);
          completedScenes.current += 1;
          
          // Gentle haptic for scene change
          haptics.impactLight();
          sound.transition();
          
          return VISUAL_SCENES[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(sceneTimer);
  }, [isActive, currentSceneIndex]);

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

  // Scene transition animation
  useEffect(() => {
    if (!isActive) return;

    // Smooth scene transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(colorAnim, {
          toValue: currentSceneIndex,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Gentle pulsing for the visual element
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Soft glow effect
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [currentSceneIndex, isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const expectedScenes = Math.floor(duration / 24); // Average scene duration
    const score = Math.min(100, (completedScenes.current / expectedScenes) * 120);

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
    outputRange: [0.2, 0.6],
  });

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={currentScene.colors as [string, string, string]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Scenes</Text>
            <Text style={[styles.statValue, { color: '#00BCD4' }]}>
              {completedScenes.current}
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
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                backgroundColor: currentScene.colors[1],
                opacity: glowOpacity,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />

          {/* Visual scene */}
          <Animated.View
            style={[
              styles.visualCircle,
              {
                backgroundColor: currentScene.colors[1],
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.sceneEmoji}>{currentScene.emoji}</Text>
            <Text style={styles.sceneName}>{currentScene.name}</Text>
          </Animated.View>

          {/* Floating elements for atmosphere */}
          <Animated.View
            style={[
              styles.floatingElement,
              { top: '20%', left: '20%', opacity: fadeAnim },
            ]}
          >
            <Text style={styles.floatingText}>✨</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingElement,
              { top: '30%', right: '15%', opacity: fadeAnim },
            ]}
          >
            <Text style={styles.floatingText}>💫</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingElement,
              { bottom: '40%', left: '10%', opacity: fadeAnim },
            ]}
          >
            <Text style={styles.floatingText}>⭐</Text>
          </Animated.View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {currentScene.description}
          </Text>
          <Text style={styles.sceneTimer}>
            {sceneTimeLeft}s
          </Text>
          <Text style={styles.guidanceText}>
            Let the peaceful imagery fill your mind
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.realmText}>Realm 5 - Flow</Text>
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
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 4,
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  visualCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    gap: 12,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },
  sceneEmoji: {
    fontSize: 64,
  },
  sceneName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  floatingElement: {
    position: 'absolute',
  },
  floatingText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  sceneTimer: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guidanceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  realmText: {
    fontSize: 12,
    color: 'rgba(0, 188, 212, 0.9)',
    fontWeight: '600',
  },
});