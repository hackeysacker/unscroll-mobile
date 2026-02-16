/**
 * SPATIAL PUZZLE CHALLENGE
 * Arrange and rotate tiles to match the target pattern
 *
 * Difficulty Scaling:
 * - Larger grid at higher levels (3x3 to 5x5)
 * - More complex patterns
 * - Less time to complete
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { hapticPatterns as haptics } from '@/lib/haptic-patterns';

interface SpatialPuzzleChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

interface Tile {
  id: number;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
  color: string;
  rotation: number; // 0, 90, 180, 270
}

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
const SHAPES: Tile['shape'][] = ['circle', 'square', 'triangle', 'diamond'];

export function SpatialPuzzleChallenge({ duration, onComplete, onBack, level = 1 }: SpatialPuzzleChallengeProps) {
  const themeStyles = useThemeStyles();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('spatial_puzzle');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [targetGrid, setTargetGrid] = useState<Tile[]>([]);
  const [playerGrid, setPlayerGrid] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate grid size based on level (3x3 to 5x5)
  const gridSize = Math.min(5, Math.max(3, 3 + Math.floor(level / 4)));
  const totalTiles = gridSize * gridSize;
  const shapeVariety = Math.min(4, Math.max(2, 2 + Math.floor(level / 3)));
  const colorVariety = Math.min(6, Math.max(3, 3 + Math.floor(level / 2)));

  // Refs
  const startTimeRef = useRef(Date.now());
  const checkCompleteRef = useRef(false);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const tileAnims = useRef<{ [key: number]: Animated.Value }>({}).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate a random tile
  const generateTile = (id: number): Tile => {
    const shapes = SHAPES.slice(0, shapeVariety);
    const colors = COLORS.slice(0, colorVariety);

    return {
      id,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
    };
  };

  // Initialize grids
  useEffect(() => {
    if (isActive && targetGrid.length === 0) {
      // Generate target pattern
      const target = Array.from({ length: totalTiles }, (_, i) => generateTile(i));
      setTargetGrid(target);

      // Create scrambled player grid
      const scrambled = target.map((tile, i) => ({
        ...tile,
        id: i + 1000, // Different IDs to avoid conflicts
        rotation: (tile.rotation + [0, 90, 180, 270][Math.floor(Math.random() * 4)]) % 360,
      }));

      // Shuffle positions
      for (let i = scrambled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
      }

      setPlayerGrid(scrambled);

      // Initialize tile animations
      scrambled.forEach(tile => {
        tileAnims[tile.id] = new Animated.Value(0);
      });
    }
  }, [isActive, totalTiles]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isComplete]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = ((duration - timeLeft) / duration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, duration]);

  // Check if puzzle is complete
  const checkCompletion = (grid: Tile[]) => {
    if (checkCompleteRef.current) return;

    for (let i = 0; i < grid.length; i++) {
      const playerTile = grid[i];
      const targetTile = targetGrid[i];

      if (
        playerTile.shape !== targetTile.shape ||
        playerTile.color !== targetTile.color ||
        playerTile.rotation !== targetTile.rotation
      ) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    if (playerGrid.length > 0 && targetGrid.length > 0 && !isComplete) {
      if (checkCompletion(playerGrid)) {
        setIsComplete(true);
        checkCompleteRef.current = true;
        haptics.notificationSuccess();
        sound.complete();

        // Success pulse animation
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          handleComplete();
        }, 1000);
      }
    }
  }, [playerGrid, targetGrid, isComplete]);

  const handleTilePress = (tileId: number) => {
    if (isComplete) return;

    haptics.impactLight();

    if (selectedTile === null) {
      // Select first tile
      setSelectedTile(tileId);
      sound.tap();

      // Bounce animation
      Animated.sequence([
        Animated.timing(tileAnims[tileId], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tileAnims[tileId], {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (selectedTile === tileId) {
      // Deselect
      setSelectedTile(null);
    } else {
      // Swap tiles
      const selectedIndex = playerGrid.findIndex(t => t.id === selectedTile);
      const targetIndex = playerGrid.findIndex(t => t.id === tileId);

      const newGrid = [...playerGrid];
      [newGrid[selectedIndex], newGrid[targetIndex]] = [newGrid[targetIndex], newGrid[selectedIndex]];

      setPlayerGrid(newGrid);
      setSelectedTile(null);
      setMoves(prev => prev + 1);
      sound.tap();
    }
  };

  const handleTileRotate = (tileId: number) => {
    if (isComplete) return;

    haptics.impactLight();
    sound.tap();

    setPlayerGrid(prev => prev.map(tile =>
      tile.id === tileId
        ? { ...tile, rotation: (tile.rotation + 90) % 360 }
        : tile
    ));
    setMoves(prev => prev + 1);
  };

  const handleComplete = () => {
    const timeBonus = (timeLeft / duration) * 100;
    const moveEfficiency = Math.max(0, 100 - moves * 2);
    const completionBonus = isComplete ? 100 : 0;

    // Score: 50% completion, 30% time bonus, 20% move efficiency
    const score = Math.min(100, Math.round(
      completionBonus * 0.5 + timeBonus * 0.3 + moveEfficiency * 0.2
    ));

    setIsActive(false);
    haptics.notificationSuccess();
    sound.complete();

    const elapsedTime = Date.now() - startTimeRef.current;
    onComplete(score, elapsedTime);
  };

  const handleStart = () => {
    setIsActive(true);
    startTimeRef.current = Date.now();
  };

  const renderTile = (tile: Tile, isTarget: boolean = false) => {
    const scale = tileAnims[tile.id] ? tileAnims[tile.id].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    }) : 1;

    const isSelected = selectedTile === tile.id;
    const tileSize = isTarget ? 60 / gridSize : 80 / gridSize;

    return (
      <TouchableOpacity
        key={tile.id}
        style={[
          styles.tileContainer,
          { width: `${100 / gridSize}%`, aspectRatio: 1 },
        ]}
        onPress={() => !isTarget && handleTilePress(tile.id)}
        onLongPress={() => !isTarget && handleTileRotate(tile.id)}
        activeOpacity={0.7}
        disabled={isTarget || isComplete}
      >
        <Animated.View
          style={[
            styles.tile,
            isSelected && styles.tileSelected,
            { transform: [{ scale: isSelected ? 1.1 : (scale || 1) }] },
          ]}
        >
          <LinearGradient
            colors={[tile.color, tile.color + 'CC']}
            style={[styles.tileGradient, { transform: [{ rotate: `${tile.rotation}deg` }] }]}
          >
            {renderShape(tile.shape, tileSize)}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderShape = (shape: Tile['shape'], size: number) => {
    const shapeStyle = {
      width: size,
      height: size,
    };

    switch (shape) {
      case 'circle':
        return <View style={[styles.shapeCircle, shapeStyle]} />;
      case 'square':
        return <View style={[styles.shapeSquare, shapeStyle]} />;
      case 'triangle':
        return <View style={[styles.shapeTriangle, shapeStyle]} />;
      case 'diamond':
        return <View style={[styles.shapeDiamond, shapeStyle]} />;
    }
  };

  const matchedTiles = playerGrid.filter((tile, i) => {
    const target = targetGrid[i];
    return target &&
      tile.shape === target.shape &&
      tile.color === target.color &&
      tile.rotation === target.rotation;
  }).length;

  const completionPercentage = targetGrid.length > 0
    ? Math.round((matchedTiles / targetGrid.length) * 100)
    : 0;

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={handleStart}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Matches</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {completionPercentage}%
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{moves}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>

        {/* Target Pattern */}
        <View style={styles.targetSection}>
          <Text style={styles.targetLabel}>Target Pattern:</Text>
          <Animated.View
            style={[
              styles.targetGrid,
              { transform: [{ scale: isComplete ? pulseAnim : 1 }] }
            ]}
          >
            {targetGrid.map(tile => renderTile(tile, true))}
          </Animated.View>
        </View>

        {/* Player Grid */}
        <View style={styles.gameContainer}>
          <View style={styles.playerGrid}>
            {playerGrid.map(tile => renderTile(tile, false))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {isComplete
              ? '🎉 Perfect! Pattern matched!'
              : 'Tap to swap tiles • Long press to rotate'}
          </Text>
          {selectedTile && !isComplete && (
            <Text style={styles.selectedText}>
              Tile selected - tap another to swap
            </Text>
          )}
        </View>
      </LinearGradient>
    </BaseChallengeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  targetSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  targetLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontWeight: '600',
  },
  targetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tileContainer: {
    padding: 4,
  },
  tile: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tileSelected: {
    borderWidth: 3,
    borderColor: '#FBBF24',
  },
  tileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  shapeCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 1000,
  },
  shapeSquare: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
  },
  shapeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.9)',
  },
  shapeDiamond: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: [{ rotate: '45deg' }],
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  instructionText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedText: {
    fontSize: 12,
    color: '#FBBF24',
    marginTop: 6,
    fontWeight: '600',
  },
});
