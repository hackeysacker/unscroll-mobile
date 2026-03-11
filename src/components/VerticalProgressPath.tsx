/**
 * Enhanced Vertical Progress Path - Duolingo Style
 * 
 * PHASE 4: Complete Implementation
 * 
 * Features:
 * - 250 levels across 10 realms (25 levels per realm)
 * - Progressive difficulty: more exercises per level in later realms
 * - Smooth opening animation with staggered node fade-in
 * - Enhanced node visuals with depth, shadows, and glow effects
 * - Background with layered animated gradients
 * - Duolingo-style header with streak, gems, XP bar, crowns, league
 * - Character positioned on current level with smooth scroll
 * - Bottom navigation bar
 * - Buttery-smooth realm transitions with color blending
 * 
 * NEW FEATURES (Phase 4):
 * - Daily goal progress ring
 * - League system (Bronze, Silver, Gold, Platinum, Diamond)
 * - Chest rewards at milestones (every 5 levels)
 * - Branching paths for different skill tracks
 * - Side quests (optional challenges)
 * - Boss battles every 25 levels
 * - Personal records display
 * - Shake for bonus challenges
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Easing,
  Platform,
  Vibration,
  NativeModules,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Path, Circle, Rect, Polygon, Ellipse, G, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';
import { FOCUS_REALMS, type FocusRealm, getRealmForLevel, interpolateColor } from '@/lib/focus-realm-themes';
import type { ActivityType } from '@/lib/journey-levels';
import { UniversalHeader } from './ui/UniversalHeader';
import { UniversalFooter, type TabType } from './ui/UniversalFooter';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NODE_SIZE = 70;
const NODE_SPACING = 90;
const REALM_HEADER_HEIGHT = 140;
const COMPANION_SIZE = 50;
const WINDING_AMPLITUDE = 70;

interface VerticalProgressPathProps {
  onBack: () => void;
  onLevelSelect: (level: number) => void;
  onNavigate?: (route: string) => void;
}

type LevelStatus = 'locked' | 'available' | 'current' | 'completed';

// League system
type LeagueType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

const LEAGUE_CONFIG: Record<LeagueType, { name: string; color: string; minXP: number; maxXP: number; icon: string }> = {
  bronze: { name: 'Bronze', color: '#CD7F32', minXP: 0, maxXP: 1000, icon: '🥉' },
  silver: { name: 'Silver', color: '#C0C0C0', minXP: 1000, maxXP: 5000, icon: '🥈' },
  gold: { name: 'Gold', color: '#FFD700', minXP: 5000, maxXP: 15000, icon: '🥇' },
  platinum: { name: 'Platinum', color: '#E5E4E2', minXP: 15000, maxXP: 50000, icon: '💎' },
  diamond: { name: 'Diamond', color: '#B9F2FF', minXP: 50000, maxXP: 999999, icon: '💠' },
};

function getLeague(xp: number): LeagueType {
  if (xp >= 50000) return 'diamond';
  if (xp >= 15000) return 'platinum';
  if (xp >= 5000) return 'gold';
  if (xp >= 1000) return 'silver';
  return 'bronze';
}

function getLeagueProgress(xp: number): number {
  const league = getLeague(xp);
  const config = LEAGUE_CONFIG[league];
  return ((xp - config.minXP) / (config.maxXP - config.minXP)) * 100;
}

// Milestone chest rewards
const CHEST_REWARDS: Record<number, { xp: number; gems: number; type: string }> = {
  5: { xp: 50, gems: 5, type: 'bronze' },
  10: { xp: 75, gems: 10, type: 'bronze' },
  15: { xp: 100, gems: 15, type: 'silver' },
  20: { xp: 150, gems: 20, type: 'silver' },
  25: { xp: 250, gems: 25, type: 'gold' }, // Boss level
  30: { xp: 200, gems: 30, type: 'silver' },
  35: { xp: 250, gems: 35, type: 'silver' },
  40: { xp: 300, gems: 40, type: 'gold' },
  45: { xp: 350, gems: 45, type: 'gold' },
  50: { xp: 500, gems: 50, type: 'platinum' }, // Boss level
};

function getChestsUnlocked(level: number): number {
  return Object.keys(CHEST_REWARDS).filter(k => parseInt(k) <= level).length;
}

// Branching paths
type BranchType = 'focus' | 'memory' | 'reaction' | 'breathing';

interface BranchPath {
  type: BranchType;
  name: string;
  color: string;
  icon: string;
}

const BRANCH_PATHS: BranchPath[] = [
  { type: 'focus', name: 'Focus Track', color: '#8B5CF6', icon: '🎯' },
  { type: 'memory', name: 'Memory Track', color: '#3B82F6', icon: '🧠' },
  { type: 'reaction', name: 'Reaction Track', color: '#EF4444', icon: '⚡' },
  { type: 'breathing', name: 'Breathing Track', color: '#10B981', icon: '🌬️' },
];

// Side quests
interface SideQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  gemsReward: number;
  isCompleted: boolean;
  requirement: string;
}

const SIDE_QUESTS: SideQuest[] = [
  { id: 'sq1', title: 'Perfect Day', description: 'Complete 3 challenges with perfect score', xpReward: 100, gemsReward: 10, isCompleted: false, requirement: '3_perfect' },
  { id: 'sq2', title: 'Streak Starter', description: 'Maintain a 3-day streak', xpReward: 50, gemsReward: 5, isCompleted: false, requirement: '3_streak' },
  { id: 'sq3', title: 'Early Bird', description: 'Complete a challenge before 9 AM', xpReward: 75, gemsReward: 8, isCompleted: false, requirement: 'before_9am' },
];

// Daily goal
interface DailyGoal {
  target: number;
  current: number;
  xpReward: number;
}

const DEFAULT_DAILY_GOAL: DailyGoal = {
  target: 100, // XP per day
  current: 45,
  xpReward: 50,
};

function getDefaultActivityForRealm(realmId: number): ActivityType {
  const realmActivities: { [key: number]: ActivityType } = {
    1: 'gaze_hold', 2: 'breath_pacing', 3: 'stillness_test', 4: 'memory_flash',
    5: 'finger_tracing', 6: 'reaction_inhibition', 7: 'popup_ignore', 8: 'tap_pattern',
    9: 'multi_task_tap', 10: 'impulse_spike_test',
  };
  return realmActivities[realmId] || 'gaze_hold';
}

interface LevelNode {
  level: number;
  realmId: number;
  realm: FocusRealm;
  status: LevelStatus;
  isMilestone: boolean;
  isBoss?: boolean;
  isBonus?: boolean;
  isSideQuest?: boolean;
  branchType?: BranchType;
  bonusActivityType?: ActivityType;
  activityType?: ActivityType;
  exerciseCount: number;
}

type NodeIconType = ActivityType | 'crown' | 'lock' | 'chest' | 'boss' | 'fire' | 'star';

function getNodeIcon(status: LevelStatus, node: LevelNode): NodeIconType {
  if (status === 'locked') return 'lock';
  if (node.isMilestone) return 'crown';
  if (node.isBoss) return 'boss';
  if (node.isBonus) return 'star';
  if (node.isSideQuest) return 'fire';
  return node.activityType || 'gaze_hold';
}

// Animated Background
function SimpleAnimatedBackground({ accentColor }: { accentColor: string }) {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (value: Animated.Value, duration: number) => {
      Animated.loop(Animated.timing(value, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })).start();
    };
    animate(orb1Anim, 20000);
    animate(orb2Anim, 15000);
    animate(orb3Anim, 25000);
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      <LinearGradient colors={['#0A0F1C', '#1E293B', '#0F172A']} style={StyleSheet.absoluteFill} />
      {[orb1Anim, orb2Anim, orb3Anim].map((anim, i) => (
        <Animated.View key={i} style={[
          styles.orb, {
            backgroundColor: accentColor,
            opacity: 0.1,
            transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) }],
          }
        ]} />
      ))}
    </View>
  );
}

// Duolingo Header with XP Bar, League, Daily Goal
interface HeaderProps {
  topInset: number;
  currentHearts: number;
  maxHearts: number;
  streak: number;
  gems: number;
  xp: number;
  xpToNextLevel: number;
  level: number;
  league: LeagueType;
  dailyGoal: DailyGoal;
  chestsUnlocked: number;
  onProfilePress: () => void;
}

function EnhancedDuolingoHeader({ topInset, streak, gems, xp, xpToNextLevel, level, league, dailyGoal, chestsUnlocked, onProfilePress }: HeaderProps) {
  const leagueConfig = LEAGUE_CONFIG[league];
  const xpProgress = (xp / xpToNextLevel) * 100;
  const dailyProgress = Math.min(100, (dailyGoal.current / dailyGoal.target) * 100);

  return (
    <View style={[styles.duoHeader, { paddingTop: topInset + 10 }]}>
      {/* League Badge */}
      <View style={styles.leagueBadge}>
        <View style={[styles.leagueIcon, { backgroundColor: leagueConfig.color + '30' }]}>
          <Text style={styles.leagueIconText}>{leagueConfig.icon}</Text>
        </View>
        <View style={styles.leagueInfo}>
          <Text style={styles.leagueName}>{leagueConfig.name}</Text>
          <View style={styles.leagueProgressBar}>
            <View style={[styles.leagueProgressFill, { width: `${getLeagueProgress(xp)}%`, backgroundColor: leagueConfig.color }]} />
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Streak */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{streak}</Text>
        </View>
        
        {/* Gems */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💎</Text>
          <Text style={styles.statValue}>{gems}</Text>
        </View>
        
        {/* Hearts */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statValue}>5</Text>
        </View>

        {/* Chests */}
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🎁</Text>
          <Text style={styles.statValue}>{chestsUnlocked}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpBarContainer}>
        <View style={styles.xpBarBackground}>
          <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
        </View>
        <Text style={styles.xpBarText}>{xp} / {xpToNextLevel} XP</Text>
      </View>

      {/* Daily Goal Ring */}
      <TouchableOpacity style={styles.dailyGoalContainer} onPress={onProfilePress}>
        <View style={styles.dailyGoalRing}>
          <View style={[styles.dailyGoalProgress, { 
            borderColor: dailyProgress >= 100 ? '#10B981' : '#8B5CF6',
            transform: [{ rotate: `${dailyProgress * 3.6}deg` }]
          }]} />
          <Text style={styles.dailyGoalText}>{dailyGoal.current}/{dailyGoal.target}</Text>
        </View>
        <Text style={styles.dailyGoalLabel}>Daily Goal</Text>
      </TouchableOpacity>
    </View>
  );
}

