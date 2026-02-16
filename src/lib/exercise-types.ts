/**
 * Exercise System Types
 *
 * Defines all exercise types, data structures, and configurations
 * for the 25 mindfulness and focus exercises
 */

export type ExerciseType =
  | 'slow_breathing'
  | 'box_breathing'
  | 'five_senses'
  | 'thought_reframe'
  | 'micro_journal'
  | 'body_scan'
  | 'dopamine_pause'
  | 'positive_self_talk'
  | 'focus_sprint'
  | 'distraction_log'
  | 'calm_visual'
  | 'value_check'
  | 'mental_reset'
  | 'urge_surfing'
  | 'mood_naming'
  | 'positive_action'
  | 'self_inquiry'
  | 'vision_moment'
  | 'mini_gratitude'
  | 'intent_setting'
  | 'ego_detach'
  | 'body_release'
  | 'ten_second_reflection'
  | 'compulsion_detector'
  | 'inner_mentor';

export interface ExerciseConfig {
  id: ExerciseType;
  name: string;
  shortName: string;
  description: string;
  duration: number; // seconds
  category: 'breathing' | 'grounding' | 'cognitive' | 'reflection' | 'movement';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  icon: string; // emoji
  instructions: string[];
  benefits: string[];
}

export interface ExerciseResult {
  exerciseType: ExerciseType;
  completed: boolean;
  duration: number; // actual time spent in seconds
  score?: number; // 0-100 for exercises with scoring
  timestamp: number;
  xpEarned: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BreathingPattern {
  inhale: number;
  hold1?: number;
  exhale: number;
  hold2?: number;
}

export interface ExerciseState {
  phase: 'intro' | 'active' | 'complete';
  progress: number; // 0-100
  timeElapsed: number;
  timeRemaining: number;
  currentStep?: number;
  totalSteps?: number;
}

/**
 * All 25 Exercise Configurations
 */
export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  // #1: SLOW BREATHING
  slow_breathing: {
    id: 'slow_breathing',
    name: 'Slow Breathing',
    shortName: 'Slow Breath',
    description: 'Calm your nervous system with gentle, elongated breathing',
    duration: 120, // 2 minutes
    category: 'breathing',
    difficulty: 'easy',
    xpReward: 15,
    colors: {
      primary: '#7DD3C0',
      secondary: '#4ECDC4',
      accent: '#A8E6CF',
      background: '#0a1a1a',
    },
    icon: '🫁',
    instructions: [
      'Find a comfortable position',
      'Breathe in slowly for 4 seconds',
      'Breathe out slowly for 6 seconds',
      'Continue for 2 minutes',
    ],
    benefits: [
      'Reduces anxiety',
      'Calms nervous system',
      'Improves focus',
    ],
  },

  // #2: BOX BREATHING
  box_breathing: {
    id: 'box_breathing',
    name: 'Box Breathing',
    shortName: 'Box Breath',
    description: 'Military-grade technique for focus and calm',
    duration: 180, // 3 minutes
    category: 'breathing',
    difficulty: 'medium',
    xpReward: 20,
    colors: {
      primary: '#6C63FF',
      secondary: '#5A54E0',
      accent: '#8A85FF',
      background: '#0a0a1a',
    },
    icon: '⬜',
    instructions: [
      'Breathe in for 4 seconds',
      'Hold for 4 seconds',
      'Breathe out for 4 seconds',
      'Hold for 4 seconds',
      'Repeat for 3 minutes',
    ],
    benefits: [
      'Enhances focus',
      'Regulates stress',
      'Used by Navy SEALs',
    ],
  },

  // #3: FIVE SENSES GROUNDING
  five_senses: {
    id: 'five_senses',
    name: 'Five Senses Grounding',
    shortName: '5 Senses',
    description: 'Ground yourself in the present moment',
    duration: 180, // 3 minutes
    category: 'grounding',
    difficulty: 'easy',
    xpReward: 18,
    colors: {
      primary: '#FFB347',
      secondary: '#FF9A1F',
      accent: '#FFCC80',
      background: '#1a0f0a',
    },
    icon: '👁️',
    instructions: [
      'Name 5 things you see',
      'Name 4 things you can touch',
      'Name 3 things you hear',
      'Name 2 things you smell',
      'Name 1 thing you taste',
    ],
    benefits: [
      'Stops spiraling thoughts',
      'Anchors to present',
      'Reduces overwhelm',
    ],
  },

