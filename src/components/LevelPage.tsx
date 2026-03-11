import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import type { ProgressTreeNode, ChallengeType } from '@/types';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

interface LevelPageProps {
  level: number;
  onBack: () => void;
  onSelectChallenge: (challengeType: ChallengeType, isTest?: boolean, testSequence?: ChallengeType[]) => void;
}

const CHALLENGE_DESCRIPTIONS: Record<ChallengeType, { name: string; emoji: string; description: string; skill: string }> = {
  focus_hold: { name: 'Focus Hold', emoji: '👁️', description: 'Hold your gaze on the center dot', skill: 'Focus' },
  finger_hold: { name: 'Finger Hold', emoji: '👆', description: 'Keep your finger still on the spot', skill: 'Focus' },
  slow_tracking: { name: 'Slow Tracking', emoji: '🎯', description: 'Track the moving shape smoothly', skill: 'Focus' },
  tap_only_correct: { name: 'Tap Only Correct', emoji: '✅', description: 'Tap only the correct shapes', skill: 'Impulse Control' },
  breath_pacing: { name: 'Breath Pacing', emoji: '🌬️', description: 'Follow the breathing rhythm', skill: 'Focus' },
  fake_notifications: { name: 'Fake Notifications', emoji: '🔔', description: 'Ignore the fake pop-ups', skill: 'Distraction Resistance' },
  look_away: { name: 'Look Away', emoji: '🙈', description: 'Do not touch, just breathe', skill: 'Impulse Control' },
  delay_unlock: { name: 'Delay Unlock', emoji: '🔓', description: 'Hold the unlock button', skill: 'Impulse Control' },
  anti_scroll_swipe: { name: 'Anti-Scroll', emoji: '📱', description: 'Swipe up to break the scroll loop', skill: 'Impulse Control' },
  memory_flash: { name: 'Memory Flash', emoji: '💡', description: 'Remember the sequence shown', skill: 'Focus' },
  reaction_inhibition: { name: 'Reaction Inhibition', emoji: '🚫', description: 'Tap only the specific target', skill: 'Impulse Control' },
  multi_object_tracking: { name: 'Multi-Object Track', emoji: '👀', description: 'Track multiple moving targets', skill: 'Focus' },
  rhythm_tap: { name: 'Rhythm Tap', emoji: '🎵', description: 'Tap in rhythm with the pulse', skill: 'Focus' },
  stillness_test: { name: 'Stillness Test', emoji: '🧘', description: 'Hold perfectly still', skill: 'Impulse Control' },
  impulse_spike_test: { name: 'Impulse Spike', emoji: '⚡', description: 'Resist bright hooks and bait', skill: 'Distraction Resistance' },
  finger_tracing: { name: 'Finger Tracing', emoji: '✏️', description: 'Trace the path accurately', skill: 'Focus' },
  multi_task_tap: { name: 'Multi-Task Tap', emoji: '🤹', description: 'Hold and tap simultaneously', skill: 'Impulse Control' },
  popup_ignore: { name: 'Pop-Up Ignore', emoji: '🚨', description: 'Stay focused, ignore flashes', skill: 'Distraction Resistance' },
  controlled_breathing: { name: 'Controlled Breathing', emoji: '🫁', description: 'Follow complex breath patterns', skill: 'Focus' },
  reset: { name: 'Level Reset', emoji: '🔄', description: 'Cooldown and mini test', skill: 'Focus' },
  gaze_hold: { name: 'Gaze Hold', emoji: '👁️', description: 'Hold your focus on the target', skill: 'Focus' },
  moving_target: { name: 'Moving Target', emoji: '🎯', description: 'Track and click moving targets', skill: 'Focus' },
  tap_pattern: { name: 'Pattern Memory', emoji: '🧠', description: 'Remember and repeat patterns', skill: 'Impulse Control' },
  stability_hold: { name: 'Stability Hold', emoji: '🎚️', description: 'Keep your cursor steady', skill: 'Focus' },
  impulse_delay: { name: 'Impulse Delay', emoji: '⏱️', description: 'Wait for the perfect moment', skill: 'Impulse Control' },
  distraction_resistance: { name: 'Distraction Resist', emoji: '🛡️', description: 'Ignore the distractions', skill: 'Distraction Resistance' },
  audio_focus: { name: 'Audio Focus', emoji: '🔊', description: 'Count the target sounds', skill: 'Distraction Resistance' },
};

