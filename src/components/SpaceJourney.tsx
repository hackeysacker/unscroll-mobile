import { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useGame } from '@/contexts/GameContext';
import { Header } from '@/components/ui/Header';
import { getRealmForLevel, REALM_THEMES } from '@/lib/realm-themes';
import { getChallengeForLevel, getChallengeName } from '@/lib/challenge-progression';
import type { ProgressTreeNode, ChallengeType } from '@/types';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configuration
const NODE_SIZE = 64;
const VERTICAL_SPACING = 100;
const HORIZONTAL_AMPLITUDE = SCREEN_WIDTH * 0.32;
const CENTER_X = SCREEN_WIDTH / 2;
const TOP_PADDING = 80;

interface SpaceJourneyProps {
  onBack: () => void;
  onStartChallenge: (challengeType: ChallengeType, level: number, isTest?: boolean, testSequence?: ChallengeType[]) => void;
}

// Calculate node position on winding path
function getPosition(level: number): { x: number; y: number } {
  const index = level - 1;
  const y = TOP_PADDING + (index * VERTICAL_SPACING);
  const wave = Math.sin(index * 0.4) * HORIZONTAL_AMPLITUDE;
  const x = CENTER_X + wave;
  return { x, y };
}

// Generate smooth curve between two points
function getCurvePath(p1: { x: number; y: number }, p2: { x: number; y: number }): string {
  const midY = (p1.y + p2.y) / 2;
  return `M ${p1.x} ${p1.y} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
}

export function SpaceJourney({ onBack, onStartChallenge }: SpaceJourneyProps) {
  const { progress, progressTree } = useGame();
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to current level
  useEffect(() => {
    if (progress && scrollViewRef.current) {
      const pos = getPosition(progress.level);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, pos.y - 250), animated: true });
      }, 300);
    }
  }, [progress?.level]);

  if (!progress || !progressTree) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f1729', '#1a2744']} style={StyleSheet.absoluteFill} />
        <Header title="Your Journey" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Get all nodes (all available)
  const allNodes = useMemo(() => {
    return progressTree.nodes
      .filter((node: ProgressTreeNode) => node.level <= 100)
      .map((node: ProgressTreeNode) => ({
        ...node,
        challengeType: getChallengeForLevel(node.level),
        status: 'available' as const,
        position: getPosition(node.level),
      }))
      .sort((a, b) => a.level - b.level);
  }, [progressTree]);

  // Find realm starts (every 10 levels)
  const realmMarkers = useMemo(() => {
    return [1, 11, 21, 31, 41, 51, 61, 71, 81, 91].map(level => {
      const realmNum = Math.ceil(level / 10);
      return {
        level,
        realm: REALM_THEMES[realmNum],
        position: getPosition(level),
      };
    });
  }, []);

  const handleNodePress = (node: ProgressTreeNode & { position: { x: number; y: number } }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartChallenge(node.challengeType, node.level, node.nodeType === 'test', node.testSequence);
  };

  const totalHeight = getPosition(101).y + 200;
  const currentRealm = getRealmForLevel(progress.level);

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[
          currentRealm.colors.backgroundGradientStart,
          currentRealm.colors.backgroundGradientEnd,
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Stars */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${(Math.random() * totalHeight) % SCREEN_WIDTH}%`,
                opacity: 0.3 + Math.random() * 0.5,
              },
            ]}
          />
        ))}
      </View>

      <Header title="🌌 Your Journey" onBack={onBack} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{ minHeight: totalHeight }}
        showsVerticalScrollIndicator={false}
      >
        {/* SVG Path Layer */}
        <Svg height={totalHeight} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
          {/* Draw curved paths */}
          {allNodes.map((node, i) => {
            if (i === 0) return null;
            const prev = allNodes[i - 1];
            const pathData = getCurvePath(prev.position, node.position);
            const realm = getRealmForLevel(node.level);

            return (
              <Path
                key={`path-${node.id}`}
                d={pathData}
                stroke={realm.colors.primary}
                strokeWidth="5"
                fill="none"
                opacity={0.4}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>

        {/* Realm Planets */}
        {realmMarkers.map(({ level, realm, position }) => (
          <View
            key={`realm-${level}`}
            style={[styles.realmMarker, { left: position.x - 75, top: position.y - 160 }]}
          >
            {/* Glow */}
            <View style={[styles.planetGlow, { backgroundColor: realm.colors.primary }]} />

            {/* Planet */}
            <LinearGradient
              colors={[realm.colors.primary, realm.colors.secondary, realm.colors.accent]}
              style={styles.planet}
            >
              <Text style={styles.planetEmoji}>{realm.emoji}</Text>
            </LinearGradient>

            {/* Info */}
            <Text style={styles.realmName}>{realm.name}</Text>
          </View>
        ))}

        {/* Challenge Nodes */}
        {allNodes.map((node) => {
          const isCurrent = node.level === progress.level;
          const isCompleted = node.status === 'completed';
          const isTest = node.nodeType === 'test';
          const realm = getRealmForLevel(node.level);
          const name = getChallengeName(node.challengeType);

          return (
            <View
              key={node.id}
              style={[
                styles.nodeWrapper,
                { left: node.position.x - NODE_SIZE / 2, top: node.position.y - NODE_SIZE / 2 },
              ]}
            >
              {/* Glow for current */}
              {isCurrent && (
                <View style={[styles.currentGlow, { backgroundColor: realm.colors.accent }]} />
              )}

              {/* Node */}
              <TouchableOpacity onPress={() => handleNodePress(node)} activeOpacity={0.8}>
                <LinearGradient
                  colors={
                    isCurrent
                      ? ['#FFD700', '#FFA500']
                      : isCompleted
                      ? ['#10b981', '#059669']
                      : [realm.colors.primary, realm.colors.secondary]
                  }
                  style={[
                    styles.node,
                    isTest && styles.testNode,
                    isCurrent && styles.currentNode,
                  ]}
                >
                  {isTest ? (
                    <>
                      <Text style={styles.testIcon}>⭐</Text>
                      <Text style={styles.testText}>TEST</Text>
                    </>
                  ) : (
                    <Text style={styles.levelNumber}>{node.level}</Text>
                  )}

                  {/* Checkmark */}
                  {isCompleted && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}

                  {/* Border */}
                  <View
                    style={[
                      styles.nodeBorder,
                      isCurrent && styles.currentBorder,
                      isTest && styles.testBorder,
                    ]}
                  />
                </LinearGradient>

                {/* Label */}
                <Text style={styles.nodeLabel} numberOfLines={2}>
                  {name}
                </Text>
              </TouchableOpacity>

              {/* Current marker */}
              {isCurrent && (
                <View style={styles.currentLabel}>
                  <Text style={styles.currentText}>YOU</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.bottomBar}
        pointerEvents="none"
      >
        <Text style={styles.bottomLevel}>Level {progress.level}</Text>
        <Text style={styles.bottomRealm}>{currentRealm.name} Realm</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  realmMarker: {
    position: 'absolute',
    width: 150,
    alignItems: 'center',
  },
  planetGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.3,
  },
  planet: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  planetEmoji: {
    fontSize: 56,
  },
  realmName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  nodeWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  currentGlow: {
    position: 'absolute',
    width: NODE_SIZE + 28,
    height: NODE_SIZE + 28,
    borderRadius: (NODE_SIZE + 28) / 2,
    top: -14,
    left: -14,
    opacity: 0.5,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  testNode: {
    width: NODE_SIZE + 8,
    height: NODE_SIZE + 8,
    borderRadius: (NODE_SIZE + 8) / 2,
  },
  currentNode: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  nodeBorder: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  currentBorder: {
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  testBorder: {
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  testIcon: {
    fontSize: 28,
    marginBottom: -6,
  },
  testText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nodeLabel: {
    marginTop: 6,
    width: NODE_SIZE + 30,
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 13,
  },
  currentLabel: {
    position: 'absolute',
    bottom: -28,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  currentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bottomLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  bottomRealm: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
