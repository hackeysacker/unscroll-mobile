/**
 * Achievements Screen - Full achievements gallery with filters
 */

import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { BADGE_DEFINITIONS, getBadgeProgressPercentage } from '@/lib/badge-mechanics';
import { loadFromStorage, STORAGE_KEYS } from '@/lib/storage';
import type { BadgeType, ChallengeResult } from '@/types';
import Svg, { Path, Circle } from 'react-native-svg';

function TrophyIcon({ size, color }: { size: number; color: string }) {
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

interface AchievementsScreenProps {
  onBack: () => void;
}

export function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const insets = useSafeAreaInsets();
  const { progress, skillTree, badgeProgress } = useGame();
  const { user } = useAuth();
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'>('all');
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

  // Get all badges with their unlock status
  const allBadges = useMemo(() => {
    if (!badgeProgress || !progress || !skillTree) return [];
    
    const unlockedTypes = new Set(badgeProgress.unlockedBadges.map(b => b.type));
    const unlockedBadgesMap = new Map(badgeProgress.unlockedBadges.map(b => [b.type, b]));
    const allBadgeTypes = Object.keys(BADGE_DEFINITIONS) as BadgeType[];
    
    return allBadgeTypes.map(badgeType => {
      const definition = BADGE_DEFINITIONS[badgeType];
      const isUnlocked = unlockedTypes.has(badgeType);
      const unlockedBadge = unlockedBadgesMap.get(badgeType);
      const badgeProgressData = getBadgeProgressPercentage(badgeType, badgeProgress, progress, skillTree, challengeResults);
      
      return {
        type: badgeType,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
        unlocked: isUnlocked,
        progress: badgeProgressData.percentage,
        unlockedAt: unlockedBadge?.unlockedAt,
      };
    }).sort((a, b) => {
      // Sort: unlocked first (by unlock time), then locked by rarity
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      if (a.unlocked && b.unlocked && a.unlockedAt && b.unlockedAt) {
        return b.unlockedAt - a.unlockedAt; // Most recent first
      }
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }, [badgeProgress, progress, skillTree, challengeResults]);

  // Filter badges based on selected filter
  const filteredBadges = useMemo(() => {
    if (achievementFilter === 'all') return allBadges;
    if (achievementFilter === 'unlocked') return allBadges.filter(b => b.unlocked);
    if (achievementFilter === 'locked') return allBadges.filter(b => !b.unlocked);
    return allBadges.filter(b => b.rarity === achievementFilter);
  }, [allBadges, achievementFilter]);

  const unlockedCount = allBadges.filter(b => b.unlocked).length;
  const totalCount = allBadges.length;

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
        <View style={styles.headerTitleContainer}>
          <TrophyIcon size={28} color="#F59E0B" />
          <Text style={styles.headerTitle}>Achievements</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount - unlockedCount}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'unlocked', 'locked', 'common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                achievementFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setAchievementFilter(filter);
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  achievementFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements Grid */}
        <View style={styles.achievementsGrid}>
          {filteredBadges.map((badge) => {
            const rarityColors = {
              common: '#9CA3AF',
              uncommon: '#10B981',
              rare: '#3B82F6',
              epic: '#8B5CF6',
              legendary: '#F59E0B',
            };
            const rarityColor = rarityColors[badge.rarity];

            return (
              <TouchableOpacity
                key={badge.type}
                style={[
                  styles.achievementCard,
                  !badge.unlocked && styles.achievementLocked,
                  badge.unlocked && { borderColor: rarityColor, borderWidth: 2 },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.achievementIconContainer}>
                  <Text style={styles.achievementEmoji}>{badge.unlocked ? badge.icon : '🔒'}</Text>
                  {badge.unlocked && (
                    <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                      <Text style={styles.rarityText}>{badge.rarity.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.achievementTitle,
                    !badge.unlocked && styles.achievementTitleLocked,
                  ]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
                <Text
                  style={[
                    styles.achievementDescription,
                    !badge.unlocked && styles.achievementDescriptionLocked,
                  ]}
                  numberOfLines={2}
                >
                  {badge.description}
                </Text>
                {!badge.unlocked && badge.progress > 0 && (
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${badge.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{badge.progress}%</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIconContainer: {
    marginBottom: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 32,
  },
  rarityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  achievementDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  achievementDescriptionLocked: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

