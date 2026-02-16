import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RealmTheme } from '@/lib/realm-themes';
import { HapticPatterns } from '@/lib/haptic-patterns';
import { UIIcon } from '@/components/ui/UIIcon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AchievementAnimationProps {
  type: 'level' | 'milestone' | 'perfect' | 'streak';
  realm: RealmTheme;
  level?: number;
  message?: string;
  onComplete: () => void;
}

/**
 * Beautiful achievement celebration animations
 * - Level complete: Quick burst with level number
 * - Milestone: Bigger celebration with special effects
 * - Perfect: Golden shine effect
 * - Streak: Fire/lightning effect
 */
export function AchievementAnimation({
  type,
  realm,
  level,
  message,
  onComplete,
}: AchievementAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const particles = useRef(
    Array.from({ length: 30 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Trigger haptic
    if (type === 'milestone') {
      HapticPatterns.milestone();
    } else if (type === 'perfect') {
      HapticPatterns.success();
    } else {
      HapticPatterns.levelComplete();
    }

    // Main animation sequence
    Animated.sequence([
      // Fade in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // Hold
      Animated.delay(type === 'milestone' ? 2000 : 1200),
      
      // Fade out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });

    // Particle burst
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;
      const delay = index * 15;
      
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: Math.cos(angle) * distance,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: Math.sin(angle) * distance,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 200,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(particle.scale, {
            toValue: 1,
            friction: 5,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, []);

  const getAchievementContent = () => {
    switch (type) {
      case 'level':
        return {
          icon: 'party' as const,
          title: `Level ${level}`,
          subtitle: 'Complete!',
          colors: [realm.colors.primary, realm.colors.secondary],
        };
      case 'milestone':
        return {
          icon: 'trophy' as const,
          title: 'Milestone',
          subtitle: message || 'Achievement Unlocked!',
          colors: [realm.colors.primary, realm.colors.accent],
        };
      case 'perfect':
        return {
          icon: 'diamond' as const,
          title: 'Perfect!',
          subtitle: 'Flawless Execution',
          colors: ['#FCD34D', '#FBBF24'],
        };
      case 'streak':
        return {
          icon: 'fire' as const,
          title: `${level} Day Streak`,
          subtitle: 'Keep it up!',
          colors: ['#F59E0B', '#EF4444'],
        };
      default:
        return {
          icon: 'confetti' as const,
          title: 'Achievement',
          subtitle: 'Unlocked',
          colors: [realm.colors.primary, realm.colors.secondary],
        };
    }
  };

  const content = getAchievementContent();

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Particles */}
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                backgroundColor: index % 2 === 0 ? content.colors[0] : content.colors[1],
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale },
                ],
                opacity: particle.opacity,
              },
            ]}
          />
        ))}
        
        {/* Main card */}
        <LinearGradient
          colors={[...content.colors, content.colors[0]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <UIIcon name={content.icon} size={56} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  card: {
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
});
























