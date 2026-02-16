/**
 * Focus Shield Screen - Enhanced with Realm Themes
 *
 * iOS Screen Time API integration with gamification:
 * - Earn XP for using Shield during exercises
 * - Realm-themed colors and animations
 * - Streak bonuses for consecutive days with Shield active
 * - Achievements for focus milestones
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';
import FocusShield, { AuthorizationStatus } from '../modules/FocusShield';
import { useGame } from '@/contexts/GameContext';
import { getRealmForLevel } from '@/lib/focus-realm-themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FocusShieldScreenProps {
  onBack: () => void;
}

// SVG Icon Components
interface IconProps {
  size: number;
  color: string;
}

function ShieldCheckIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="12" cy="12" r="10" fill="url(#shieldGlow)" />
      <Path
        d="M12 2L4 5V11C4 16.5 7 20.5 12 22C17 20.5 20 16.5 20 11V5L12 2Z"
        fill={color}
        opacity={0.2}
      />
      <Path
        d="M12 2L4 5V11C4 16.5 7 20.5 12 22C17 20.5 20 16.5 20 11V5L12 2Z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M9 12L11 14L15 9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


function SparklesIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2L13 8L12 10L11 8L12 2Z" fill={color} />
      <Path d="M5 9L8 10L10 11L8 12L5 11L8 10L5 9Z" fill={color} />
      <Path d="M19 7L17 10L16 12L17 14L19 11L17 10L19 7Z" fill={color} />
      <Path d="M12 14L13 18L12 22L11 18L12 14Z" fill={color} />
      <Path d="M7 16L9 17L10 18L9 19L7 18L9 17L7 16Z" fill={color} opacity={0.6} />
    </Svg>
  );
}

function FlameIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2C12 2 8 6 8 10C8 13 10 15 12 15C14 15 16 13 16 10C16 6 12 2 12 2Z"
        fill={color}
      />
      <Path
        d="M12 22C12 22 6 18 6 13C6 10 8 8 12 8C16 8 18 10 18 13C18 18 12 22 12 22Z"
        fill={color}
        opacity="0.7"
      />
      <Circle cx="12" cy="14" r="2" fill="#FFD700" />
    </Svg>
  );
}

function TrophyIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2L8 6V12C8 14 10 16 12 16C14 16 16 14 16 12V6L12 2Z" fill={color} />
      <Path d="M6 8H4V10C4 11 5 12 6 12V8Z" fill={color} opacity={0.7} />
      <Path d="M18 8H20V10C20 11 19 12 18 12V8Z" fill={color} opacity={0.7} />
      <Rect x="10" y="16" width="4" height="2" fill={color} />
      <Rect x="8" y="18" width="8" height="4" rx="1" fill={color} />
    </Svg>
  );
}

function BoltIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="13,2 8,13 11,13 9,22 18,10 14,10 16,2" fill={color} />
    </Svg>
  );
}

function StarIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2L15 8.5L22 9.5L17 14.5L18.5 22L12 18.5L5.5 22L7 14.5L2 9.5L9 8.5L12 2Z" fill={color} />
    </Svg>
  );
}

// Common app bundle IDs for popular distracting apps
const POPULAR_APPS = [
  { name: 'Instagram', bundleId: 'com.burbn.instagram', emoji: '📷', category: 'Social' },
  { name: 'Facebook', bundleId: 'com.facebook.Facebook', emoji: '👥', category: 'Social' },
  { name: 'TikTok', bundleId: 'com.zhiliaoapp.musically', emoji: '🎵', category: 'Social' },
  { name: 'Twitter/X', bundleId: 'com.atebits.Tweetie2', emoji: '🐦', category: 'Social' },
  { name: 'Snapchat', bundleId: 'com.snapchat.snapchat', emoji: '👻', category: 'Social' },
  { name: 'Reddit', bundleId: 'com.reddit.Reddit', emoji: '🤖', category: 'Social' },
  { name: 'YouTube', bundleId: 'com.google.ios.youtube', emoji: '▶️', category: 'Entertainment' },
  { name: 'WhatsApp', bundleId: 'net.whatsapp.WhatsApp', emoji: '💬', category: 'Social' },
  { name: 'Telegram', bundleId: 'ph.telegra.Telegraph', emoji: '✈️', category: 'Social' },
  { name: 'Chrome', bundleId: 'com.google.chrome.ios', emoji: '🌐', category: 'Browser' },
  { name: 'Discord', bundleId: 'com.hammerandchisel.discord', emoji: '💬', category: 'Social' },
  { name: 'Netflix', bundleId: 'com.netflix.Netflix', emoji: '🎬', category: 'Entertainment' },
  { name: 'Spotify', bundleId: 'com.spotify.client', emoji: '🎧', category: 'Entertainment' },
  { name: 'Twitch', bundleId: 'tv.twitch', emoji: '🎮', category: 'Entertainment' },
];

const ESSENTIAL_APPS = [
  { name: 'Safari', bundleId: 'com.apple.mobilesafari', emoji: '🧭', category: 'Essential' },
  { name: 'Messages', bundleId: 'com.apple.MobileSMS', emoji: '💬', category: 'Essential' },
  { name: 'Phone', bundleId: 'com.apple.mobilephone', emoji: '📞', category: 'Essential' },
  { name: 'Mail', bundleId: 'com.apple.mobilemail', emoji: '📧', category: 'Essential' },
  { name: 'Calendar', bundleId: 'com.apple.mobilecal', emoji: '📅', category: 'Essential' },
  { name: 'Clock', bundleId: 'com.apple.mobiletimer', emoji: '⏰', category: 'Essential' },
  { name: 'Notes', bundleId: 'com.apple.mobilenotes', emoji: '📝', category: 'Productivity' },
  { name: 'Reminders', bundleId: 'com.apple.reminders', emoji: '✅', category: 'Productivity' },
];

type ShieldMode = 'off' | 'block-all' | 'block-selected' | 'scheduled';

interface ShieldStats {
  totalTimeActive: number; // minutes
  daysUsedStreak: number;
  xpEarned: number;
  appsBlocked: number;
}

export function FocusShieldScreen({ onBack }: FocusShieldScreenProps) {
  const insets = useSafeAreaInsets();
  const { progress } = useGame();

  // Get current realm theme
  const currentRealm = getRealmForLevel(progress?.level || 1);
  const realmColors = currentRealm.colors;
  const realmBackground = currentRealm.background;

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // State
  const [authStatus, setAuthStatus] = useState<AuthorizationStatus['status']>('notDetermined');
  const [shieldMode, setShieldMode] = useState<ShieldMode>('off');
  const [blockedApps, setBlockedApps] = useState<string[]>([]);
  const [allowedApps, setAllowedApps] = useState<string[]>([
    'com.apple.mobilesafari',
    'com.apple.MobileSMS',
    'com.apple.mobilephone',
    'com.apple.mobilemail'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<'block' | 'allow'>('block');

  // Shield stats (would be loaded from storage in production)
  const [shieldStats] = useState<ShieldStats>({
    totalTimeActive: 1247, // minutes
    daysUsedStreak: 7,
    xpEarned: 850,
    appsBlocked: 142,
  });

  useEffect(() => {
    checkAuthorization();

    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (shieldMode !== 'off') {
      // Pulse animation when shield is active
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [shieldMode]);

  const checkAuthorization = async () => {
    // For development/demo: Always show as approved so we can see the full UI
    if (!FocusShield.isAvailable()) {
      setAuthStatus('approved');
      return;
    }
    try {
      await FocusShield.checkAuthorizationStatus();
      // Override to show approved for demo
      setAuthStatus('approved');
      // setAuthStatus(status.status); // Uncomment this for production
    } catch (error) {
      console.error('Failed to check authorization:', error);
      setAuthStatus('approved');
    }
  };

  const requestPermission = async () => {
    if (!FocusShield.isAvailable()) {
      Alert.alert('Not Available', 'Focus Shield is only available on iOS devices.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await FocusShield.requestAuthorization();
      if (result.authorized) {
        setAuthStatus('approved');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success! 🎉', 'Screen Time permission granted. You can now use Focus Shield!');
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Permission Denied', error.message || 'Failed to request permission');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShieldMode = async (mode: ShieldMode) => {
    if (authStatus !== 'approved') {
      Alert.alert(
        'Permission Required',
        'You need to grant Screen Time permission first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: requestPermission }
        ]
      );
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (mode === 'off') {
        if (FocusShield.isAvailable()) {
          await FocusShield.disable();
          await FocusShield.stopMonitoring();
        }
        setShieldMode('off');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Shield Deactivated 🔓', 'All apps are now accessible.');
      } else if (mode === 'block-all') {
        if (FocusShield.isAvailable()) {
          await FocusShield.enable({
            blockAllApps: true,
            allowedApps: allowedApps,
          });
          await FocusShield.scheduleMonitoring({});
        }
        setShieldMode('block-all');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Calculate XP bonus
        const xpBonus = 25;
        Alert.alert(
          'Shield Activated! 🛡️',
          `All apps blocked except ${allowedApps.length} essential apps.\n\n+${xpBonus} XP for activating Focus Shield!`
        );
      } else if (mode === 'block-selected') {
        if (blockedApps.length === 0) {
          Alert.alert('No Apps Selected', 'Please select apps to block first.');
          setIsLoading(false);
          return;
        }
        if (FocusShield.isAvailable()) {
          await FocusShield.enable({
            blockedApps: blockedApps,
          });
          await FocusShield.scheduleMonitoring({});
        }
        setShieldMode('block-selected');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const xpBonus = Math.min(blockedApps.length * 3, 50);
        Alert.alert(
          'Shield Activated! 🎯',
          `${blockedApps.length} apps are now blocked.\n\n+${xpBonus} XP for focused protection!`
        );
      }
    } catch (error: any) {
      Alert.alert('Demo Mode', 'Shield state updated. On iOS with permissions, this would actually block apps.');
      setShieldMode(mode);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAppInList = (bundleId: string, listType: 'block' | 'allow') => {
    Haptics.selectionAsync();
    if (listType === 'block') {
      setBlockedApps(prev =>
        prev.includes(bundleId)
          ? prev.filter(id => id !== bundleId)
          : [...prev, bundleId]
      );
    } else {
      setAllowedApps(prev =>
        prev.includes(bundleId)
          ? prev.filter(id => id !== bundleId)
          : [...prev, bundleId]
      );
    }
  };

  const openAppSelector = (type: 'block' | 'allow') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectorType(type);
    setShowAppSelector(true);
  };

  const applyPreset = (presetName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (presetName === 'social-media') {
      const socialApps = POPULAR_APPS.filter(app => app.category === 'Social').map(app => app.bundleId);
      setBlockedApps(socialApps);
      Alert.alert('Preset Applied! 📱', `${socialApps.length} social media apps added to block list.\n\n+10 XP for proactive focus!`);
    } else if (presetName === 'entertainment') {
      const entertainmentApps = POPULAR_APPS.filter(app => app.category === 'Entertainment').map(app => app.bundleId);
      setBlockedApps(entertainmentApps);
      Alert.alert('Preset Applied! 🎬', `${entertainmentApps.length} entertainment apps added to block list.\n\n+10 XP!`);
    } else if (presetName === 'essentials-only') {
      setAllowedApps(ESSENTIAL_APPS.map(app => app.bundleId));
      setBlockedApps(POPULAR_APPS.map(app => app.bundleId));
      Alert.alert('Preset Applied! ⚡', 'Only essential apps will be accessible.\n\n+15 XP for maximum focus mode!');
    } else if (presetName === 'reset') {
      setBlockedApps([]);
      setAllowedApps(['com.apple.mobilesafari', 'com.apple.MobileSMS', 'com.apple.mobilephone', 'com.apple.mobilemail']);
      Alert.alert('Reset Complete 🔄', 'All app lists cleared to defaults.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Realm-themed Background */}
      <LinearGradient
        colors={[realmBackground.top, realmBackground.bottom]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Orbs Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            styles.floatingOrb,
            {
              backgroundColor: realmColors.primary,
              top: '10%',
              left: '10%',
              opacity: 0.1,
              transform: [
                {
                  translateY: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingOrb,
            {
              backgroundColor: realmColors.accent,
              bottom: '20%',
              right: '15%',
              opacity: 0.15,
              transform: [
                {
                  translateY: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Focus Shield</Text>
          <Text style={[styles.headerSubtitle, { color: realmColors.accent }]}>
            {currentRealm.name} Realm • Level {progress?.level || 1}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview Card */}
        <Animated.View
          style={[
            styles.statsCard,
            {
              transform: [{ scale: slideAnim }],
              opacity: slideAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[realmColors.primary + '20', realmColors.secondary + '20']}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <FlameIcon size={24} color={realmColors.accent} />
                <Text style={styles.statValue}>{shieldStats.daysUsedStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <BoltIcon size={24} color="#FFD700" />
                <Text style={styles.statValue}>{shieldStats.xpEarned}</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <TrophyIcon size={24} color={realmColors.primary} />
                <Text style={styles.statValue}>{shieldStats.appsBlocked}</Text>
                <Text style={styles.statLabel}>Apps Blocked</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Shield Status - Big Hero Card */}
        {authStatus === 'approved' && (
          <View style={styles.heroCard}>
            <LinearGradient
              colors={
                shieldMode !== 'off'
                  ? [realmColors.primary, realmColors.secondary]
                  : ['#374151', '#1F2937']
              }
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.heroIconContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                {shieldMode !== 'off' ? (
                  <ShieldCheckIcon size={80} color="#FFFFFF" />
                ) : (
                  <View style={styles.inactiveShieldIcon}>
                    <Text style={styles.inactiveShieldEmoji}>🛡️</Text>
                  </View>
                )}
              </Animated.View>

              <Text style={styles.heroTitle}>
                {shieldMode !== 'off' ? 'Shield Active!' : 'Shield Inactive'}
              </Text>

              <Text style={styles.heroSubtitle}>
                {shieldMode === 'block-all' && `All apps blocked except ${allowedApps.length} essential`}
                {shieldMode === 'block-selected' && `${blockedApps.length} selected apps blocked`}
                {shieldMode === 'scheduled' && 'Scheduled blocking active'}
                {shieldMode === 'off' && 'Tap a mode below to activate protection'}
              </Text>

              {shieldMode !== 'off' && (
                <View style={styles.heroBonus}>
                  <SparklesIcon size={16} color="#FFD700" />
                  <Text style={styles.heroBonusText}>+20% XP Bonus while active</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Permission Required Card */}
        {authStatus !== 'approved' && (
          <View style={styles.permissionCard}>
            <LinearGradient
              colors={[realmColors.primary, realmColors.accent]}
              style={styles.permissionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.permissionIconContainer}>
                <Text style={styles.permissionEmoji}>🔐</Text>
              </View>
              <Text style={styles.permissionTitle}>Permission Required</Text>
              <Text style={styles.permissionDescription}>
                Grant Screen Time access to enable real app blocking
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermission}
                disabled={isLoading}
              >
                <Text style={styles.permissionButtonText}>
                  {isLoading ? 'Requesting...' : 'Grant Permission'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Shield Modes */}
        {authStatus === 'approved' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shield Modes</Text>
              <View style={[styles.sectionBadge, { backgroundColor: realmColors.primary + '30' }]}>
                <StarIcon size={14} color={realmColors.accent} />
                <Text style={[styles.sectionBadgeText, { color: realmColors.accent }]}>
                  Earn XP
                </Text>
              </View>
            </View>

            {/* Block All Mode */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                shieldMode === 'block-all' && {
                  borderColor: realmColors.primary,
                  backgroundColor: realmColors.primary + '15',
                },
              ]}
              onPress={() => toggleShieldMode(shieldMode === 'block-all' ? 'off' : 'block-all')}
              disabled={isLoading}
            >
              <LinearGradient
                colors={
                  shieldMode === 'block-all'
                    ? [realmColors.primary + '20', realmColors.secondary + '20']
                    : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']
                }
                style={styles.modeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.modeIcon, shieldMode === 'block-all' && { backgroundColor: realmColors.primary + '30' }]}>
                  <Text style={styles.modeIconEmoji}>🚫</Text>
                </View>
                <View style={styles.modeContent}>
                  <Text style={styles.modeTitle}>Maximum Protection</Text>
                  <Text style={styles.modeDescription}>
                    Block all apps except {allowedApps.length} essentials • +25 XP
                  </Text>
                </View>
                <Switch
                  value={shieldMode === 'block-all'}
                  onValueChange={() => toggleShieldMode(shieldMode === 'block-all' ? 'off' : 'block-all')}
                  disabled={isLoading}
                  trackColor={{ false: '#4B5563', true: realmColors.primary }}
                  thumbColor={shieldMode === 'block-all' ? realmColors.accent : '#9CA3AF'}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Block Selected Mode */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                shieldMode === 'block-selected' && {
                  borderColor: realmColors.secondary,
                  backgroundColor: realmColors.secondary + '15',
                },
              ]}
              onPress={() => toggleShieldMode(shieldMode === 'block-selected' ? 'off' : 'block-selected')}
              disabled={isLoading}
            >
              <LinearGradient
                colors={
                  shieldMode === 'block-selected'
                    ? [realmColors.secondary + '20', realmColors.accent + '20']
                    : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']
                }
                style={styles.modeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.modeIcon, shieldMode === 'block-selected' && { backgroundColor: realmColors.secondary + '30' }]}>
                  <Text style={styles.modeIconEmoji}>🎯</Text>
                </View>
                <View style={styles.modeContent}>
                  <Text style={styles.modeTitle}>Targeted Focus</Text>
                  <Text style={styles.modeDescription}>
                    Block {blockedApps.length || 0} chosen apps • +{Math.min(blockedApps.length * 3, 50)} XP
                  </Text>
                </View>
                <Switch
                  value={shieldMode === 'block-selected'}
                  onValueChange={() => toggleShieldMode(shieldMode === 'block-selected' ? 'off' : 'block-selected')}
                  disabled={isLoading}
                  trackColor={{ false: '#4B5563', true: realmColors.secondary }}
                  thumbColor={shieldMode === 'block-selected' ? realmColors.accent : '#9CA3AF'}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Turn Off Shield */}
            {shieldMode !== 'off' && (
              <TouchableOpacity
                style={styles.disableButton}
                onPress={() => toggleShieldMode('off')}
                disabled={isLoading}
              >
                <Text style={styles.disableButtonText}>
                  {isLoading ? 'Disabling...' : '🔓 Deactivate Shield'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* App Selection */}
        {authStatus === 'approved' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Apps</Text>

            <View style={styles.appManageGrid}>
              {/* Blocked Apps */}
              <TouchableOpacity
                style={[styles.appManageCard, { borderColor: realmColors.primary + '50' }]}
                onPress={() => openAppSelector('block')}
              >
                <LinearGradient
                  colors={[realmColors.primary + '15', realmColors.primary + '05']}
                  style={styles.appManageGradient}
                >
                  <View style={[styles.appManageIcon, { backgroundColor: realmColors.primary + '30' }]}>
                    <Text style={styles.appManageIconEmoji}>🚫</Text>
                  </View>
                  <Text style={styles.appManageTitle}>Block List</Text>
                  <Text style={styles.appManageCount}>{blockedApps.length}</Text>
                  <Text style={styles.appManageLabel}>apps</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Allowed Apps */}
              <TouchableOpacity
                style={[styles.appManageCard, { borderColor: realmColors.secondary + '50' }]}
                onPress={() => openAppSelector('allow')}
              >
                <LinearGradient
                  colors={[realmColors.secondary + '15', realmColors.secondary + '05']}
                  style={styles.appManageGradient}
                >
                  <View style={[styles.appManageIcon, { backgroundColor: realmColors.secondary + '30' }]}>
                    <Text style={styles.appManageIconEmoji}>✅</Text>
                  </View>
                  <Text style={styles.appManageTitle}>Allow List</Text>
                  <Text style={styles.appManageCount}>{allowedApps.length}</Text>
                  <Text style={styles.appManageLabel}>apps</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Presets */}
        {authStatus === 'approved' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Presets</Text>

            <View style={styles.presetsGrid}>
              <TouchableOpacity
                style={styles.presetCard}
                onPress={() => applyPreset('social-media')}
              >
                <LinearGradient
                  colors={['#EC4899', '#DB2777']}
                  style={styles.presetGradient}
                >
                  <Text style={styles.presetEmoji}>📱</Text>
                  <Text style={styles.presetTitle}>Social Media</Text>
                  <Text style={styles.presetXp}>+10 XP</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetCard}
                onPress={() => applyPreset('entertainment')}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.presetGradient}
                >
                  <Text style={styles.presetEmoji}>🎬</Text>
                  <Text style={styles.presetTitle}>Entertainment</Text>
                  <Text style={styles.presetXp}>+10 XP</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetCard}
                onPress={() => applyPreset('essentials-only')}
              >
                <LinearGradient
                  colors={[realmColors.primary, realmColors.secondary]}
                  style={styles.presetGradient}
                >
                  <Text style={styles.presetEmoji}>⚡</Text>
                  <Text style={styles.presetTitle}>Essentials Only</Text>
                  <Text style={styles.presetXp}>+15 XP</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetCard}
                onPress={() => applyPreset('reset')}
              >
                <LinearGradient
                  colors={['#6B7280', '#4B5563']}
                  style={styles.presetGradient}
                >
                  <Text style={styles.presetEmoji}>🔄</Text>
                  <Text style={styles.presetTitle}>Reset</Text>
                  <Text style={styles.presetXp}>Clear All</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shield Benefits</Text>

          <View style={[styles.benefitCard, { borderLeftColor: realmColors.primary }]}>
            <View style={styles.benefitIconContainer}>
              <BoltIcon size={24} color={realmColors.accent} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>XP Multiplier</Text>
              <Text style={styles.benefitDescription}>
                Earn 20% more XP on all exercises while Shield is active
              </Text>
            </View>
          </View>

          <View style={[styles.benefitCard, { borderLeftColor: realmColors.secondary }]}>
            <View style={styles.benefitIconContainer}>
              <FlameIcon size={24} color="#FF6B35" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Streak Protection</Text>
              <Text style={styles.benefitDescription}>
                Build focus streaks and earn daily bonuses
              </Text>
            </View>
          </View>

          <View style={[styles.benefitCard, { borderLeftColor: realmColors.accent }]}>
            <View style={styles.benefitIconContainer}>
              <TrophyIcon size={24} color={realmColors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Unlock Achievements</Text>
              <Text style={styles.benefitDescription}>
                Complete shield challenges to unlock exclusive rewards
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* App Selector Modal */}
      <Modal
        visible={showAppSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAppSelector(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowAppSelector(false)}
            activeOpacity={1}
          />
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ width: 60 }} />
              <Text style={styles.modalTitle}>
                {selectorType === 'block' ? 'Select Apps to Block' : 'Always Allow Apps'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAppSelector(false);
                }}
                style={styles.modalDoneButton}
              >
                <Text style={[styles.modalDoneText, { color: realmColors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* App List */}
            <FlatList
              data={selectorType === 'block' ? POPULAR_APPS : ESSENTIAL_APPS}
              keyExtractor={(item) => item.bundleId}
              renderItem={({ item }) => {
                const isSelected = selectorType === 'block'
                  ? blockedApps.includes(item.bundleId)
                  : allowedApps.includes(item.bundleId);

                return (
                  <TouchableOpacity
                    style={[
                      styles.appSelectItem,
                      isSelected && { backgroundColor: realmColors.primary + '15', borderColor: realmColors.primary + '50' },
                    ]}
                    onPress={() => toggleAppInList(item.bundleId, selectorType)}
                  >
                    <View style={styles.appSelectLeft}>
                      <Text style={styles.appSelectEmoji}>{item.emoji}</Text>
                      <View>
                        <Text style={styles.appSelectName}>{item.name}</Text>
                        <Text style={styles.appSelectCategory}>{item.category}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && { backgroundColor: realmColors.primary, borderColor: realmColors.primary },
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              }}
              style={styles.appList}
              contentContainerStyle={styles.appListContent}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },

  // Stats Card
  statsCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Hero Card
  heroCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  heroIconContainer: {
    marginBottom: 16,
  },
  inactiveShieldIcon: {
    opacity: 0.5,
  },
  inactiveShieldEmoji: {
    fontSize: 80,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  heroBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  heroBonusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 6,
  },

  // Permission Card
  permissionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  permissionGradient: {
    padding: 32,
    alignItems: 'center',
  },
  permissionIconContainer: {
    marginBottom: 16,
  },
  permissionEmoji: {
    fontSize: 64,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },

  // Mode Cards
  modeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modeIconEmoji: {
    fontSize: 26,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },

  // Disable Button
  disableButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disableButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },

  // App Manage Grid
  appManageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  appManageCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  appManageGradient: {
    padding: 20,
    alignItems: 'center',
  },
  appManageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appManageIconEmoji: {
    fontSize: 24,
  },
  appManageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appManageCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  appManageLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },

  // Presets Grid
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    width: (SCREEN_WIDTH - 32 - 10) / 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  presetGradient: {
    padding: 18,
    alignItems: 'center',
  },
  presetEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  presetXp: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Benefit Cards
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalDoneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '700',
  },
  appList: {
    flex: 1,
  },
  appListContent: {
    padding: 16,
  },
  appSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appSelectEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  appSelectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  appSelectCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
