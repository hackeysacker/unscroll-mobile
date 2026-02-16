/**
 * Vertical Progress Path - Duolingo Style
 *
 * Features:
 * - 250 levels across 10 realms (25 levels per realm)
 * - Progressive difficulty: more exercises per level in later realms
 * - Realm 1: Basic attention training (beginner)
 * - Realms 2-10: Advanced skills and combinations
 * - Smooth opening animation with staggered node fade-in
 * - Enhanced node visuals with depth, shadows, and glow effects
 * - Improved background with layered animated gradients
 * - Duolingo-style header with streak, gems, hearts, and profile
 * - Character positioned on current level with smooth scroll
 * - Bottom navigation bar
 * - Buttery-smooth realm transitions with color blending
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

// Simple accent colors for background orbs
const ACCENT_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4'];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Layout constants
const NODE_SIZE = 70;
const NODE_SPACING = 90; // Spacing between levels - tighter like Duolingo
const REALM_HEADER_HEIGHT = 140; // Clean centered title between realms
const COMPANION_SIZE = 50;
const WINDING_AMPLITUDE = 70; // How far the path swings left/right - proportional to tighter spacing

interface VerticalProgressPathProps {
  onBack: () => void;
  onLevelSelect: (level: number) => void;
  onNavigate?: (route: string) => void;
}

type LevelStatus = 'locked' | 'available' | 'current' | 'completed';

// Helper function to get default activity type for a realm
function getDefaultActivityForRealm(realmId: number): ActivityType {
  const realmActivities: { [key: number]: ActivityType } = {
    1: 'gaze_hold',
    2: 'breath_pacing',
    3: 'stillness_test',
    4: 'memory_flash',
    5: 'finger_tracing',
    6: 'reaction_inhibition',
    7: 'popup_ignore',
    8: 'tap_pattern',
    9: 'multi_task_tap',
    10: 'impulse_spike_test',
  };
  return realmActivities[realmId] || 'gaze_hold';
}

interface LevelNode {
  level: number;
  realmId: number;
  realm: FocusRealm;
  status: LevelStatus;
  isMilestone: boolean;
  isBonus?: boolean; // Optional bonus challenge between curves
  bonusActivityType?: ActivityType; // Activity type for bonus challenge
  activityType?: ActivityType; // Primary activity type for this node
  exerciseCount: number; // Number of exercises at this level
}

/**
 * Enhanced Animated Background - Layered gradients with smooth floating orbs
 */
function SimpleAnimatedBackground({ accentColor, realmIndex, scrollProgress }: { accentColor: string; realmIndex: number; scrollProgress: number }) {
  // Create animated values for 5 orbs (more depth)
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;
  const orb4Anim = useRef(new Animated.Value(0)).current;
  const orb5Anim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const gradientShiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth looping animations using native driver
    Animated.loop(
      Animated.timing(orb1Anim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(orb2Anim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(orb3Anim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(orb4Anim, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(orb5Anim, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Get blended orb colors for smooth transition
  const getOrbColors = useMemo(() => {
    const currentRealm = FOCUS_REALMS[realmIndex];
    const nextRealm = FOCUS_REALMS[Math.min(9, realmIndex + 1)];

    if (!currentRealm || !nextRealm || scrollProgress < 0.6) {
      return [
        currentRealm?.colors.primary || '#8B5CF6',
        currentRealm?.colors.accent || '#EC4899',
        currentRealm?.colors.secondary || '#06B6D4',
      ];
    }

    // Ultra-smooth easing for color transition (quintic easing for buttery smoothness)
    const blendProgress = (scrollProgress - 0.6) / 0.4;
    const easeInOutQuintic = (t: number): number => {
      return t < 0.5
        ? 16 * t * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 5) / 2;
    };
    const blendAmount = easeInOutQuintic(blendProgress);

    return [
      interpolateColor(currentRealm.colors.primary, nextRealm.colors.primary, blendAmount),
      interpolateColor(currentRealm.colors.accent, nextRealm.colors.accent, blendAmount),
      interpolateColor(currentRealm.colors.secondary, nextRealm.colors.secondary, blendAmount),
    ];
  }, [realmIndex, scrollProgress]);

  // Interpolate animations to create smooth circular motion
  const orb1TranslateX = orb1Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 80, 0, -80, 0],
  });
  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-60, 0, 60, 0, -60],
  });

  const orb2TranslateX = orb2Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [60, 0, -60, 0, 60],
  });
  const orb2TranslateY = orb2Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 70, 0, -70, 0],
  });

  const orb3TranslateX = orb3Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-40, 40, 40, -40, -40],
  });
  const orb3TranslateY = orb3Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [40, 40, -40, -40, 40],
  });

  const orb4TranslateX = orb4Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-50, 0, 50, 0, -50],
  });
  const orb4TranslateY = orb4Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -50, 0, 50, 0],
  });

  const orb5TranslateX = orb5Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [70, -70, -70, 70, 70],
  });
  const orb5TranslateY = orb5Anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-50, -50, 50, 50, -50],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.25],
  });

  const [orbColor1, orbColor2, orbColor3] = getOrbColors;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Orb 1 - Top area */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            left: SCREEN_WIDTH * 0.3 - 75,
            top: SCREEN_HEIGHT * 0.2 - 75,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: orbColor1,
            opacity: pulseOpacity,
            transform: [
              { translateX: orb1TranslateX },
              { translateY: orb1TranslateY },
              { scale: pulseScale },
            ],
          },
        ]}
      />

      {/* Orb 2 - Middle area */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            left: SCREEN_WIDTH * 0.7 - 100,
            top: SCREEN_HEIGHT * 0.45 - 100,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: orbColor2,
            opacity: 0.12,
            transform: [
              { translateX: orb2TranslateX },
              { translateY: orb2TranslateY },
              { scale: pulseScale },
            ],
          },
        ]}
      />

      {/* Orb 3 - Bottom area */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            left: SCREEN_WIDTH * 0.4 - 90,
            top: SCREEN_HEIGHT * 0.7 - 90,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: orbColor3,
            opacity: pulseOpacity,
            transform: [
              { translateX: orb3TranslateX },
              { translateY: orb3TranslateY },
              { scale: pulseScale },
            ],
          },
        ]}
      />

      {/* Orb 4 - Upper right area */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            left: SCREEN_WIDTH * 0.75 - 80,
            top: SCREEN_HEIGHT * 0.25 - 80,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: orbColor1,
            opacity: 0.18,
            transform: [
              { translateX: orb4TranslateX },
              { translateY: orb4TranslateY },
              { scale: pulseScale },
            ],
          },
        ]}
      />

      {/* Orb 5 - Lower left area */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            left: SCREEN_WIDTH * 0.15 - 85,
            top: SCREEN_HEIGHT * 0.55 - 85,
            width: 170,
            height: 170,
            borderRadius: 85,
            backgroundColor: orbColor2,
            opacity: 0.15,
            transform: [
              { translateX: orb5TranslateX },
              { translateY: orb5TranslateY },
              { scale: pulseScale },
            ],
          },
        ]}
      />
    </View>
  );
}

// Extended type for node icons (includes special icons like crown, lock, checkmark)
type NodeIconType = ActivityType | 'crown' | 'checkmark' | 'lock';

/**
 * Custom SVG Icon for Activity Types
 */
interface ActivityIconProps {
  activityType: NodeIconType;
  size: number;
  color: string;
}

