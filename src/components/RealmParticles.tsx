import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import type { RealmTheme } from '@/lib/realm-themes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleProps {
  type: RealmTheme['particles']['type'];
  color: string;
  speed: RealmTheme['particles']['speed'];
  size: number;
  initialX: number;
  initialY: number;
  opacity: Animated.Value;
}

const Particle = ({ type, color, speed, size, initialX, initialY, opacity }: ParticleProps) => {
  const animValueX = useRef(new Animated.Value(initialX)).current;
  const animValueY = useRef(new Animated.Value(initialY)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const durationMap = {
    slow: 18000,
    medium: 12000,
    fast: 8000,
  };
  const rangeMap = {
    slow: 60,
    medium: 100,
    fast: 150,
  };

  const animateParticle = () => {
    const duration = durationMap[speed];
    const range = rangeMap[speed];

    // Position animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animValueX, {
            toValue: initialX + Math.random() * range - range / 2,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(animValueY, {
            toValue: initialY + Math.random() * range - range / 2,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animValueX, {
            toValue: initialX + Math.random() * range - range / 2,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(animValueY, {
            toValue: initialY + Math.random() * range - range / 2,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Rotation animation for some types
    if (['geometric', 'stars', 'sparks'].includes(type)) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 1.5,
          useNativeDriver: true,
        })
      ).start();
    }
  };

  useEffect(() => {
    animateParticle();
  }, [type, color, speed, size]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderParticleShape = () => {
    switch (type) {
      case 'waves':
        return (
          <Svg width={size} height={size}>
            <Path 
              d={`M0,${size / 2} Q${size / 4},${size * 0.2} ${size / 2},${size / 2} T${size},${size / 2}`} 
              stroke={color} 
              strokeWidth={2} 
              fill="none" 
            />
          </Svg>
        );
      case 'dust':
        return (
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
          </Svg>
        );
      case 'geometric':
        return (
          <Svg width={size} height={size}>
            <Polygon 
              points={`${size / 2},0 ${size},${size * 0.75} ${size * 0.5},${size} 0,${size * 0.75}`} 
              fill={color} 
              stroke={color}
              strokeWidth={1}
            />
          </Svg>
        );
      case 'ribbons':
        return (
          <Svg width={size} height={size * 2}>
            <Path
              d={`M0,0 Q${size / 2},${size} ${size},${size * 2}`}
              stroke={color}
              strokeWidth={2}
              fill="none"
            />
          </Svg>
        );
      case 'orbs':
        return (
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} opacity={0.7} />
            <Circle cx={size / 2} cy={size / 2} r={size / 3} fill={color} opacity={0.9} />
          </Svg>
        );
      case 'sparks':
        return (
          <Svg width={size} height={size}>
            <Line 
              x1={size * 0.2} 
              y1={size / 2} 
              x2={size * 0.8} 
              y2={size / 2} 
              stroke={color} 
              strokeWidth={3} 
              strokeLinecap="round"
            />
            <Line 
              x1={size / 2} 
              y1={size * 0.2} 
              x2={size / 2} 
              y2={size * 0.8} 
              stroke={color} 
              strokeWidth={3} 
              strokeLinecap="round"
            />
          </Svg>
        );
      case 'lines':
        return (
          <Svg width={size * 2} height={size}>
            <Line 
              x1="0" 
              y1={size / 2} 
              x2={size * 2} 
              y2={size / 2} 
              stroke={color} 
              strokeWidth={1.5} 
              strokeLinecap="round"
            />
          </Svg>
        );
      case 'stars':
        const points = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        let starPath = '';
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / points - Math.PI / 2;
          const x = size / 2 + Math.cos(angle) * radius;
          const y = size / 2 + Math.sin(angle) * radius;
          starPath += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
        }
        starPath += ' Z';
        
        return (
          <Svg width={size} height={size}>
            <Path d={starPath} fill={color} />
          </Svg>
        );
      case 'energy':
        return (
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} opacity={0.4} />
            <Circle cx={size / 2} cy={size / 2} r={size / 3} fill={color} opacity={0.7} />
            <Circle cx={size / 2} cy={size / 2} r={size / 6} fill={color} />
          </Svg>
        );
      case 'aura':
        return (
          <Svg width={size * 1.5} height={size * 1.5}>
            <Circle cx={size * 0.75} cy={size * 0.75} r={size * 0.7} fill={color} opacity={0.2} />
            <Circle cx={size * 0.75} cy={size * 0.75} r={size * 0.5} fill={color} opacity={0.3} />
            <Circle cx={size * 0.75} cy={size * 0.75} r={size * 0.3} fill={color} opacity={0.4} />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: [
          { translateX: animValueX },
          { translateY: animValueY },
          { rotate },
        ],
        opacity: opacity,
      }}
      pointerEvents="none"
    >
      {renderParticleShape()}
    </Animated.View>
  );
};

interface RealmParticlesProps {
  realmTheme: RealmTheme;
  opacity: Animated.Value | number;
  count?: number;
}

/**
 * Enhanced realm particles with varied, beautiful animations
 */
export function RealmParticles({ realmTheme, opacity, count }: RealmParticlesProps) {
  const particles = useRef<Array<{
    id: number;
    type: RealmTheme['particles']['type'];
    color: string;
    speed: RealmTheme['particles']['speed'];
    size: number;
    initialX: number;
    initialY: number;
  }>>([]);

  // Use count from realm theme or prop
  const particleCount = count || realmTheme.particles.count;
  
  // Convert opacity to Animated.Value if it's a number
  const opacityValue = useRef(
    typeof opacity === 'number' ? new Animated.Value(opacity) : opacity
  ).current;

  useEffect(() => {
    particles.current = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      type: realmTheme.particles.type,
      color: realmTheme.particles.color,
      speed: realmTheme.particles.speed,
      size: Math.random() * 12 + 8, // Size between 8 and 20
      initialX: Math.random() * SCREEN_WIDTH,
      initialY: Math.random() * SCREEN_HEIGHT,
    }));
  }, [realmTheme, particleCount]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.current.map((p) => (
        <Particle
          key={p.id}
          type={p.type}
          color={p.color}
          speed={p.speed}
          size={p.size}
          initialX={p.initialX}
          initialY={p.initialY}
          opacity={opacityValue}
        />
      ))}
    </View>
  );
}
