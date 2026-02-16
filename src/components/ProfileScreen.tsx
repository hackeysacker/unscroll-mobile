/**
 * Profile Screen - Duolingo Style
 *
 * User profile with stats, achievements, and settings
 */

import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { BADGE_DEFINITIONS, getBadgeProgressPercentage } from '@/lib/badge-mechanics';
import { loadFromStorage, STORAGE_KEYS } from '@/lib/storage';
import type { BadgeType, ChallengeResult } from '@/types';
import Svg, { Path, Circle, Rect, Polygon, Ellipse } from 'react-native-svg';
import { FocusShieldControl } from './FocusShieldControl';

// SVG Icon Components
interface IconProps {
  size: number;
  color: string;
}

function ProfileIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill="none" />
      <Path
        d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function SettingsIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function ChartIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M18 20V10M12 20V4M6 20V14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function CrownIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 7L5 13L9 7L12 13L15 7L19 13L22 7V19H2V7Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M2 19H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TrophyIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 21H16M12 17V21M6 4H18V8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8V4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6 4V8C6 8 4 8 4 6C4 4 6 4 6 4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M18 4V8C18 8 20 8 20 6C20 4 18 4 18 4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function FlameIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2C12 2 8 6 8 10C8 13 9.79 15 12 15C14.21 15 16 13 16 10C16 6 12 2 12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 22C12 22 6 18 6 13C6 10 8.24 8 12 8C15.76 8 18 10 18 13C18 18 12 22 12 22Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function StarIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function DiamondIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 3H18L22 9L12 21L2 9L6 3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M2 9H22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M12 3L8 9L12 21L16 9L12 3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function TargetIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

interface ProfileScreenProps {
  onBack: () => void;
  onNavigate: (route: string) => void;
}

// Avatar emoji options
const AVATAR_EMOJIS = ['😊', '🧠', '🎯', '⚡', '🌟', '🔥', '💎', '🦋', '🌈', '🎮', '🚀', '🌙', '☀️', '🌸', '🍀', '🦊', '🐱', '🐶', '🦉', '🐺', '👑', '💫', '🎨', '🎭', '🎪', '🎯', '💪', '🧘', '🎵', '✨'];

