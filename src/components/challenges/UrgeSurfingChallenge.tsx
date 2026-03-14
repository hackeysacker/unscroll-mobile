/**
 * URGE SURFING CHALLENGE
 * Observe and ride out urges without acting on them
 *
 * Used in Realm 6 (Discipline) - 300s urge observation exercise
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { HapticPatterns as haptics } from '@/lib/haptic-patterns';

interface UrgeSurfingChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

type UrgePhase = 'rising' | 'peak' | 'falling' | 'calm';

interface UrgeWave {
  id: number;
  intensity: number;
  phase: UrgePhase;
  description: string;
  emoji: string;
}

const URGE_DESCRIPTIONS = [
  { description: 'Check your phone', emoji: '📱' },
  { description: 'Get up and move around', emoji: '🚶' },
  { description: 'Think about something else', emoji: '💭' },
  { description: 'Skip this exercise', emoji: '⏭️' },
  { description: 'Look around the room', emoji: '👀' },
  { description: 'Touch your face', emoji: '🤚' },
  { description: 'Adjust your position', emoji: '🪑' },
  { description: 'Take a deep breath', emoji: '😮‍💨' },
];

const config: ChallengeConfig = {
  name: 'Urge Surfing',
  icon: '🏄',
  description: 'Learn to observe and ride out urges without acting on them. Watch urges rise and fall like waves.',
  duration: 300,
  xpReward: 22,
  difficulty: 'hard',
  instructions: [
    'Urges will arise like waves',
    'OBSERVE them without acting',
    'Notice the urge rising, peaking, and falling',
    'Stay present and let them pass naturally',
    'DO NOT give in to the urge',
  ],
  benefits: [
    'Builds impulse resistance',
    'Develops urge awareness',
    'Strengthens self-control',
    'Reduces reactive behavior',
  ],
  colors: {
    background: '#0a1a2a',
    primary: '#00BCD4',
    secondary: '#26C6DA',
  },
};

export function UrgeSurfingChallenge({ duration, onComplete, onBack, level = 1 }: UrgeSurfingChallengeProps) {
  const themeStyles = useThemeStyles();

  // State
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentUrge, setCurrentUrge] = useState<UrgeWave | null>(null);
  const [urgeTimer, setUrgeTimer] = useState(0);

  // Tracking refs
  const urgesResisted = useRef(0);
  const urgesFailed = useRef(0);
  const totalUrges = useRef(0);
  const currentUrgeStartTime = useRef(0);

  // Animations
  const waveAnim = useRef(new Animated.Value(0)).current;
  const intensityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Generate new urge wave
  const generateUrge = (): UrgeWave => {
    const urge = URGE_DESCRIPTIONS[Math.floor(Math.random() * URGE_DESCRIPTIONS.length)];
    return {
      id: Date.now(),
      intensity: 0,
      phase: 'rising',
      description: urge.description,
      emoji: urge.emoji,
    };
  };

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

  // Urge lifecycle timer
  useEffect(() => {
    if (!isActive) return;

    const urgeLifecycleTimer = setInterval(() => {
      if (!currentUrge) {
        // Generate new urge every 15-45 seconds
        if (Math.random() < 0.1) {
          const newUrge = generateUrge();
          setCurrentUrge(newUrge);
          setUrgeTimer(0);
          currentUrgeStartTime.current = Date.now();
          totalUrges.current += 1;
          
          haptics.impactLight();
          sound.notification();
        }
      } else {
        setUrgeTimer(prev => {
          const newTime = prev + 1;
          
          // Update urge phase and intensity based on time
          let newPhase: UrgePhase = currentUrge.phase;
          let newIntensity = currentUrge.intensity;
          
          if (newTime < 10) {
            // Rising phase (0-10s)
            newPhase = 'rising';
            newIntensity = (newTime / 10) * 100;
          } else if (newTime < 20) {
            // Peak phase (10-20s) 
            newPhase = 'peak';
            newIntensity = 100;
          } else if (newTime < 35) {
            // Falling phase (20-35s)
            newPhase = 'falling';
            newIntensity = 100 - ((newTime - 20) / 15) * 100;
          } else {
            // Calm phase (35s+) - urge naturally subsides
            newPhase = 'calm';
            newIntensity = 0;
            
            // Urge successfully resisted
            urgesResisted.current += 1;
            setCurrentUrge(null);
            setUrgeTimer(0);
            
            haptics.impactMedium();
            sound.success();
            
            return 0;
          }
          
          setCurrentUrge(prev => prev ? { ...prev, phase: newPhase, intensity: newIntensity } : null);
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(urgeLifecycleTimer);
  }, [isActive, currentUrge]);

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

  // Wave animation based on urge intensity
  useEffect(() => {
    if (!currentUrge) {
      Animated.timing(waveAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start();
      return;
    }

    const targetIntensity = currentUrge.intensity / 100;
    
    Animated.parallel([
      Animated.timing(waveAnim, {
        toValue: targetIntensity,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(intensityAnim, {
        toValue: targetIntensity,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: targetIntensity,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentUrge?.intensity]);

  // Handle giving in to urge (failure)
  const handleGiveIn = () => {
    if (currentUrge) {
      urgesFailed.current += 1;
      setCurrentUrge(null);
      setUrgeTimer(0);
      
      haptics.notificationError();
      sound.error();
    }
  };

  const handleComplete = () => {
    setIsActive(false);

    const resistanceRate = totalUrges.current > 0 
      ? (urgesResisted.current / totalUrges.current) * 100 
      : 100;
    
    const failurePenalty = urgesFailed.current * 15;
    const score = Math.max(0, Math.min(100, resistanceRate - failurePenalty));

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const getPhaseColor = () => {
    if (!currentUrge) return '#00BCD4';
    
    switch (currentUrge.phase) {
      case 'rising': return '#FF9800';
      case 'peak': return '#f44336';
      case 'falling': return '#9C27B0';
      case 'calm': return '#4CAF50';
      default: return '#00BCD4';
    }
  };

  const getPhaseText = () => {
    if (!currentUrge) return 'Stay calm and centered';
    
    switch (currentUrge.phase) {
      case 'rising': return 'Urge is rising...';
      case 'peak': return 'Urge at peak intensity!';
      case 'falling': return 'Urge is subsiding...';
      case 'calm': return 'Returning to calm';
      default: return 'Observe the urge';
    }
  };

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1.2],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.9],
  });

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#0a1a2a', '#0a2a3a', '#0a1a2a']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Resisted</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {urgesResisted.current}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Failed</Text>
            <Text style={[styles.statValue, { color: '#f44336' }]}>
              {urgesFailed.current}
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

        {/* Wave/Urge Visualization */}
        <View style={styles.waveArea}>
          {/* Background glow */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                backgroundColor: getPhaseColor(),
                opacity: glowOpacity,
                transform: [{ scale: waveScale }],
              },
            ]}
          />

          {/* Wave circle */}
          <Animated.View
            style={[
              styles.waveCircle,
              {
                backgroundColor: getPhaseColor(),
                transform: [{ scale: waveScale }],
              },
            ]}
          >
            {currentUrge && (
              <>
                <Text style={styles.urgeEmoji}>{currentUrge.emoji}</Text>
                <Text style={styles.urgeIntensity}>
                  {Math.round(currentUrge.intensity)}%
                </Text>
              </>
            )}
          </Animated.View>
        </View>

        {/* Urge Description */}
        <View style={styles.urgeInfo}>
          <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
            {getPhaseText()}
          </Text>
          {currentUrge && (
            <Text style={styles.urgeDescription}>
              Urge to: {currentUrge.description}
            </Text>
          )}
          <Text style={styles.instructionText}>
            {currentUrge ? 'Observe without acting. Let it pass.' : 'Stay present and aware.'}
          </Text>
        </View>

        {/* Give In Button (temptation) */}
        {currentUrge && (
          <View style={styles.temptationArea}>
            <Pressable
              onPress={handleGiveIn}
              style={[
                styles.giveInButton,
                { backgroundColor: getPhaseColor() + '30' },
              ]}
            >
              <Text style={styles.giveInText}>Give In</Text>
              <Text style={styles.giveInSubtext}>Don't resist it...</Text>
            </Pressable>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.realmText}>Realm 6 - Discipline</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
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
    backgroundColor: '#00BCD4',
    borderRadius: 4,
  },

  // Wave Area
  waveArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  waveCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    gap: 8,
  },
  urgeEmoji: {
    fontSize: 48,
  },
  urgeIntensity: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Urge Info
  urgeInfo: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  urgeDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Temptation Button
  temptationArea: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  giveInButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 67, 54, 0.5)',
  },
  giveInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  giveInSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
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
    color: 'rgba(0, 188, 212, 0.7)',
    fontWeight: '600',
  },
});