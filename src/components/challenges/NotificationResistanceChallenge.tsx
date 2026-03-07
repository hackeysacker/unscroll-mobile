/**
 * NOTIFICATION RESISTANCE CHALLENGE
 *
 * Resist the urge to tap on distracting fake notifications
 * Tests impulse control and focus
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

const { width } = Dimensions.get('window');

interface NotificationResistanceChallengeProps {
  duration: number;
  onComplete: (score: number, timeSpent: number) => void;
  onBack?: () => void;
  level?: number;
}

interface FakeNotification {
  id: number;
  title: string;
  body: string;
  icon: string;
  color: string[];
}

const NOTIFICATION_TEMPLATES = [
  { title: 'New Message', body: 'Sarah: Hey, check this out! 🔥', icon: '💬', color: ['#3B82F6', '#2563EB'] },
  { title: 'Breaking News', body: 'You won\'t believe what happened...', icon: '📰', color: ['#EF4444', '#DC2626'] },
  { title: 'Instagram', body: 'johndoe liked your photo', icon: '📸', color: ['#EC4899', '#DB2777'] },
  { title: 'YouTube', body: 'New video from your subscription', icon: '▶️', color: ['#EF4444', '#DC2626'] },
  { title: 'Twitter', body: 'Trending now: #BreakingNews', icon: '🐦', color: ['#3B82F6', '#2563EB'] },
  { title: 'WhatsApp', body: 'Mom: Are you coming for dinner?', icon: '💚', color: ['#10B981', '#059669'] },
  { title: 'TikTok', body: 'Your video is going viral! 🚀', icon: '🎵', color: ['#EC4899', '#DB2777'] },
  { title: 'Email', body: 'You have 5 unread emails', icon: '📧', color: ['#F59E0B', '#D97706'] },
  { title: 'Snapchat', body: 'Alex sent you a snap', icon: '👻', color: ['#FBBF24', '#F59E0B'] },
  { title: 'Reddit', body: 'Your post got 500 upvotes!', icon: '🔺', color: ['#F97316', '#EA580C'] },
];

export function NotificationResistanceChallenge({
  duration,
  onComplete,
  onBack,
  level = 1,
}: NotificationResistanceChallengeProps) {
  const themeStyles = useThemeStyles();
  const [notifications, setNotifications] = useState<FakeNotification[]>([]);
  const [tappedCount, setTappedCount] = useState(0);
  const [resistedCount, setResistedCount] = useState(0);
  const notificationIdRef = useRef(0);

  // Notification spawn rate increases with level
  const spawnIntervalMs = Math.max(1000, 3000 - level * 200);
  const maxNotifications = Math.min(5, 2 + Math.floor(level / 3));

  // Spawn notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (notifications.length < maxNotifications) {
        const template = NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)];
        const newNotification: FakeNotification = {
          id: notificationIdRef.current++,
          title: template.title,
          body: template.body,
          icon: template.icon,
          color: template.color,
        };

        setNotifications(prev => [...prev, newNotification]);
        sound.error(); // Notification sound
        haptics.notificationWarning();

        // Auto-remove notification after 4 seconds
        setTimeout(() => {
          setNotifications(prev => {
            const filtered = prev.filter(n => n.id !== newNotification.id);
            if (prev.length > filtered.length) {
              // Notification expired without being tapped - that's good!
              setResistedCount(c => c + 1);
            }
            return filtered;
          });
        }, 4000);
      }
    }, spawnIntervalMs);

    return () => clearInterval(interval);
  }, [notifications.length, spawnIntervalMs, maxNotifications]);

  const handleNotificationTap = (notificationId: number) => {
    // User tapped! That's bad!
    setTappedCount(prev => prev + 1);
    haptics.notificationError();
    sound.warning();

    // Remove notification
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    // Vibrate to indicate failure
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleComplete = (timeSpent: number) => {
    const totalNotifications = tappedCount + resistedCount;
    const resistanceRate = totalNotifications > 0 ? (resistedCount / totalNotifications) * 100 : 100;

    // Score: 100% resistance rate, with penalty for taps
    const tapPenalty = tappedCount * 5;
    const score = Math.min(100, Math.max(0, Math.round(resistanceRate - tapPenalty)));

    onComplete(score, timeSpent);
  };

  return (
    <BaseChallengeWrapper
      title="Notification Resistance"
      description="Resist tapping on fake notifications"
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
          <Text style={styles.mainInstruction}>⚠️ DO NOT TAP ⚠️</Text>
          <Text style={[styles.subInstruction, { color: themeStyles.colors.mutedForeground }]}>
            Ignore all notifications that appear
          </Text>
          {tappedCount > 0 && (
            <Text style={styles.failureText}>
              You tapped {tappedCount} time{tappedCount > 1 ? 's' : ''}! 😬
            </Text>
          )}
        </View>

        {/* Notification Area */}
        <View style={styles.notificationArea}>
          {notifications.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              index={index}
              onTap={() => handleNotificationTap(notification.id)}
            />
          ))}

          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: themeStyles.colors.mutedForeground }]}>
                {resistedCount > 0
                  ? `✓ Great job! ${resistedCount} resisted`
                  : 'Waiting for notifications...'}
              </Text>
            </View>
          )}
        </View>

        {/* Resistance Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{resistedCount}</Text>
            <Text style={[styles.statLabel, { color: themeStyles.colors.mutedForeground }]}>Resisted ✓</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDanger]}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{tappedCount}</Text>
            <Text style={[styles.statLabel, { color: themeStyles.colors.mutedForeground }]}>Tapped ✗</Text>
          </View>
        </View>
      </View>
    </BaseChallengeWrapper>
  );
}

// Notification Card Component
function NotificationCard({
  notification,
  index,
  onTap,
}: {
  notification: FakeNotification;
  index: number;
  onTap: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(-400)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.notificationWrapper,
        {
          transform: [
            { translateX: slideAnim },
            { scale: pulseAnim },
          ],
          top: 20 + index * 100,
        },
      ]}
    >
      <TouchableOpacity onPress={onTap} activeOpacity={0.9}>
        <LinearGradient
          colors={notification.color}
          style={styles.notification}
        >
          <View style={styles.notificationIcon}>
            <Text style={styles.iconText}>{notification.icon}</Text>
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationBody}>{notification.body}</Text>
          </View>
          <View style={styles.notificationTime}>
            <Text style={styles.timeText}>now</Text>
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
  },
  failureText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    fontWeight: '700',
  },
  notificationArea: {
    flex: 1,
    position: 'relative',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  notificationTime: {
    paddingLeft: 8,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
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