export function ProfileScreen({ onBack, onNavigate }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { progress, skillTree, badgeProgress, stats, heartState } = useGame();
  const { user, updateProfile } = useAuth();
  
  // Edit profile state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editAvatarEmoji, setEditAvatarEmoji] = useState(user?.avatarEmoji || '');
  const [isSaving, setIsSaving] = useState(false);
  const [challengeResults, setChallengeResults] = useState<ChallengeResult[]>([]);

  // Load challenge results for badge progress calculation
  useEffect(() => {
    async function loadChallengeResults() {
      if (user) {
        const results = await loadFromStorage<ChallengeResult[]>(STORAGE_KEYS.CHALLENGE_RESULTS) || [];
        setChallengeResults(results.filter(r => r.userId === user.id));
      }
    }
    loadChallengeResults();
  }, [user]);

  // Get recent completed achievements (last 6)
  const recentAchievements = useMemo(() => {
    if (!badgeProgress || !progress || !skillTree) return [];
    
    // Get all unlocked badges with their unlock timestamp
    const unlockedBadgesWithData = badgeProgress.unlockedBadges.map(badge => {
      const definition = BADGE_DEFINITIONS[badge.type];
      return {
        ...badge,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
      };
    });
    
    // Sort by unlock time (most recent first) and take last 6
    return unlockedBadgesWithData
      .sort((a, b) => b.unlockedAt - a.unlockedAt)
      .slice(0, 6);
  }, [badgeProgress, progress, skillTree]);

  // Get all badges for stats
  const allBadges = useMemo(() => {
    if (!badgeProgress || !progress || !skillTree) return [];
    
    const unlockedTypes = new Set(badgeProgress.unlockedBadges.map(b => b.type));
    const allBadgeTypes = Object.keys(BADGE_DEFINITIONS) as BadgeType[];
    
    return allBadgeTypes.map(badgeType => {
      const definition = BADGE_DEFINITIONS[badgeType];
      const isUnlocked = unlockedTypes.has(badgeType);
      
      return {
        type: badgeType,
        unlocked: isUnlocked,
      };
    });
  }, [badgeProgress, progress, skillTree]);

  const unlockedCount = allBadges.filter(b => b.unlocked).length;
  const totalCount = allBadges.length;

  const menuItems = [
    { id: 'edit-profile', IconComponent: ProfileIcon, title: 'Edit Profile', color: '#6366F1' },
    { id: 'achievements', IconComponent: TrophyIcon, title: 'Achievements', color: '#F59E0B' },
    { id: 'settings', IconComponent: SettingsIcon, title: 'Settings', color: '#10B981' },
    { id: 'insights', IconComponent: ChartIcon, title: 'Statistics', color: '#8B5CF6' },
    { id: 'premium', IconComponent: CrownIcon, title: 'Go Premium', color: '#EC4899' },
  ];

  const handleMenuPress = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (itemId === 'edit-profile') {
      // Reset form with current values
      setEditDisplayName(user?.displayName || '');
      setEditAvatarEmoji(user?.avatarEmoji || '');
      setIsEditModalVisible(true);
      return;
    }
    if (itemId === 'achievements') {
      onNavigate('achievements');
      return;
    }
    onNavigate(itemId);
  };

  const handleSaveProfile = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await updateProfile({
        displayName: editDisplayName.trim() || undefined,
        avatarEmoji: editAvatarEmoji || undefined,
      });
      setIsEditModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to update profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false);
  };

  // Helper function to get time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    const weeks = Math.floor(diffDays / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    const months = Math.floor(diffDays / 30);
    return `${months}mo ago`;
  };

  // Get display name for profile
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarEmoji = user?.avatarEmoji;
  const avatarLetter = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Background */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {avatarEmoji || avatarLetter}
            </Text>
          </View>

          <Text style={styles.profileName}>
            {displayName}
          </Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{progress?.level || 1}</Text>
              <Text style={styles.profileStatLabel}>Level</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{progress?.totalXp || 0}</Text>
              <Text style={styles.profileStatLabel}>Total XP</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{progress?.streak || 0}</Text>
              <Text style={styles.profileStatLabel}>Streak</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Focus Shield Control */}
        <FocusShieldControl />

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <>
            <View style={styles.achievementsHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent Achievements</Text>
                <Text style={styles.achievementCount}>
                  {allBadges.filter(b => b.unlocked).length} / {allBadges.length} unlocked
                </Text>
              </View>
            </View>

            {/* Recent Achievements List */}
            <View style={styles.recentAchievementsContainer}>
              {recentAchievements.map((badge) => {
                const rarityColors = {
                  common: '#9CA3AF',
                  uncommon: '#10B981',
                  rare: '#3B82F6',
                  epic: '#8B5CF6',
                  legendary: '#F59E0B',
                };
                const rarityColor = rarityColors[badge.rarity];
                const unlockedDate = new Date(badge.unlockedAt);
                const timeAgo = getTimeAgo(unlockedDate);

                return (
                  <View
                    key={badge.id}
                    style={[
                      styles.recentAchievementCard,
                      { borderLeftColor: rarityColor, borderLeftWidth: 3 },
                    ]}
                  >
                    <Text style={styles.recentAchievementEmoji}>{badge.icon}</Text>
                    <View style={styles.recentAchievementInfo}>
                      <Text style={styles.recentAchievementTitle}>{badge.name}</Text>
                      <Text style={styles.recentAchievementTime}>{timeAgo}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Menu Items */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {menuItems.map((item) => {
          const IconComponent = item.IconComponent;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <IconComponent size={24} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuChevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={handleCloseModal}
              activeOpacity={1}
            />
            <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[styles.modalSaveButton, isSaving && styles.modalSaveButtonDisabled]}
                  disabled={isSaving}
                >
                  <Text style={[styles.modalSaveText, isSaving && styles.modalSaveTextDisabled]}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Avatar Preview */}
              <View style={styles.editAvatarPreview}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.editAvatarCircle}
                >
                  <Text style={styles.editAvatarText}>
                    {editAvatarEmoji || editDisplayName?.charAt(0).toUpperCase() || avatarLetter}
                  </Text>
                </LinearGradient>
              </View>

              {/* Display Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editDisplayName}
                  onChangeText={setEditDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                  maxLength={30}
                />
              </View>

              {/* Avatar Emoji Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Choose Avatar Emoji</Text>
                <View style={styles.emojiGrid}>
                  {/* Clear option */}
                  <TouchableOpacity
                    style={[
                      styles.emojiOption,
                      !editAvatarEmoji && styles.emojiOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setEditAvatarEmoji('');
                    }}
                  >
                    <Text style={styles.emojiText}>
                      {editDisplayName?.charAt(0).toUpperCase() || avatarLetter}
                    </Text>
                  </TouchableOpacity>
                  {AVATAR_EMOJIS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiOption,
                        editAvatarEmoji === emoji && styles.emojiOptionSelected,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setEditAvatarEmoji(emoji);
                      }}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
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

  // Profile Card
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileAvatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },

  // Achievements
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  recentAchievementsContainer: {
    marginBottom: 24,
  },
  recentAchievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  recentAchievementEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  recentAchievementInfo: {
    flex: 1,
  },
  recentAchievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  recentAchievementTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuChevron: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseButton: {
    padding: 8,
    minWidth: 70,
  },
  modalCloseText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSaveButton: {
    padding: 8,
    minWidth: 70,
    alignItems: 'flex-end',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  modalSaveTextDisabled: {
    color: 'rgba(99, 102, 241, 0.5)',
  },
  editAvatarPreview: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  editAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  editAvatarText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  emojiText: {
    fontSize: 24,
  },
});
