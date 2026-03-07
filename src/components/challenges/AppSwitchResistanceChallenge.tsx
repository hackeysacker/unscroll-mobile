/**
 * APP SWITCH RESISTANCE CHALLENGE
 *
 * Resist the urge to tap fake "switch app" prompts
 * Tests focus and resistance to multitasking temptation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { hapticPatterns as haptics } from '@/lib/haptic-patterns';

const { width, height } = Dimensions.get('window');

interface AppSwitchResistanceChallengeProps {
  duration: number;
  onComplete: (score: number, timeSpent: number) => void;
  onBack?: () => void;
  level?: number;
}

interface FakePrompt {
  id: number;
  type: 'app' | 'message' | 'action';
  text: string;
  subtext?: string;
  icon: string;
  position: { top: number; left?: number; right?: number };
}

const PROMPT_TEMPLATES = [
  { type: 'app' as const, text: 'Check your messages', subtext: '3 new messages', icon: '💬' },
  { type: 'app' as const, text: 'Open Instagram', subtext: 'New posts from friends', icon: '📸' },
  { type: 'app' as const, text: 'Back to home screen', subtext: 'Tap to exit', icon: '🏠' },
  { type: 'message' as const, text: 'Reply to Sarah', subtext: 'She\'s waiting...', icon: '📱' },
  { type: 'action' as const, text: 'Switch apps', subtext: 'Recent apps', icon: '⚡' },
  { type: 'app' as const, text: 'Open browser', subtext: 'Check your tabs', icon: '🌐' },
  { type: 'message' as const, text: 'New email arrived', subtext: 'Tap to read', icon: '📧' },
  { type: 'action' as const, text: 'Take a break', subtext: 'You\'ve been here a while', icon: '☕' },
  { type: 'app' as const, text: 'YouTube notification', subtext: 'New video ready', icon: '▶️' },
  { type: 'action' as const, text: 'Minimize app', subtext: 'Go back to tasks', icon: '📱' },
];

export function AppSwitchResistanceChallenge({
  duration,
  onComplete,
  onBack,
  level = 1,
}: AppSwitchResistanceChallengeProps) {
  const themeStyles = useThemeStyles();
  const [prompts, setPrompts] = useState<FakePrompt[]>([]);
  const [tappedCount, setTappedCount] = useState(0);
  const [resistedCount, setResistedCount] = useState(0);
  const promptIdRef = useRef(0);

  // Prompt spawn rate increases with level
  const spawnIntervalMs = Math.max(1200, 3500 - level * 250);
  const maxPrompts = Math.min(4, 1 + Math.floor(level / 2));

  // Spawn prompts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (prompts.length < maxPrompts) {
        const template = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];

        // Random position
        const positions = [
          { top: 100, left: 20 },
          { top: 200, right: 20 },
          { top: height / 2 - 50, left: width / 2 - 80 },
          { top: height - 200, left: 20 },
          { top: height - 200, right: 20 },
        ];

        const position = positions[Math.floor(Math.random() * positions.length)];

        const newPrompt: FakePrompt = {
          id: promptIdRef.current++,
          type: template.type,
          text: template.text,
          subtext: template.subtext,
          icon: template.icon,
          position,
        };

        setPrompts(prev => [...prev, newPrompt]);
        sound.error();
        haptics.notificationWarning();

        // Auto-remove prompt after 5 seconds
        setTimeout(() => {
          setPrompts(prev => {
            const filtered = prev.filter(p => p.id !== newPrompt.id);
            if (prev.length > filtered.length) {
              // Prompt expired without being tapped - that's good!
              setResistedCount(c => c + 1);
              haptics.impactLight();
            }
            return filtered;
          });
        }, 5000);
      }
    }, spawnIntervalMs);

    return () => clearInterval(interval);
  }, [prompts.length, spawnIntervalMs, maxPrompts]);

  const handlePromptTap = (promptId: number) => {
    // User tapped! That's bad!
    setTappedCount(prev => prev + 1);
    haptics.notificationError();
    sound.warning();

    // Remove prompt
    setPrompts(prev => prev.filter(p => p.id !== promptId));

    // Heavy vibration to indicate failure
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleComplete = (timeSpent: number) => {
    const totalPrompts = tappedCount + resistedCount;
    const resistanceRate = totalPrompts > 0 ? (resistedCount / totalPrompts) * 100 : 100;

    // Score: resistance rate with penalty for taps
    const tapPenalty = tappedCount * 10;
    const score = Math.min(100, Math.max(0, Math.round(resistanceRate - tapPenalty)));

    onComplete(score, timeSpent);
  };

  const resistancePercentage = tappedCount + resistedCount > 0
    ? Math.round((resistedCount / (tappedCount + resistedCount)) * 100)
    : 100;

  return (
    <BaseChallengeWrapper
      title="App Switch Resistance"
      description="Resist switching apps or tapping prompts"
      duration={duration}
      onComplete={handleComplete}
      onBack={onBack}
      stats={[
        { label: 'Resisted', value: resistedCount },
        { label: 'Tapped', value: tappedCount },
      ]}
    >
      <View style={styles.container}>
        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.mainInstruction}>⚠️ STAY FOCUSED ⚠️</Text>
          <Text style={[styles.subInstruction, { color: themeStyles.colors.mutedForeground }]}>
            Ignore all prompts to switch apps or take actions
          </Text>
          <View style={styles.resistanceBar}>
            <View
              style={[
                styles.resistanceFill,
                {
                  width: `${resistancePercentage}%`,
                  backgroundColor: resistancePercentage >= 80 ? '#10B981' : resistancePercentage >= 50 ? '#F59E0B' : '#EF4444',
                },
              ]}
            />
          </View>
          <Text style={[styles.resistanceText, { color: themeStyles.colors.mutedForeground }]}>
            Resistance: {resistancePercentage}%
          </Text>
        </View>

        {/* Prompt Area */}
        <View style={styles.promptArea}>
          {prompts.map((prompt) => (
            <FakePromptCard
              key={prompt.id}
              prompt={prompt}
              onTap={() => handlePromptTap(prompt.id)}
            />
          ))}

          {/* Center Message */}
          <View style={styles.centerMessage}>
            <Text style={[styles.centerText, { color: themeStyles.colors.foreground }]}>
              {prompts.length === 0 ? (
                resistedCount > 0 ? (
                  <>🎯 Perfect focus!</>
                ) : (
                  <>👁️ Stay alert...</>
                )
              ) : (
                <>🚫 Don't tap!</>
              )}
            </Text>
          </View>
        </View>

        {/* Stats */}
        {(tappedCount > 0 || resistedCount > 0) && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{resistedCount}</Text>
              <Text style={[styles.statLabel, { color: themeStyles.colors.mutedForeground }]}>
                Ignored ✓
              </Text>
            </View>
            <View style={[styles.statCard, styles.statCardDanger]}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{tappedCount}</Text>
              <Text style={[styles.statLabel, { color: themeStyles.colors.mutedForeground }]}>
                Tapped ✗
              </Text>
            </View>
          </View>
        )}
      </View>
    </BaseChallengeWrapper>
  );
}

