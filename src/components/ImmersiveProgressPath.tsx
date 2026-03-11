import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '@/contexts/GameContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAttentionAvatar } from '@/contexts/AttentionAvatarContext';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { EnhancedAvatar } from '@/components/EnhancedAvatar';
import { AttentionAvatar } from '@/components/AttentionAvatar';
import { ShimmerEffect } from '@/components/ShimmerEffect';
import { getRealmForLevel, getRealmTransition, interpolateColor, REALM_THEMES } from '@/lib/realm-themes';
import { getChallengeForLevel, getChallengeScaling, getChallengeName, getChallengeDescription } from '@/lib/challenge-progression';
import { HapticPatterns, HapticManager } from '@/lib/haptic-patterns';
import type { ProgressTreeNode, ChallengeType } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NODE_SIZE = 64;
const NODE_SPACING = 140;
const PATH_WIDTH = SCREEN_WIDTH * 0.8;
const PATH_CENTER_X = SCREEN_WIDTH / 2;

// Total levels in the game
const TOTAL_LEVELS = 200;
const LEVELS_PER_ZONE = 20;

// Space theme - 10 Galaxy Zones (20 levels each = 200 total levels)
const SPACE_ZONES = [
  {
    name: 'Inner Nebula',
    emoji: '🌌',
    color: '#6B5B95',
    glow: '#9B8BC3',
    theme: 'Awakening',
    bgStart: '#0a0a1a',
    bgEnd: '#1a1a3a'
  },
  {
    name: 'Mercury Belt',
    emoji: '🪨',
    color: '#8B8B8B',
    glow: '#A8A8A8',
    theme: 'Foundation',
    bgStart: '#1a1a3a',
    bgEnd: '#2a1a2a'
  },
  {
    name: 'Venus Clouds',
    emoji: '🌕',
    color: '#E6C229',
    glow: '#FFE066',
    theme: 'Clarity',
    bgStart: '#2a1a2a',
    bgEnd: '#3a2a1a'
  },
  {
    name: 'Earth Orbit',
    emoji: '🌍',
    color: '#4A90D9',
    glow: '#7FB3FF',
    theme: 'Discipline',
    bgStart: '#3a2a1a',
    bgEnd: '#1a2a3a'
  },
  {
    name: 'Mars Territory',
    emoji: '🔴',
    color: '#CD5C5C',
    glow: '#FF8080',
    theme: 'Strength',
    bgStart: '#1a2a3a',
    bgEnd: '#3a1a1a'
  },
  {
    name: 'Asteroid Field',
    emoji: '☄️',
    color: '#D4A574',
    glow: '#FFCC99',
    theme: 'Precision',
    bgStart: '#3a1a1a',
    bgEnd: '#2a2a1a'
  },
  {
    name: 'Jupiter Storm',
    emoji: '🟤',
    color: '#F4D03F',
    glow: '#FFF59D',
    theme: 'Power',
    bgStart: '#2a2a1a',
    bgEnd: '#3a3a1a'
  },
  {
    name: 'Saturn Rings',
    emoji: '🪐',
    color: '#5DADE2',
    glow: '#85C1E9',
    theme: 'Balance',
    bgStart: '#3a3a1a',
    bgEnd: '#1a3a3a'
  },
  {
    name: 'Deep Space',
    emoji: '🔵',
    color: '#3498DB',
    glow: '#5DADE2',
    theme: 'Mastery',
    bgStart: '#1a3a3a',
    bgEnd: '#2a1a4a'
  },
  {
    name: 'Galactic Core',
    emoji: '🌟',
    color: '#9B59B6',
    glow: '#D7BDE2',
    theme: 'Transcendence',
    bgStart: '#2a1a4a',
    bgEnd: '#4a1a6a'
  },
];

// Keep original for backwards compatibility
const SPACE_PLANETS = SPACE_ZONES;

// Challenge type icons for visual identification
const CHALLENGE_ICONS: Record<string, string> = {
  focus_hold: '👁️',
  finger_hold: '☝️',
  slow_tracking: '🎯',
  tap_only_correct: '✅',
  breath_pacing: '🌬️',
  fake_notifications: '🔔',
  look_away: '👀',
  delay_unlock: '🔒',
  anti_scroll_swipe: '📜',
  memory_flash: '🧠',
  reaction_inhibition: '🛑',
  multi_object_tracking: '🔮',
  rhythm_tap: '🎵',
  stillness_test: '🧘',
  impulse_spike_test: '⚡',
  finger_tracing: '✍️',
  multi_task_tap: '🎪',
  popup_ignore: '🚫',
  controlled_breathing: '💨',
  reset: '🏆',
};

