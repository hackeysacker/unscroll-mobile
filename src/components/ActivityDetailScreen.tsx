import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import type { ChallengeType } from '@/types';
import type { ExerciseType } from '@/lib/exercise-types';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { UIIcon } from '@/components/ui/UIIcon';

interface ActivityDetailScreenProps {
  activityType: ChallengeType | ExerciseType;
  duration: number;
  xpReward: number;
  difficultyLevel: number;
  onStart: () => void;
  onBack: () => void;
}

interface ActivityInfo {
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
  howItWorks: string[];
  tips: string[];
  gradient: [string, string];
}

const ACTIVITY_INFO: Record<string, ActivityInfo> = {
  // Focus Challenges
  focus_hold: {
    emoji: '👁️',
    title: 'Focus Hold',
    tagline: 'Master sustained attention',
    description: 'Train your ability to maintain focus on a single point without distraction. This foundational exercise builds concentration endurance.',
    benefits: [
      'Improves sustained attention span',
      'Reduces mind wandering',
      'Builds mental endurance',
      'Enhances concentration skills'
    ],
    howItWorks: [
      'Place and hold your finger on the center dot',
      'Keep steady pressure without lifting',
      'Resist the urge to move or check your phone',
      'Complete the full duration to succeed'
    ],
    tips: [
      'Find a comfortable position before starting',
      'Take a deep breath and commit to stillness',
      'If your mind wanders, gently return focus to the dot'
    ],
    gradient: ['#6366F1', '#4F46E5']
  },

  finger_hold: {
    emoji: '☝️',
    title: 'Finger Hold',
    tagline: 'Build physical stillness',
    description: 'Develop the ability to remain perfectly still while maintaining focus. Combines physical and mental discipline.',
    benefits: [
      'Trains impulse control',
      'Improves body awareness',
      'Reduces restlessness',
      'Builds patience and discipline'
    ],
    howItWorks: [
      'Place your finger on the target area',
      'Hold completely still for the duration',
      'Any movement breaks your streak',
      'Maintain focus on staying motionless'
    ],
    tips: [
      'Rest your hand on a stable surface',
      'Breathe slowly and naturally',
      'Notice the urge to move without acting on it'
    ],
    gradient: ['#8B5CF6', '#7C3AED']
  },

  gaze_hold: {
    emoji: '👀',
    title: 'Gaze Hold',
    tagline: 'Train visual focus',
    description: 'Practice maintaining visual attention on a single point. Strengthens your ability to resist visual distractions.',
    benefits: [
      'Enhances visual concentration',
      'Reduces eye movement impulses',
      'Improves reading focus',
      'Builds visual discipline'
    ],
    howItWorks: [
      'Keep your eyes fixed on the center point',
      'Resist looking at anything else',
      'Maintain steady gaze without blinking excessively',
      'Stay focused for the full duration'
    ],
    tips: [
      'Blink naturally, but keep gaze steady',
      'Soften your focus to reduce eye strain',
      'Use peripheral awareness without moving eyes'
    ],
    gradient: ['#06B6D4', '#0891B2']
  },

  tap_only_correct: {
    emoji: '🎯',
    title: 'Tap Only Correct',
    tagline: 'Practice selective attention',
    description: 'Train yourself to respond only to correct targets while ignoring distractors. Builds impulse control and selective focus.',
    benefits: [
      'Improves selective attention',
      'Strengthens impulse control',
      'Reduces reactive behavior',
      'Enhances decision-making speed'
    ],
    howItWorks: [
      'Green circles are correct targets - tap them',
      'Red circles are distractors - ignore them',
      'Build streaks by tapping only green',
      'Wrong taps break your combo'
    ],
    tips: [
      'Take a moment to identify color before tapping',
      'Quality over speed - accuracy matters more',
      'Stay calm when distractors appear'
    ],
    gradient: ['#10B981', '#059669']
  },

  memory_flash: {
    emoji: '🧠',
    title: 'Memory Flash',
    tagline: 'Strengthen working memory',
    description: 'Challenge your working memory by remembering and recalling number sequences. Essential for maintaining focus on complex tasks.',
    benefits: [
      'Enhances working memory capacity',
      'Improves information retention',
      'Strengthens recall ability',
      'Boosts cognitive processing'
    ],
    howItWorks: [
      'Watch as numbers flash in sequence',
      'Memorize the order carefully',
      'Recall and tap the sequence correctly',
      'Complete multiple rounds successfully'
    ],
    tips: [
      'Use chunking - group numbers mentally',
      'Create a mental story or pattern',
      'Focus intensely during the flash phase'
    ],
    gradient: ['#F59E0B', '#D97706']
  },

  reaction_inhibition: {
    emoji: '⚡',
    title: 'Reaction Inhibition',
    tagline: 'Control impulsive reactions',
    description: 'Learn to inhibit automatic responses and act only when appropriate. Critical for breaking reactive patterns.',
    benefits: [
      'Builds impulse control',
      'Reduces automatic reactions',
      'Improves response selection',
      'Enhances self-regulation'
    ],
    howItWorks: [
      'Tap when you see the GO signal',
      'Do NOT tap on STOP signals',
      'Resist the urge to tap too quickly',
      'Maintain accuracy over speed'
    ],
    tips: [
      'Wait for clear GO signals',
      'Better to be slightly slow than wrong',
      'Notice the impulse before acting'
    ],
    gradient: ['#EF4444', '#DC2626']
  },

  slow_tracking: {
    emoji: '🎯',
    title: 'Slow Tracking',
    tagline: 'Practice deliberate movement',
    description: 'Follow a slowly moving target with precision. Trains patience and smooth, controlled attention.',
    benefits: [
      'Improves attention to detail',
      'Builds patience with slow tasks',
      'Enhances smooth pursuit',
      'Reduces rushing behavior'
    ],
    howItWorks: [
      'Keep your finger on the moving target',
      'Match its slow, steady pace',
      'Maintain contact throughout',
      'Stay calm and deliberate'
    ],
    tips: [
      'Don\'t rush ahead of the target',
      'Breathe slowly to match the pace',
      'Accept the slow speed mindfully'
    ],
    gradient: ['#14B8A6', '#0D9488']
  },

  moving_target: {
    emoji: '🎪',
    title: 'Moving Target',
    tagline: 'Track dynamic objects',
    description: 'Follow rapidly moving targets with your attention. Builds dynamic focus and tracking ability.',
    benefits: [
      'Enhances dynamic attention',
      'Improves tracking ability',
      'Builds visual-motor coordination',
      'Increases processing speed'
    ],
    howItWorks: [
      'Follow the moving target with your finger',
      'Keep up with changing speed and direction',
      'Maintain contact as it moves',
      'Stay focused despite unpredictability'
    ],
    tips: [
      'Predict movement patterns',
      'Stay relaxed - tension slows you down',
      'Use your whole hand, not just fingertip'
    ],
    gradient: ['#F97316', '#EA580C']
  },

  rhythm_tap: {
    emoji: '🥁',
    title: 'Rhythm Tap',
    tagline: 'Master timing and rhythm',
    description: 'Tap in time with rhythmic patterns. Builds temporal attention and synchronization skills.',
    benefits: [
      'Improves timing and rhythm',
      'Enhances predictive attention',
      'Builds pattern recognition',
      'Strengthens synchronization'
    ],
    howItWorks: [
      'Listen and watch for the rhythm',
      'Tap in sync with the beat',
      'Maintain consistent timing',
      'Build and keep your combo'
    ],
    tips: [
      'Feel the rhythm internally first',
      'Tap slightly ahead if you\'re late',
      'Let your body find the groove'
    ],
    gradient: ['#A855F7', '#9333EA']
  },

  fake_notifications: {
    emoji: '🔔',
    title: 'Fake Notifications',
    tagline: 'Resist notification urges',
    description: 'Ignore fake notification alerts while staying focused. Directly targets one of the biggest digital distractions.',
    benefits: [
      'Builds notification resistance',
      'Reduces alert anxiety',
      'Improves focus despite distractions',
      'Breaks checking compulsions'
    ],
    howItWorks: [
      'Fake notifications will appear',
      'Do NOT tap on them',
      'Stay focused on the actual task',
      'Resist the urge to check'
    ],
    tips: [
      'Expect the notifications - they\'re part of the test',
      'Notice the urge to check without acting',
      'Remember: they\'re all fake'
    ],
    gradient: ['#EF4444', '#F97316']
  },

  delay_unlock: {
    emoji: '⏱️',
    title: 'Delay Unlock',
    tagline: 'Build delayed gratification',
    description: 'Wait through a delay before unlocking. Trains patience and resistance to instant gratification.',
    benefits: [
      'Improves impulse control',
      'Builds delayed gratification',
      'Reduces impatience',
      'Strengthens willpower'
    ],
    howItWorks: [
      'Wait for the timer to complete',
      'Do NOT tap the unlock button early',
      'Stay present during the wait',
      'Unlock only when timer finishes'
    ],
    tips: [
      'Use the wait time to breathe',
      'Notice impatience without acting on it',
      'Remember: the wait is the exercise'
    ],
    gradient: ['#6366F1', '#8B5CF6']
  },

  popup_ignore: {
    emoji: '❌',
    title: 'Popup Ignore',
    tagline: 'Ignore intrusive popups',
    description: 'Stay focused while annoying popups try to distract you. Simulates real-world digital distractions.',
    benefits: [
      'Builds distraction resistance',
      'Reduces popup reactivity',
      'Improves sustained focus',
      'Strengthens attention control'
    ],
    howItWorks: [
      'Focus on the main task',
      'Ignore all popup distractions',
      'Do NOT interact with popups',
      'Complete task despite interruptions'
    ],
    tips: [
      'Expect popups - don\'t let them surprise you',
      'Keep peripheral vision soft',
      'Stay anchored to your main task'
    ],
    gradient: ['#DC2626', '#B91C1C']
  },

  stillness_test: {
    emoji: '🧘',
    title: 'Stillness Test',
    tagline: 'Achieve perfect stillness',
    description: 'Remain completely motionless for the duration. The ultimate test of physical and mental discipline.',
    benefits: [
      'Builds profound self-control',
      'Enhances body awareness',
      'Reduces fidgeting',
      'Cultivates inner stillness'
    ],
    howItWorks: [
      'Hold device perfectly still',
      'Any movement resets progress',
      'Stay motionless for full duration',
      'Maintain complete stillness'
    ],
    tips: [
      'Find a stable position first',
      'Rest arms on a surface',
      'Breathe gently without moving body'
    ],
    gradient: ['#64748B', '#475569']
  },

  multi_object_tracking: {
    emoji: '👁️‍🗨️',
    title: 'Multi-Object Tracking',
    tagline: 'Track multiple targets',
    description: 'Keep track of several moving objects simultaneously. Builds divided attention and spatial awareness.',
    benefits: [
      'Enhances divided attention',
      'Improves spatial tracking',
      'Builds mental agility',
      'Strengthens working memory'
    ],
    howItWorks: [
      'Remember which objects are marked',
      'Track them as they move and swap',
      'Identify the correct objects at the end',
      'Keep mental focus on all targets'
    ],
    tips: [
      'Use spatial patterns to help remember',
      'Don\'t fixate on one - see the whole field',
      'Trust your peripheral vision'
    ],
    gradient: ['#06B6D4', '#0284C7']
  },

  finger_tracing: {
    emoji: '✏️',
    title: 'Finger Tracing',
    tagline: 'Follow precise paths',
    description: 'Trace paths with precision and control. Builds fine motor control and sustained attention to detail.',
    benefits: [
      'Improves precision and control',
      'Enhances attention to detail',
      'Builds patience with tasks',
      'Strengthens visual-motor coordination'
    ],
    howItWorks: [
      'Follow the path with your finger',
      'Stay within the boundaries',
      'Move smoothly and deliberately',
      'Complete the full path accurately'
    ],
    tips: [
      'Go slow - speed causes mistakes',
      'Look ahead on the path',
      'Maintain steady pressure'
    ],
    gradient: ['#8B5CF6', '#A855F7']
  },

  multi_task_tap: {
    emoji: '🎯',
    title: 'Multi-Task Tap',
    tagline: 'Handle multiple demands',
    description: 'Manage multiple simultaneous tasks. Trains task-switching and divided attention.',
    benefits: [
      'Improves multitasking ability',
      'Enhances task-switching',
      'Builds cognitive flexibility',
      'Reduces overwhelm'
    ],
    howItWorks: [
      'Monitor multiple task areas',
      'Respond to different types of targets',
      'Switch attention rapidly',
      'Keep all tasks progressing'
    ],
    tips: [
      'Scan all areas regularly',
      'Prioritize based on urgency',
      'Stay calm despite multiple demands'
    ],
    gradient: ['#F59E0B', '#EF4444']
  },

  impulse_spike_test: {
    emoji: '⚡',
    title: 'Impulse Spike Test',
    tagline: 'Resist impulse spikes',
    description: 'Maintain control during high-impulse moments. Simulates the intense urges that break focus.',
    benefits: [
      'Builds impulse resistance',
      'Improves self-regulation',
      'Reduces reactive behavior',
      'Strengthens willpower under pressure'
    ],
    howItWorks: [
      'Resist during impulse spike moments',
      'Do NOT give in to the urge',
      'Stay focused despite intensity',
      'Outlast the impulse wave'
    ],
    tips: [
      'Expect intense urges - they pass',
      'Breathe through the spike',
      'Remember: this is temporary'
    ],
    gradient: ['#DC2626', '#7C2D12']
  },

  tap_pattern: {
    emoji: '🔢',
    title: 'Tap Pattern',
    tagline: 'Master complex patterns',
    description: 'Reproduce tapping patterns accurately. Builds sequential memory and procedural learning.',
    benefits: [
      'Enhances pattern recognition',
      'Improves sequential memory',
      'Builds procedural learning',
      'Strengthens attention to sequence'
    ],
    howItWorks: [
      'Watch the pattern demonstration',
      'Remember the sequence',
      'Reproduce it accurately',
      'Complete multiple patterns'
    ],
    tips: [
      'Count the beats mentally',
      'Use rhythm to aid memory',
      'Practice the pattern in your mind first'
    ],
    gradient: ['#A855F7', '#7C3AED']
  },

  // Mindfulness Exercises
  breath_pacing: {
    emoji: '🫁',
    title: 'Breath Pacing',
    tagline: 'Calm your mind through breath',
    description: 'Follow guided breathing patterns to calm your nervous system and improve focus. A foundational mindfulness practice.',
    benefits: [
      'Reduces stress and anxiety',
      'Improves emotional regulation',
      'Enhances focus and clarity',
      'Calms the nervous system'
    ],
    howItWorks: [
      'Follow the visual breathing guide',
      'Inhale when circle expands',
      'Hold when circle pauses',
      'Exhale when circle contracts'
    ],
    tips: [
      'Breathe naturally through your nose',
      'Let the breath be smooth and even',
      'If you lose the rhythm, gently rejoin'
    ],
    gradient: ['#60A5FA', '#34D399']
  },

  controlled_breathing: {
    emoji: '🌬️',
    title: 'Controlled Breathing',
    tagline: 'Master 4-4-4-4 breathing',
    description: 'Practice box breathing (4-4-4-4 pattern) to achieve deep calm and mental clarity. Used by athletes and special forces.',
    benefits: [
      'Achieves deep relaxation',
      'Improves focus under pressure',
      'Balances nervous system',
      'Enhances stress resilience'
    ],
    howItWorks: [
      'Inhale for 4 seconds',
      'Hold for 4 seconds',
      'Exhale for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat the cycle'
    ],
    tips: [
      'Keep counts consistent',
      'Don\'t force the breath',
      'Find your natural rhythm within the pattern'
    ],
    gradient: ['#A78BFA', '#6B7280']
  }
};