// Fake Prompt Card Component
function FakePromptCard({
  prompt,
  onTap,
}: {
  prompt: FakePrompt;
  onTap: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop-in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Shake animation to grab attention
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();
  }, []);

  const getColors = () => {
    switch (prompt.type) {
      case 'app':
        return ['#3B82F6', '#2563EB'];
      case 'message':
        return ['#EC4899', '#DB2777'];
      case 'action':
        return ['#F59E0B', '#D97706'];
    }
  };

  return (
    <Animated.View
      style={[
        styles.promptWrapper,
        prompt.position,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={onTap} activeOpacity={0.9}>
        <LinearGradient
          colors={getColors()}
          style={styles.prompt}
        >
          <Text style={styles.promptIcon}>{prompt.icon}</Text>
          <View style={styles.promptContent}>
            <Text style={styles.promptText}>{prompt.text}</Text>
            {prompt.subtext && (
              <Text style={styles.promptSubtext}>{prompt.subtext}</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionsBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  mainInstruction: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subInstruction: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  resistanceBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  resistanceFill: {
    height: '100%',
    borderRadius: 6,
  },
  resistanceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  promptArea: {
    flex: 1,
    position: 'relative',
  },
  centerMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -20 }],
    zIndex: 1,
  },
  centerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  promptWrapper: {
    position: 'absolute',
    zIndex: 100,
  },
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
    minWidth: 200,
    maxWidth: 280,
  },
  promptIcon: {
    fontSize: 32,
  },
  promptContent: {
    flex: 1,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promptSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statCardDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