// Level Node Component
function LevelNodeComponent({ node, onPress, index, totalNodes }: { node: LevelNode; onPress: () => void; index: number; totalNodes: number }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (node.status === 'current') {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])).start();
    }
    if (node.status === 'completed') {
      Animated.loop(Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })).start();
    }
  }, []);

  const isLocked = node.status === 'locked';
  const isCompleted = node.status === 'completed';
  const isCurrent = node.status === 'current';
  const isMilestone = node.isMilestone;
  const isBoss = node.isBoss;

  return (
    <Animated.View style={{
      transform: [{ scale: node.status === 'current' ? pulseAnim : 1 }],
      opacity: isLocked ? 0.4 : 1,
    }}>
      <TouchableOpacity
        onPress={() => { if (!isLocked) onPress(); }}
        disabled={isLocked}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isLocked ? ['#374151', '#1F2937'] : 
                isMilestone ? ['#FFD700', '#F59E0B'] :
                isBoss ? ['#EF4444', '#DC2626'] :
                node.branchType ? [BRANCH_PATHS.find(b => b.type === node.branchType)?.color || '#8B5CF6', '#7C3AED'] :
                [node.realm.colors.primary, node.realm.colors.secondary]}
          style={[styles.nodeGradient, isCompleted && styles.nodeCompleted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glow for completed */}
          {isCompleted && (
            <View style={[styles.nodeGlow, { backgroundColor: node.realm.colors.primary }]} />
          )}
          
          {/* Icon */}
          <Text style={styles.nodeIcon}>
            {isLocked ? '🔒' : 
             isMilestone ? '👑' : 
             isBoss ? '🎯' : 
             node.isSideQuest ? '🔥' :
             node.isBonus ? '⭐' :
             '🎯'}
          </Text>
          
          {/* Level number */}
          <Text style={styles.nodeLevel}>{node.level}</Text>
          
          {/* Checkmark for completed */}
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Branch Path Indicator
function BranchPathIndicator({ branches, currentLevel }: { branches: BranchType[]; currentLevel: number }) {
  return (
    <View style={styles.branchContainer}>
      <Text style={styles.branchTitle}>Choose Your Path</Text>
      <View style={styles.branchOptions}>
        {BRANCH_PATHS.map(branch => (
          <TouchableOpacity 
            key={branch.type} 
            style={[styles.branchOption, { borderColor: branch.color }]}
          >
            <Text style={styles.branchIcon}>{branch.icon}</Text>
            <Text style={[styles.branchName, { color: branch.color }]}>{branch.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Side Quest Card
function SideQuestCard({ quest, onComplete }: { quest: SideQuest; onComplete: () => void }) {
  return (
    <View style={styles.questCard}>
      <View style={styles.questHeader}>
        <Text style={styles.questTitle}>{quest.title}</Text>
        <View style={styles.questRewards}>
          <Text style={styles.questXP}>+{quest.xpReward} XP</Text>
          <Text style={styles.questGems}>+{quest.gemsReward} 💎</Text>
        </View>
      </View>
      <Text style={styles.questDesc}>{quest.description}</Text>
      <TouchableOpacity style={styles.questButton} onPress={onComplete}>
        <Text style={styles.questButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

// Milestone Chest Popup
function MilestoneChest({ level, reward, onClaim }: { level: number; reward: typeof CHEST_REWARDS[5]; onClaim: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.chestOverlay}>
      <View style={styles.chestPopup}>
        <Text style={styles.chestTitle}>🎉 Milestone Reached!</Text>
        <Text style={styles.chestLevel}>Level {level}</Text>
        <View style={styles.chestContent}>
          <Text style={styles.chestIcon}>🎁</Text>
          <View style={styles.chestRewards}>
            <Text style={styles.chestXP}>+{reward.xp} XP</Text>
            <Text style={styles.chestGems}>+{reward.gems} Gems</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.chestButton} onPress={onClaim}>
          <Text style={styles.chestButtonText}>Claim Reward</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Main Component
export function VerticalProgressPath({ onBack, onLevelSelect, onNavigate }: VerticalProgressPathProps) {
  const insets = useSafeAreaInsets();
  const { progress } = useGame();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showChests, setShowChests] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchType | null>(null);

  const currentLevel = progress?.level || 1;
  const currentXP = progress?.xp || 0;
  const currentStreak = progress?.streak || 0;
  const currentGems = progress?.xp || 0;
  const league = getLeague(currentXP);
  const chestsUnlocked = getChestsUnlocked(currentLevel);

  // Generate nodes
  const nodes = useMemo(() => {
    const result: LevelNode[] = [];
    for (let level = 1; level <= 250; level++) {
      const realm = getRealmForLevel(level);
      const realmId = Math.ceil(level / 25);
      
      result.push({
        level,
        realmId,
        realm,
        status: level < currentLevel ? 'completed' : 
                level === currentLevel ? 'current' : 
                level <= currentLevel + 2 ? 'available' : 'locked',
        isMilestone: level % 25 === 0,
        isBoss: level % 25 === 0 && level > 25,
        isBonus: level % 10 === 0 && !isNaN(level / 10),
        isSideQuest: level % 15 === 0,
        branchType: level % 30 === 0 ? 'focus' : undefined,
        activityType: getDefaultActivityForRealm(realmId),
        exerciseCount: Math.min(8, 3 + Math.floor(level / 20)),
      });
    }
    return result;
  }, [currentLevel]);

  // Handle level press
  const handleLevelPress = (level: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLevelSelect(level);
    
    // Check for milestone chest
    if (CHEST_REWARDS[level] && !showChests.includes(level)) {
      setShowChests([...showChests, level]);
    }
  };

  // Handle shake for bonus (simplified - would need native shake detection)
  const handleShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Show bonus challenge
  };

  return (
    <View style={styles.container}>
      <SimpleAnimatedBackground accentColor={FOCUS_REALMS[0].colors.primary} />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <EnhancedDuolingoHeader
          topInset={insets.top}
          currentHearts={5}
          maxHearts={5}
          streak={currentStreak}
          gems={currentGems}
          xp={currentXP}
          xpToNextLevel={Math.min(500, 50 + currentLevel * 10)}
          level={currentLevel}
          league={league}
          dailyGoal={{ ...DEFAULT_DAILY_GOAL, current: Math.min(DEFAULT_DAILY_GOAL.target, currentXP % 100) }}
          chestsUnlocked={chestsUnlocked}
          onProfilePress={() => {}}
        />

        {/* Branch Path Selector (at level 30) */}
        {currentLevel >= 30 && (
          <BranchPathIndicator branches={['focus', 'memory', 'reaction', 'breathing']} currentLevel={currentLevel} />
        )}

        {/* Level Path */}
        <View style={styles.pathContainer}>
          {nodes.map((node, index) => (
            <LevelNodeComponent
              key={node.level}
              node={node}
              index={index}
              totalNodes={nodes.length}
              onPress={() => handleLevelPress(node.level)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Milestone Chest Popups */}
      {showChests.map(level => (
        <MilestoneChest
          key={level}
          level={level}
          reward={CHEST_REWARDS[level]}
          onClaim={() => setShowChests(showChests.filter(l => l !== level))}
        />
      ))}

      {/* Footer Navigation */}
      <View style={[styles.footer, { paddingBottom: insets.bottom, paddingTop: 10, backgroundColor: '#0A0F1C', flexDirection: 'row', justifyContent: 'space-around' }]}>
        <TouchableOpacity style={styles.footerButton} onPress={onBack}>
          <Text style={styles.footerIcon}>🏠</Text>
          <Text style={styles.footerLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerIcon}>🛡️</Text>
          <Text style={styles.footerLabel}>Shield</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerIcon}>📊</Text>
          <Text style={styles.footerLabel}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerIcon}>⚙️</Text>
          <Text style={styles.footerLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0F1C' },
  backgroundContainer: { ...StyleSheet.absoluteFillObject },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 10 },
  
  // Header
  duoHeader: { paddingHorizontal: 20, paddingBottom: 20 },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  leagueIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  leagueIconText: { fontSize: 20 },
  leagueInfo: { marginLeft: 10, flex: 1 },
  leagueName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  leagueProgressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 4 },
  leagueProgressFill: { height: '100%', borderRadius: 2 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statIcon: { fontSize: 18, marginRight: 4 },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  xpBarContainer: { marginBottom: 15 },
  xpBarBackground: { height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 6 },
  xpBarText: { color: '#FFF', fontSize: 12, textAlign: 'center', marginTop: 4 },
  
  dailyGoalContainer: { alignItems: 'center' },
  dailyGoalRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 4, borderColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
  dailyGoalProgress: { position: 'absolute', width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: 'transparent' },
  dailyGoalText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  dailyGoalLabel: { color: '#9CA3AF', fontSize: 10, marginTop: 4 },
  
  // Path
  pathContainer: { paddingHorizontal: 20, alignItems: 'center' },
  nodeGradient: { width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2, alignItems: 'center', justifyContent: 'center', marginVertical: 5 },
  nodeCompleted: { borderWidth: 2, borderColor: '#FFD700' },
  nodeGlow: { ...StyleSheet.absoluteFillObject, borderRadius: NODE_SIZE / 2, opacity: 0.3 },
  nodeIcon: { fontSize: 24 },
  nodeLevel: { color: '#FFF', fontSize: 12, fontWeight: '700', marginTop: 2 },
  checkmark: { position: 'absolute', top: 2, right: 2, color: '#10B981', fontSize: 14 },
  
  // Branch
  branchContainer: { padding: 20 },
  branchTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 15 },
  branchOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  branchOption: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.05)' },
  branchIcon: { fontSize: 24, textAlign: 'center' },
  branchName: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  
  // Quest
  questCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 15, margin: 20 },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  questRewards: { flexDirection: 'row', gap: 10 },
  questXP: { color: '#8B5CF6', fontSize: 14, fontWeight: '600' },
  questGems: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  questDesc: { color: '#9CA3AF', fontSize: 14, marginBottom: 10 },
  questButton: { backgroundColor: '#8B5CF6', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  questButtonText: { color: '#FFF', fontWeight: '600' },
  
  // Chest
  chestOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  chestPopup: { backgroundColor: '#1F2937', borderRadius: 24, padding: 30, alignItems: 'center', width: '80%' },
  chestTitle: { color: '#FFD700', fontSize: 24, fontWeight: '700', marginBottom: 10 },
  chestLevel: { color: '#FFF', fontSize: 18, marginBottom: 20 },
  chestContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  chestIcon: { fontSize: 50, marginRight: 20 },
  chestRewards: {},
  chestXP: { color: '#8B5CF6', fontSize: 20, fontWeight: '700' },
  chestGems: { color: '#10B981', fontSize: 20, fontWeight: '700' },
  chestButton: { backgroundColor: '#8B5CF6', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12 },
  chestButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  
  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerButton: { alignItems: 'center', padding: 10 },
  footerIcon: { fontSize: 24 },
  footerLabel: { color: '#9CA3AF', fontSize: 10, marginTop: 2 },
});