function ActivityIcon({ activityType, size, color }: ActivityIconProps) {
  const s = size;

  switch (activityType) {
    case 'crown':
      return <CrownIcon size={s} color={color} />;

    case 'checkmark':
      return <CheckmarkIcon size={s} color={color} />;

    case 'lock':
      return <LockIcon size={s} color={color} />;

    case 'gaze_hold':
      // Detailed eye with iris, pupil, and reflection
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Eye outline */}
          <Path
            d="M2 12 C5 7 9 5 12 5 C15 5 19 7 22 12 C19 17 15 19 12 19 C9 19 5 17 2 12"
            fill="none"
            stroke={color}
            strokeWidth="1.8"
          />
          {/* Iris */}
          <Circle cx="12" cy="12" r="4.5" fill={color} />
          {/* Pupil */}
          <Circle cx="12" cy="12" r="2.5" fill="#000" opacity="0.6" />
          {/* Reflection highlights */}
          <Circle cx="10.5" cy="10.5" r="1.2" fill="#FFF" />
          <Circle cx="13" cy="13" r="0.6" fill="#FFF" opacity="0.6" />
        </Svg>
      );

    case 'focus_hold':
      // Crosshair with concentric rings
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="12" cy="12" r="5.5" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="12" cy="12" r="2" fill={color} />
          {/* Crosshair lines */}
          <Line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="2" />
          <Line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="2" />
          <Line x1="2" y1="12" x2="5" y2="12" stroke={color} strokeWidth="2" />
          <Line x1="19" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
        </Svg>
      );

    case 'moving_target':
      // Target with motion lines
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="14" cy="12" r="7" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="14" cy="12" r="4" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="14" cy="12" r="1.5" fill={color} />
          {/* Motion lines */}
          <Line x1="2" y1="9" x2="6" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="3" y1="12" x2="7" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="2" y1="15" x2="6" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );

    case 'finger_hold':
      // Hand with pointing finger
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Palm */}
          <Path
            d="M8 22 L8 14 Q8 12 10 12 L14 12 Q16 12 16 14 L16 22"
            fill={color}
          />
          {/* Index finger pointing up */}
          <Rect x="10.5" y="4" width="3" height="10" rx="1.5" fill={color} />
          {/* Fingernail */}
          <Ellipse cx="12" cy="5" rx="1.2" ry="0.8" fill="#FFF" opacity="0.4" />
          {/* Touch indicator */}
          <Circle cx="12" cy="2.5" r="1.5" fill={color} opacity="0.4" />
        </Svg>
      );

    case 'slow_breathing':
    case 'breath_pacing':
      // Nose with breath flow
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Nose shape */}
          <Path
            d="M12 4 L12 12 Q12 16 9 17 Q7 17 7 15 Q7 13 9 13 M12 12 Q12 16 15 17 Q17 17 17 15 Q17 13 15 13"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Breath flow lines */}
          <Path d="M8 19 Q6 21 4 20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <Path d="M16 19 Q18 21 20 20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <Path d="M9 20 Q7 22 5 21" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
          <Path d="M15 20 Q17 22 19 21" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
        </Svg>
      );

    case 'controlled_breathing':
      // Lungs with airflow
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Trachea */}
          <Line x1="12" y1="3" x2="12" y2="8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Left lung */}
          <Path
            d="M11 8 Q6 9 5 13 Q4 18 7 20 L10 20 Q11 20 11 19 L11 8"
            fill={color}
            opacity="0.8"
          />
          {/* Right lung */}
          <Path
            d="M13 8 Q18 9 19 13 Q20 18 17 20 L14 20 Q13 20 13 19 L13 8"
            fill={color}
            opacity="0.8"
          />
          {/* Bronchi details */}
          <Path d="M10 11 L8 13 M10 14 L7 16" stroke="#FFF" strokeWidth="1" opacity="0.5" />
          <Path d="M14 11 L16 13 M14 14 L17 16" stroke="#FFF" strokeWidth="1" opacity="0.5" />
        </Svg>
      );

    case 'box_breathing':
      // Box with directional arrows
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Rect x="5" y="5" width="14" height="14" fill="none" stroke={color} strokeWidth="2" rx="2" />
          {/* Arrows on each side */}
          <Path d="M8 5 L12 2 L16 5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M19 8 L22 12 L19 16" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M16 19 L12 22 L8 19" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Path d="M5 16 L2 12 L5 8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Center plus for balance */}
          <Line x1="12" y1="9" x2="12" y2="15" stroke={color} strokeWidth="1.5" />
          <Line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1.5" />
        </Svg>
      );

    case 'stillness_test':
      // Zen stone stack
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Bottom stone */}
          <Ellipse cx="12" cy="19" rx="8" ry="3" fill={color} />
          {/* Middle stone */}
          <Ellipse cx="12" cy="14" rx="6" ry="2.5" fill={color} />
          {/* Top stone */}
          <Ellipse cx="12" cy="10" rx="4" ry="2" fill={color} />
          {/* Tiny top stone */}
          <Ellipse cx="12" cy="7" rx="2" ry="1" fill={color} />
          {/* Highlights */}
          <Path d="M6 19 Q8 18 10 19" stroke="#FFF" strokeWidth="0.8" opacity="0.3" fill="none" />
          <Path d="M8 14 Q10 13 12 14" stroke="#FFF" strokeWidth="0.8" opacity="0.3" fill="none" />
        </Svg>
      );

    case 'rhythm_tap':
      // Metronome
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Base */}
          <Path d="M6 22 L8 8 L16 8 L18 22 Z" fill={color} />
          {/* Pendulum arm */}
          <Line x1="12" y1="18" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
          {/* Pendulum weight */}
          <Circle cx="15" cy="8" r="2.5" fill={color} />
          {/* Face details */}
          <Rect x="10" y="12" width="4" height="6" rx="1" fill="#FFF" opacity="0.3" />
          {/* Tick marks */}
          <Line x1="11" y1="13" x2="13" y2="13" stroke={color} strokeWidth="1" />
          <Line x1="11" y1="15" x2="13" y2="15" stroke={color} strokeWidth="1" />
        </Svg>
      );

    case 'slow_tracking':
    case 'finger_tracing':
      // Finger tracing a smooth path
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Wavy path */}
          <Path
            d="M3 14 C6 8 10 18 14 10 C17 5 21 12 21 12"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="0"
          />
          {/* Path trace dots */}
          <Circle cx="3" cy="14" r="1.5" fill={color} opacity="0.4" />
          <Circle cx="8" cy="12" r="1.2" fill={color} opacity="0.5" />
          <Circle cx="14" cy="10" r="1.2" fill={color} opacity="0.6" />
          {/* Finger tip */}
          <Circle cx="21" cy="12" r="3" fill={color} />
          <Ellipse cx="21" cy="10.5" rx="1.5" ry="1" fill="#FFF" opacity="0.3" />
        </Svg>
      );

    case 'tap_only_correct':
      // Checkmark tap indicator
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Circle background */}
          <Circle cx="12" cy="12" r="10" fill={color} opacity="0.2" />
          <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
          {/* Bold checkmark */}
          <Path
            d="M6 12 L10 17 L18 7"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tap ripple */}
          <Circle cx="12" cy="12" r="7" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
        </Svg>
      );

    case 'reaction_inhibition':
      // Stop hand
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Octagon stop sign shape */}
          <Polygon
            points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8"
            fill={color}
          />
          {/* Hand palm */}
          <Path
            d="M9 15 L9 10 Q9 9 10 9 L10 8 Q10 7 11 7 L11 14 M11 7 L11 6.5 Q11 6 12 6 L12 14 M12 6 L12 6.5 Q12 6 13 6 L13 14 M13 6 L13 7 Q13 7 14 7 L14 10 Q14 9 15 9 L15 15 Q15 17 12 17 Q9 17 9 15"
            fill="#FFF"
          />
        </Svg>
      );

    case 'memory_flash':
      // Brain with sparkle
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Brain shape */}
          <Path
            d="M12 3 Q16 3 18 6 Q20 9 19 12 Q20 15 18 18 Q16 21 12 21 Q8 21 6 18 Q4 15 5 12 Q4 9 6 6 Q8 3 12 3"
            fill={color}
          />
          {/* Brain folds */}
          <Path d="M12 3 L12 21" stroke="#FFF" strokeWidth="1" opacity="0.3" />
          <Path d="M8 7 Q10 9 8 11 Q10 13 8 15" stroke="#FFF" strokeWidth="1.5" fill="none" opacity="0.4" />
          <Path d="M16 7 Q14 9 16 11 Q14 13 16 15" stroke="#FFF" strokeWidth="1.5" fill="none" opacity="0.4" />
          {/* Sparkle/flash */}
          <Polygon points="19,4 20,6 22,5 20,7 22,8 20,8 19,10 18,8 16,8 18,7 16,5 18,6" fill="#FFD700" />
        </Svg>
      );

    case 'multi_object_tracking':
      // Three moving dots with trails
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Trails */}
          <Path d="M4 8 Q6 6 8 8" stroke={color} strokeWidth="1.5" fill="none" opacity="0.3" />
          <Path d="M14 6 Q16 4 18 6" stroke={color} strokeWidth="1.5" fill="none" opacity="0.3" />
          <Path d="M10 16 Q12 14 14 16" stroke={color} strokeWidth="1.5" fill="none" opacity="0.3" />
          {/* Moving objects */}
          <Circle cx="8" cy="8" r="3.5" fill={color} />
          <Circle cx="18" cy="7" r="3" fill={color} opacity="0.7" />
          <Circle cx="13" cy="17" r="3.5" fill={color} />
          {/* Highlight eyes */}
          <Circle cx="7" cy="7" r="1" fill="#FFF" opacity="0.5" />
          <Circle cx="17" cy="6" r="0.8" fill="#FFF" opacity="0.5" />
          <Circle cx="12" cy="16" r="1" fill="#FFF" opacity="0.5" />
        </Svg>
      );

    case 'impulse_spike_test':
    case 'impulse_delay':
      // Lightning bolt with energy
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Outer glow */}
          <Path
            d="M13 1 L6 13 L11 13 L9 23 L20 9 L14 9 L17 1 Z"
            fill={color}
            opacity="0.2"
          />
          {/* Main bolt */}
          <Path
            d="M13 2 L7 12 L11 12 L9 22 L19 10 L14 10 L16 2 Z"
            fill={color}
          />
          {/* Inner highlight */}
          <Path
            d="M12 5 L9 11 L11 11 L10 17"
            stroke="#FFF"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
          {/* Energy sparks */}
          <Circle cx="5" cy="10" r="1" fill={color} opacity="0.5" />
          <Circle cx="20" cy="12" r="0.8" fill={color} opacity="0.5" />
        </Svg>
      );

    case 'delay_unlock':
      // Lock with timer
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Lock body */}
          <Rect x="6" y="11" width="12" height="10" rx="2" fill={color} />
          {/* Shackle */}
          <Path
            d="M8 11 L8 7 Q8 3 12 3 Q16 3 16 7 L16 11"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
          />
          {/* Keyhole */}
          <Circle cx="12" cy="15" r="2" fill="#FFF" />
          <Rect x="11" y="15" width="2" height="3" fill="#FFF" />
          {/* Timer arc */}
          <Path
            d="M18 5 A5 5 0 0 1 20 9"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Circle cx="20" cy="9" r="1" fill={color} />
        </Svg>
      );

    case 'fake_notifications':
      // Phone with notification badge
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Phone body */}
          <Rect x="6" y="2" width="12" height="20" rx="2" fill={color} />
          {/* Screen */}
          <Rect x="7" y="4" width="10" height="14" rx="1" fill="#FFF" opacity="0.2" />
          {/* Home button */}
          <Circle cx="12" cy="20" r="1.5" fill="#FFF" opacity="0.3" />
          {/* Notification badge */}
          <Circle cx="17" cy="5" r="4" fill="#FF3B30" />
          <SvgText x="17" y="7" fontSize="6" fill="#FFF" textAnchor="middle" fontWeight="bold">3</SvgText>
          {/* Notification lines on screen */}
          <Line x1="8" y1="7" x2="14" y2="7" stroke={color} strokeWidth="1" opacity="0.5" />
          <Line x1="8" y1="10" x2="12" y2="10" stroke={color} strokeWidth="1" opacity="0.3" />
        </Svg>
      );

    case 'popup_ignore':
      // Browser window with X popup
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Browser window */}
          <Rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
          {/* Title bar */}
          <Rect x="2" y="4" width="20" height="4" fill={color} />
          {/* Window controls */}
          <Circle cx="5" cy="6" r="1" fill="#FF5F57" />
          <Circle cx="8" cy="6" r="1" fill="#FEBC2E" />
          <Circle cx="11" cy="6" r="1" fill="#28C840" />
          {/* Popup box */}
          <Rect x="8" y="10" width="10" height="8" rx="1" fill={color} opacity="0.8" />
          {/* X to close */}
          <Line x1="14" y1="11" x2="17" y2="14" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <Line x1="17" y1="11" x2="14" y2="14" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    case 'multi_task_tap':
      // Multiple simultaneous tap indicators
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Three tap circles */}
          <Circle cx="6" cy="8" r="4" fill="none" stroke={color} strokeWidth="2" />
          <Circle cx="18" cy="8" r="4" fill="none" stroke={color} strokeWidth="2" />
          <Circle cx="12" cy="17" r="4" fill="none" stroke={color} strokeWidth="2" />
          {/* Tap indicators */}
          <Circle cx="6" cy="8" r="2" fill={color} />
          <Circle cx="18" cy="8" r="2" fill={color} />
          <Circle cx="12" cy="17" r="2" fill={color} />
          {/* Connection lines */}
          <Line x1="9" y1="10" x2="10" y2="14" stroke={color} strokeWidth="1" opacity="0.4" />
          <Line x1="15" y1="10" x2="14" y2="14" stroke={color} strokeWidth="1" opacity="0.4" />
          <Line x1="9" y1="7" x2="15" y2="7" stroke={color} strokeWidth="1" opacity="0.4" />
        </Svg>
      );

    case 'tap_pattern':
      // Numbered sequence pattern
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Grid of numbered circles */}
          <Circle cx="6" cy="6" r="4" fill={color} />
          <Circle cx="18" cy="6" r="4" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="6" cy="18" r="4" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="18" cy="18" r="4" fill={color} />
          {/* Numbers */}
          <SvgText x="6" y="8" fontSize="6" fill="#FFF" textAnchor="middle" fontWeight="bold">1</SvgText>
          <SvgText x="18" y="8" fontSize="6" fill={color} textAnchor="middle" fontWeight="bold">2</SvgText>
          <SvgText x="6" y="20" fontSize="6" fill={color} textAnchor="middle" fontWeight="bold">3</SvgText>
          <SvgText x="18" y="20" fontSize="6" fill="#FFF" textAnchor="middle" fontWeight="bold">4</SvgText>
          {/* Connecting arrow */}
          <Path d="M10 6 L14 6 M10 18 L14 18" stroke={color} strokeWidth="1" strokeDasharray="2" opacity="0.5" />
        </Svg>
      );

    case 'body_scan':
      // Human body outline with scan line
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Head */}
          <Circle cx="12" cy="4" r="3" fill="none" stroke={color} strokeWidth="1.5" />
          {/* Body */}
          <Line x1="12" y1="7" x2="12" y2="14" stroke={color} strokeWidth="1.5" />
          {/* Arms */}
          <Path d="M12 9 L7 12 M12 9 L17 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          {/* Legs */}
          <Path d="M12 14 L8 22 M12 14 L16 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          {/* Scan line */}
          <Line x1="5" y1="11" x2="19" y2="11" stroke={color} strokeWidth="2" opacity="0.5" />
          {/* Scan glow */}
          <Rect x="5" y="10" width="14" height="2" fill={color} opacity="0.2" />
        </Svg>
      );

    case 'five_senses':
      // Five senses icons arranged
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Eye - sight */}
          <Ellipse cx="12" cy="5" rx="3" ry="2" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="12" cy="5" r="1" fill={color} />
          {/* Ear - hearing */}
          <Path d="M4 12 Q2 10 3 8 Q5 6 7 8" fill="none" stroke={color} strokeWidth="1.5" />
          {/* Nose - smell */}
          <Path d="M12 10 L12 14 Q10 15 11 16 M12 14 Q14 15 13 16" fill="none" stroke={color} strokeWidth="1.5" />
          {/* Hand - touch */}
          <Path d="M19 10 L19 14 L21 14 M19 12 L17 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          {/* Tongue - taste */}
          <Path d="M10 20 Q12 22 14 20 Q12 21 10 20" fill={color} stroke={color} strokeWidth="1" />
        </Svg>
      );

    case 'calm_visual':
      // Peaceful waves with sun
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Sun */}
          <Circle cx="18" cy="6" r="3" fill={color} />
          {/* Sun rays */}
          <Line x1="18" y1="1" x2="18" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="22" y1="6" x2="23" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="21" y1="3" x2="22" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          {/* Waves */}
          <Path d="M2 14 Q6 11 10 14 T18 14 T22 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M2 18 Q6 15 10 18 T18 18 T22 18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <Path d="M2 22 Q6 19 10 22 T18 22" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </Svg>
      );

    case 'urge_surfing':
      // Surfer on wave
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Big wave */}
          <Path
            d="M2 16 Q6 10 12 14 Q18 18 22 12"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Wave curl */}
          <Path d="M20 12 Q22 10 22 8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Surfer */}
          <Circle cx="11" cy="9" r="2" fill={color} />
          <Line x1="11" y1="11" x2="11" y2="13" stroke={color} strokeWidth="1.5" />
          <Path d="M11 12 L9 13 M11 12 L13 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          {/* Surfboard */}
          <Ellipse cx="11" cy="14" rx="4" ry="1" fill={color} />
        </Svg>
      );

    case 'thought_reframe':
      // Thought bubble with transformation
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Thought cloud */}
          <Path
            d="M6 14 Q3 14 3 11 Q3 8 6 8 Q6 5 10 5 Q14 5 15 8 Q18 7 19 10 Q21 10 21 13 Q21 16 18 16 L6 16 Q3 16 3 13"
            fill={color}
            opacity="0.8"
          />
          {/* Minus becoming plus */}
          <Line x1="8" y1="11" x2="11" y2="11" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          {/* Arrow */}
          <Path d="M12 10 L14 11 L12 12" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
          {/* Plus */}
          <Line x1="16" y1="11" x2="19" y2="11" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <Line x1="17.5" y1="9.5" x2="17.5" y2="12.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          {/* Thought bubbles */}
          <Circle cx="5" cy="19" r="1.5" fill={color} opacity="0.5" />
          <Circle cx="7" cy="21" r="1" fill={color} opacity="0.3" />
        </Svg>
      );

    case 'self_inquiry':
      // Mirror reflection
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Mirror frame */}
          <Ellipse cx="12" cy="11" rx="9" ry="10" fill="none" stroke={color} strokeWidth="2" />
          {/* Stand */}
          <Path d="M8 21 L12 18 L16 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
          {/* Face silhouette */}
          <Circle cx="12" cy="9" r="3" fill={color} opacity="0.5" />
          <Ellipse cx="12" cy="15" rx="4" ry="2" fill={color} opacity="0.3" />
          {/* Question mark */}
          <Path
            d="M11 8 Q11 7 12 7 Q13 7 13 8 Q13 9 12 9.5 L12 10.5"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Circle cx="12" cy="12" r="0.8" fill={color} />
        </Svg>
      );

    case 'distraction_log':
      // Journal with pen
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Book */}
          <Path d="M4 4 L4 20 Q4 21 5 21 L17 21 Q18 21 18 20 L18 4 Q18 3 17 3 L5 3 Q4 3 4 4" fill={color} />
          {/* Spine */}
          <Line x1="7" y1="3" x2="7" y2="21" stroke={color} strokeWidth="2" />
          {/* Lines */}
          <Line x1="9" y1="7" x2="15" y2="7" stroke="#FFF" strokeWidth="1" opacity="0.5" />
          <Line x1="9" y1="10" x2="15" y2="10" stroke="#FFF" strokeWidth="1" opacity="0.5" />
          <Line x1="9" y1="13" x2="13" y2="13" stroke="#FFF" strokeWidth="1" opacity="0.5" />
          {/* Pen */}
          <Path d="M20 2 L22 4 L14 18 L12 18 L12 16 L20 2" fill={color} />
          <Path d="M20 2 L22 4" stroke="#FFF" strokeWidth="0.5" />
        </Svg>
      );

    case 'focus_sprint':
      // Stopwatch with running figure
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Stopwatch */}
          <Circle cx="12" cy="13" r="9" fill="none" stroke={color} strokeWidth="2" />
          {/* Top button */}
          <Rect x="10" y="2" width="4" height="3" rx="1" fill={color} />
          <Line x1="12" y1="1" x2="12" y2="2" stroke={color} strokeWidth="2" />
          {/* Side button */}
          <Rect x="19" y="8" width="3" height="2" rx="0.5" fill={color} />
          {/* Hands */}
          <Line x1="12" y1="13" x2="12" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Line x1="12" y1="13" x2="16" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          {/* Center */}
          <Circle cx="12" cy="13" r="1.5" fill={color} />
          {/* Speed lines */}
          <Line x1="2" y1="11" x2="4" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <Line x1="2" y1="14" x2="5" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        </Svg>
      );

    case 'mental_reset':
      // Refresh with sparkles
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Circular arrow */}
          <Path
            d="M12 4 A8 8 0 1 1 4 12"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Arrow head */}
          <Polygon points="12,1 15,5 9,5" fill={color} />
          {/* Sparkles */}
          <Path d="M18 4 L19 6 L21 5 L19 7 L21 8 L19 8 L18 10 L17 8 L15 8 L17 7 L15 5 L17 6 Z" fill={color} />
          <Circle cx="6" cy="6" r="1" fill={color} opacity="0.5" />
          <Circle cx="19" cy="18" r="1" fill={color} opacity="0.5" />
        </Svg>
      );

    case 'intent_setting':
      // Flag on target
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          {/* Target rings */}
          <Circle cx="12" cy="14" r="8" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="12" cy="14" r="5" fill="none" stroke={color} strokeWidth="1.5" />
          <Circle cx="12" cy="14" r="2" fill={color} />
          {/* Flag pole */}
          <Line x1="12" y1="14" x2="12" y2="2" stroke={color} strokeWidth="2" />
          {/* Flag */}
          <Path d="M12 2 L20 4 L12 7" fill={color} />
        </Svg>
      );

    case 'controlled_breathing':
      // Lungs with flow
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M12 4 L12 9 M8 11 Q5 11 5 14 Q5 19 9 20 L11 20 L11 9 M16 11 Q19 11 19 14 Q19 19 15 20 L13 20 L13 9"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Path d="M8 14 Q10 12 12 14 Q14 12 16 14" stroke={color} strokeWidth="1.5" fill="none" />
        </Svg>
      );

    case 'focus_hold':
      // Crosshair target
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="2" />
          <Line x1="12" y1="2" x2="12" y2="6" stroke={color} strokeWidth="2" />
          <Line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="2" />
          <Line x1="2" y1="12" x2="6" y2="12" stroke={color} strokeWidth="2" />
          <Line x1="18" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
          <Circle cx="12" cy="12" r="2" fill={color} />
        </Svg>
      );

    case 'slow_breathing':
      // Gentle wave breath
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M4 12 Q8 6 12 12 T20 12"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Circle cx="4" cy="12" r="2" fill={color} />
          <Circle cx="20" cy="12" r="2" fill={color} />
        </Svg>
      );

    default:
      // Default sparkle/star icon for exercises
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Polygon
            points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10"
            fill={color}
          />
        </Svg>
      );
  }
}

