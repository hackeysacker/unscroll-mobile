/**
 * FAKE NOTIFICATIONS CHALLENGE
 * Ignore all fake notifications - don't tap them!
 *
 * Difficulty Scaling:
 * - More frequent notifications at higher levels
 * - More tempting notification types at higher levels
 * - Faster appearance rate at higher levels
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface FakeNotificationsChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

interface Notification {
  id: number;
  message: string;
  emoji: string;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
}

export function FakeNotificationsChallenge({ duration, onComplete, onBack, level = 1 }: FakeNotificationsChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('fake_notifications');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Tracking refs
  const clickedNotificationsRef = useRef(0);
  const totalNotificationsRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;

  const notificationTypes = [
    { emoji: '🔔', message: 'New message!' },
    { emoji: '💬', message: 'Someone commented' },
    { emoji: '📧', message: 'You have mail' },
    { emoji: '❤️', message: 'New likes!' },
    { emoji: '👋', message: 'Friend request!' },
    { emoji: '🎁', message: 'Special offer!' },
    { emoji: '⭐', message: 'New achievement!' },
    { emoji: '📸', message: 'Photo tagged!' },
  ];

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

  // Generate notifications
  useEffect(() => {
    if (!isActive) return;

    const generateNotification = () => {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const newNotification: Notification = {
        id: Date.now() + Math.random(),
        message: type.message,
        emoji: type.emoji,
        scaleAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(0),
      };

      // Animate appearance
      Animated.parallel([
        Animated.spring(newNotification.scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(newNotification.opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setNotifications(prev => [...prev.slice(-4), newNotification]);
      totalNotificationsRef.current += 1;
      haptics.impactLight();
      sound.targetAppear();

      // Auto-remove after 3 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(newNotification.scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(newNotification.opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        });
      }, 3000);
    };

    const spawnInterval = Math.max(1200, 2000 - (level * 50)); // Faster at higher levels
    const interval = setInterval(generateNotification, spawnInterval);
    return () => clearInterval(interval);
  }, [isActive, level]);

  const handleNotificationClick = (notification: Notification) => {
    clickedNotificationsRef.current += 1;
    haptics.notificationError();
    sound.targetMiss();

    // Animate removal
    Animated.parallel([
      Animated.timing(notification.scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(notification.opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    });
  };

  const handleComplete = () => {
    setIsActive(false);

    const ignoredNotifications = totalNotificationsRef.current - clickedNotificationsRef.current;
    const score = totalNotificationsRef.current > 0
      ? (ignoredNotifications / totalNotificationsRef.current) * 100
      : 100;

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const ignoredCount = totalNotificationsRef.current - clickedNotificationsRef.current;
  const ignoredPercentage = totalNotificationsRef.current > 0
    ? Math.round((ignoredCount / totalNotificationsRef.current) * 100)
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
          <Text style={styles.statLabel}>Ignored</Text>
          <Text style={[styles.statValue, { color: ignoredPercentage >= 70 ? '#10B981' : '#F59E0B' }]}>
            {ignoredPercentage}%
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

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>✓</Text>
          <Text style={styles.ignoredText}>{ignoredCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>✗</Text>
          <Text style={styles.clickedText}>{clickedNotificationsRef.current}</Text>
        </View>
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        <View style={styles.centerMessage}>
          <Text style={styles.centerEmoji}>🎯</Text>
          <Text style={styles.centerText}>Stay focused!</Text>
        </View>

        {notifications.map((notification) => (
          <Animated.View
            key={notification.id}
            style={[
              styles.notificationWrapper,
              {
                transform: [{ scale: notification.scaleAnim }],
                opacity: notification.opacityAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.notification}
              onPress={() => handleNotificationClick(notification)}
              activeOpacity={0.7}
            >
              <Text style={styles.notificationEmoji}>{notification.emoji}</Text>
              <Text style={styles.notificationText}>{notification.message}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Don't tap the notifications!
        </Text>
        <Text style={styles.subText}>
          Resist the urge to click
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

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statEmoji: {
    fontSize: 24,
  },
  ignoredText: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  clickedText: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: 'bold',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMessage: {
    alignItems: 'center',
    gap: 8,
  },
  centerEmoji: {
    fontSize: 48,
  },
  centerText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  notificationWrapper: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 20,
  },
  notification: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 76,
    borderWidth: 2,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  notificationEmoji: {
    fontSize: 32,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
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