export function ActivityDetailScreen({
  activityType,
  duration,
  xpReward,
  difficultyLevel,
  onStart,
  onBack
}: ActivityDetailScreenProps) {
  const { colors } = useTheme();

  const activityInfo = ACTIVITY_INFO[activityType] || {
    emoji: '⚡',
    title: activityType,
    tagline: 'Focus challenge',
    description: 'Complete this challenge to earn XP and improve your focus.',
    benefits: ['Improves focus', 'Builds discipline'],
    howItWorks: ['Follow the instructions', 'Complete the challenge'],
    tips: ['Stay focused', 'Do your best'],
    gradient: ['#6366F1', '#4F46E5']
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Gradient - Compact */}
      <LinearGradient
        colors={activityInfo.gradient}
        style={styles.header}
      >
        <ActivityIcon
          activityType={activityType}
          size={56}
          color="#FFFFFF"
          backgroundColor="rgba(255, 255, 255, 0.2)"
        />
        <Text style={styles.title}>{activityInfo.title}</Text>
        <Text style={styles.tagline}>{activityInfo.tagline}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statContent}>
              <UIIcon name="clock" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statLabel}>{Math.round(duration / 60)}m</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statContent}>
              <UIIcon name="star" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statLabel}>{xpReward} XP</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lv.{difficultyLevel}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Compact Content - Fits on one screen */}
      <View style={styles.content}>
        {/* Description */}
        <View style={[styles.compactSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {activityInfo.description}
          </Text>
        </View>

        {/* Quick Info Grid - 2 columns */}
        <View style={styles.gridContainer}>
          {/* Left: Key Points */}
          <View style={[styles.gridColumn, { backgroundColor: colors.card }]}>
            <View style={styles.gridTitleRow}>
              <UIIcon name="checkmark" size={16} color={colors.foreground} />
              <Text style={[styles.gridTitle, { color: colors.foreground }]}>Key Benefits</Text>
            </View>
            {activityInfo.benefits.slice(0, 3).map((benefit, index) => (
              <Text key={index} style={[styles.gridText, { color: colors.mutedForeground }]}>
                • {benefit.replace(/^(Improves?|Builds?|Enhances?|Reduces?|Strengthens?|Increases?|Trains?) /, '')}
              </Text>
            ))}
          </View>

          {/* Right: Quick Tips */}
          <View style={[styles.gridColumn, { backgroundColor: colors.card }]}>
            <View style={styles.gridTitleRow}>
              <UIIcon name="lightning" size={16} color={colors.foreground} />
              <Text style={[styles.gridTitle, { color: colors.foreground }]}>Quick Tips</Text>
            </View>
            {activityInfo.tips.slice(0, 3).map((tip, index) => (
              <Text key={index} style={[styles.gridText, { color: colors.mutedForeground }]}>
                • {tip}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          onPress={onBack}
          variant="outline"
          style={styles.backButton}
        >
          Back
        </Button>
        <LinearGradient
          colors={activityInfo.gradient}
          style={styles.startButtonGradient}
        >
          <Button
            onPress={onStart}
            style={styles.startButton}
          >
            Start Challenge
          </Button>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Compact Header
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Compact Content
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  compactSection: {
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  gridColumn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  gridTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  gridText: {
    fontSize: 12,
    lineHeight: 18,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  backButton: {
    flex: 1,
  },
  startButtonGradient: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    backgroundColor: 'transparent',
  },
});
