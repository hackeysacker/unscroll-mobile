/**
 * Challenge Configurations
 * Defines all challenge metadata for intro screens
 */

import { ChallengeConfig } from '@/components/challenges/BaseChallengeWrapper';
import type { ChallengeType } from '@/types';

export const CHALLENGE_CONFIGS: Record<ChallengeType, ChallengeConfig> = {
  focus_hold: {
    name: 'Focus Hold',
    icon: '👁️',
    description: 'Train your ability to maintain focus on a single point without distraction. Build concentration endurance.',
    duration: 60,
    xpReward: 10,
    difficulty: 'easy',
    instructions: [
      'Place and hold your finger on the center dot',
      'Keep steady pressure without lifting',
      'Resist the urge to move or check your phone',
      'Complete the full duration to succeed',
    ],
    benefits: [
      'Improves sustained attention span',
      'Reduces mind wandering',
      'Builds mental endurance',
      'Enhances concentration skills',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#6366F1',
      secondary: '#4F46E5',
    },
  },

  finger_hold: {
    name: 'Finger Hold',
    icon: '☝️',
    description: 'Develop the ability to remain perfectly still while maintaining focus. Combines physical and mental discipline.',
    duration: 60,
    xpReward: 10,
    difficulty: 'easy',
    instructions: [
      'Place your finger on the target area',
      'Hold completely still for the duration',
      'Any movement breaks your streak',
      'Maintain focus on staying motionless',
    ],
    benefits: [
      'Trains impulse control',
      'Improves body awareness',
      'Reduces restlessness',
      'Builds patience and discipline',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#8B5CF6',
      secondary: '#7C3AED',
    },
  },

  gaze_hold: {
    name: 'Gaze Hold',
    icon: '👀',
    description: 'Practice maintaining visual attention on a single point. Strengthens your ability to resist visual distractions.',
    duration: 60,
    xpReward: 10,
    difficulty: 'medium',
    instructions: [
      'Keep your eyes fixed on the center point',
      'Resist looking at anything else',
      'Maintain steady gaze without blinking excessively',
      'Stay focused for the full duration',
    ],
    benefits: [
      'Enhances visual concentration',
      'Reduces eye movement impulses',
      'Improves reading focus',
      'Builds visual discipline',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#06B6D4',
      secondary: '#0891B2',
    },
  },

  tap_only_correct: {
    name: 'Tap Only Correct',
    icon: '🎯',
    description: 'Train yourself to respond only to correct targets while ignoring distractors. Builds impulse control and selective focus.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Green circles are correct targets - tap them',
      'Red circles are distractors - ignore them',
      'Build streaks by tapping only green',
      'Wrong taps break your combo',
    ],
    benefits: [
      'Improves selective attention',
      'Strengthens impulse control',
      'Reduces reactive behavior',
      'Enhances decision-making speed',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#10B981',
      secondary: '#059669',
    },
  },

  memory_flash: {
    name: 'Memory Flash',
    icon: '🧠',
    description: 'Challenge your working memory by remembering and recalling number sequences. Essential for maintaining focus on complex tasks.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Watch as numbers flash in sequence',
      'Memorize the order carefully',
      'Recall and tap the sequence correctly',
      'Complete multiple rounds successfully',
    ],
    benefits: [
      'Enhances working memory capacity',
      'Improves information retention',
      'Strengthens recall ability',
      'Boosts cognitive processing',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#F59E0B',
      secondary: '#D97706',
    },
  },

  reaction_inhibition: {
    name: 'Reaction Inhibition',
    icon: '⚡',
    description: 'Learn to inhibit automatic responses and act only when appropriate. Critical for breaking reactive patterns.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Tap when you see the GO signal',
      'Do NOT tap on STOP signals',
      'Resist the urge to tap too quickly',
      'Maintain accuracy over speed',
    ],
    benefits: [
      'Builds impulse control',
      'Reduces automatic reactions',
      'Improves response selection',
      'Enhances self-regulation',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#EF4444',
      secondary: '#DC2626',
    },
  },

  slow_tracking: {
    name: 'Slow Tracking',
    icon: '🎯',
    description: 'Follow a slowly moving target with precision. Trains patience and smooth, controlled attention.',
    duration: 60,
    xpReward: 10,
    difficulty: 'easy',
    instructions: [
      'Keep your finger on the moving target',
      'Match its slow, steady pace',
      'Maintain contact throughout',
      'Stay calm and deliberate',
    ],
    benefits: [
      'Improves attention to detail',
      'Builds patience with slow tasks',
      'Enhances smooth pursuit',
      'Reduces rushing behavior',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#14B8A6',
      secondary: '#0D9488',
    },
  },

  moving_target: {
    name: 'Moving Target',
    icon: '🎪',
    description: 'Follow rapidly moving targets with your attention. Builds dynamic focus and tracking ability.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Follow the moving target with your finger',
      'Keep up with changing speed and direction',
      'Maintain contact as it moves',
      'Stay focused despite unpredictability',
    ],
    benefits: [
      'Enhances dynamic attention',
      'Improves tracking ability',
      'Builds visual-motor coordination',
      'Increases processing speed',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#F97316',
      secondary: '#EA580C',
    },
  },

  rhythm_tap: {
    name: 'Rhythm Tap',
    icon: '🥁',
    description: 'Tap in time with rhythmic patterns. Builds temporal attention and synchronization skills.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Listen and watch for the rhythm',
      'Tap in sync with the beat',
      'Maintain consistent timing',
      'Build and keep your combo',
    ],
    benefits: [
      'Improves timing and rhythm',
      'Enhances predictive attention',
      'Builds pattern recognition',
      'Strengthens synchronization',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#A855F7',
      secondary: '#9333EA',
    },
  },

  fake_notifications: {
    name: 'Fake Notifications',
    icon: '🔔',
    description: 'Ignore fake notification alerts while staying focused. Directly targets one of the biggest digital distractions.',
    duration: 60,
    xpReward: 20,
    difficulty: 'hard',
    instructions: [
      'Fake notifications will appear',
      'Do NOT tap on them',
      'Stay focused on the actual task',
      'Resist the urge to check',
    ],
    benefits: [
      'Builds notification resistance',
      'Reduces alert anxiety',
      'Improves focus despite distractions',
      'Breaks checking compulsions',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#EF4444',
      secondary: '#F97316',
    },
  },

  delay_unlock: {
    name: 'Delay Unlock',
    icon: '⏱️',
    description: 'Wait through a delay before unlocking. Trains patience and resistance to instant gratification.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Wait for the timer to complete',
      'Do NOT tap the unlock button early',
      'Stay present during the wait',
      'Unlock only when timer finishes',
    ],
    benefits: [
      'Improves impulse control',
      'Builds delayed gratification',
      'Reduces impatience',
      'Strengthens willpower',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#6366F1',
      secondary: '#8B5CF6',
    },
  },

  popup_ignore: {
    name: 'Popup Ignore',
    icon: '❌',
    description: 'Stay focused while annoying popups try to distract you. Simulates real-world digital distractions.',
    duration: 60,
    xpReward: 20,
    difficulty: 'hard',
    instructions: [
      'Focus on the main task',
      'Ignore all popup distractions',
      'Do NOT interact with popups',
      'Complete task despite interruptions',
    ],
    benefits: [
      'Builds distraction resistance',
      'Reduces popup reactivity',
      'Improves sustained focus',
      'Strengthens attention control',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#DC2626',
      secondary: '#B91C1C',
    },
  },

  stillness_test: {
    name: 'Stillness Test',
    icon: '🧘',
    description: 'Remain completely motionless for the duration. The ultimate test of physical and mental discipline.',
    duration: 60,
    xpReward: 20,
    difficulty: 'hard',
    instructions: [
      'Hold device perfectly still',
      'Any movement resets progress',
      'Stay motionless for full duration',
      'Maintain complete stillness',
    ],
    benefits: [
      'Builds profound self-control',
      'Enhances body awareness',
      'Reduces fidgeting',
      'Cultivates inner stillness',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#64748B',
      secondary: '#475569',
    },
  },

  multi_object_tracking: {
    name: 'Multi-Object Tracking',
    icon: '👁️‍🗨️',
    description: 'Keep track of several moving objects simultaneously. Builds divided attention and spatial awareness.',
    duration: 60,
    xpReward: 20,
    difficulty: 'hard',
    instructions: [
      'Remember which objects are marked',
      'Track them as they move and swap',
      'Identify the correct objects at the end',
      'Keep mental focus on all targets',
    ],
    benefits: [
      'Enhances divided attention',
      'Improves spatial tracking',
      'Builds mental agility',
      'Strengthens working memory',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#06B6D4',
      secondary: '#0284C7',
    },
  },

  finger_tracing: {
    name: 'Finger Tracing',
    icon: '✏️',
    description: 'Trace paths with precision and control. Builds fine motor control and sustained attention to detail.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Follow the path with your finger',
      'Stay within the boundaries',
      'Move smoothly and deliberately',
      'Complete the full path accurately',
    ],
    benefits: [
      'Improves precision and control',
      'Enhances attention to detail',
      'Builds patience with tasks',
      'Strengthens visual-motor coordination',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#8B5CF6',
      secondary: '#A855F7',
    },
  },

  multi_task_tap: {
    name: 'Multi-Task Tap',
    icon: '🎯',
    description: 'Manage multiple simultaneous tasks. Trains task-switching and divided attention.',
    duration: 60,
    xpReward: 20,
    difficulty: 'hard',
    instructions: [
      'Monitor multiple task areas',
      'Respond to different types of targets',
      'Switch attention rapidly',
      'Keep all tasks progressing',
    ],
    benefits: [
      'Improves multitasking ability',
      'Enhances task-switching',
      'Builds cognitive flexibility',
      'Reduces overwhelm',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#F59E0B',
      secondary: '#EF4444',
    },
  },

  impulse_spike_test: {
    name: 'Impulse Spike Test',
    icon: '⚡',
    description: 'Maintain control during high-impulse moments. Simulates the intense urges that break focus.',
    duration: 60,
    xpReward: 25,
    difficulty: 'hard',
    instructions: [
      'Resist during impulse spike moments',
      'Do NOT give in to the urge',
      'Stay focused despite intensity',
      'Outlast the impulse wave',
    ],
    benefits: [
      'Builds impulse resistance',
      'Improves self-regulation',
      'Reduces reactive behavior',
      'Strengthens willpower under pressure',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#DC2626',
      secondary: '#7C2D12',
    },
  },

  tap_pattern: {
    name: 'Tap Pattern',
    icon: '🔢',
    description: 'Reproduce tapping patterns accurately. Builds sequential memory and procedural learning.',
    duration: 60,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Watch the pattern demonstration',
      'Remember the sequence',
      'Reproduce it accurately',
      'Complete multiple patterns',
    ],
    benefits: [
      'Enhances pattern recognition',
      'Improves sequential memory',
      'Builds procedural learning',
      'Strengthens attention to sequence',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#A855F7',
      secondary: '#7C3AED',
    },
  },

  breath_pacing: {
    name: 'Breath Pacing',
    icon: '🫁',
    description: 'Follow guided breathing patterns to calm your nervous system and improve focus. A foundational mindfulness practice.',
    duration: 180,
    xpReward: 15,
    difficulty: 'easy',
    instructions: [
      'Follow the visual breathing guide',
      'Inhale when circle expands',
      'Hold when circle pauses',
      'Exhale when circle contracts',
    ],
    benefits: [
      'Reduces stress and anxiety',
      'Improves emotional regulation',
      'Enhances focus and clarity',
      'Calms the nervous system',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#60A5FA',
      secondary: '#34D399',
    },
  },

  controlled_breathing: {
    name: 'Controlled Breathing',
    icon: '🌬️',
    description: 'Practice box breathing (4-4-4-4 pattern) to achieve deep calm and mental clarity. Used by athletes and special forces.',
    duration: 180,
    xpReward: 15,
    difficulty: 'easy',
    instructions: [
      'Inhale for 4 seconds',
      'Hold for 4 seconds',
      'Exhale for 4 seconds',
      'Hold empty for 4 seconds',
    ],
    benefits: [
      'Achieves deep relaxation',
      'Improves focus under pressure',
      'Balances nervous system',
      'Enhances stress resilience',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#A78BFA',
      secondary: '#6B7280',
    },
  },

  look_away: {
    name: 'Look Away',
    icon: '🙈',
    description: 'Practice looking away from the screen to reduce screen dependency and eye strain. Build the ability to disconnect.',
    duration: 30,
    xpReward: 10,
    difficulty: 'easy',
    instructions: [
      'Tilt your device away or face down',
      'Look away from the screen',
      'Hold for the full duration',
      'Resist the urge to check the screen',
    ],
    benefits: [
      'Reduces screen dependency',
      'Improves eye health',
      'Builds disconnect discipline',
      'Reduces compulsive checking',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#10B981',
      secondary: '#059669',
    },
  },

  anti_scroll_swipe: {
    name: 'Anti-Scroll Swipe',
    icon: '🚫',
    description: 'Resist the urge to scroll through enticing content. Build resistance to infinite scroll patterns.',
    duration: 45,
    xpReward: 15,
    difficulty: 'medium',
    instructions: [
      'Content will appear on screen',
      'DO NOT scroll or swipe',
      'Resist for the full duration',
      'Any scrolling reduces your score',
    ],
    benefits: [
      'Breaks scroll addiction',
      'Improves impulse control',
      'Reduces compulsive behavior',
      'Builds digital discipline',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#EF4444',
      secondary: '#DC2626',
    },
  },

  reset: {
    name: 'Reset - Final Challenge',
    icon: '🏆',
    description: 'The ultimate mastery test combining all attention skills. Complete multiple rapid challenges to prove your focus mastery.',
    duration: 120,
    xpReward: 100,
    difficulty: 'hard',
    instructions: [
      'Complete a series of mini-challenges',
      'Each tests a different attention skill',
      'Maintain high performance throughout',
      'Prove your complete attention mastery',
    ],
    benefits: [
      'Tests all attention skills',
      'Proves mastery level',
      'Ultimate focus challenge',
      'Complete skill integration',
    ],
    colors: {
      background: '#1a1a2e',
      primary: '#FFD700',
      secondary: '#FFA500',
    },
  },
};

export function getChallengeConfig(challengeType: ChallengeType): ChallengeConfig {
  return CHALLENGE_CONFIGS[challengeType] || CHALLENGE_CONFIGS.focus_hold;
}
