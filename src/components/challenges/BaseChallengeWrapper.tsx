/**
 * BaseChallengeWrapper Component
 *
 * Shared wrapper for all focus challenges
 * Provides consistent intro screen with instructions and benefits
 * Same format as mindfulness exercises
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export interface ChallengeConfig {
  name: string;
  icon: string;
  description: string;
  duration: number;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  benefits: string[];
  colors: {
    background: string;
    primary: string;
    secondary: string;
  };
}

interface BaseChallengeWrapperProps {
  // Config object pattern (preferred)
  config?: ChallengeConfig;
  // Individual props pattern (legacy support)
  title?: string;
  description?: string;
  duration?: number;
  stats?: { label: string; value: number }[];
  onComplete?: (score?: number, timeSpent?: number) => void;
  // Common props
  onStart: () => void;
  onBack: () => void;
  children: React.ReactNode;
  isActive: boolean;
}

// Helper to get config from either pattern
function getEffectiveConfig(props: BaseChallengeWrapperProps): ChallengeConfig {
  if (props.config) {
    return props.config;
  }
  // Fallback for legacy individual props pattern
  return {
    name: props.title || 'Challenge',
    icon: '🎯',
    description: props.description || '',
    duration: props.duration || 60,
    xpReward: 50,
    difficulty: 'medium',
    instructions: ['Complete the challenge to earn XP'],
    benefits: ['Improve your focus skills'],
    colors: {
      background: '#1a1a2e',
      primary: '#6366f1',
      secondary: '#8b5cf6',
    },
  };
}

export function BaseChallengeWrapper(props: BaseChallengeWrapperProps) {
  const config = getEffectiveConfig(props);
  const { onStart, onBack, children, isActive } = props;
  const [showIntro, setShowIntro] = useState(true); // Show nice intro screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Fade in animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowIntro(false);
    onStart();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show intro screen
  if (showIntro && !isActive) {
    return (
      <View style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={[config.colors.background, '#000000']}
          style={StyleSheet.absoluteFill}
        />

        {/* Animated content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onBack();
                }}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Intro Phase - Scrollable to fit on one screen */}
            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.introContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.exerciseIcon}>{config.icon}</Text>
              <Text style={styles.exerciseName}>{config.name}</Text>
              <Text style={styles.exerciseDescription}>{config.description}</Text>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>⏱️ {Math.ceil(config.duration / 60)} min</Text>
                  </View>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>✨ +{config.xpReward} XP</Text>
                  </View>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>
                      {config.difficulty === 'easy' && '🟢'}
                      {config.difficulty === 'medium' && '🟡'}
                      {config.difficulty === 'hard' && '🔴'}
                      {' '}{config.difficulty}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>How it works:</Text>
                {config.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionRow}>
                    <Text style={styles.instructionNumber}>{index + 1}</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Benefits:</Text>
                <View style={styles.benefitsList}>
                  {config.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <Text style={styles.benefitDot}>•</Text>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <LinearGradient
                  colors={[config.colors.primary, config.colors.secondary]}
                  style={styles.startButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.startButtonText}>Begin Challenge</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    );
  }

  // Show challenge content
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },

  scrollContainer: {
    flex: 1,
  },
  // Intro Phase
  introContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  exerciseIcon: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 12,
  },

  // Info badges
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  infoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  infoBadgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Instructions
  instructionsContainer: {
    marginBottom: 18,
  },
  instructionsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  instructionNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 26,
    marginRight: 10,
    flexShrink: 0,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },

  // Benefits
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 6,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitDot: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 10,
    marginTop: 2,
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  // Start button
  startButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  startButtonGradient: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