  // #4: THOUGHT REFRAME
  thought_reframe: {
    id: 'thought_reframe',
    name: 'Thought Reframe',
    shortName: 'Reframe',
    description: 'Challenge and rewrite anxious thoughts',
    duration: 240, // 4 minutes
    category: 'cognitive',
    difficulty: 'medium',
    xpReward: 25,
    colors: {
      primary: '#9B7EBD',
      secondary: '#8A6CAF',
      accent: '#B29BCB',
      background: '#0f0a1a',
    },
    icon: '💭',
    instructions: [
      'Identify a negative thought',
      'Ask: Is this 100% true?',
      'Find evidence against it',
      'Rewrite a balanced version',
    ],
    benefits: [
      'Breaks cognitive distortions',
      'Builds mental flexibility',
      'Reduces rumination',
    ],
  },

  // #5: MICRO JOURNAL
  micro_journal: {
    id: 'micro_journal',
    name: 'Micro Journal Reflection',
    shortName: 'Micro Journal',
    description: 'Quick emotional check-in and release',
    duration: 180, // 3 minutes
    category: 'reflection',
    difficulty: 'easy',
    xpReward: 20,
    colors: {
      primary: '#F4A259',
      secondary: '#E8894A',
      accent: '#F7B673',
      background: '#1a1210',
    },
    icon: '📝',
    instructions: [
      'How do you feel right now?',
      'What triggered this feeling?',
      'What do you need in this moment?',
    ],
    benefits: [
      'Emotional awareness',
      'Prevents suppression',
      'Clarifies needs',
    ],
  },

  // #6: BODY SCAN
  body_scan: {
    id: 'body_scan',
    name: 'One Minute Body Scan',
    shortName: 'Body Scan',
    description: 'Release physical tension quickly',
    duration: 60, // 1 minute
    category: 'grounding',
    difficulty: 'easy',
    xpReward: 12,
    colors: {
      primary: '#A8E6CF',
      secondary: '#8FD9B6',
      accent: '#C1F0DB',
      background: '#0a1a14',
    },
    icon: '🧘',
    instructions: [
      'Start at your head',
      'Notice any tension',
      'Breathe into tight areas',
      'Scan down to your toes',
    ],
    benefits: [
      'Releases physical stress',
      'Increases body awareness',
      'Quick reset',
    ],
  },

  // #7: DOPAMINE PAUSE
  dopamine_pause: {
    id: 'dopamine_pause',
    name: 'Dopamine Pause Timer',
    shortName: 'Dopamine Pause',
    description: 'Resist the urge to check your phone',
    duration: 300, // 5 minutes
    category: 'cognitive',
    difficulty: 'hard',
    xpReward: 30,
    colors: {
      primary: '#FF6B9D',
      secondary: '#FF5689',
      accent: '#FF8CB0',
      background: '#1a0a14',
    },
    icon: '⏸️',
    instructions: [
      'Put phone face down',
      'Sit with the urge to check it',
      'Notice the feeling without acting',
      'Wait 5 minutes',
    ],
    benefits: [
      'Builds impulse control',
      'Breaks phone addiction',
      'Strengthens willpower',
    ],
  },

  // #8: POSITIVE SELF TALK
  positive_self_talk: {
    id: 'positive_self_talk',
    name: 'Positive Self Talk Builder',
    shortName: 'Self Talk',
    description: 'Rewire negative self-narratives',
    duration: 180, // 3 minutes
    category: 'cognitive',
    difficulty: 'medium',
    xpReward: 22,
    colors: {
      primary: '#FFD93D',
      secondary: '#FFC700',
      accent: '#FFE680',
      background: '#1a1710',
    },
    icon: '✨',
    instructions: [
      'Notice a harsh self-judgment',
      'Ask: Would I say this to a friend?',
      'Replace with compassionate words',
      'Repeat 3 times',
    ],
    benefits: [
      'Builds self-compassion',
      'Reduces shame',
      'Improves self-esteem',
    ],
  },

  // #9: FOCUS SPRINT
  focus_sprint: {
    id: 'focus_sprint',
    name: 'Three Minute Focus Sprint',
    shortName: 'Focus Sprint',
    description: 'Train deep focus in short bursts',
    duration: 180, // 3 minutes
    category: 'cognitive',
    difficulty: 'medium',
    xpReward: 25,
    colors: {
      primary: '#4A90E2',
      secondary: '#357ABD',
      accent: '#6BA3E8',
      background: '#0a0f1a',
    },
    icon: '⚡',
    instructions: [
      'Choose one simple task',
      'Set timer for 3 minutes',
      'Focus only on that task',
      'When distracted, gently return',
    ],
    benefits: [
      'Builds focus muscle',
      'Reduces task switching',
      'Improves concentration',
    ],
  },