// Enhanced shooting star component with trail effect
const ShootingStar = memo(({ delay = 0 }: { delay?: number }) => {
  const translateX = useRef(new Animated.Value(-150)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      const startY = Math.random() * 2000;
      const angle = 0.3 + Math.random() * 0.4; // Varying angles
      const distance = SCREEN_WIDTH + 300;

      translateY.setValue(startY);
      translateX.setValue(-150);
      opacity.setValue(0);
      scale.setValue(0.5 + Math.random() * 0.5);

      Animated.parallel([
        // Fade in quickly, stay visible, fade out
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(800),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Move across screen
        Animated.timing(translateX, {
          toValue: distance,
          duration: 1200,
          useNativeDriver: true,
        }),
        // Move down at angle
        Animated.timing(translateY, {
          toValue: startY + distance * angle,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Random delay before next shooting star
        setTimeout(animate, Math.random() * 10000 + 5000);
      });
    };

    const timeout = setTimeout(animate, delay + Math.random() * 5000);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.shootingStarContainer,
        {
          transform: [
            { translateX },
            { translateY },
            { rotate: '35deg' },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      {/* Main star head */}
      <View style={styles.shootingStarHead} />
      {/* Glowing trail */}
      <View style={styles.shootingStarTrail} />
      {/* Fading tail */}
      <View style={styles.shootingStarTail} />
    </Animated.View>
  );
});

// Twinkling star component
const TwinklingStar = memo(({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3 + Math.random() * 0.4)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.3,
            duration: 800 + Math.random() * 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.3 + Math.random() * 0.3,
            duration: 800 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800 + Math.random() * 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    twinkle.start();
    return () => twinkle.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size * 2,
        },
      ]}
    />
  );
});

// Star field component for galaxy background
const StarField = memo(({ scrollY }: { scrollY: Animated.Value }) => {
  const stars = useMemo(() => {
    const starArray = [];
    // Many more stars - 500 total
    for (let i = 0; i < 500; i++) {
      const isBright = Math.random() > 0.85;
      starArray.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * 35000, // Extend to cover all zones
        size: isBright ? Math.random() * 3 + 2 : Math.random() * 2 + 0.5,
        opacity: isBright ? 0.9 : Math.random() * 0.6 + 0.2,
        twinkle: isBright || Math.random() > 0.7,
        color: Math.random() > 0.85 ? '#B3E5FC' :
               Math.random() > 0.7 ? '#FFE4B5' :
               Math.random() > 0.5 ? '#E8D5FF' : '#FFFFFF',
      });
    }
    return starArray;
  }, []);

  // Separate twinkling and static stars
  const twinklingStars = stars.filter(s => s.twinkle).slice(0, 100); // Limit animated stars for performance
  const staticStars = stars.filter(s => !s.twinkle || stars.indexOf(s) >= 100);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Static stars */}
      {staticStars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              backgroundColor: star.color,
            },
          ]}
        />
      ))}
      {/* Twinkling stars */}
      {twinklingStars.map((star) => (
        <TwinklingStar
          key={`twinkle-${star.id}`}
          x={star.x}
          y={star.y}
          size={star.size}
          color={star.color}
          delay={Math.random() * 3000}
        />
      ))}
      {/* More shooting stars */}
      <ShootingStar delay={0} />
      <ShootingStar delay={2000} />
      <ShootingStar delay={5000} />
      <ShootingStar delay={8000} />
      <ShootingStar delay={12000} />
    </View>
  );
});

// Orbital path line between planets
const OrbitalPath = memo(({ fromPos, toPos, color }: { fromPos: { x: number; y: number }; toPos: { x: number; y: number }; color: string }) => {
  return (
    <View
      style={[
        styles.orbitalPath,
        {
          position: 'absolute',
          left: Math.min(fromPos.x, toPos.x),
          top: fromPos.y,
          width: Math.abs(toPos.x - fromPos.x) || 3,
          height: toPos.y - fromPos.y,
          borderColor: color,
        },
      ]}
    />
  );
});

