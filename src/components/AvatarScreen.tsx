import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AttentionAvatar } from '@/components/AttentionAvatar';
import { useAttentionAvatar } from '@/contexts/AttentionAvatarContext';
import { useGame } from '@/contexts/GameContext';
import { Header } from '@/components/ui/Header';
import { AVATAR_EVOLUTIONS, getSkinColors, type AvatarSkin, type AvatarStage } from '@/lib/avatar-evolution';
import { useState, useRef, useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// All evolution stages in order
const EVOLUTION_ORDER: AvatarStage[] = [
  'spark', 'ember', 'flame', 'orb', 'wisp', 'sprite', 'spirit', 'guardian', 'sage', 'celestial', 'master'
];

interface AvatarScreenProps {
  onBack: () => void;
}

const AVAILABLE_SKINS: { id: AvatarSkin; name: string; emoji: string }[] = [
  { id: 'default', name: 'Classic', emoji: '⚪' },
  { id: 'fire', name: 'Fire', emoji: '🔥' },
  { id: 'water', name: 'Aqua', emoji: '💧' },
  { id: 'nature', name: 'Forest', emoji: '🌿' },
  { id: 'cosmic', name: 'Cosmic', emoji: '🌌' },
  { id: 'shadow', name: 'Shadow', emoji: '🌑' },
  { id: 'gold', name: 'Golden', emoji: '✨' },
  { id: 'rainbow', name: 'Prismatic', emoji: '🌈' },
];

export function AvatarScreen({ onBack }: AvatarScreenProps) {
  const { avatarState, currentEvolution, updateName, changeSkin } = useAttentionAvatar();
  const { progress, stats } = useGame();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(avatarState.name);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Calculate avatar stats
  const avatarStats = useMemo(() => {
    const level = progress?.level || 1;
    const totalXp = progress?.totalXp || 0;
    const streak = progress?.streak || 0;
    const challengesCompleted = stats?.challengesCompleted || 0;
    const bestScore = stats?.bestScore || 0;
    const totalTime = stats?.totalTrainingTime || 0;

    // Calculate derived stats
    const power = Math.min(100, Math.round(level * 0.5 + streak * 2 + bestScore * 0.1));
    const wisdom = Math.min(100, Math.round(challengesCompleted * 0.3 + level * 0.3));
    const endurance = Math.min(100, Math.round((totalTime / 60000) * 0.5 + streak * 3));
    const focus = Math.min(100, Math.round(bestScore * 0.8 + streak * 1.5));

    return {
      power,
      wisdom,
      endurance,
      focus,
      totalXp,
      challengesCompleted,
      hoursTraining: Math.round(totalTime / 3600000 * 10) / 10,
      perfectScores: Math.round(challengesCompleted * 0.15), // Estimate
    };
  }, [progress, stats]);

  // Current evolution index
  const currentEvolutionIndex = EVOLUTION_ORDER.indexOf(avatarState.stage);

  const handleSaveName = async () => {
    if (newName.trim()) {
      await updateName(newName.trim());
      setIsEditingName(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSkinChange = async (skin: AvatarSkin) => {
    await changeSkin(skin);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const nextEvolution = Object.values(AVATAR_EVOLUTIONS).find(
    (evo) => evo.minLevel > (progress?.level || 1)
  );

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#030712', '#0a0a1a', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Your Companion" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Avatar Display Card */}
          <View style={styles.avatarCard}>
            <LinearGradient
              colors={['#1a1a3a', '#0a0a1a']}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />

            <View style={styles.avatarDisplayWrapper}>
              <View style={styles.avatarDisplay}>
                {/* Animated glow behind avatar */}
                <Animated.View
                  style={[
                    styles.avatarGlowBg,
                    {
                      backgroundColor: getSkinColors(avatarState.skin, currentEvolution.colors).primary,
                      opacity: glowAnim.interpolate({
                        inputRange: [0.5, 1],
                        outputRange: [0.2, 0.4],
                      }),
                    },
                  ]}
                />
                <AttentionAvatar size="large" showParticles={true} />
              </View>
            </View>

            {/* Name Section */}
            <View style={styles.nameSection}>
              {isEditingName ? (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Enter name..."
                    placeholderTextColor="#6B7280"
                    maxLength={20}
                    autoFocus
                  />
                  <View style={styles.nameButtons}>
                    <TouchableOpacity
                      style={[styles.nameButton, { backgroundColor: '#6366F1' }]}
                      onPress={handleSaveName}
                    >
                      <Text style={styles.nameButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.nameButton, { backgroundColor: '#374151' }]}
                      onPress={() => {
                        setNewName(avatarState.name);
                        setIsEditingName(false);
                      }}
                    >
                      <Text style={styles.nameButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameDisplay}>
                  <Text style={styles.avatarName}>{avatarState.name}</Text>
                  <Text style={styles.editHint}>Tap to rename</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Current Stage Badge */}
            <View style={[styles.stageBadge, { backgroundColor: currentEvolution.colors.primary + '30' }]}>
              <Text style={styles.stageEmoji}>{currentEvolution.emoji}</Text>
              <View>
                <Text style={[styles.stageName, { color: currentEvolution.colors.primary }]}>
                  {currentEvolution.name}
                </Text>
                <Text style={styles.stageDescription}>{currentEvolution.description}</Text>
              </View>
            </View>
          </View>

          {/* Power Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Power Stats</Text>
            <View style={styles.powerStatsGrid}>
              <View style={styles.powerStat}>
                <View style={styles.powerStatHeader}>
                  <Text style={styles.powerStatEmoji}>⚡</Text>
                  <Text style={styles.powerStatLabel}>Power</Text>
                </View>
                <View style={styles.powerStatBar}>
                  <LinearGradient
                    colors={['#EF4444', '#F97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.powerStatFill, { width: `${avatarStats.power}%` }]}
                  />
                </View>
                <Text style={styles.powerStatValue}>{avatarStats.power}</Text>
              </View>

              <View style={styles.powerStat}>
                <View style={styles.powerStatHeader}>
                  <Text style={styles.powerStatEmoji}>🧠</Text>
                  <Text style={styles.powerStatLabel}>Wisdom</Text>
                </View>
                <View style={styles.powerStatBar}>
                  <LinearGradient
                    colors={['#8B5CF6', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.powerStatFill, { width: `${avatarStats.wisdom}%` }]}
                  />
                </View>
                <Text style={styles.powerStatValue}>{avatarStats.wisdom}</Text>
              </View>

              <View style={styles.powerStat}>
                <View style={styles.powerStatHeader}>
                  <Text style={styles.powerStatEmoji}>🛡️</Text>
                  <Text style={styles.powerStatLabel}>Endurance</Text>
                </View>
                <View style={styles.powerStatBar}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.powerStatFill, { width: `${avatarStats.endurance}%` }]}
                  />
                </View>
                <Text style={styles.powerStatValue}>{avatarStats.endurance}</Text>
              </View>

              <View style={styles.powerStat}>
                <View style={styles.powerStatHeader}>
                  <Text style={styles.powerStatEmoji}>🎯</Text>
                  <Text style={styles.powerStatLabel}>Focus</Text>
                </View>
                <View style={styles.powerStatBar}>
                  <LinearGradient
                    colors={['#06B6D4', '#0891B2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.powerStatFill, { width: `${avatarStats.focus}%` }]}
                  />
                </View>
                <Text style={styles.powerStatValue}>{avatarStats.focus}</Text>
              </View>
            </View>
          </View>

          {/* Evolution Tree */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolution Path</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evolutionScroll}>
              <View style={styles.evolutionTree}>
                {EVOLUTION_ORDER.map((stage, index) => {
                  const evolution = AVATAR_EVOLUTIONS[stage];
                  const isUnlocked = index <= currentEvolutionIndex;
                  const isCurrent = index === currentEvolutionIndex;

                  return (
                    <View key={stage} style={styles.evolutionNodeWrapper}>
                      {index > 0 && (
                        <View
                          style={[
                            styles.evolutionLine,
                            { backgroundColor: isUnlocked ? evolution.colors.primary : '#374151' },
                          ]}
                        />
                      )}
                      <View
                        style={[
                          styles.evolutionNode,
                          {
                            borderColor: isCurrent ? evolution.colors.primary : isUnlocked ? '#4ADE80' : '#374151',
                            backgroundColor: isCurrent ? evolution.colors.primary + '30' : isUnlocked ? '#1F2937' : '#111827',
                          },
                        ]}
                      >
                        <Text style={[styles.evolutionEmoji, !isUnlocked && styles.evolutionEmojiLocked]}>
                          {evolution.emoji}
                        </Text>
                        {isCurrent && <View style={[styles.currentIndicator, { backgroundColor: evolution.colors.primary }]} />}
                      </View>
                      <Text style={[styles.evolutionName, !isUnlocked && styles.evolutionNameLocked]}>
                        {evolution.name}
                      </Text>
                      <Text style={styles.evolutionLevel}>
                        Lv. {evolution.minLevel}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Evolution Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Evolution</Text>
            <View style={styles.progressInfo}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Level {progress?.level || 1}</Text>
                <Text style={styles.progressPercent}>{avatarState.evolutionProgress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={[currentEvolution.colors.primary, currentEvolution.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBar, { width: `${avatarState.evolutionProgress}%` }]}
                />
              </View>
            </View>

            {nextEvolution && (
              <View style={styles.nextEvolution}>
                <Text style={styles.nextLabel}>EVOLVES INTO</Text>
                <View style={styles.nextEvolutionRow}>
                  <Text style={styles.nextEmoji}>{nextEvolution.emoji}</Text>
                  <View>
                    <Text style={styles.nextName}>{nextEvolution.name}</Text>
                    <Text style={styles.nextRequirement}>Level {nextEvolution.minLevel}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Appearance Customization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>

            <View style={styles.skinsGrid}>
              {AVAILABLE_SKINS.map((skin) => {
                const isSelected = avatarState.skin === skin.id;

                return (
                  <TouchableOpacity
                    key={skin.id}
                    style={[
                      styles.skinCard,
                      isSelected && styles.skinCardSelected,
                    ]}
                    onPress={() => handleSkinChange(skin.id)}
                  >
                    <Text style={styles.skinEmoji}>{skin.emoji}</Text>
                    <Text style={[styles.skinName, isSelected && styles.skinNameSelected]}>
                      {skin.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Companion Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Companion Stats</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current Mood</Text>
                <Text style={styles.statValue}>
                  {avatarState.mood.charAt(0).toUpperCase() + avatarState.mood.slice(1)}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Stage</Text>
                <Text style={styles.statValue}>
                  {avatarState.stage.charAt(0).toUpperCase() + avatarState.stage.slice(1)}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Days Together</Text>
                <Text style={styles.statValue}>
                  {Math.max(1, Math.floor((Date.now() - avatarState.lastInteraction) / (1000 * 60 * 60 * 24)))}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },
  avatarCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  avatarGlowBg: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: 0,
    left: 0,
  },
  avatarDisplayWrapper: {
    marginBottom: 24,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 140,
    height: 140,
  },
  nameSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  nameDisplay: {
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  editHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  nameEditContainer: {
    width: '100%',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  nameButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  nameButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nameButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  stageEmoji: {
    fontSize: 32,
  },
  stageName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  powerStatsGrid: {
    gap: 16,
  },
  powerStat: {
    gap: 8,
  },
  powerStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  powerStatEmoji: {
    fontSize: 20,
  },
  powerStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  powerStatBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  powerStatFill: {
    height: '100%',
    borderRadius: 4,
  },
  powerStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  evolutionScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  evolutionTree: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  evolutionNodeWrapper: {
    alignItems: 'center',
    width: 80,
  },
  evolutionLine: {
    height: 2,
    width: 40,
    position: 'absolute',
    top: 30,
    left: -24,
  },
  evolutionNode: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  evolutionEmoji: {
    fontSize: 28,
  },
  evolutionEmojiLocked: {
    opacity: 0.3,
  },
  currentIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  evolutionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  evolutionNameLocked: {
    color: '#6B7280',
  },
  evolutionLevel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressInfo: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  nextEvolution: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
  },
  nextLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  nextEvolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextEmoji: {
    fontSize: 40,
  },
  nextName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextRequirement: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  skinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skinCard: {
    width: (SCREEN_WIDTH - 84) / 3,
    aspectRatio: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skinCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#1a1a3a',
  },
  skinEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  skinName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D1D5DB',
  },
  skinNameSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


