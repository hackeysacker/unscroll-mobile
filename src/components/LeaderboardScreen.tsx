/**
 * Leaderboard Screen - Duolingo Style
 *
 * Shows rankings and competitive elements with tabs for different views
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

// SVG Icon Components
interface IconProps {
  size: number;
  color: string;
}

function GoldCrownIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 8L5 12L9 6L12 10L15 6L19 12L22 8V20H2V8Z" fill={color} />
      <Circle cx="5" cy="10" r="1.5" fill="#FFD700" />
      <Circle cx="12" cy="8" r="1.5" fill="#FFD700" />
      <Circle cx="19" cy="10" r="1.5" fill="#FFD700" />
      <Rect x="2" y="18" width="20" height="3" fill={color} />
    </Svg>
  );
}

function SilverMedalIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="14" r="7" fill={color} />
      <Circle cx="12" cy="14" r="5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <Path d="M9 3L9 10L12 14L15 10L15 3" fill={color} opacity="0.8" />
      <Rect x="9" y="2" width="6" height="2" rx="1" fill={color} />
    </Svg>
  );
}

function BronzeMedalIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="14" r="7" fill={color} />
      <Circle cx="12" cy="14" r="5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <Path d="M9 3L9 10L12 14L15 10L15 3" fill={color} opacity="0.8" />
      <Rect x="9" y="2" width="6" height="2" rx="1" fill={color} />
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

function ArrowUpIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4L5 11H9V20H15V11H19L12 4Z"
        fill={color}
      />
    </Svg>
  );
}

function ArrowDownIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 20L5 13H9V4H15V13H19L12 20Z"
        fill={color}
      />
    </Svg>
  );
}

interface LeaderboardScreenProps {
  onBack: () => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
  isCurrentUser?: boolean;
  rankChange?: number; // positive = moved up, negative = moved down
}

type LeaderboardTab = 'weekly' | 'alltime' | 'friends';

// Mock leaderboard data - Weekly
const MOCK_WEEKLY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'FocusMaster', xp: 2420, level: 45, streak: 42, avatar: '🧠', rankChange: 2 },
  { rank: 2, name: 'MindfulWarrior', xp: 2210, level: 42, streak: 38, avatar: '⚡', rankChange: -1 },
  { rank: 3, name: 'ZenNinja', xp: 1890, level: 40, streak: 35, avatar: '🎯', rankChange: 1 },
  { rank: 4, name: 'AttentionKing', xp: 1650, level: 38, streak: 28, avatar: '👑', rankChange: -2 },
  { rank: 5, name: 'FlowState_Pro', xp: 1420, level: 36, streak: 25, avatar: '🌊', rankChange: 0 },
  { rank: 6, name: 'CalmMind88', xp: 1350, level: 34, streak: 21, avatar: '🧘', rankChange: 3 },
  { rank: 7, name: 'LaserFocus', xp: 1280, level: 32, streak: 19, avatar: '🔥', rankChange: -1 },
  { rank: 8, name: 'DeepWork_Dan', xp: 1150, level: 30, streak: 17, avatar: '💪', rankChange: 0 },
  { rank: 9, name: 'ZoneIn_Zoe', xp: 1080, level: 28, streak: 15, avatar: '✨', rankChange: 2 },
  { rank: 10, name: 'PeakPerform', xp: 980, level: 27, streak: 14, avatar: '🏆', rankChange: -1 },
];

// Mock leaderboard data - All Time
const MOCK_ALLTIME_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'LegendaryFocus', xp: 125420, level: 250, streak: 365, avatar: '👑', rankChange: 0 },
  { rank: 2, name: 'MasterOfMind', xp: 98210, level: 220, streak: 280, avatar: '🧠', rankChange: 0 },
  { rank: 3, name: 'AttentionGuru', xp: 87890, level: 195, streak: 240, avatar: '🎯', rankChange: 1 },
  { rank: 4, name: 'FocusMaster', xp: 76650, level: 180, streak: 210, avatar: '⚡', rankChange: -1 },
  { rank: 5, name: 'ZenWarrior', xp: 65420, level: 165, streak: 180, avatar: '🧘', rankChange: 0 },
  { rank: 6, name: 'DeepFocus_King', xp: 54350, level: 150, streak: 150, avatar: '🔥', rankChange: 2 },
  { rank: 7, name: 'MindfulMaven', xp: 48280, level: 140, streak: 130, avatar: '💫', rankChange: 0 },
  { rank: 8, name: 'FlowState_OG', xp: 42150, level: 130, streak: 120, avatar: '🌊', rankChange: -2 },
  { rank: 9, name: 'ClearMind', xp: 38080, level: 120, streak: 100, avatar: '💎', rankChange: 1 },
  { rank: 10, name: 'LaserSharp', xp: 35980, level: 115, streak: 95, avatar: '✨', rankChange: -1 },
];

// Mock friends data
const MOCK_FRIENDS_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'BestFriend_Alex', xp: 3420, level: 35, streak: 28, avatar: '😊', rankChange: 1 },
  { rank: 2, name: 'StudyBuddy_Sam', xp: 2890, level: 30, streak: 21, avatar: '📚', rankChange: -1 },
  { rank: 3, name: 'GymBro_Jake', xp: 2150, level: 25, streak: 14, avatar: '💪', rankChange: 0 },
  { rank: 4, name: 'WorkFriend_Mia', xp: 1650, level: 20, streak: 10, avatar: '💼', rankChange: 2 },
  { rank: 5, name: 'Roomie_Chris', xp: 1420, level: 18, streak: 7, avatar: '🏠', rankChange: -1 },
];

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const insets = useSafeAreaInsets();
  const { progress } = useGame();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('weekly');

  // Get display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'You';
  const userAvatar = user?.avatarEmoji || '😊';

  // Create current user entry based on active tab
  const getCurrentUserEntry = (): LeaderboardEntry => {
    const baseEntry = {
      name: displayName,
      xp: progress?.xp || 0,
      level: progress?.level || 1,
      streak: progress?.streak || 0,
      avatar: userAvatar,
      isCurrentUser: true,
    };

    switch (activeTab) {
      case 'weekly':
        return { ...baseEntry, rank: 12, rankChange: 3 };
      case 'alltime':
        return { ...baseEntry, rank: 1542, rankChange: 25 };
      case 'friends':
        return { ...baseEntry, rank: 3, rankChange: 1 };
      default:
        return { ...baseEntry, rank: 12, rankChange: 0 };
    }
  };

  const currentUserEntry = getCurrentUserEntry();

  const getLeaderboardData = (): LeaderboardEntry[] => {
    switch (activeTab) {
      case 'weekly':
        return MOCK_WEEKLY_LEADERBOARD;
      case 'alltime':
        return MOCK_ALLTIME_LEADERBOARD;
      case 'friends':
        return MOCK_FRIENDS_LEADERBOARD;
      default:
        return MOCK_WEEKLY_LEADERBOARD;
    }
  };

  const leaderboardData = getLeaderboardData();

  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#9CA3AF';
  };

  const handleTabChange = (tab: LeaderboardTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const formatXP = (xp: number): string => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

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
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['weekly', 'alltime', 'friends'] as LeaderboardTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'weekly' ? 'This Week' : tab === 'alltime' ? 'All Time' : 'Friends'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Current User Card */}
        <View style={styles.currentUserSection}>
          <Text style={styles.sectionTitle}>Your Ranking</Text>
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentUserCard}
          >
            <View style={styles.currentUserLeft}>
              <View style={styles.currentUserRank}>
                <Text style={styles.currentUserRankText}>#{currentUserEntry.rank}</Text>
              </View>
              {currentUserEntry.rankChange !== 0 && (
                <View style={[
                  styles.rankChange,
                  { backgroundColor: currentUserEntry.rankChange > 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {currentUserEntry.rankChange > 0 ? (
                    <ArrowUpIcon size={10} color="#FFFFFF" />
                  ) : (
                    <ArrowDownIcon size={10} color="#FFFFFF" />
                  )}
                  <Text style={styles.rankChangeText}>
                    {Math.abs(currentUserEntry.rankChange)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.currentUserAvatar}>
              <Text style={styles.currentUserAvatarText}>{userAvatar}</Text>
            </View>

            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserName}>{displayName}</Text>
              <View style={styles.currentUserStats}>
                <Text style={styles.currentUserStat}>Lvl {currentUserEntry.level}</Text>
                <Text style={styles.currentUserStatDivider}>•</Text>
                <Text style={styles.currentUserStat}>{formatXP(currentUserEntry.xp)} XP</Text>
                <Text style={styles.currentUserStatDivider}>•</Text>
                <View style={styles.streakBadge}>
                  <FlameIcon size={12} color="#FF9500" />
                  <Text style={styles.streakText}>{currentUserEntry.streak}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Top Performers */}
        <Text style={styles.sectionTitle}>
          {activeTab === 'weekly' ? 'Top This Week' : activeTab === 'alltime' ? 'All-Time Legends' : 'Top Friends'}
        </Text>

        {/* Top 3 Podium */}
        {leaderboardData.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={styles.podiumItem}>
              <View style={[styles.podiumMedal, { backgroundColor: '#C0C0C0' }]}>
                <SilverMedalIcon size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.podiumAvatar}>{leaderboardData[1].avatar}</Text>
              <Text style={styles.podiumName} numberOfLines={1}>{leaderboardData[1].name}</Text>
              <Text style={styles.podiumXP}>{formatXP(leaderboardData[1].xp)} XP</Text>
              <View style={[styles.podiumBase, { height: 80, backgroundColor: 'rgba(192, 192, 192, 0.2)' }]}>
                <Text style={styles.podiumRank}>2</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumItem, { marginTop: -20 }]}>
              <View style={[styles.podiumMedal, { backgroundColor: '#FFD700', width: 56, height: 56 }]}>
                <GoldCrownIcon size={32} color="#FFFFFF" />
              </View>
              <Text style={[styles.podiumAvatar, { fontSize: 32 }]}>{leaderboardData[0].avatar}</Text>
              <Text style={[styles.podiumName, { fontSize: 16, fontWeight: '800' }]} numberOfLines={1}>
                {leaderboardData[0].name}
              </Text>
              <Text style={styles.podiumXP}>{formatXP(leaderboardData[0].xp)} XP</Text>
              <View style={[styles.podiumBase, { height: 100, backgroundColor: 'rgba(255, 215, 0, 0.25)' }]}>
                <Text style={styles.podiumRank}>1</Text>
              </View>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumItem}>
              <View style={[styles.podiumMedal, { backgroundColor: '#CD7F32' }]}>
                <BronzeMedalIcon size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.podiumAvatar}>{leaderboardData[2].avatar}</Text>
              <Text style={styles.podiumName} numberOfLines={1}>{leaderboardData[2].name}</Text>
              <Text style={styles.podiumXP}>{formatXP(leaderboardData[2].xp)} XP</Text>
              <View style={[styles.podiumBase, { height: 60, backgroundColor: 'rgba(205, 127, 50, 0.2)' }]}>
                <Text style={styles.podiumRank}>3</Text>
              </View>
            </View>
          </View>
        )}

        {/* Rest of Leaderboard */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Full Rankings</Text>

        {leaderboardData.slice(3).map((entry) => (
          <View key={entry.rank} style={styles.leaderboardEntry}>
            <View style={styles.entryLeft}>
              <View style={[styles.entryRank, { borderColor: getRankColor(entry.rank) }]}>
                <Text style={[styles.entryRankText, { color: getRankColor(entry.rank) }]}>
                  {entry.rank}
                </Text>
              </View>
              {entry.rankChange !== undefined && entry.rankChange !== 0 && (
                <View style={[
                  styles.miniRankChange,
                  { backgroundColor: entry.rankChange > 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {entry.rankChange > 0 ? (
                    <ArrowUpIcon size={8} color="#FFFFFF" />
                  ) : (
                    <ArrowDownIcon size={8} color="#FFFFFF" />
                  )}
                </View>
              )}
            </View>

            <Text style={styles.entryAvatar}>{entry.avatar}</Text>

            <View style={styles.entryInfo}>
              <Text style={styles.entryName}>{entry.name}</Text>
              <View style={styles.entrySubInfo}>
                <Text style={styles.entryLevel}>Lvl {entry.level}</Text>
                <View style={styles.entryStreak}>
                  <FlameIcon size={10} color="#FF9500" />
                  <Text style={styles.entryStreakText}>{entry.streak}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.entryXP}>{formatXP(entry.xp)} XP</Text>
          </View>
        ))}

        {/* Empty state for friends */}
        {activeTab === 'friends' && leaderboardData.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>No Friends Yet</Text>
            <Text style={styles.emptyDescription}>
              Invite friends to compete and see who can stay focused the longest!
            </Text>
            <TouchableOpacity style={styles.inviteButton}>
              <Text style={styles.inviteButtonText}>Invite Friends</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Motivational message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={styles.motivationText}>
            {activeTab === 'weekly'
              ? 'Keep practicing to climb the weekly ranks!'
              : activeTab === 'alltime'
              ? 'Every XP counts towards your legacy!'
              : 'Challenge your friends to stay focused!'}
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
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

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },

  // Current User
  currentUserSection: {
    marginBottom: 24,
  },
  currentUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  currentUserLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  currentUserRank: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserRankText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    gap: 2,
  },
  rankChangeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentUserAvatarText: {
    fontSize: 24,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentUserStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUserStat: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  currentUserStatDivider: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    fontSize: 13,
    color: '#FF9500',
    fontWeight: '700',
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumMedal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumAvatar: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  podiumXP: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  podiumBase: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    paddingTop: 12,
  },
  podiumRank: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Leaderboard Entries
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  entryLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  entryRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryRankText: {
    fontSize: 14,
    fontWeight: '800',
  },
  miniRankChange: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  entryAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  entrySubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  entryStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  entryStreakText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  entryXP: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginTop: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Motivation Card
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  motivationEmoji: {
    fontSize: 24,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});