// Animated companion avatar component
const CompanionAvatar = memo(({ position, name, planetColor, level }: { position: { x: number; y: number }; name: string; planetColor: string; level: number }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 12,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow pulse
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

  return (
    <View
      style={[
        styles.spaceshipContainer,
        {
          position: 'absolute',
          left: position.x - 50,
          top: position.y - 100,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.spaceshipWrapper,
          {
            transform: [
              { translateY: floatAnim },
            ],
          },
        ]}
      >
        {/* Glow effect behind avatar */}
        <Animated.View
          style={[
            styles.avatarGlow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.2, 0.5],
              }),
              backgroundColor: planetColor,
            },
          ]}
        />
        {/* Actual avatar */}
        <View style={styles.avatarWrapper}>
          <AttentionAvatar size="medium" showParticles={true} />
        </View>
      </Animated.View>
      <Text style={[styles.avatarName, { color: planetColor }]}>
        {name}
      </Text>
    </View>
  );
});

// Planet node component
const PlanetNode = memo(({
  node,
  planetData,
  isCurrentNode,
  onPress,
  challengeIcon
}: {
  node: ProgressTreeNode;
  planetData: typeof SPACE_PLANETS[0];
  isCurrentNode: boolean;
  onPress: (node: ProgressTreeNode) => void;
  challengeIcon: string;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCurrentNode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
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
    }

    if (node.status === 'available' || isCurrentNode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Orbiting icon animation
      Animated.loop(
        Animated.timing(orbitAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isCurrentNode, node.status]);

  const getStatusStyle = () => {
    switch (node.status) {
      case 'completed':
        return { opacity: 1, borderColor: '#4CAF50' };
      case 'perfect':
        return { opacity: 1, borderColor: '#FFD700' };
      case 'available':
        return { opacity: 1, borderColor: planetData.glow };
      default:
        return { opacity: 0.6, borderColor: 'transparent' };
    }
  };

  const statusStyle = getStatusStyle();

  // Calculate orbit position
  const orbitRotate = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={() => onPress(node)}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.planetContainer,
          {
            transform: [{ scale: isCurrentNode ? pulseAnim : 1 }],
          },
        ]}
      >
        {/* Glow effect */}
        {(node.status === 'available' || isCurrentNode) && (
          <Animated.View
            style={[
              styles.planetGlow,
              {
                backgroundColor: planetData.glow,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
              },
            ]}
          />
        )}

        {/* Planet body */}
        <View
          style={[
            styles.planet,
            {
              backgroundColor: planetData.color,
              borderColor: statusStyle.borderColor,
              borderWidth: 3,
              opacity: statusStyle.opacity,
            },
          ]}
        >
          <Text style={styles.levelNumber}>{node.level}</Text>
        </View>

        {/* Orbiting challenge icon */}
        {(node.status === 'available' || isCurrentNode) && (
          <Animated.View
            style={[
              styles.orbitingIcon,
              {
                transform: [{ rotate: orbitRotate }],
              },
            ]}
          >
            <View style={styles.challengeIconContainer}>
              <Text style={styles.challengeIcon}>{challengeIcon}</Text>
            </View>
          </Animated.View>
        )}

        {/* Status indicators */}
        {node.status === 'perfect' && (
          <View style={styles.perfectStar}>
            <Text style={{ fontSize: 16 }}>⭐</Text>
          </View>
        )}
        {node.status === 'completed' && node.status !== 'perfect' && (
          <View style={styles.completedCheck}>
            <Text style={{ fontSize: 10, color: '#fff' }}>✓</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

interface ImmersiveProgressPathProps {
  onBack: () => void;
  onSelectLevel?: (level: number) => void;
  onStartChallenge: (challengeType: ChallengeType, level: number, isTest?: boolean, testSequence?: ChallengeType[]) => void;
}

/**
 * Space-themed Immersive Progress Path
 *
 * Features:
 * - 100 levels across 10 planetary systems
 * - Galaxy background with twinkling stars
 * - Planets as level nodes with orbital animations
 * - Animated spaceship avatar
 * - Rich haptic feedback
 * - Performance optimized with memo and callbacks
 */
export function ImmersiveProgressPath({ onBack, onSelectLevel, onStartChallenge }: ImmersiveProgressPathProps) {
  const { progress, progressTree } = useGame();
  const { colors } = useTheme();
  const { avatarState } = useAttentionAvatar();

  const [selectedNode, setSelectedNode] = useState<ProgressTreeNode | null>(null);
  const [showModal, setShowModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const hapticManager = useRef(new HapticManager()).current;
  const lastRealmRef = useRef<number>(1);

  // Loading state
  if (!progress || !progressTree) {
    return (
      <View style={[styles.container, { backgroundColor: '#0a0a1a' }]}>
        <Header title="Galaxy Journey" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ShimmerEffect width={200} height={200} borderRadius={100} />
          <Text style={[styles.loadingText, { color: '#8B9DC3' }]}>
            Charting your course...
          </Text>
        </View>
      </View>
    );
  }

  // Get all nodes with proper challenge mapping - ALL AVAILABLE for testing
  // Generate 200 levels even if progressTree has fewer
  const allNodes = useMemo(() => {
    const nodes = [];
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
      const challengeType = getChallengeForLevel(level <= 100 ? level : ((level - 1) % 100) + 1);
      const existingNode = progressTree?.nodes?.find((n: ProgressTreeNode) => n.level === level);

      nodes.push({
        id: existingNode?.id || `level-${level}`,
        level,
        challengeType,
        nodeType: level % 20 === 0 ? 'test' : 'challenge',
        status: level < progress.level ? 'completed' :
                level === progress.level ? 'available' : 'available',
        testSequence: existingNode?.testSequence,
      });
    }
    return nodes;
  }, [progressTree, progress.level]);

  // Current zone info based on level (20 levels per zone)
  const currentZoneIndex = useMemo(() => {
    return Math.min(Math.floor((progress.level - 1) / LEVELS_PER_ZONE), SPACE_ZONES.length - 1);
  }, [progress.level]);

  const currentZone = SPACE_ZONES[currentZoneIndex];
  const currentPlanet = currentZone; // Alias for compatibility

  // Calculate node positions (winding path) with zone barriers
  const ZONE_BARRIER_HEIGHT = 200; // Extra space before each zone for title cards

  const getNodePosition = useCallback((level: number): { x: number; y: number } => {
    // Calculate which zone this level is in
    const zoneIndex = Math.floor((level - 1) / LEVELS_PER_ZONE);

    // Add barrier height for each zone (including the first one)
    const barrierOffset = (zoneIndex + 1) * ZONE_BARRIER_HEIGHT;

    const baseY = 200 + (level - 1) * NODE_SPACING + barrierOffset;
    const waveAmplitude = PATH_WIDTH / 3;
    const waveFrequency = 0.4;
    const xOffset = Math.sin(level * waveFrequency) * waveAmplitude;

    return {
      x: PATH_CENTER_X + xOffset,
      y: baseY,
    };
  }, []);

  // Calculate zone backgrounds for blending gradients
  const zoneBackgrounds = useMemo(() => {
    return SPACE_ZONES.map((zone, index) => {
      const firstLevelOfZone = index * LEVELS_PER_ZONE + 1;
      const position = getNodePosition(firstLevelOfZone);
      const zoneHeight = LEVELS_PER_ZONE * NODE_SPACING + ZONE_BARRIER_HEIGHT;

      // Get next zone's start color for smooth blending
      const nextZone = SPACE_ZONES[index + 1];
      const endColor = nextZone ? nextZone.bgStart : zone.bgEnd;

      return {
        zone,
        y: index === 0 ? 0 : position.y - ZONE_BARRIER_HEIGHT - 150, // First zone starts at top
        height: zoneHeight + 300, // Extra overlap for smooth blending
        colors: [zone.bgStart, zone.bgEnd, endColor] as [string, string, string],
      };
    });
  }, [getNodePosition]);

  // Animated nebula clouds positioned throughout the journey
  const nebulaPositions = useMemo(() => {
    const nebulae = [];
    for (let i = 0; i < SPACE_ZONES.length; i++) {
      const zone = SPACE_ZONES[i];
      const baseY = i * (LEVELS_PER_ZONE * NODE_SPACING + ZONE_BARRIER_HEIGHT);

      // 2-3 nebulae per zone
      nebulae.push({
        id: `nebula-${i}-1`,
        color: zone.glow,
        x: Math.random() > 0.5 ? -80 : SCREEN_WIDTH - 120,
        y: baseY + 400 + Math.random() * 500,
        size: 180 + Math.random() * 100,
      });
      nebulae.push({
        id: `nebula-${i}-2`,
        color: zone.color,
        x: Math.random() > 0.5 ? -60 : SCREEN_WIDTH - 140,
        y: baseY + 1500 + Math.random() * 500,
        size: 150 + Math.random() * 80,
      });
      if (Math.random() > 0.5) {
        nebulae.push({
          id: `nebula-${i}-3`,
          color: zone.glow,
          x: SCREEN_WIDTH / 2 - 100 + Math.random() * 200,
          y: baseY + 2500 + Math.random() * 300,
          size: 120 + Math.random() * 60,
        });
      }
    }
    return nebulae;
  }, []);

  // Auto-scroll to current level
  useEffect(() => {
    if (scrollViewRef.current && allNodes.length > 0) {
      const currentNodeIndex = allNodes.findIndex(n => n.level === progress.level);
      if (currentNodeIndex !== -1) {
        const targetY = currentNodeIndex * NODE_SPACING - SCREEN_HEIGHT / 3;
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
        }, 300);
      }
    }
  }, [progress.level]);

  // Detect planet changes (realm transitions)
  useEffect(() => {
    const newPlanet = Math.ceil(progress.level / 10);
    if (newPlanet > lastRealmRef.current && progress.level % 10 === 1) {
      HapticPatterns.realmBoundary();
    }
    lastRealmRef.current = newPlanet;
  }, [progress.level]);

  // Handle node press
  const handleNodePress = useCallback((node: ProgressTreeNode) => {
    setSelectedNode(node);
    setShowModal(true);
  }, []);

  // Handle scroll with haptic feedback at realm boundaries
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const levelAtScroll = Math.floor(y / NODE_SPACING) + 1;
        const realm = Math.ceil(levelAtScroll / 10);
        
        // Trigger haptic at realm boundaries
        if (levelAtScroll % 10 === 0 && realm !== lastRealmRef.current) {
          hapticManager.trigger('realmBoundary');
        }
      },
    }
  );

  // Zone headers (20 levels per zone) - positioned in the barrier space before each zone
  const zoneHeaders = useMemo(() => {
    const headers: Array<{ zone: typeof SPACE_ZONES[number]; y: number; index: number }> = [];
    for (let i = 0; i < SPACE_ZONES.length; i++) {
      const firstLevelOfZone = i * LEVELS_PER_ZONE + 1;
      const position = getNodePosition(firstLevelOfZone);
      // Position header higher in the barrier space so it's not blocked
      headers.push({
        zone: SPACE_ZONES[i],
        y: position.y - ZONE_BARRIER_HEIGHT - 60, // Higher up, above barrier space
        index: i,
      });
    }
    return headers;
  }, [getNodePosition]);

  // For backwards compatibility
  const planetHeaders = zoneHeaders.map(h => ({ planet: h.zone, y: h.y, index: h.index }));

  // Total height includes barriers for all zones
  const totalBarrierHeight = SPACE_ZONES.length * ZONE_BARRIER_HEIGHT;
  const totalHeight = 200 + allNodes.length * NODE_SPACING + totalBarrierHeight + 400;

  return (
    <View style={[styles.container, { backgroundColor: '#0a0a1a' }]}>
      {/* Header with back button */}
      <View style={{ zIndex: 1000 }}>
        <Header title="Galaxy Journey" onBack={onBack} />
      </View>

      {/* Base dark background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a1a' }]} pointerEvents="none" />

      {/* Star field */}
      <StarField scrollY={scrollY} />

      {/* Nebula clouds removed - now rendered inside ScrollView */}

      {/* Main scrollable path */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { minHeight: totalHeight }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        bounces={true}
      >
        {/* Zone background gradients - blending sections */}
        {zoneBackgrounds.map((bg, index) => (
          <LinearGradient
            key={`zone-bg-${index}`}
            colors={bg.colors}
            locations={[0, 0.6, 1]}
            style={[
              styles.zoneBackground,
              {
                position: 'absolute',
                top: bg.y,
                left: 0,
                right: 0,
                height: bg.height,
              },
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        ))}

        {/* Animated nebula clouds throughout the journey */}
        {nebulaPositions.map((nebula) => (
          <View
            key={nebula.id}
            style={[
              styles.nebula,
              {
                backgroundColor: nebula.color,
                left: nebula.x,
                top: nebula.y,
                width: nebula.size,
                height: nebula.size,
                borderRadius: nebula.size / 2,
              },
            ]}
          />
        ))}

        {/* Zone headers with gradient backgrounds */}
        {zoneHeaders.map((header, index) => (
          <View
            key={`zone-${index}`}
            style={[styles.realmHeader, { top: header.y }]}
          >
            {/* Zone gradient background */}
            <LinearGradient
              colors={[header.zone.bgStart, header.zone.bgEnd]}
              style={styles.zoneGradientBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.realmEmoji}>{header.zone.emoji}</Text>
            <Text style={[styles.realmName, { color: header.zone.glow }]}>
              {header.zone.name}
            </Text>
            <Text style={[styles.realmTheme, { color: header.zone.glow }]}>
              {header.zone.theme}
            </Text>
            <Text style={[styles.realmDescription, { color: '#8B9DC3' }]}>
              Levels {header.index * LEVELS_PER_ZONE + 1}-{(header.index + 1) * LEVELS_PER_ZONE}
            </Text>
          </View>
        ))}

        {/* Orbital paths between planets */}
        {allNodes.slice(0, -1).map((node, index) => {
          const fromPos = getNodePosition(node.level);
          const toPos = getNodePosition(allNodes[index + 1].level);
          const zoneIndex = Math.min(Math.floor((node.level - 1) / LEVELS_PER_ZONE), SPACE_ZONES.length - 1);
          const pathColor = node.status === 'completed' ? '#4CAF50' : SPACE_ZONES[zoneIndex].glow + '40';

          return (
            <View
              key={`path-${node.id}`}
              style={[
                styles.orbitalPathContainer,
                {
                  position: 'absolute',
                  left: 0,
                  top: fromPos.y,
                  width: SCREEN_WIDTH,
                  height: toPos.y - fromPos.y,
                },
              ]}
              pointerEvents="none"
            >
              <View
                style={[
                  styles.orbitalDot,
                  {
                    backgroundColor: pathColor,
                    left: fromPos.x - 2,
                    top: (toPos.y - fromPos.y) * 0.25,
                  },
                ]}
              />
              <View
                style={[
                  styles.orbitalDot,
                  {
                    backgroundColor: pathColor,
                    left: (fromPos.x + toPos.x) / 2 - 2,
                    top: (toPos.y - fromPos.y) * 0.5,
                  },
                ]}
              />
              <View
                style={[
                  styles.orbitalDot,
                  {
                    backgroundColor: pathColor,
                    left: toPos.x - 2,
                    top: (toPos.y - fromPos.y) * 0.75,
                  },
                ]}
              />
            </View>
          );
        })}

        {/* Planet nodes */}
        {allNodes.map((node) => {
          const position = getNodePosition(node.level);
          const zoneIndex = Math.min(Math.floor((node.level - 1) / LEVELS_PER_ZONE), SPACE_ZONES.length - 1);
          const planetData = SPACE_ZONES[zoneIndex];
          const isCurrentNode = node.level === progress.level;
          const challengeIcon = CHALLENGE_ICONS[node.challengeType] || '🎯';

          return (
            <View
              key={node.id}
              style={[
                styles.nodeContainer,
                {
                  position: 'absolute',
                  left: position.x - NODE_SIZE / 2,
                  top: position.y - NODE_SIZE / 2,
                },
              ]}
            >
              <PlanetNode
                node={node}
                planetData={planetData}
                isCurrentNode={isCurrentNode}
                onPress={handleNodePress}
                challengeIcon={challengeIcon}
              />
            </View>
          );
        })}

        {/* Animated companion avatar */}
        <CompanionAvatar
          position={getNodePosition(progress.level)}
          name={avatarState.name}
          planetColor={currentPlanet.glow}
          level={progress.level}
        />
      </ScrollView>
      
      {/* Node detail modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: '#1a1a3a', borderColor: '#3a3a6a' },
            ]}
          >
            {selectedNode && (() => {
              const nodeZoneIndex = Math.min(Math.floor((selectedNode.level - 1) / LEVELS_PER_ZONE), SPACE_ZONES.length - 1);
              const nodeZone = SPACE_ZONES[nodeZoneIndex];
              return (
                <>
                  <Text style={styles.modalEmoji}>{nodeZone.emoji}</Text>
                  <Text style={[styles.modalTitle, { color: '#FFFFFF' }]}>
                    Level {selectedNode.level}
                  </Text>
                  <Text style={[styles.modalChallengeName, { color: nodeZone.glow }]}>
                    {getChallengeName(selectedNode.challengeType)}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: '#8B9DC3' }]}>
                    {nodeZone.name} • {selectedNode.nodeType === 'test' ? 'Zone Test' : 'Mission'}
                  </Text>
                  <Text style={[styles.modalDescription, { color: '#8B9DC3' }]}>
                    {getChallengeDescription(selectedNode.challengeType, selectedNode.level)}
                  </Text>

                  {/* Difficulty indicator - stars */}
                  <View style={styles.difficultyContainer}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Text
                        key={i}
                        style={{
                          fontSize: 16,
                          opacity: i < Math.ceil((selectedNode.level / TOTAL_LEVELS) * 5) ? 1 : 0.3,
                        }}
                      >
                        ⭐
                      </Text>
                    ))}
                  </View>

                  {selectedNode.status !== 'locked' && (
                    <Button
                      onPress={() => {
                        setShowModal(false);
                        onStartChallenge(
                          selectedNode.challengeType,
                          selectedNode.level,
                          selectedNode.nodeType === 'test',
                          selectedNode.testSequence
                        );
                      }}
                      style={{ marginTop: 20 }}
                    >
                      Launch {selectedNode.nodeType === 'test' ? 'Test' : 'Mission'}
                    </Button>
                  )}

                  {selectedNode.status === 'locked' && (
                    <Text style={[styles.lockedText, { color: '#8B9DC3' }]}>
                      Complete previous missions to unlock
                    </Text>
                  )}
                </>
              );
            })()}
          </View>
        </TouchableOpacity>
      </Modal>
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
    gap: 20,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 200,
  },
  // Star field
  star: {
    position: 'absolute',
    borderRadius: 50,
  },
  shootingStar: {
    position: 'absolute',
    width: 60,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  shootingStarContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shootingStarHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  shootingStarTrail: {
    width: 40,
    height: 3,
    backgroundColor: '#FFFFFF',
    marginLeft: -3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  shootingStarTail: {
    width: 80,
    height: 1,
    marginLeft: -2,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    backgroundColor: 'rgba(135, 206, 235, 0.6)',
  },
  // Zone backgrounds
  zoneBackground: {
    opacity: 1,
  },
  // Orbital paths
  orbitalPathContainer: {
    overflow: 'visible',
  },
  orbitalPath: {
    borderWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.3,
  },
  orbitalDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  // Nebula clouds
  nebulaContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  nebula: {
    position: 'absolute',
    opacity: 0.12,
  },
  // Zone/Planet headers
  realmHeader: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    left: 20, // Center horizontally
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  zoneGradientBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
    borderRadius: 16,
  },
  realmEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  realmName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  realmTheme: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  realmDescription: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 300,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Node container
  nodeContainer: {
    width: NODE_SIZE,
    height: NODE_SIZE,
  },
  // Planet node styles
  planetContainer: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planetGlow: {
    position: 'absolute',
    width: NODE_SIZE + 20,
    height: NODE_SIZE + 20,
    borderRadius: (NODE_SIZE + 20) / 2,
  },
  planet: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  perfectStar: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  completedCheck: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIcon: {
    position: 'absolute',
  },
  // Orbiting challenge icon
  orbitingIcon: {
    position: 'absolute',
    width: NODE_SIZE + 30,
    height: NODE_SIZE + 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  challengeIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  challengeIcon: {
    fontSize: 12,
  },
  // Avatar/spaceship
  avatarContainer: {
    alignItems: 'center',
    width: 80,
  },
  spaceshipContainer: {
    alignItems: 'center',
    width: 100,
  },
  spaceshipWrapper: {
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -15,
    left: -15,
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 20, 0.85)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalChallengeName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  lockedText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});
