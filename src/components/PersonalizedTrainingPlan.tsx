import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import type { PersonalizedTrainingPlan, ChallengeType } from '@/types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/database';

interface PersonalizedTrainingPlanProps {
  onBack: () => void;
  onStartChallenge?: (challengeType: ChallengeType) => void;
}

const challengeNames: Record<ChallengeType, string> = {
  focus_hold: 'Focus Hold',
  finger_hold: 'Finger Hold',
  slow_tracking: 'Slow Tracking',
  tap_only_correct: 'Tap Only Correct',
  breath_pacing: 'Breath Pacing',
  fake_notifications: 'Fake Notifications',
  look_away: 'Look Away',
  delay_unlock: 'Delay Unlock',
  anti_scroll_swipe: 'Anti-Scroll Swipe',
  memory_flash: 'Memory Flash',
  reaction_inhibition: 'Reaction Inhibition',
  multi_object_tracking: 'Multi-Object Tracking',
  rhythm_tap: 'Rhythm Tap',
  stillness_test: 'Stillness Test',
  impulse_spike_test: 'Impulse Spike Test',
  finger_tracing: 'Finger Tracing',
  multi_task_tap: 'Multi-Task Tap',
  popup_ignore: 'Pop-Up Ignore',
  controlled_breathing: 'Controlled Breathing',
  reset: 'Level Reset',
  gaze_hold: 'Gaze Hold',
  moving_target: 'Moving Target',
  tap_pattern: 'Tap Pattern',
  stability_hold: 'Stability Hold',
  impulse_delay: 'Impulse Delay',
  distraction_resistance: 'Distraction Resistance',
  audio_focus: 'Audio Focus',
};

function generateTrainingPlan(
  userId: string,
  progress: any,
  skillTree: any,
  stats: any
): PersonalizedTrainingPlan {
  const focusAreas: Array<'focus' | 'impulseControl' | 'distractionResistance'> = [];
  
  if (skillTree.focus < 50) focusAreas.push('focus');
  if (skillTree.impulseControl < 50) focusAreas.push('impulseControl');
  if (skillTree.distractionResistance < 50) focusAreas.push('distractionResistance');

  const recommendations: Array<{
    challengeType: ChallengeType;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }> = [];

  if (skillTree.focus < 50) {
    recommendations.push({
      challengeType: 'focus_hold',
      priority: 'high',
      reason: 'Improve your focus skills',
    });
  }

  if (skillTree.impulseControl < 50) {
    recommendations.push({
      challengeType: 'delay_unlock',
      priority: 'high',
      reason: 'Build impulse control',
    });
  }

  if (skillTree.distractionResistance < 50) {
    recommendations.push({
      challengeType: 'fake_notifications',
      priority: 'high',
      reason: 'Resist distractions',
    });
  }

  return {
    userId,
    lastUpdated: Date.now(),
    focusAreas,
    recommendations,
    streakBonus: progress.streak >= 3,
    weeklyGoal: 5,
  };
}

export function PersonalizedTrainingPlanComponent({ onBack, onStartChallenge }: PersonalizedTrainingPlanProps) {
  const { user } = useAuth();
  const { progress, skillTree, stats } = useGame();
  const { colors } = useTheme();
  const [plan, setPlan] = React.useState<PersonalizedTrainingPlan | null>(null);

  React.useEffect(() => {
    if (!user || !progress || !skillTree || !stats) return;

    async function loadPlan() {
      const savedPlan = await loadFromStorage<PersonalizedTrainingPlan>(STORAGE_KEYS.TRAINING_PLAN);

      const needsRegeneration = !savedPlan ||
        savedPlan.userId !== user.id ||
        Date.now() - savedPlan.lastUpdated > 24 * 60 * 60 * 1000;

      if (needsRegeneration) {
        const newPlan = generateTrainingPlan(user.id, progress, skillTree, stats);
        setPlan(newPlan);
        await saveToStorage(STORAGE_KEYS.TRAINING_PLAN, newPlan);

        // Sync to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          db.saveTrainingPlan(user.id, {
            plan_type: 'personalized',
            exercises: newPlan.recommendations.map(r => r.challengeType),
            is_active: true,
          }).catch((error) => {
            console.error('Failed to sync training plan to Supabase:', error);
          });
        }
      } else {
        setPlan(savedPlan);
      }
    }

    loadPlan();
  }, [user, progress, skillTree, stats]);

  if (!plan || !progress || !skillTree) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading your personalized plan...</Text>
      </View>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>🧠</Text>
        </View>
        <Text style={styles.title}>Your Personalized Training Plan</Text>
        <Text style={styles.subtitle}>
          AI-powered recommendations based on your performance
        </Text>
      </View>

      {plan.streakBonus && (
        <Card style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>
                {progress.streak} Day Streak!
              </Text>
              <Text style={styles.streakText}>
                Your consistency is amazing! Keep it up for maximum retention.
              </Text>
            </View>
          </View>
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🎯 Areas to Improve</Text>
        <View style={styles.focusAreasContainer}>
          {plan.focusAreas.map((area) => (
            <View key={area} style={styles.focusAreaBadge}>
              <Text style={styles.focusAreaText}>
                {area === 'focus' && '🎯 Focus'}
                {area === 'impulseControl' && '⚡ Impulse Control'}
                {area === 'distractionResistance' && '🛡️ Distraction Resistance'}
              </Text>
            </View>
          ))}
          {plan.focusAreas.length === 0 && (
            <Text style={styles.noAreasText}>
              Great job! All areas are performing well.
            </Text>
          )}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💡 Recommended Challenges</Text>
        <View style={styles.recommendationsContainer}>
          {plan.recommendations.map((rec, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recommendationCard}
              onPress={() => onStartChallenge?.(rec.challengeType)}
            >
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationName}>
                  {challengeNames[rec.challengeType] || rec.challengeType}
                </Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(rec.priority) },
                ]}>
                  <Text style={styles.priorityText}>
                    {rec.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.recommendationReason}>{rec.reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Weekly Goal</Text>
        <Text style={styles.goalText}>
          Complete {plan.weeklyGoal} challenges this week
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  streakCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#7f1d1d',
    borderColor: '#991b1b',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  sectionCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  focusAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  focusAreaBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
  },
  focusAreaText: {
    fontSize: 14,
    color: '#ffffff',
  },
  noAreasText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  recommendationReason: {
    fontSize: 14,
    color: '#9ca3af',
  },
  goalText: {
    fontSize: 16,
    color: '#ffffff',
  },
});