/**
 * Custom SVG Icons for UI Elements
 */
interface IconProps {
  size: number;
  color: string;
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

function GemIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2L4 8L12 22L20 8Z" fill={color} />
      <Path d="M12 2L8 8L12 14L16 8Z" fill="rgba(255,255,255,0.4)" />
      <Path d="M4 8L8 8L12 14Z" fill="rgba(0,0,0,0.2)" />
      <Path d="M20 8L16 8L12 14Z" fill="rgba(0,0,0,0.2)" />
    </Svg>
  );
}

function HeartIcon({ size, color, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21C12 21 3 15 3 9C3 6 5 4 7.5 4C9.5 4 11 5 12 6C13 5 14.5 4 16.5 4C19 4 21 6 21 9C21 15 12 21 12 21Z"
        fill={filled ? color : 'none'}
        stroke={filled ? 'none' : color}
        strokeWidth={filled ? 0 : 2}
      />
    </Svg>
  );
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

function HomeIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path 
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" 
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function DumbbellIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.5 6.5L17.5 17.5M6.5 6.5L3 10M6.5 6.5L10 3M17.5 17.5L21 14M17.5 17.5L14 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="6.5" cy="6.5" r="2" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="17.5" cy="17.5" r="2" stroke={color} strokeWidth="2" fill="none" />
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

function MenuIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="6" r="1.5" fill={color} />
      <Circle cx="12" cy="18" r="1.5" fill={color} />
    </Svg>
  );
}

function MeditationIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="6" r="3" fill={color} />
      <Path d="M12 10 L12 14 M12 11 L8 12.5 M12 11 L16 12.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M12 14 L9 18 M12 14 L15 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Ellipse cx="12" cy="19" rx="6" ry="1" fill={color} opacity="0.3" />
    </Svg>
  );
}

function StarFilledIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9"
        fill={color}
      />
    </Svg>
  );
}

function StarEmptyIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
}

function CrownIcon({ size, color }: IconProps) {
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

function ShieldIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Shield outline */}
      <Path
        d="M12 2L4 5V11C4 16 7 20 12 22C17 20 20 16 20 11V5L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Phone icon inside shield */}
      <Rect
        x="9.5"
        y="8"
        width="5"
        height="8"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* X mark over phone */}
      <Path
        d="M8.5 11L13.5 16M13.5 11L8.5 16"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LockIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="7" y="11" width="10" height="9" rx="1" fill={color} />
      <Path
        d="M9 11 L9 8 Q9 5 12 5 Q15 5 15 8 L15 11"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      <Circle cx="12" cy="15.5" r="2" fill="#FFF" />
    </Svg>
  );
}

function BookIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 2L4 4V20L6 22H18L20 20V4L18 2H6Z" fill={color} />
      <Path d="M8 6H16M8 10H16M8 14H13" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 2V22" stroke={color} strokeWidth="1" opacity="0.3" />
    </Svg>
  );
}

