/**
 * Practice Overview Screen
 * Shows all challenges/exercises in a practice before starting
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { ActivityType } from '@/lib/journey-levels';

interface PracticeOverviewProps {
  practiceTitle: string;
  practiceDescription: string;
  activities: ActivityType[];
  totalXP: number;
  estimatedDuration: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  practiceColors: [string, string];
  onStart: () => void;
  onBack: () => void;
}

// Activity icons mapping
const ACTIVITY_ICONS: Record<string, string> = {
  // Challenges
  gaze_hold: '👁️',
  focus_hold: '🎯',
  stillness_test: '🧘‍♂️',
  breath_pacing: '💨',
  tap_pattern: '🎵',
  reaction_inhibition: '🛡️',
  impulse_spike_test: '⚡',
  popup_ignore: '🚫',
  multi_task_tap: '🤹',
  memory_flash: '⚡',
  multi_object_tracking: '👀',
  finger_tracing: '✏️',
  tap_only_correct: '✅',
  // Exercises (breathing)
  controlled_breathing: '🧘',
  box_breathing: '⬛',
  slow_breathing: '🌬️',
  // Add more as needed
};

// Get display name for activity
function getActivityDisplayName(activity: string): string {
  // Try to get challenge name first
  try {
    const { getChallengeName } = require('@/lib/challenge-progression');
    const challengeName = getChallengeName(activity as any);
    if (challengeName) return challengeName;
  } catch (e) {
    // Not a challenge type, continue
  }
  
  // Format as display name
  return activity
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const DIFFICULTY_COLORS = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
  extreme: '#8B5CF6',
};

export function PracticeOverview({
  practiceTitle,
  practiceDescription,
  activities,
  totalXP,
  estimatedDuration,
  difficulty,
  practiceColors,
  onStart,
  onBack,
}: PracticeOverviewProps) {
  const insets = useSafeAreaInsets();
  const difficultyColor = DIFFICULTY_COLORS[difficulty];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Background */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Overview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Practice Header Card */}
        <LinearGradient
          colors={practiceColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.practiceHeaderCard}
        >
          <Text style={styles.practiceTitle}>{practiceTitle}</Text>
          <Text style={styles.practiceDescription}>{practiceDescription}</Text>
          
          <View style={styles.practiceMeta}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{estimatedDuration}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaIcon}>✨</Text>
              <Text style={styles.metaText}>+{totalXP} XP</Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: difficultyColor + '30', borderColor: difficultyColor }]}>
              <Text style={[styles.metaText, { color: difficultyColor }]}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Activities List */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>
            {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
          </Text>
          
          <View style={styles.activitiesList}>
            {activities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityNumber}>
                  <Text style={styles.activityNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>
                    {ACTIVITY_ICONS[activity] || '🎯'}
                  </Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>
                    {getActivityDisplayName(activity)}
                  </Text>
                  <Text style={styles.activityType}>
                    {activity.includes('breath') || activity.includes('breathing') 
                      ? 'Breathing Exercise' 
                      : 'Focus Challenge'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Practice Tips</Text>
          <Text style={styles.infoText}>
            • Complete all activities in order{'\n'}
            • You'll earn XP for each completed challenge{'\n'}
            • Focus on accuracy over speed{'\n'}
            • Take breaks between activities if needed
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onStart();
          }}
          style={styles.startButtonContainer}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={practiceColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Start Practice</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: Math.max(insets.bottom, 40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  practiceHeaderCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  practiceTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  practiceDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 22,
  },
  practiceMeta: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activitiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366F1',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  startButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  startButton: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