  // #10: DISTRACTION LOG
  distraction_log: {
    id: 'distraction_log',
    name: 'Distraction Log',
    shortName: 'Distraction Log',
    description: 'Track and understand your distractions',
    duration: 120, // 2 minutes
    category: 'reflection',
    difficulty: 'easy',
    xpReward: 15,
    colors: {
      primary: '#E74C3C',
      secondary: '#C0392B',
      accent: '#EC7063',
      background: '#1a0a0a',
    },
    icon: '📊',
    instructions: [
      'What distracted you?',
      'What were you doing before?',
      'What emotion triggered it?',
      'Log the pattern',
    ],
    benefits: [
      'Reveals patterns',
      'Increases awareness',
      'Prevents auto-pilot',
    ],
  },

  // #11: CALM VISUAL LOOP
  calm_visual: {
    id: 'calm_visual',
    name: 'Calm Visual Loop',
    shortName: 'Calm Visual',
    description: 'Mesmerizing visuals to anchor attention',
    duration: 120, // 2 minutes
    category: 'grounding',
    difficulty: 'easy',
    xpReward: 15,
    colors: {
      primary: '#3498DB',
      secondary: '#2980B9',
      accent: '#5DADE2',
      background: '#0a0f14',
    },
    icon: '🌊',
    instructions: [
      'Watch the flowing animation',
      'Let your eyes softly follow',
      'Breathe slowly',
      'Allow thoughts to pass',
    ],
    benefits: [
      'Calms racing mind',
      'Visual meditation',
      'Reduces anxiety',
    ],
  },

  // #12: VALUE CHECK
  value_check: {
    id: 'value_check',
    name: 'Value Check In',
    shortName: 'Values',
    description: 'Align actions with your core values',
    duration: 240, // 4 minutes
    category: 'reflection',
    difficulty: 'medium',
    xpReward: 25,
    colors: {
      primary: '#27AE60',
      secondary: '#229954',
      accent: '#52BE80',
      background: '#0a140f',
    },
    icon: '🎯',
    instructions: [
      'What matters most to you?',
      'Are your actions aligned?',
      'What one thing can you change?',
    ],
    benefits: [
      'Increases meaning',
      'Reduces aimlessness',
      'Guides decisions',
    ],
  },

  // #13: MENTAL RESET
  mental_reset: {
    id: 'mental_reset',
    name: 'Mental Reset Timer',
    shortName: 'Reset',
    description: 'Clear your mind between tasks',
    duration: 90, // 1.5 minutes
    category: 'grounding',
    difficulty: 'easy',
    xpReward: 12,
    colors: {
      primary: '#9B59B6',
      secondary: '#8E44AD',
      accent: '#BB8FCE',
      background: '#0f0a14',
    },
    icon: '🔄',
    instructions: [
      'Close your eyes',
      'Take 5 deep breaths',
      'Imagine clearing a whiteboard',
      'Open eyes, fresh start',
    ],
    benefits: [
      'Task transition buffer',
      'Prevents mental clutter',
      'Improves task switching',
    ],
  },

  // #14: URGE SURFING
  urge_surfing: {
    id: 'urge_surfing',
    name: 'Urge Surfing Exercise',
    shortName: 'Urge Surf',
    description: 'Ride cravings without acting on them',
    duration: 300, // 5 minutes
    category: 'cognitive',
    difficulty: 'hard',
    xpReward: 35,
    colors: {
      primary: '#1ABC9C',
      secondary: '#16A085',
      accent: '#48C9B0',
      background: '#0a1a14',
    },
    icon: '🏄',
    instructions: [
      'Notice the urge rising',
      'Don\'t fight or indulge it',
      'Observe it like a wave',
      'Watch it peak and pass',
    ],
    benefits: [
      'Breaks addiction loops',
      'Builds self-control',
      'Reduces reactivity',
    ],
  },

  // #15: MOOD NAMING
  mood_naming: {
    id: 'mood_naming',
    name: 'Mood Naming Exercise',
    shortName: 'Name Mood',
    description: 'Label emotions to reduce their power',
    duration: 120, // 2 minutes
    category: 'reflection',
    difficulty: 'easy',
    xpReward: 15,
    colors: {
      primary: '#F39C12',
      secondary: '#D68910',
      accent: '#F5B041',
      background: '#1a1410',
    },
    icon: '🎭',
    instructions: [
      'What emotion am I feeling?',
      'Name it precisely',
      'Where do I feel it in my body?',
      'Let the label create distance',
    ],
    benefits: [
      'Reduces emotional intensity',
      'Increases self-awareness',
      'Prevents overwhelm',
    ],
  },