export function LevelPage({ level, onBack, onSelectChallenge }: LevelPageProps) {
  const { progress, progressTree, canStartChallenge } = useGame();
  const { colors } = useTheme();
  const { user } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Entrance animation
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
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  if (!progress || !progressTree) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const currentNode = progressTree.nodes.find((n: ProgressTreeNode) => n.id === progressTree.currentNodeId);
  const levelNodes = progressTree.nodes.filter((node: ProgressTreeNode) => node.level === level);

  if (levelNodes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Level {level} not available yet</Text>
        <Button onPress={onBack}>Go Back</Button>
      </View>
    );
  }

  const exercises = levelNodes.filter(n => n.nodeType === 'exercise').sort((a, b) => a.position - b.position);
  const test = levelNodes.find(n => n.nodeType === 'test');

  const completedExercises = exercises.filter(n => n.status === 'completed' || n.status === 'perfect').length;
  const totalExercises = exercises.length;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  const handleNodePress = (node: ProgressTreeNode) => {
    if (node.status === 'locked' || node.status === 'completed' || node.status === 'perfect') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const { canStart } = canStartChallenge(node.nodeType === 'test');
    if (!canStart) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Show heart dialog or message
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectChallenge(node.challengeType, node.nodeType === 'test', node.testSequence);
  };

  const getNodeStyle = (node: ProgressTreeNode, isCurrent: boolean) => {
    if (node.status === 'locked') {
      return [styles.node, styles.nodeLocked];
    }
    if (node.status === 'perfect') {
      return [styles.node, styles.nodePerfect];
    }
    if (node.status === 'completed') {
      return [styles.node, styles.nodeCompleted];
    }
    if (isCurrent) {
      return [styles.node, styles.nodeCurrent];
    }
    return [styles.node, styles.nodeAvailable];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={`Level ${level}`} onBack={onBack} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        accessibilityLabel={`Level ${level} page`}
        accessibilityRole="main"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.header}>
            <Text style={styles.subtitle}>Complete all exercises to unlock the test</Text>
          </View>

      {/* Progress Card */}
      <View 
        style={styles.progressCard}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: totalExercises, now: completedExercises, text: `${progressPercent}% complete, ${completedExercises} out of ${totalExercises} exercises` }}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progress</Text>
          <Text style={styles.progressPercent} accessibilityLabel={`${progressPercent} percent complete`}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBarContainer} accessibilityLabel={`Progress: ${progressPercent}%`}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText} accessibilityLabel={`${completedExercises} out of ${totalExercises} exercises completed`}>
          {completedExercises} / {totalExercises} exercises completed
        </Text>
      </View>

      {/* Exercises Grid */}
      <View style={styles.exercisesSection}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        <View style={styles.exercisesGrid}>
          {exercises.map((node) => {
            const challenge = CHALLENGE_DESCRIPTIONS[node.challengeType];
            const isCurrent = node.id === progressTree.currentNodeId;
            const stars = Array.from({ length: node.starsEarned });

            return (
              <TouchableOpacity
                key={node.id}
                style={getNodeStyle(node, isCurrent)}
                onPress={() => handleNodePress(node)}
                disabled={node.status === 'locked' || node.status === 'completed' || node.status === 'perfect'}
                accessibilityLabel={`${challenge.name}, ${node.status === 'locked' ? 'locked' : node.status === 'completed' ? 'completed' : node.status === 'perfect' ? 'perfect' : isCurrent ? 'current exercise' : 'available'}, ${challenge.description}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: node.status === 'locked' || node.status === 'completed' || node.status === 'perfect' }}
                activeOpacity={0.7}
              >
                {node.status === 'locked' ? (
                  <Text style={styles.lockIcon}>🔒</Text>
                ) : (
                  <>
                    <Text style={styles.nodeEmoji}>{challenge.emoji}</Text>
                    {stars.length > 0 && (
                      <View style={styles.starsContainer}>
                        {stars.map((_, i) => (
                          <Text key={i} style={styles.star}>⭐</Text>
                        ))}
                      </View>
                    )}
                  </>
                )}
                <Text style={styles.nodeNumber}>{node.position + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Test Node */}
      {test && (
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Level {level} Test</Text>
          <TouchableOpacity
            style={[
              styles.testNode,
              test.status === 'locked' && styles.testNodeLocked,
              test.status === 'available' && styles.testNodeAvailable,
              (test.status === 'completed' || test.status === 'perfect') && styles.testNodeCompleted,
            ]}
            onPress={() => handleNodePress(test)}
            disabled={test.status === 'locked' || test.status === 'completed' || test.status === 'perfect'}
            accessibilityLabel={`Level ${level} test, ${test.status === 'locked' ? 'locked' : test.status === 'completed' ? 'completed' : test.status === 'perfect' ? 'perfect' : 'available'}, ${test.testSequence ? `${test.testSequence.length} challenges` : ''}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: test.status === 'locked' || test.status === 'completed' || test.status === 'perfect' }}
            activeOpacity={0.7}
          >
            {test.status === 'locked' ? (
              <Text style={styles.lockIcon}>🔒</Text>
            ) : (
              <>
                <Text style={styles.testEmoji}>🎯</Text>
                {test.status === 'perfect' && (
                  <View style={styles.starsContainer}>
                    {Array.from({ length: test.starsEarned }).map((_, i) => (
                      <Text key={i} style={styles.star}>⭐</Text>
                    ))}
                  </View>
                )}
              </>
            )}
            <Text style={styles.testLabel}>TEST</Text>
            {test.testSequence && (
              <Text style={styles.testDescription}>
                {test.testSequence.length} challenges
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
  },
  loadingText: {
    marginTop: 16,
    color: '#9ca3af',
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: '#a8b3cf',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 0.8,
    textShadowColor: '#6366f1',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 15,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  progressCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    borderWidth: 2,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#1f2937',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 6,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  exercisesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 18,
    letterSpacing: 0.4,
  },
  exercisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  node: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  nodeLocked: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  nodeAvailable: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8',
  },
  nodeCurrent: {
    backgroundColor: '#6366f1',
    borderColor: '#ffffff',
    borderWidth: 4,
  },
  nodeCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  nodePerfect: {
    backgroundColor: '#f59e0b',
    borderColor: '#fbbf24',
  },
  nodeEmoji: {
    fontSize: 30,
  },
  lockIcon: {
    fontSize: 28,
    color: '#6b7280',
  },
  nodeNumber: {
    position: 'absolute',
    bottom: -20,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  starsContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 12,
  },
  testSection: {
    marginBottom: 24,
  },
  testNode: {
    width: '100%',
    height: 110,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  testNodeLocked: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  testNodeAvailable: {
    backgroundColor: '#a855f7',
    borderColor: '#c084fc',
  },
  testNodeCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  testEmoji: {
    fontSize: 40,
  },
  testLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  testDescription: {
    fontSize: 14,
    color: '#e5e7eb',
    marginTop: 6,
    fontWeight: '600',
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
});

