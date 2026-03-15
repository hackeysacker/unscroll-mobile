import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Switch, Linking, Share } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useGame } from '@/contexts/GameContext';
import { Header } from '@/components/ui/Header';
import { UIIcon } from '@/components/ui/UIIcon';
import type { UIIconName } from '@/components/icons';
import { getThemeColors } from '@/lib/theme-colors';
import type { ThemeType } from '@/types';
import { useHaptics } from '@/hooks/useHaptics';
import { useAnimations } from '@/hooks/useAnimations';
import { useSound } from '@/hooks/useSound';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'expo-camera';
import { sendTestNotification } from '@/lib/notification-manager';
import { exportAllUserData } from '@/lib/data-export';
import * as Clipboard from 'expo-clipboard';

interface SettingsProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

// Theme definitions with preview colors
const THEMES: Record<ThemeType, {
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
}> = {
  'noir-cinema': {
    name: 'Noir Cinema',
    description: 'Film noir drama',
    primary: '#0C0A09',
    secondary: '#1C1917',
    accent: '#F59E0B',
  },
  'tokyo-neon': {
    name: 'Tokyo Neon',
    description: 'Cyberpunk glow',
    primary: '#030712',
    secondary: '#4A044E',
    accent: '#EC4899',
  },
  'aura-glass': {
    name: 'Aura Glass',
    description: 'Frosted lavender',
    primary: '#F5F3FF',
    secondary: '#EDE9FE',
    accent: '#8B5CF6',
  },
  'paper-craft': {
    name: 'Paper Craft',
    description: 'Artisan warmth',
    primary: '#FFFBEB',
    secondary: '#FEF3C7',
    accent: '#EA580C',
  },
  'arctic-aurora': {
    name: 'Arctic Aurora',
    description: 'Northern lights',
    primary: '#0F172A',
    secondary: '#083344',
    accent: '#2DD4BF',
  },
  'rose-quartz': {
    name: 'Rose Quartz',
    description: 'Rose gold lux',
    primary: '#18181B',
    secondary: '#4C0519',
    accent: '#FB7185',
  },
  'matcha-zen': {
    name: 'Matcha Zen',
    description: 'Deep serenity',
    primary: '#1C1917',
    secondary: '#14532D',
    accent: '#84CC16',
  },
  'cosmic-void': {
    name: 'Cosmic Void',
    description: 'Deep space',
    primary: '#030303',
    secondary: '#2E1065',
    accent: '#A855F7',
  },
};