  // #16: POSITIVE ACTION
  positive_action: {
    id: 'positive_action',
    name: 'One Positive Action Challenge',
    shortName: 'Positive Action',
    description: 'Break rumination with one small action',
    duration: 180, // 3 minutes
    category: 'cognitive',
    difficulty: 'medium',
    xpReward: 20,
    colors: {
      primary: '#E67E22',
      secondary: '#CA6F1E',
      accent: '#EB984E',
      background: '#1a0f0a',
    },
    icon: '🎬',
    instructions: [
      'Pick one tiny action',
      'Something you can do right now',
      'Do it immediately',
      'Notice the shift in energy',
    ],
    benefits: [
      'Breaks paralysis',
      'Builds momentum',
      'Reduces overthinking',
    ],
  },

  // #17: SELF INQUIRY
  self_inquiry: {
    id: 'self_inquiry',
    name: 'Self Inquiry Prompt',
    shortName: 'Inquiry',
    description: 'Question limiting beliefs',
    duration: 240, // 4 minutes
    category: 'cognitive',
    difficulty: 'hard',
    xpReward: 28,
    colors: {
      primary: '#8E44AD',
      secondary: '#7D3C98',
      accent: '#A569BD',
      background: '#0f0a14',
    },
    icon: '❓',
    instructions: [
      'What belief is limiting me?',
      'Where did this belief come from?',
      'Is it serving me now?',
      'What would I believe instead?',
    ],
    benefits: [
      'Challenges assumptions',
      'Increases self-knowledge',
      'Creates mental freedom',
    ],
  },

  // #18: VISION MOMENT
  vision_moment: {
    id: 'vision_moment',
    name: 'Vision Moment Exercise',
    shortName: 'Vision',
    description: 'Visualize your ideal future self',
    duration: 240, // 4 minutes
    category: 'reflection',
    difficulty: 'medium',
    xpReward: 25,
    colors: {
      primary: '#16A085',
      secondary: '#138D75',
      accent: '#45B39D',
      background: '#0a1410',
    },
    icon: '🔮',
    instructions: [
      'Close your eyes',
      'Imagine yourself 1 year from now',
      'Who are you? What have you become?',
      'Feel the emotions of that future',
    ],
    benefits: [
      'Clarifies direction',
      'Increases motivation',
      'Aligns daily actions',
    ],
  },

  // #19: MINI GRATITUDE
  mini_gratitude: {
    id: 'mini_gratitude',
    name: 'Mini Gratitude Loop',
    shortName: 'Gratitude',
    description: 'Quick appreciation practice',
    duration: 120, // 2 minutes
    category: 'reflection',
    difficulty: 'easy',
    xpReward: 15,
    colors: {
      primary: '#F1C40F',
      secondary: '#D4AC0D',
      accent: '#F4D03F',
      background: '#1a1710',
    },
    icon: '🙏',
    instructions: [
      'Name 3 things you\'re grateful for',
      'Feel the appreciation in your body',
      'Even tiny things count',
    ],
    benefits: [
      'Shifts mood instantly',
      'Rewires negativity bias',
      'Improves well-being',
    ],
  },

  // #20: INTENT SETTING
  intent_setting: {
    id: 'intent_setting',
    name: 'Intent Setting Exercise',
    shortName: 'Intent',
    description: 'Set clear intention before acting',
    duration: 120, // 2 minutes
    category: 'cognitive',
    difficulty: 'easy',
    xpReward: 18,
    colors: {
      primary: '#3498DB',
      secondary: '#2E86C1',
      accent: '#5DADE2',
      background: '#0a0f14',
    },
    icon: '🎯',
    instructions: [
      'What am I about to do?',
      'Why am I doing it?',
      'Set a clear intention',
      'Proceed with awareness',
    ],
    benefits: [
      'Prevents autopilot',
      'Increases mindfulness',
      'Aligns actions with goals',
    ],
  },

