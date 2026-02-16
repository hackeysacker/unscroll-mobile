import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAttentionAvatar } from '@/contexts/AttentionAvatarContext';
import { AttentionAvatar } from '@/components/AttentionAvatar';
import { XP_PER_LEVEL } from '@/lib/game-mechanics';
import { useMemo, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardProps {
  onNavigate: (route: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { progress, todaySession, initializeProgress, heartState } = useGame();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { avatarState } = useAttentionAvatar();
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Memoize calculations
  const dashboardData = useMemo(() => {
    if (!progress || !user) return null;

    const xpProgress = (progress.xp / XP_PER_LEVEL) * 100;
    const challengesCompleted = todaySession?.challenges.length ?? 0;
    const sessionComplete = challengesCompleted >= 3;

    return { xpProgress, challengesCompleted, sessionComplete };
  }, [progress, user, todaySession]);

  // Initialize progress
  useEffect(() => {
    if (user && !progress) {
      initializeProgress(1);
    }
  }, [user, progress, initializeProgress]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for main button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Navigation handler
  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate(route);
  };

  // Loading state
  if (!progress || !user || !dashboardData) {
    return (
      <View style={[styles.container, { backgroundColor: '#030712' }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { xpProgress, challengesCompleted, sessionComplete } = dashboardData;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#030712', '#0a0a1a', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Top Bar - Hearts & Streak */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.statBadge}
            onPress={() => handleNavigate('avatar')}
          >
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statValue}>{heartState?.currentHearts ?? 5}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBadge}
            onPress={() => handleNavigate('insights')}
          >
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{progress.streak}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => handleNavigate('settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Center Section - Avatar & Greeting */}
        <View style={styles.centerSection}>
          <TouchableOpacity
            style={styles.avatarArea}
            onPress={() => handleNavigate('avatar')}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.avatarGlow, { opacity: glowAnim }]} />
            <AttentionAvatar size="large" showParticles={true} />
          </TouchableOpacity>

          <Text style={styles.greeting}>
            {sessionComplete ? 'Great work today!' : 'Ready to focus?'}
          </Text>

          <Text style={styles.levelText}>
            Level {progress.level}
          </Text>

          {/* XP Progress Bar */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpFill, { width: `${xpProgress}%` }]}
              />
            </View>
            <Text style={styles.xpText}>{progress.xp}/{XP_PER_LEVEL} XP</Text>
          </View>
        </View>

        {/* Main Action Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => handleNavigate('progress-tree')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainButtonGradient}
            >
              <Text style={styles.mainButtonIcon}>🚀</Text>
              <Text style={styles.mainButtonText}>
                {sessionComplete ? 'Keep Training' : 'Start Training'}
              </Text>
              <Text style={styles.mainButtonSub}>
                {challengesCompleted}/3 daily exercises
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Daily Progress Dots */}
        <View style={styles.progressDots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < challengesCompleted && styles.progressDotComplete,
              ]}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleNavigate('insights')}
          >
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionLabel}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => handleNavigate('skill-tree')}
          >
            <Text style={styles.quickActionIcon}>🌟</Text>
            <Text style={styles.quickActionLabel}>Skills</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, styles.premiumAction]}
            onPress={() => handleNavigate('premium')}
          >
            <Text style={styles.quickActionIcon}>👑</Text>
            <Text style={[styles.quickActionLabel, styles.premiumLabel]}>Pro</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '700',
  },
  settingsButton: {
    marginLeft: 'auto',
    padding: 10,
  },
  settingsIcon: {
    fontSize: 22,
    opacity: 0.7,
  },

  // Center Section
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  avatarArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#8B5CF6',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
    textAlign: 'center',
  },
  levelText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },

  // XP Bar
  xpContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  xpBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },

  // Main Button
  mainButton: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  mainButtonGradient: {
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  mainButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mainButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mainButtonSub: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Progress Dots
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressDotComplete: {
    backgroundColor: '#10B981',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  premiumAction: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  premiumLabel: {
    color: '#FBBF24',
  },
});