export function Settings({ onBack, onNavigate }: SettingsProps) {
  const { user, logout, resetOnboarding } = useAuth();
  const { settings, updateSettings, toggleDarkMode } = useSettings();
  const { theme, setTheme, availableThemes, colors } = useTheme();
  const { resetProgress, gameState } = useGame();
  const haptics = useHaptics();
  const animations = useAnimations();
  const sound = useSound();

  // Camera permission state
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [testingNotification, setTestingNotification] = useState(false);

  // Test notification handler
  const handleTestNotification = async () => {
    if (testingNotification) return;
    setTestingNotification(true);
    try {
      await sendTestNotification();
      haptics.notificationSuccess();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch (error) {
      haptics.notificationError();
      Alert.alert('Error', 'Could not send test notification. Check permissions.');
    } finally {
      setTestingNotification(false);
    }
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...animations.spring({ friction: 8, tension: 50 }),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, animations]);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      setCameraPermission(status);
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setCameraPermission('undetermined');
    }
  };

  const handleCameraPermission = async () => {
    haptics.impactLight();
    sound.tap();

    if (cameraPermission === 'granted') {
      // Already granted
      Alert.alert(
        'Camera Access',
        'Camera access is already enabled for face tracking challenges.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (cameraPermission === 'denied') {
      // Need to open settings
      Alert.alert(
        'Camera Permission Required',
        'To use face tracking for gaze hold challenges, please enable camera access in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openURL('app-settings:');
            }
          }
        ]
      );
      return;
    }

    // Undetermined - request permission
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status);

      if (status === 'granted') {
        haptics.notificationSuccess();
        sound.success();
        Alert.alert(
          'Camera Enabled',
          'Camera access enabled! You can now use face tracking in gaze hold challenges.',
          [{ text: 'OK' }]
        );
      } else {
        haptics.notificationWarning();
        sound.warning();
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      haptics.notificationError();
      sound.error();
    }
  };

  if (!settings || !user || !colors) return null;

  const handleToggle = (key: string, value: boolean) => {
    haptics.impactLight();
    sound.toggle();
    updateSettings({ [key]: value });
  };

  const handleThemeSelect = (themeOption: ThemeType) => {
    haptics.impactMedium();
    sound.select();
    setTheme(themeOption);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'This will reset all your training progress, streaks, XP, and unlock status. You will go through the onboarding again. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            haptics.impactLight();
            sound.tap();
          }
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            haptics.notificationWarning();
            sound.warning();
            try {
              await resetProgress();
              await resetOnboarding();
              haptics.notificationSuccess();
              sound.success();
              onBack();
            } catch (error) {
              console.error('Error resetting progress:', error);
              haptics.notificationError();
              sound.error();
              Alert.alert(
                'Error',
                'Failed to reset progress. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await logout();
            onBack();
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    haptics.impactMedium();
    sound.tap();
    await logout();
    onBack();
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@focusflow.app');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://focusflow.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://focusflow.app/terms');
  };

  const handleExportData = async () => {
    try {
      haptics?.impactLight();
      const data = await exportAllUserData();
      await Clipboard.setStringAsync(data);
      Alert.alert(
        'Data Exported',
        'Your data has been copied to clipboard. You can paste it into a text editor to save it.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    }
  };

  const handleRateApp = () => {
    haptics?.impactLight();
    // Open App Store review page (would need actual App Store URL when published)
    // For now, show an alert
    Alert.alert(
      'Rate FocusFlow',
      'Thank you for using FocusFlow! Rating will be available when the app is published on the App Store.',
      [{ text: 'OK' }]
    );
  };

  const handleShareApp = async () => {
    try {
      haptics?.impactLight();
      await Share.share({
        message: 'Check out FocusFlow - an app that helps you build focus and reduce screen time! Download at https://focusflow.app',
        title: 'Share FocusFlow',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" onBack={onBack} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Section */}
          <LinearGradient
            colors={[colors.card, colors.muted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
              <UIIcon name="person" size={28} color={colors.primaryForeground} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileEmail, { color: colors.foreground }]}>
                {user.email || 'Focus Trainer'}
              </Text>
              <View style={styles.profileStats}>
                <View style={styles.statBadge}>
                  <UIIcon name="trophy" size={12} color="#F59E0B" />
                  <Text style={styles.statText}>
                    Level {gameState?.level || 1}
                  </Text>
                </View>
                <View style={styles.statBadge}>
                  <UIIcon name="flame" size={12} color="#EF4444" />
                  <Text style={styles.statText}>
                    {gameState?.streak || 0} day streak
                  </Text>
                </View>
              </View>
            </View>
            {!user.isPremium && (
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
                onPress={() => onNavigate?.('premium')}
              >
                <UIIcon name="star-outline" size={16} color={colors.primaryForeground} />
              </TouchableOpacity>
            )}
          </LinearGradient>

          {/* Training Preferences */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="settings" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Training Preferences
              </Text>
            </View>

            <SettingRow
              icon="vibrate"
              label="Haptic Feedback"
              description="Vibrations during exercises"
              value={settings.vibrationEnabled}
              onToggle={(value) => handleToggle('vibrationEnabled', value)}
              colors={colors}
            />

            <SettingRow
              icon="volume-high"
              label="Sound Effects"
              description="Audio cues and feedback"
              value={settings.soundEnabled}
              onToggle={(value) => handleToggle('soundEnabled', value)}
              colors={colors}
            />

            <SettingRow
              icon="notifications"
              label="Daily Reminders"
              description="Training notifications"
              value={settings.notificationsEnabled}
              onToggle={(value) => handleToggle('notificationsEnabled', value)}
              colors={colors}
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTestNotification}
              disabled={testingNotification}
            >
              <View style={styles.actionButtonContent}>
                <UIIcon name="mail" size={20} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                    {testingNotification ? 'Sending...' : 'Test Notification'}
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                    Send a test notification to verify
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <SettingRow
              icon="flash"
              label="Auto-Progress"
              description="Move to next challenge automatically"
              value={settings.autoProgress ?? true}
              onToggle={(value) => handleToggle('autoProgress', value)}
              colors={colors}
            />

            <SettingRow
              icon="eye-off"
              label="Reduced Motion"
              description="Minimize animations"
              value={settings.reducedMotion ?? false}
              onToggle={(value) => handleToggle('reducedMotion', value)}
              colors={colors}
            />

            <View style={styles.settingRow}>
              <TouchableOpacity
                style={styles.permissionRow}
                onPress={handleCameraPermission}
              >
                <View style={styles.settingInfo}>
                  <UIIcon name="flash" size={20} color={colors.mutedForeground} style={styles.settingIcon} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                      Camera Access
                    </Text>
                    <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                      {cameraPermission === 'granted'
                        ? 'Enabled for face tracking'
                        : cameraPermission === 'denied'
                        ? 'Tap to enable in Settings'
                        : 'Required for gaze hold challenges'}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.permissionBadge,
                  { backgroundColor: cameraPermission === 'granted' ? '#10B981' : '#F59E0B' }
                ]}>
                  <Text style={styles.permissionBadgeText}>
                    {cameraPermission === 'granted' ? '✓' : '!'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Difficulty & Goals */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="target" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Difficulty & Goals
              </Text>
            </View>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => onNavigate?.('difficulty-settings')}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="trophy" size={20} color={colors.mutedForeground} />
                <View style={styles.linkText}>
                  <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                    Challenge Difficulty
                  </Text>
                  <Text style={[styles.linkDescription, { color: colors.mutedForeground }]}>
                    Adaptive · Moderate
                  </Text>
                </View>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => onNavigate?.('daily-goal')}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="calendar" size={20} color={colors.mutedForeground} />
                <View style={styles.linkText}>
                  <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                    Daily Goal
                  </Text>
                  <Text style={[styles.linkDescription, { color: colors.mutedForeground }]}>
                    5 minutes per day
                  </Text>
                </View>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, styles.linkRowLast]}
              onPress={() => onNavigate?.('focus-areas')}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="bulb" size={20} color={colors.mutedForeground} />
                <View style={styles.linkText}>
                  <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                    Focus Areas
                  </Text>
                  <Text style={[styles.linkDescription, { color: colors.mutedForeground }]}>
                    Customize training emphasis
                  </Text>
                </View>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Theme Selection */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="color-palette" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Appearance
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
              Choose your visual style
            </Text>

            <View style={styles.themeGrid}>
              {availableThemes.map((themeOption) => {
                const themeData = THEMES[themeOption];
                if (!themeData) return null;

                const isSelected = theme === themeOption;
                const themeColors = getThemeColors(themeOption);
                return (
                  <TouchableOpacity
                    key={themeOption}
                    style={[
                      styles.themeCard,
                      {
                        borderColor: isSelected ? themeColors.primary : colors.border,
                        backgroundColor: isSelected ? themeColors.card : colors.muted,
                      }
                    ]}
                    onPress={() => handleThemeSelect(themeOption)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.themePreview}>
                      <View style={[styles.themePreviewMain, { backgroundColor: themeData.primary }]}>
                        <View style={[styles.themePreviewAccent, { backgroundColor: themeData.accent }]} />
                      </View>
                    </View>
                    <Text style={[
                      styles.themeName,
                      { color: isSelected ? themeColors.primary : colors.foreground }
                    ]}>
                      {themeData.name}
                    </Text>
                    <Text style={[styles.themeDesc, { color: colors.mutedForeground }]}>
                      {themeData.description}
                    </Text>
                    {isSelected && (
                      <View style={[styles.themeCheck, { backgroundColor: themeColors.primary }]}>
                        <UIIcon name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Privacy & Security */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Privacy & Security
              </Text>
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={handlePrivacy}>
              <View style={styles.linkInfo}>
                <UIIcon name="lock-closed" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  Privacy Policy
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={handleTerms}>
              <View style={styles.linkInfo}>
                <UIIcon name="document-text" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  Terms of Service
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, styles.linkRowLast]}
              onPress={handleExportData}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="download" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  Export Your Data
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Spread the Word */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="person-circle" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Spread the Word
              </Text>
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={handleShareApp}>
              <View style={styles.linkInfo}>
                <UIIcon name="person-circle" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  Share FocusFlow
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, styles.linkRowLast]}
              onPress={handleRateApp}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="star" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  Rate FocusFlow
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Help & Support */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="bulb" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Help & Support
              </Text>
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={handleSupport}>
              <View style={styles.linkInfo}>
                <UIIcon name="mail" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  Contact Support
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => onNavigate?.('tutorial')}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="book-open" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  How to Use App
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkRow, styles.linkRowLast]}
              onPress={() => onNavigate?.('faq')}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="chatbubbles" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  FAQs
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Developer Tools */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="code-slash" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Developer
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.linkRow, styles.linkRowLast]}
              onPress={() => {
                haptics.impactLight();
                sound.tap();
                onNavigate?.('dev-testing');
              }}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="flask" size={20} color={colors.mutedForeground} />
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>
                  Testing Mode
                </Text>
              </View>
              <UIIcon name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Account Actions */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <UIIcon name="person-circle" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Account
              </Text>
            </View>

            <TouchableOpacity
              style={styles.dangerRow}
              onPress={() => {
                haptics.notificationWarning();
                sound.warning();
                handleResetProgress();
              }}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="refresh" size={20} color="#EF4444" />
                <Text style={styles.dangerLabel}>Reset Progress</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dangerRow}
              onPress={() => {
                haptics.notificationWarning();
                sound.warning();
                handleDeleteAccount();
              }}
            >
              <View style={styles.linkInfo}>
                <UIIcon name="trash" size={20} color="#EF4444" />
                <Text style={styles.dangerLabel}>Delete Account</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.muted }]}
              onPress={handleLogout}
            >
              <UIIcon name="log-out" size={20} color={colors.foreground} />
              <Text style={[styles.logoutButtonText, { color: colors.foreground }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              FocusFlow v1.0.0
            </Text>
            <Text style={[styles.footerSubtext, { color: colors.mutedForeground }]}>
              Built for better focus
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Helper component for setting rows
function SettingRow({
  icon,
  label,
  description,
  value,
  onToggle,
  colors,
  isLast = false
}: {
  icon: UIIconName;
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
      <View style={styles.settingInfo}>
        <UIIcon name={icon} size={20} color={colors.mutedForeground} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
          <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.muted, true: colors.primary }}
        thumbColor={colors.primaryForeground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#E2E8F0',
  },
  upgradeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  actionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },

  // Permission Row
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  permissionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Link Row
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  linkText: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  linkDescription: {
    fontSize: 12,
    marginTop: 2,
  },

  // Theme Grid
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '47%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    position: 'relative',
  },
  themePreview: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  themePreviewMain: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 6,
  },
  themePreviewAccent: {
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Danger Row
  dangerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