function CheckmarkIcon({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 12 L10 17 L19 6"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Duolingo-Style Header with Streak, Gems, Hearts, Profile
 */
interface HeaderProps {
  topInset: number;
  currentHearts: number;
  maxHearts: number;
  streak: number;
  gems: number;
  onProfilePress: () => void;
}

function DuolingoHeader({ topInset, currentHearts, maxHearts, streak, gems, onProfilePress }: HeaderProps) {
  return (
    <View style={[styles.duoHeader, { paddingTop: Math.max(topInset, 12) }]}>
      {/* Streak */}
      <View style={styles.duoHeaderStat}>
        <View style={styles.duoHeaderIconContainer}>
          <FlameIcon size={20} color="#FF6B35" />
        </View>
        <Text style={styles.duoHeaderValue}>{streak}</Text>
      </View>

      {/* Gems/XP */}
      <View style={styles.duoHeaderStat}>
        <View style={styles.duoHeaderIconContainer}>
          <GemIcon size={20} color="#1CB0F6" />
        </View>
        <Text style={styles.duoHeaderValue}>{gems}</Text>
      </View>

      {/* Hearts */}
      <View style={styles.duoHeaderStat}>
        <View style={styles.duoHeaderIconContainer}>
          <HeartIcon size={20} color="#FF4B4B" />
        </View>
        <Text style={styles.duoHeaderValue}>{currentHearts}</Text>
      </View>

      {/* Profile/Menu */}
      <TouchableOpacity
        style={styles.duoProfileButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onProfilePress();
        }}
        activeOpacity={0.7}
      >
        <ProfileIcon size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Section/Unit Banner - Like "SECTION 2, UNIT 16"
 */
interface SectionBannerProps {
  sectionNumber: number;
  unitNumber: number;
  title: string;
  color: string;
}

function SectionBanner({ sectionNumber, unitNumber, title, color }: SectionBannerProps) {
  return (
    <View style={styles.sectionBanner}>
      <LinearGradient
        colors={[color + 'DD', color + 'BB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionGradient}
      >
        <View style={styles.sectionContent}>
          <View style={styles.sectionTextContainer}>
            <Text style={styles.sectionLabel}>SECTION {sectionNumber}, UNIT {unitNumber}</Text>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <TouchableOpacity style={styles.sectionButton}>
            <BookIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

/**
 * Bottom Navigation Bar - Duolingo Style
 */
interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  bottomInset: number;
}

function BottomNav({ activeTab, onTabPress, bottomInset }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Learn', IconComponent: HomeIcon },
    { id: 'practice', label: 'Practice', IconComponent: DumbbellIcon },
    { id: 'shield', label: 'Shield', IconComponent: ShieldIcon },
    { id: 'leaderboard', label: 'Ranks', IconComponent: TrophyIcon },
    { id: 'profile', label: 'Profile', IconComponent: ProfileIcon },
  ];

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.IconComponent;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.navTab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabPress(tab.id);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.navIconContainer, isActive && styles.navIconActiveContainer]}>
              <IconComponent
                size={24}
                color={isActive ? '#1CB0F6' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * Level Node Component with Duolingo Styling
 */
interface LevelNodeProps {
  node: LevelNode;
  onPress: () => void;
  showCharacter?: boolean; // New: show character above this node
}

function LevelNodeComponent({ node, onPress, showCharacter }: LevelNodeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for current and available nodes
    if (node.status === 'current') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [node.status]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (node.status === 'locked') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getNodeColors = () => {
    // Bonus nodes - floating light orbs in open space
    if (node.isBonus) {
      return {
        gradient: node.status === 'completed'
          ? ['#FFD700', '#FFA500', '#FF8C00'] as [string, string, string]  // Golden glow when completed
          : node.status === 'locked'
          ? ['#9CA3AF', '#6B7280', '#4B5563'] as [string, string, string]  // Gray when locked
          : ['#FFF5E6', '#FFE4B5', '#FFD700'] as [string, string, string],  // Soft yellow/white glow
        border: node.status === 'locked' ? '#9CA3AF' : 'rgba(255, 215, 0, 0.4)',
        glow: node.status === 'locked' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 215, 0, 0.7)',
        icon: null,
        activityType: node.bonusActivityType as NodeIconType,
        iconColor: node.status === 'locked' ? '#9CA3AF' : '#FFA500',
        showCheck: node.status === 'completed',
        isSquare: false,  // Circular orbs
        shadowColor: node.status === 'locked' ? '#000000' : '#FFD700',
      };
    }

    // Special styling for mastery test nodes (every 25 levels) - golden crowns
    if (node.isMilestone) {
      const isLocked = node.status === 'locked';
      const milestoneGradient: [string, string, string] = isLocked
        ? ['#E5E5E5', '#D0D0D0', '#B0B0B0']
        : ['#FFC800', '#FF9600', '#F59E0B'];
      return {
        gradient: milestoneGradient,
        border: isLocked ? '#C0C0C0' : '#FBBF24',
        glow: isLocked ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 200, 0, 0.6)',
        icon: null, // Will use CrownIcon
        activityType: 'crown' as NodeIconType,
        iconColor: isLocked ? '#9CA3AF' : '#FFFFFF',
        showCheck: node.status === 'completed',
        isSquare: false,
        shadowColor: isLocked ? '#000000' : '#FFC800',
      };
    }

    // Regular node styling - Duolingo green for completed, blue for current/available
    // Use the actual activity type from the node for the icon
    const nodeActivityType: NodeIconType = node.activityType || getDefaultActivityForRealm(node.realm.id);
    
    switch (node.status) {
      case 'completed':
        return {
          gradient: ['#58CC02', '#46A302', '#3A8700'] as [string, string, string],
          border: '#7DE82F',
          glow: 'rgba(88, 204, 2, 0.5)',
          icon: null,
          activityType: nodeActivityType, // Show the actual activity icon even when completed
          iconColor: '#FFFFFF',
          showCheck: true,
          isSquare: false,
          shadowColor: '#58CC02',
        };
      case 'current':
        return {
          gradient: ['#1CB0F6', '#1899D6', '#0E7AB0'] as [string, string, string],
          border: '#3DCCFF',
          glow: 'rgba(28, 176, 246, 0.6)',
          icon: null,
          activityType: nodeActivityType, // Use actual activity type from node
          iconColor: '#FFFFFF',
          showCheck: false,
          isSquare: false,
          shadowColor: '#1CB0F6',
        };
      case 'available':
        return {
          gradient: ['#1CB0F6', '#1899D6', '#0E7AB0'] as [string, string, string],
          border: '#3DCCFF',
          glow: 'rgba(28, 176, 246, 0.4)',
          icon: null,
          activityType: nodeActivityType, // Use actual activity type from node
          iconColor: '#FFFFFF',
          showCheck: false,
          isSquare: false,
          shadowColor: '#1CB0F6',
        };
      case 'locked':
      default:
        return {
          gradient: ['#E5E5E5', '#D0D0D0', '#B0B0B0'] as [string, string, string],
          border: '#C0C0C0',
          glow: 'rgba(0, 0, 0, 0.1)',
          icon: null,
          activityType: nodeActivityType, // Show activity icon even for locked (grayed out)
          iconColor: '#9CA3AF',
          showCheck: false,
          isSquare: false,
          shadowColor: '#000000',
        };
    }
  };

  const colors = getNodeColors();
  const size = node.isMilestone ? NODE_SIZE * 1.2 : node.isBonus ? NODE_SIZE * 0.5 : NODE_SIZE;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={node.status === 'locked'}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        }}
      >
        {/* Character removed - cleaner design */}

        {/* Enhanced glow effect - multiple layers for depth */}
        {(node.status === 'current' || node.status === 'available') && (
          <>
            {/* Outer glow */}
            <View
              style={[
                styles.nodeGlow,
                {
                  width: size + 30,
                  height: size + 30,
                  borderRadius: (size + 30) / 2,
                  backgroundColor: colors.glow,
                  opacity: node.status === 'current' ? 0.4 : 0.2,
                },
              ]}
            />
            {/* Inner glow */}
            <View
              style={[
                styles.nodeGlow,
                {
                  width: size + 15,
                  height: size + 15,
                  borderRadius: (size + 15) / 2,
                  backgroundColor: colors.glow,
                  opacity: node.status === 'current' ? 0.5 : 0.25,
                },
              ]}
            />
          </>
        )}
        {/* Milestone glow - golden aura */}
        {node.isMilestone && node.status !== 'locked' && (
          <View
            style={[
              styles.nodeGlow,
              {
                width: size + 40,
                height: size + 40,
                borderRadius: (size + 40) / 2,
                backgroundColor: 'rgba(255, 200, 0, 0.5)',
                opacity: 0.6,
              },
            ]}
          />
        )}
        {/* Completed nodes - subtle green glow */}
        {node.status === 'completed' && !node.isMilestone && (
          <View
            style={[
              styles.nodeGlow,
              {
                width: size + 20,
                height: size + 20,
                borderRadius: (size + 20) / 2,
                backgroundColor: 'rgba(88, 204, 2, 0.4)',
                opacity: 0.3,
              },
            ]}
          />
        )}

        {/* Main node */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.node,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: colors.border,
              borderWidth: node.status === 'current' ? 6 : node.isMilestone ? 5.5 : 5,
            },
            Platform.select({
              ios: {
                shadowColor: colors.shadowColor,
                shadowOffset: { width: 0, height: node.status === 'current' ? 8 : 6 },
                shadowOpacity: node.status === 'locked' ? 0.15 : node.isMilestone ? 0.5 : 0.4,
                shadowRadius: node.status === 'current' ? 14 : node.isMilestone ? 12 : 10,
              },
              android: {
                elevation: node.status === 'current' ? 14 : node.isMilestone ? 12 : 10,
              },
            }),
          ]}
        >
          {/* Content - Use custom SVG icon */}
          {colors.activityType ? (
            <ActivityIcon
              activityType={colors.activityType}
              size={node.isMilestone ? 44 : 40}
              color={colors.iconColor}
            />
          ) : (
            <Text style={[styles.nodeIconText, { color: colors.iconColor, fontSize: node.isMilestone ? 40 : 32 }]}>
              {colors.icon}
            </Text>
          )}

          {/* Check badge for completed */}
          {colors.showCheck && (
            <View style={styles.checkBadge}>
              <CheckmarkIcon size={14} color="#FFFFFF" />
            </View>
          )}

          {/* Level number badge for milestone */}
          {node.isMilestone && (
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneBadgeText}>L{node.level}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * Realm Header - Clean centered title between levels
 */
interface RealmHeaderProps {
  realm: FocusRealm;
  levelsCompleted: number;
  totalLevels: number;
  isFirst?: boolean;
}

function RealmHeader({ realm, levelsCompleted, totalLevels, isFirst }: RealmHeaderProps) {
  const progress = (levelsCompleted / totalLevels) * 100;

  return (
    <View style={[styles.realmHeader, isFirst && styles.realmHeaderFirst]}>
      {/* Clean centered title card */}
      <View style={styles.realmTitleCard}>
        {/* Main title */}
        <Text style={[
          styles.realmName,
          { color: realm.colors.accent }
        ]}>
          {realm.name.toUpperCase()}
        </Text>

        {/* Subtitle / Theme */}
        <Text style={styles.realmSubtitle}>
          {realm.theme}
        </Text>

        {/* Progress indicator */}
        <View style={styles.realmProgressPill}>
          <View style={[styles.realmProgressDot, { backgroundColor: realm.colors.accent }]} />
          <Text style={[styles.realmProgressText, { color: realm.colors.accent }]}>
            {levelsCompleted} / {totalLevels}
          </Text>
          <View style={styles.realmProgressBarMini}>
            <View 
              style={[
                styles.realmProgressFillMini, 
                { 
                  width: `${progress}%`,
                  backgroundColor: realm.colors.accent 
                }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Main Component
 */
export function VerticalProgressPath({ onBack, onLevelSelect, onNavigate }: VerticalProgressPathProps) {
  const { progress, heartState } = useGame();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [currentRealmIndex, setCurrentRealmIndex] = useState(Math.max(0, Math.ceil((progress?.level || 1) / 25) - 1));
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Generate all 250 levels (10 realms × 25 levels each) + bonus challenges
  const allLevels = useMemo<LevelNode[]>(() => {
    const currentLevel = progress?.level || 1;
    const nodes: LevelNode[] = [];
    const { getJourneyLevel, getPrimaryActivityType } = require('@/lib/journey-levels');

    // Bonus activity types for variety
    const bonusActivities: ActivityType[] = [
      'breath_pacing',
      'controlled_breathing',
      'finger_tracing',
      'memory_flash',
      'tap_pattern',
    ];

    for (let i = 0; i < 250; i++) {
      const level = i + 1;
      const realmId = Math.ceil(level / 25);
      const realm = FOCUS_REALMS[realmId - 1];
      const isMilestone = level % 25 === 0; // Mastery test every 25 levels (realm completion)
      const levelInRealm = (level - 1) % 25;

      let status: LevelStatus;
      if (level < currentLevel) {
        status = 'completed';
      } else if (level === currentLevel) {
        status = 'current';
      } else {
        // All levels unlocked for testing/development
        status = 'available';
      }

      // Get journey level data
      const journeyLevel = getJourneyLevel(level, currentLevel);
      const primaryActivityType = getPrimaryActivityType(level);

      // Add main level node
      nodes.push({
        level,
        realmId,
        realm,
        status,
        isMilestone,
        activityType: isMilestone ? undefined : primaryActivityType,
        exerciseCount: journeyLevel.activities.length,
      });

      // Add exactly 4 bonus challenges per realm in the perfect curve spots
      // Place them at the widest gaps: after levels 4, 9, 14, 19 in each realm
      // These are the positions where S-curves create maximum open space
      const bonusPositions = [4, 9, 14, 19]; // Perfect spots in 25-level realm
      const shouldAddBonus = bonusPositions.includes(levelInRealm) && !isMilestone;

      if (shouldAddBonus) {
        const bonusLevel = level + 0.5; // Fractional level for bonus (e.g., 4.5, 9.5, 14.5, 19.5)
        const bonusIndex = bonusPositions.indexOf(levelInRealm);
        const bonusActivity = bonusActivities[bonusIndex % bonusActivities.length];

        nodes.push({
          level: bonusLevel,
          realmId,
          realm,
          status: level < currentLevel ? 'completed' : 'available',
          isMilestone: false,
          isBonus: true,
          bonusActivityType: bonusActivity,
          activityType: bonusActivity,
          exerciseCount: 1,
        });
      }
    }

    return nodes;
  }, [progress?.level]);

  // Calculate Y position for each level
  const getLevelYPosition = (level: number): number => {
    const realmIndex = Math.ceil(level / 25) - 1;
    const levelInRealm = (level - 1) % 25;

    return (
      realmIndex * (REALM_HEADER_HEIGHT + 25 * NODE_SPACING) +
      REALM_HEADER_HEIGHT +
      levelInRealm * NODE_SPACING +
      60
    );
  };

  // Calculate X position for winding path effect - Duolingo style
  const getLevelXPosition = (level: number, isBonus: boolean = false): number => {
    // For bonus nodes, position them in the WIDEST open space between curves
    if (isBonus) {
      const baseLevel = Math.floor(level); // e.g., 2 from 2.5
      const baseLevelInRealm = (baseLevel - 1) % 25;
      const cycleLength = 5;

      // Get positions of the base level and next level
      const baseCycleProgress = (baseLevelInRealm % cycleLength) / cycleLength;
      const baseCycleNumber = Math.floor(baseLevelInRealm / cycleLength);
      const baseDirection = baseCycleNumber % 2 === 0 ? 1 : -1;

      const nextLevelInRealm = baseLevelInRealm + 1;
      const nextCycleProgress = (nextLevelInRealm % cycleLength) / cycleLength;
      const nextCycleNumber = Math.floor(nextLevelInRealm / cycleLength);
      const nextDirection = nextCycleNumber % 2 === 0 ? 1 : -1;

      // Calculate path positions
      const baseCurvePos = Math.sin(baseCycleProgress * Math.PI - Math.PI / 2) * 0.5 + 0.5;
      const baseSineOffset = (baseCurvePos * 2 - 1) * baseDirection;

      const nextCurvePos = Math.sin(nextCycleProgress * Math.PI - Math.PI / 2) * 0.5 + 0.5;
      const nextSineOffset = (nextCurvePos * 2 - 1) * nextDirection;

      // Calculate the midpoint between current and next path position
      const avgPathOffset = (baseSineOffset + nextSineOffset) / 2;

      // Position bonus on the OPPOSITE side of the average path position
      // This puts it in the widest gap
      const bonusOffset = -avgPathOffset * WINDING_AMPLITUDE * 0.9;

      return SCREEN_WIDTH / 2 - (NODE_SIZE * 0.5) / 2 + bonusOffset;
    }

    // Regular node calculation
    const levelInRealm = (level - 1) % 25;
    const cycleLength = 5;
    const cycleProgress = (levelInRealm % cycleLength) / cycleLength;
    const cycleNumber = Math.floor(levelInRealm / cycleLength);
    const direction = cycleNumber % 2 === 0 ? 1 : -1;

    const curvePosition = Math.sin(cycleProgress * Math.PI - Math.PI / 2) * 0.5 + 0.5;
    const sineOffset = (curvePosition * 2 - 1) * direction;

    return SCREEN_WIDTH / 2 - NODE_SIZE / 2 + sineOffset * WINDING_AMPLITUDE;
  };

  const currentLevelY = getLevelYPosition(progress?.level || 1);

  // Auto-scroll to current level on mount
  useEffect(() => {
    if (!hasScrolled && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentLevelY - SCREEN_HEIGHT / 2 + 100),
          animated: true,
        });
        setHasScrolled(true);
      }, 500);
    }
  }, [currentLevelY, hasScrolled]);

  // Group levels by realm
  const realmGroups = useMemo(() => {
    const groups: { [key: number]: LevelNode[] } = {};
    allLevels.forEach(node => {
      if (!groups[node.realmId]) groups[node.realmId] = [];
      groups[node.realmId].push(node);
    });
    return groups;
  }, [allLevels]);

  const currentRealm = FOCUS_REALMS[Math.ceil((progress?.level || 1) / 25) - 1];

  // Handle scroll to update background with smooth blending between realms
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const realmHeight = REALM_HEADER_HEIGHT + 25 * NODE_SPACING;
    const newRealmIndex = Math.max(0, Math.min(9, Math.floor(offsetY / realmHeight)));
    const progress = (offsetY % realmHeight) / realmHeight;

    if (newRealmIndex !== currentRealmIndex) {
      setCurrentRealmIndex(newRealmIndex);
    }
    setScrollProgress(progress);
  };

  // Calculate total content height for gradient
  const totalContentHeight = useMemo(() => {
    return 10 * (REALM_HEADER_HEIGHT + 25 * NODE_SPACING) + 200; // 10 realms + bottom spacing
  }, []);

  // Create continuous gradient that stretches across all realms
  // The gradient smoothly blends from one realm to the next with vibrant colors
  // Uses more color stops for ultra-smooth transitions
  const continuousGradient = useMemo(() => {
    const realmHeight = REALM_HEADER_HEIGHT + 25 * NODE_SPACING;
    const colors: string[] = [];
    const locations: number[] = [];

    // Start with first realm - blend background with accent for more color
    const firstRealm = FOCUS_REALMS[0];
    const startColor = interpolateColor(firstRealm.background.top, firstRealm.colors.accent, 0.3);
    colors.push(startColor);
    locations.push(0);

    // For each realm, create ultra-smooth transitions with more color stops
    for (let i = 0; i < FOCUS_REALMS.length; i++) {
      const realm = FOCUS_REALMS[i];
      const realmStartY = i * realmHeight;
      const realmQuarterY = realmStartY + realmHeight * 0.25;
      const realmMidY = realmStartY + realmHeight * 0.5;
      const realmThreeQuarterY = realmStartY + realmHeight * 0.75;
      const realmEndY = (i + 1) * realmHeight;
      
      // Add smooth transition from previous realm
      if (i > 0) {
        const prevRealm = FOCUS_REALMS[i - 1];
        // Create a smooth blend between realms using multiple steps
        const prevBlend = interpolateColor(prevRealm.background.bottom, prevRealm.colors.accent, 0.4);
        const currBlend = interpolateColor(realm.background.top, realm.colors.accent, 0.4);
        
        // Add transition point at boundary
        const transitionColor = interpolateColor(prevBlend, currBlend, 0.5);
        colors.push(transitionColor);
        locations.push(realmStartY / totalContentHeight);
      }

      // Add realm's vibrant top color (blend background with accent)
      const vibrantTop = interpolateColor(realm.background.top, realm.colors.accent, 0.35);
      colors.push(vibrantTop);
      locations.push((realmStartY + REALM_HEADER_HEIGHT * 0.15) / totalContentHeight);

      // Add quarter point with slight accent
      const quarterColor = interpolateColor(realm.background.top, realm.colors.accent, 0.4);
      colors.push(quarterColor);
      locations.push(realmQuarterY / totalContentHeight);

      // Add vibrant mid color (more accent color in the middle)
      const vibrantMid = interpolateColor(realm.colors.primary, realm.colors.accent, 0.65);
      colors.push(vibrantMid);
      locations.push(realmMidY / totalContentHeight);

      // Add three-quarter point
      const threeQuarterColor = interpolateColor(realm.background.bottom, realm.colors.accent, 0.4);
      colors.push(threeQuarterColor);
      locations.push(realmThreeQuarterY / totalContentHeight);

      // Add realm's vibrant bottom color
      const vibrantBottom = interpolateColor(realm.background.bottom, realm.colors.accent, 0.35);
      colors.push(vibrantBottom);
      
      if (i < FOCUS_REALMS.length - 1) {
        // Blend with next realm at the boundary (ultra-smooth transition)
        const nextRealm = FOCUS_REALMS[i + 1];
        const currEndBlend = interpolateColor(realm.background.bottom, realm.colors.accent, 0.4);
        const nextStartBlend = interpolateColor(nextRealm.background.top, nextRealm.colors.accent, 0.4);
        
        // Add transition point before boundary
        const preTransition = interpolateColor(vibrantBottom, currEndBlend, 0.7);
        colors.push(preTransition);
        locations.push((realmEndY - REALM_HEADER_HEIGHT * 0.15) / totalContentHeight);
        
        // Add final transition color for smooth blend to next realm
        const transitionColor = interpolateColor(currEndBlend, nextStartBlend, 0.5);
        colors.push(transitionColor);
        locations.push(realmEndY / totalContentHeight);
      } else {
        // Last realm - end with vibrant color
        const vibrantEnd = interpolateColor(realm.background.bottom, realm.colors.accent, 0.4);
        colors[colors.length - 1] = vibrantEnd;
        locations.push(1.0);
      }
    }

    return { colors, locations };
  }, [totalContentHeight]);

  // Get current realm accent color for effects
  const currentRealmAccent = FOCUS_REALMS[currentRealmIndex]?.colors?.accent || '#6366F1';

  return (
    <View style={styles.container}>
      {/* Simple smooth animated background */}
      <SimpleAnimatedBackground
        accentColor={currentRealmAccent}
        realmIndex={currentRealmIndex}
        scrollProgress={scrollProgress}
      />

      {/* Vignette effect - only at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)'] as const}
        style={StyleSheet.absoluteFill}
        locations={[0.85, 1]}
      />

      {/* Duolingo-Style Header */}
      <UniversalHeader
        hearts={heartState?.currentHearts || 5}
        streak={progress?.streak || 0}
        gems={progress?.xp || 0}
        onProfilePress={() => onNavigate?.('profile-screen')}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 8) + 50 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Continuous gradient that stretches across entire progress path */}
        <View style={[styles.gradientContainer, { height: totalContentHeight }]} pointerEvents="none">
          <LinearGradient
            colors={continuousGradient.colors}
            locations={continuousGradient.locations}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
          {/* Render each realm */}
          {Object.entries(realmGroups).map(([realmId, nodes], index) => {
            const realm = nodes[0].realm;
            const completed = nodes.filter(n => n.status === 'completed').length;

            return (
              <View key={realmId} style={styles.realmSection}>
                {/* Realm Header */}
                <RealmHeader 
                  realm={realm} 
                  levelsCompleted={completed} 
                  totalLevels={25} 
                  isFirst={index === 0}
                />

                {/* Level Nodes */}
                <View style={styles.levelsContainer}>
                  {/* SVG layer for connection lines (behind nodes) */}
                  <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                    {nodes.map((node) => {
                      if (node.level % 25 === 0 || node.isBonus) return null; // No line after milestone or for bonus nodes

                      const currentX = getLevelXPosition(node.level, node.isBonus);
                      const nextX = getLevelXPosition(node.level + 1, false);
                      const currentY = getLevelYPosition(node.level) - (parseInt(realmId) - 1) * (REALM_HEADER_HEIGHT + 25 * NODE_SPACING) - REALM_HEADER_HEIGHT;
                      const nextY = currentY + NODE_SPACING;

                      // Center points of current and next nodes
                      const x1 = currentX + NODE_SIZE / 2;
                      const y1 = currentY + NODE_SIZE / 2;
                      const x2 = nextX + NODE_SIZE / 2;
                      const y2 = nextY + NODE_SIZE / 2;

                      const lineColor = node.status === 'completed'
                        ? '#58CC02' // Duolingo green
                        : 'rgba(229, 229, 229, 0.8)'; // Gray for incomplete

                      return (
                        <Line
                          key={`line-${node.level}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={lineColor}
                          strokeWidth={4}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </Svg>
                  
                  {/* Nodes layer (on top of lines) */}
                  {nodes.map((node, index) => {
                    const currentX = getLevelXPosition(node.level, node.isBonus);
                    const currentY = getLevelYPosition(node.level) - (parseInt(realmId) - 1) * (REALM_HEADER_HEIGHT + 25 * NODE_SPACING) - REALM_HEADER_HEIGHT;

                    return (
                      <View
                        key={`${realmId}-${node.level}-${node.isBonus ? 'bonus' : 'main'}-${index}`}
                        style={[
                          styles.levelWrapper,
                          {
                            left: currentX,
                            top: currentY,
                          },
                        ]}
                      >
                        <LevelNodeComponent
                          node={node}
                          onPress={() => onLevelSelect(Math.floor(node.level))}
                          showCharacter={node.status === 'current' && !node.isBonus}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Bottom spacing */}
          <View style={{ height: 200 }} />
        </ScrollView>

      {/* Bottom Navigation Bar */}
      <UniversalFooter
        activeTab="path"
        onTabChange={(tab) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (tab === 'home') {
            onNavigate?.('home');
          } else if (tab === 'path') {
            // Already on path, scroll to top
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          } else if (tab === 'practice') {
            onNavigate?.('practice');
          } else if (tab === 'shield') {
            onNavigate?.('focus-shield');
          } else if (tab === 'premium') {
            onNavigate?.('premium');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Animated orbs
  glowOrb: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
  },

  // Duolingo Header
  duoHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  duoHeaderStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  duoHeaderIconContainer: {
    marginRight: 6,
  },
  duoHeaderValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  duoProfileButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 176, 246, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duoProfileIcon: {
    fontSize: 20,
  },

  // Section Banner
  sectionBanner: {
    height: REALM_HEADER_HEIGHT,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  sectionGradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionButtonIcon: {
    fontSize: 24,
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIconContainer: {
    marginBottom: 2,
  },
  navIconActiveContainer: {
    // Could add background or border here
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  navLabelActive: {
    color: '#1CB0F6',
  },

  // Realm Section
  realmSection: {
    marginBottom: 40,
    zIndex: 1,
  },
  realmHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: -10,
  },
  realmHeaderFirst: {
    paddingTop: 40,
  },
  realmTitleCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    gap: 6,
  },
  realmName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
    marginVertical: 8,
  },
  realmSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  realmProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 10,
    marginTop: 4,
  },
  realmProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  realmProgressText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  realmProgressBarMini: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  realmProgressFillMini: {
    height: '100%',
    borderRadius: 2,
  },

  // Levels Container
  levelsContainer: {
    position: 'relative',
    height: 25 * NODE_SPACING,
    zIndex: 1,
  },
  levelWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },

  // Node
  nodeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    opacity: 0.3,
  },
  node: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nodeIconText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#58CC02',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  milestoneBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#FFC800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  milestoneBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Character
  characterContainer: {
    position: 'absolute',
    bottom: NODE_SIZE + 10,
    alignItems: 'center',
    zIndex: 10,
  },
  characterCircle: {
    width: COMPANION_SIZE,
    height: COMPANION_SIZE,
    borderRadius: COMPANION_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1CB0F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  characterEmoji: {
    fontSize: 32,
  },
  starRatings: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  star: {
    fontSize: 12,
  },
  starEmpty: {
    fontSize: 12,
    opacity: 0.3,
  },

});
