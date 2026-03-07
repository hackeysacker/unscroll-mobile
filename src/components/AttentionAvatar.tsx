import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, Text } from 'react-native';
import { useAttentionAvatar } from '@/contexts/AttentionAvatarContext';
import { getSkinColors } from '@/lib/avatar-evolution';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';

interface AttentionAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showParticles?: boolean;
  position?: 'fixed' | 'relative';
}

const SIZE_MAP = {
  small: 60,
  medium: 80,
  large: 100,
};

/**
 * AttentionAvatar - The living, breathing mascot of your attention journey
 * 
 * This component renders the avatar with:
 * - Smooth animations based on mood
 * - Evolution-based appearance
 * - Particle effects
 * - Customizations (wings, crown, aura)
 */
export function AttentionAvatar({ 
  size = 'medium', 
  showParticles = true,
  position = 'relative'
}: AttentionAvatarProps) {
  const { avatarState, currentEvolution } = useAttentionAvatar();
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  const displaySize = SIZE_MAP[size];
  const colors = getSkinColors(avatarState.skin, currentEvolution.colors);

  // Idle floating animation
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    
    floatAnimation.start();
    return () => floatAnimation.stop();
  }, [floatAnim]);

  // Glow pulse animation
  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    
    glowAnimation.start();
    return () => glowAnimation.stop();
  }, [glowAnim]);

  // Mood-based animations
  useEffect(() => {
    switch (avatarState.mood) {
      case 'happy':
      case 'excited':
        // Bounce animation
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      
      case 'sad':
      case 'disappointed':
        // Droop animation
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 10,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      
      case 'celebrating':
        // Rapid pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ).start();
        break;
      
      case 'glowing':
        // Enhanced glow
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        break;
      
      case 'sleeping':
        // Slow breathing
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 0.95,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
    }
  }, [avatarState.mood, pulseAnim, bounceAnim]);

  // Particle effects
  useEffect(() => {
    if (!showParticles || avatarState.customizations.particleEffect === 'none') return;

    const particleAnimations = particleAnims.map((anim, index) => {
      return Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + index * 200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    });

    particleAnimations.forEach(anim => anim.start());
    
    return () => particleAnimations.forEach(anim => anim.stop());
  }, [showParticles, avatarState.customizations.particleEffect, particleAnims]);

  // Render avatar based on stage
  const renderAvatarBody = () => {
    const stage = avatarState.stage;
    
    switch (stage) {
      case 'spark':
        return (
          <Svg width={displaySize} height={displaySize} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="sparkGlow" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="70%" stopColor={colors.secondary} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="35" fill="url(#sparkGlow)" />
            <Circle cx="50" cy="50" r="15" fill={colors.primary} />
          </Svg>
        );
      
      case 'ember':
        return (
          <Svg width={displaySize} height={displaySize} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="emberGlow" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="40" fill="url(#emberGlow)" />
            <Circle cx="50" cy="50" r="20" fill={colors.primary} />
            {/* Flame-like shape */}
            <Path
              d="M 50 30 Q 40 40 45 50 Q 48 45 50 50 Q 52 45 55 50 Q 60 40 50 30 Z"
              fill={colors.secondary}
            />
          </Svg>
        );
      
      case 'orb':
      case 'wisp':
      case 'sprite':
      case 'guardian':
      case 'master':
        return (
          <Svg width={displaySize} height={displaySize} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="mainGlow" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="70%" stopColor={colors.secondary} stopOpacity="0.7" />
                <Stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            {/* Outer glow */}
            <Circle cx="50" cy="50" r="45" fill="url(#mainGlow)" opacity="0.4" />
            {/* Main body */}
            <Circle cx="50" cy="50" r="28" fill={colors.primary} opacity="0.9" />
            <Circle cx="50" cy="50" r="20" fill={colors.secondary} />
            
            {/* Eyes based on mood */}
            {avatarState.mood !== 'sleeping' ? (
              <G>
                <Circle cx="42" cy="45" r="3" fill="#ffffff" />
                <Circle cx="58" cy="45" r="3" fill="#ffffff" />
              </G>
            ) : (
              <G>
                <Path d="M 38 45 Q 42 47 46 45" stroke="#ffffff" strokeWidth="2" fill="none" />
                <Path d="M 54 45 Q 58 47 62 45" stroke="#ffffff" strokeWidth="2" fill="none" />
              </G>
            )}
            
            {/* Mouth based on mood */}
            {avatarState.mood === 'happy' || avatarState.mood === 'excited' || avatarState.mood === 'celebrating' ? (
              <Path d="M 40 58 Q 50 65 60 58" stroke="#ffffff" strokeWidth="2" fill="none" />
            ) : avatarState.mood === 'sad' || avatarState.mood === 'disappointed' ? (
              <Path d="M 40 62 Q 50 57 60 62" stroke="#ffffff" strokeWidth="2" fill="none" />
            ) : null}
          </Svg>
        );
      
      default:
        return null;
    }
  };

  // Render particles
  const renderParticles = () => {
    if (!showParticles || avatarState.customizations.particleEffect === 'none') return null;

    const particleType = avatarState.customizations.particleEffect;
    
    return (
      <View style={StyleSheet.absoluteFill}>
        {particleAnims.map((anim, index) => {
          const angle = (index / particleAnims.length) * Math.PI * 2;
          const distance = displaySize * 0.6;
          
          const translateX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.cos(angle) * distance],
          });
          
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.sin(angle) * distance],
          });
          
          const opacity = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 1, 0],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  backgroundColor: colors.primary,
                  transform: [
                    { translateX },
                    { translateY },
                  ],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, position === 'fixed' && styles.fixedPosition]}>
      <Animated.View
        style={{
          transform: [
            { scale: pulseAnim },
            { translateY: Animated.add(floatAnim, bounceAnim) },
          ],
        }}
      >
        {/* Particles behind avatar */}
        {renderParticles()}
        
        {/* Main avatar body */}
        <Animated.View style={{ opacity: glowAnim }}>
          {renderAvatarBody()}
        </Animated.View>
        
        {/* Crown for master stage */}
        {avatarState.customizations.hasCrown && avatarState.stage === 'master' && (
          <View style={[styles.crown, { top: -displaySize * 0.2 }]}>
            <Text style={styles.crownText}>👑</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedPosition: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    left: '50%',
    top: '50%',
  },
  crown: {
    position: 'absolute',
    alignSelf: 'center',
  },
  crownText: {
    fontSize: 20,
  },
});
