  // #21: EGO DETACH
  ego_detach: {
    id: 'ego_detach',
    name: 'Ego Detach Exercise',
    shortName: 'Ego Detach',
    description: 'Observe yourself from outside',
    duration: 240, // 4 minutes
    category: 'cognitive',
    difficulty: 'hard',
    xpReward: 30,
    colors: {
      primary: '#95A5A6',
      secondary: '#7F8C8D',
      accent: '#BDC3C7',
      background: '#0f0f0f',
    },
    icon: '👤',
    instructions: [
      'Imagine watching yourself from above',
      'See your thoughts as passing clouds',
      'You are not your thoughts',
      'You are the awareness observing them',
    ],
    benefits: [
      'Reduces identification',
      'Creates mental space',
      'Decreases reactivity',
    ],
  },

  // #22: BODY RELEASE
  body_release: {
    id: 'body_release',
    name: 'Body Release Stretches',
    shortName: 'Stretch',
    description: 'Release tension through movement',
    duration: 180, // 3 minutes
    category: 'movement',
    difficulty: 'easy',
    xpReward: 20,
    colors: {
      primary: '#2ECC71',
      secondary: '#27AE60',
      accent: '#58D68D',
      background: '#0a1410',
    },
    icon: '🤸',
    instructions: [
      'Roll your shoulders back',
      'Stretch your neck gently',
      'Reach arms overhead',
      'Twist your torso side to side',
    ],
    benefits: [
      'Releases physical tension',
      'Increases energy',
      'Improves posture',
    ],
  },

  // #23: TEN SECOND REFLECTION
  ten_second_reflection: {
    id: 'ten_second_reflection',
    name: 'Ten Second Reflection',
    shortName: '10 Sec Reflect',
    description: 'Ultra-quick mindfulness check',
    duration: 10, // 10 seconds
    category: 'grounding',
    difficulty: 'easy',
    xpReward: 8,
    colors: {
      primary: '#E74C3C',
      secondary: '#CB4335',
      accent: '#EC7063',
      background: '#1a0a0a',
    },
    icon: '⚡',
    instructions: [
      'Pause',
      'Take one deep breath',
      'Notice where you are',
      'Continue',
    ],
    benefits: [
      'Instant reset',
      'Prevents autopilot',
      'Can do anytime',
    ],
  },

  // #24: COMPULSION DETECTOR
  compulsion_detector: {
    id: 'compulsion_detector',
    name: 'Compulsion Detector Exercise',
    shortName: 'Compulsion Detect',
    description: 'Identify and interrupt automatic behaviors',
    duration: 180, // 3 minutes
    category: 'cognitive',
    difficulty: 'medium',
    xpReward: 22,
    colors: {
      primary: '#C0392B',
      secondary: '#A93226',
      accent: '#E74C3C',
      background: '#1a0a0a',
    },
    icon: '🔍',
    instructions: [
      'What did I just do automatically?',
      'Was it intentional or compulsive?',
      'What triggered it?',
      'Acknowledge without judgment',
    ],
    benefits: [
      'Increases awareness',
      'Breaks auto-pilot',
      'Identifies triggers',
    ],
  },

  // #25: INNER MENTOR
  inner_mentor: {
    id: 'inner_mentor',
    name: 'Inner Mentor Exercise',
    shortName: 'Inner Mentor',
    description: 'Channel your wisest self for guidance',
    duration: 300, // 5 minutes
    category: 'reflection',
    difficulty: 'hard',
    xpReward: 35,
    colors: {
      primary: '#D4AF37',
      secondary: '#C5A028',
      accent: '#E5C158',
      background: '#1a1410',
    },
    icon: '🧙',
    instructions: [
      'Imagine your wisest future self',
      'What would they tell you right now?',
      'What advice would they give?',
      'Listen deeply to their wisdom',
    ],
    benefits: [
      'Accesses inner wisdom',
      'Provides clarity',
      'Reduces confusion',
    ],
  },
};

/**
 * Get exercise config by type
 */
export function getExerciseConfig(type: ExerciseType): ExerciseConfig {
  return EXERCISE_CONFIGS[type];
}

/**
 * Get all exercises by category
 */
export function getExercisesByCategory(category: ExerciseConfig['category']): ExerciseConfig[] {
  return Object.values(EXERCISE_CONFIGS).filter(ex => ex.category === category);
}

/**
 * Get all exercises by difficulty
 */
export function getExercisesByDifficulty(difficulty: ExerciseConfig['difficulty']): ExerciseConfig[] {
  return Object.values(EXERCISE_CONFIGS).filter(ex => ex.difficulty === difficulty);
}

/**
 * Get all exercise types as array
 */
export function getAllExerciseTypes(): ExerciseType[] {
  return Object.keys(EXERCISE_CONFIGS) as ExerciseType[];
}
