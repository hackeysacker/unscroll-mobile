import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from 'react-native';
import { HapticPatterns } from '@/lib/haptic-patterns';
import type { ProgressTreeNode } from '@/types';
import { interpolateColor } from '@/lib/realm-themes';

interface EnhancedNodeProps {
  node: ProgressTreeNode;
  isCurrentNode: boolean;
  realmColor: string;
  onPress: (node: ProgressTreeNode) => void;
}

/**
 * Enhanced animated node with rich interactions
 * - Pulse animation for current/available nodes
 * - Glow effects
 * - Smooth press animations
 * - Particle burst on unlock
 */
export function EnhancedNode({ node, isCurrentNode, realmColor, onPress }: EnhancedNodeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isTest = node.nodeType === 'test';
  const isLocked = node.status === 'locked';
  const isCompleted = node.status === 'completed' || node.status === 'perfect';
  const isAvailable = node.status === 'available';

  // Pulse animation for current and available nodes
  useEffect(() => {
    if (isCurrentNode || isAvailable) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCurrentNode, isAvailable]);

  // Glow animation for completed nodes
  useEffect(() => {
    if (isCompleted) {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      glow.start();
      return () => glow.stop();
    }
  }, [isCompleted]);

  // Rotation for test nodes
  useEffect(() => {
    if (isTest && !isLocked) {
      const rotation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      rotation.start();
      return () => rotation.stop();
    }
  }, [isTest, isLocked]);

  const handlePressIn = () => {
    if (!isLocked) {
      HapticPatterns.lightTouch();
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (isLocked) {
      HapticPatterns.locked();
    } else {
      HapticPatterns.nodeSelect();
      onPress(node);
    }
  };

  // Node colors based on status
  const getNodeColors = () => {
    if (isLocked) {
      return {
        background: 'rgba(107, 114, 128, 0.3)',
        border: 'rgba(107, 114, 128, 0.5)',
        text: 'rgba(107, 114, 128, 0.7)',
      };
    }
    if (isCompleted) {
      return {
        background: realmColor,
        border: interpolateColor(realmColor, '#ffffff', 0.3),
        text: '#ffffff',
      };
    }
    if (isAvailable || isCurrentNode) {
      return {
        background: interpolateColor(realmColor, '#ffffff', 0.8),
        border: realmColor,
        text: realmColor,
      };
    }
    return {
      background: 'rgba(148, 163, 184, 0.2)',
      border: 'rgba(148, 163, 184, 0.4)',
      text: 'rgba(148, 163, 184, 0.6)',
    };
  };

  const colors = getNodeColors();
  const nodeSize = isTest ? 72 : 56;
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={isLocked}
    >
      <Animated.View
        style={[
          styles.nodeContainer,
          {
            width: nodeSize,
            height: nodeSize,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate },
            ],
          },
        ]}
      >
        {/* Glow effect for completed nodes */}
        {isCompleted && (
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: nodeSize + 20,
                height: nodeSize + 20,
                borderRadius: (nodeSize + 20) / 2,
                backgroundColor: realmColor,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.4],
                }),
              },
            ]}
          />
        )}
        
        {/* Current node indicator */}
        {isCurrentNode && (
          <View
            style={[
              styles.currentRing,
              {
                width: nodeSize + 12,
                height: nodeSize + 12,
                borderRadius: (nodeSize + 12) / 2,
                borderColor: realmColor,
                borderWidth: 3,
              },
            ]}
          />
        )}
        
        {/* Main node */}
        <View
          style={[
            styles.node,
            {
              width: nodeSize,
              height: nodeSize,
              borderRadius: nodeSize / 2,
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderWidth: isTest ? 3 : 2,
            },
          ]}
        >
          {isTest ? (
            <Text style={[styles.testIcon, { fontSize: 32 }]}>🎯</Text>
          ) : (
            <Text style={[styles.levelText, { color: colors.text, fontSize: 20 }]}>
              {node.level}
            </Text>
          )}
          
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
          
          {node.status === 'perfect' && (
            <View style={styles.perfectBadge}>
              <Text style={styles.perfectIcon}>⭐</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  currentRing: {
    position: 'absolute',
  },
  node: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  levelText: {
    fontWeight: 'bold',
  },
  testIcon: {
    textAlign: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 999,
  },
  lockIcon: {
    fontSize: 28,
    opacity: 0.9,
  },
  perfectBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  perfectIcon: {
    fontSize: 14,
  },
});
























