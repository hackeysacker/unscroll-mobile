/**
 * ANTI-SCROLL SWIPE CHALLENGE
 * Resist the urge to scroll through content blocks
 *
 * Difficulty Scaling:
 * - More blocks to resist at higher levels
 * - More enticing/distracting content
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';
import { getChallengeScaling } from '@/lib/challenge-progression';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AntiScrollSwipeChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

export function AntiScrollSwipeChallenge({ duration, onComplete, onBack, level = 1 }: AntiScrollSwipeChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('anti_scroll_swipe');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [scrolledDistance, setScrolledDistance] = useState(0);
  const [scrollAttempts, setScrollAttempts] = useState(0);

  // Get scaling params
  const scaling = getChallengeScaling('anti_scroll_swipe', level);
  const blockCount = scaling.blockCount || 5;

  // Tracking refs
  const resistanceTimeRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const lastScrollRef = useRef(0);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;

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
  }, [isActive]);

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

  // Track resistance time (when not scrolling)
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const timeSinceScroll = Date.now() - lastScrollRef.current;
      if (timeSinceScroll > 500 || lastScrollRef.current === 0) {
        resistanceTimeRef.current += 100;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleScroll = (event: any) => {
    if (!isActive) return;

    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollDelta = Math.abs(currentOffset - scrollOffsetRef.current);

    if (scrollDelta > 5) {
      lastScrollRef.current = Date.now();
      setScrolledDistance((prev) => prev + scrollDelta);
      setScrollAttempts((prev) => prev + 1);

      // Shake animation for feedback
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      haptics.impactLight();
      sound.targetMiss();
    }

    scrollOffsetRef.current = currentOffset;
  };

  const handleComplete = () => {
    setIsActive(false);

    const totalMs = duration * 1000;
    const resistanceScore = (resistanceTimeRef.current / totalMs) * 100;
    const scrollPenalty = Math.min(50, scrolledDistance / 20);
    const score = Math.min(100, Math.max(0, resistanceScore - scrollPenalty));

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const resistancePercentage = Math.round((resistanceTimeRef.current / (duration * 1000)) * 100);

  // Generate enticing content blocks
  const contentBlocks = Array.from({ length: blockCount }, (_, i) => ({
    id: i,
    emoji: ['📱', '🎮', '📺', '🍕', '🎬', '🎵', '🏆', '💎'][i % 8],
    title: [
      'Breaking News!',
      'You Won\'t Believe This!',
      'Shocking Discovery!',
      'Viral Video Inside!',
      'Limited Time Offer!',
      'Trending Now!',
      'Must See This!',
      'Amazing Deal!',
    ][i % 8],
  }));

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Resistance</Text>
          <Text style={[styles.statValue, { color: resistancePercentage >= 80 ? '#10B981' : '#F59E0B' }]}>
            {resistancePercentage}%
          </Text>
        </View>
      </Animated.View>

      {/* Progress */}
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
        {scrollAttempts > 0 && (
          <Text style={styles.scrollAttemptsText}>
            Scroll attempts: {scrollAttempts}
          </Text>
        )}
      </View>

      {/* Challenge Area - Scrollable content */}
      <View style={styles.challengeArea}>
        <View style={styles.instructionsBox}>
          <Text style={styles.mainInstruction}>⚠️ DO NOT SCROLL ⚠️</Text>
          <Text style={styles.subInstruction}>
            Resist the urge to scroll through the content below
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {contentBlocks.map((block) => (
            <View key={block.id} style={styles.contentBlock}>
              <Text style={styles.blockEmoji}>{block.emoji}</Text>
              <Text style={styles.blockTitle}>{block.title}</Text>
              <View style={styles.blockBar} />
              <View style={styles.blockBar} />
              <View style={styles.blockBar} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.levelText}>Level {level}</Text>
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

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Progress
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
  scrollAttemptsText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  instructionsBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  mainInstruction: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  subInstruction: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentBlock: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  blockEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  blockBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginTop: 8,
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
