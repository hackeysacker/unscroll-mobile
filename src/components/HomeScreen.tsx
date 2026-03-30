import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { UniversalHeader } from './ui/UniversalHeader';
import { UniversalFooter, type TabType } from './ui/UniversalFooter';
import { useGame } from '@/contexts/GameContext';
import { useScrollTime } from '@/contexts/ScrollTimeContext';
import { checkAndClaimIfNeeded, getDailyLoginState, getNextReward, type DailyLoginReward } from '@/lib/daily-login-rewards';
import { verifyChallengeCompletion, getVerificationPrompt } from '@/lib/ai-verification';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOTIVATIONAL_QUOTES = [
  'The quieter you become, the more you can hear.',
  'You are here now. That is enough.',
  'Attention is your most valuable currency.',
  'Your focus determines your reality.',
  'Be present. Be mindful. Be free.',
];

// Easy Challenges - Quick activities (~2-5 minutes)
const EASY_CHALLENGES = [
  {
    id: 'movement',
    icon: '🚶',
    title: 'Movement Break',
    description: 'Take a 2-minute walk',
    duration: 2,
    difficulty: 'easy' as const,
    scrollTimeReward: 5,
    instruction: 'Stand up, stretch, and take a short walk. Move your body, clear your mind.',
    photoHint: 'Take a photo of your surroundings while walking or a new location you moved to',
  },
  {
    id: 'hydration',
    icon: '💧',
    title: 'Hydration Pause',
    description: 'Drink a full glass of water',
    duration: 2,
    difficulty: 'easy' as const,
    scrollTimeReward: 5,
    instruction: 'Slowly drink a full glass of water. Stay present with each sip.',
    photoHint: 'Take a photo of yourself drinking water or your water glass',
  },
  {
    id: 'breathing',
    icon: '🌬️',
    title: 'Breathe & Reset',
    description: '5 deep, intentional breaths',
    duration: 2,
    difficulty: 'easy' as const,
    scrollTimeReward: 5,
    instruction: 'Inhale for 4 counts. Hold for 4. Exhale for 4. Repeat 5 times.',
    photoHint: 'Take a photo showing yourself in a calm, relaxed breathing position',
  },
  {
    id: 'exercise',
    icon: '💪',
    title: 'Quick Exercise',
    description: 'Do 10 pushups, squats, or jumping jacks',
    duration: 2,
    difficulty: 'easy' as const,
    scrollTimeReward: 5,
    instruction: 'Get your blood pumping. Pick an exercise and do it with intention.',
    photoHint: 'Take a photo showing yourself mid-exercise or after completion',
  },
  {
    id: 'touch-grass',
    icon: '🌱',
    title: 'Touch Grass',
    description: 'Go outside and touch nature',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Step outside. Touch grass, a tree, a plant. Connect with nature for 3 minutes.',
    photoHint: 'Take a photo showing grass, plants, or nature you\'re touching',
  },
  {
    id: 'make-bed',
    icon: '🛏️',
    title: 'Make Your Bed',
    description: 'Tidy up your sleeping space',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Make your bed properly. Smooth sheets, fluff pillows. Create order.',
    photoHint: 'Take a photo of your neatly made bed',
  },
  {
    id: 'plant-care',
    icon: '🌿',
    title: 'Plant Care',
    description: 'Water and tend to plants',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Water plants, remove dead leaves, check soil. Care for living things.',
    photoHint: 'Take a photo of the plants you cared for',
  },
  {
    id: 'mindful-observation',
    icon: '👁️',
    title: 'Mindful Observation',
    description: 'Look out a window for 3 minutes',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Find a window. Watch the world outside. Notice colors, movement, and light. No phone.',
    photoHint: 'Take a photo of the view you observed through the window',
  },
  {
    id: 'gratitude-moment',
    icon: '🙏',
    title: 'Gratitude Moment',
    description: 'Write down 3 things you\'re grateful for',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Grab pen and paper. Write three things you appreciate right now. Feel the shift.',
    photoHint: 'Take a photo of your handwritten gratitude list on paper',
  },
  {
    id: 'reading',
    icon: '📖',
    title: 'Read & Reflect',
    description: 'Read one page of any book',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Pick up a book (yes, a physical one) and read just one page. That\'s it.',
    photoHint: 'Take a photo of the open physical book you are reading',
  },
  {
    id: 'body-stretch',
    icon: '🧘',
    title: 'Body Stretch',
    description: 'Do 5 simple stretches',
    duration: 4,
    difficulty: 'easy' as const,
    scrollTimeReward: 10,
    instruction: 'Stretch your neck, shoulders, arms, back, and legs. Feel your body wake up.',
    photoHint: 'Take a selfie showing yourself in a stretching position',
  },
  {
    id: 'music-mindful',
    icon: '🎵',
    title: 'Mindful Music',
    description: 'Listen to one full song without distraction',
    duration: 4,
    difficulty: 'easy' as const,
    scrollTimeReward: 10,
    instruction: 'Pick a song. Close your eyes. Really listen. Feel every note.',
    photoHint: 'Take a photo of your music setup, vinyl, speaker, or headphones',
  },
  {
    id: 'creative-doodle',
    icon: '✏️',
    title: 'Creative Doodle',
    description: 'Draw something for 5 minutes',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Pick up a pen. Doodle, draw, sketch anything. No rules, no judgment. Just create.',
    photoHint: 'Take a photo of your drawing or doodle on paper',
  },
  {
    id: 'tidy-space',
    icon: '🧹',
    title: 'Tidy Up',
    description: 'Clean and organize a small area',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Pick one surface or corner. Clear it, clean it, organize it. Small wins matter.',
    photoHint: 'Take a before and after photo of the space you cleaned',
  },
  {
    id: 'meal-prep',
    icon: '🍳',
    title: 'Quick Snack',
    description: 'Prepare a simple snack',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Make something simple. Focus on the process, the smells, the textures.',
    photoHint: 'Take a photo of what you prepared',
  },
  {
    id: 'pet-time',
    icon: '🐕',
    title: 'Pet Connection',
    description: 'Play with or pet an animal',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Spend quality time with a pet. No distractions, just connection.',
    photoHint: 'Take a photo with your pet or the animal you\'re spending time with',
  },
  {
    id: 'meditation',
    icon: '🧘‍♀️',
    title: 'Mini Meditation',
    description: 'Sit in silence for 5 minutes',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Find a quiet spot. Sit comfortably. Close your eyes. Just be.',
    photoHint: 'Take a photo of your meditation space or yourself in meditation pose',
  },
  {
    id: 'journal-quick',
    icon: '📝',
    title: 'Quick Journaling',
    description: 'Write about your current mood',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Open a journal. Write freely for 5 minutes. No editing, just flow.',
    photoHint: 'Take a photo of your journal entry (can blur text for privacy)',
  },
  {
    id: 'organize-drawer',
    icon: '🗂️',
    title: 'Organize Something',
    description: 'Sort a drawer, shelf, or bag',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Pick one container. Empty it, sort it, put it back neatly.',
    photoHint: 'Take a photo of the organized drawer, shelf, or space',
  },
  {
    id: 'self-care',
    icon: '💆',
    title: 'Self-Care Moment',
    description: 'Do something nice for yourself',
    duration: 5,
    difficulty: 'easy' as const,
    scrollTimeReward: 12,
    instruction: 'Skincare, face mask, hand massage, hair care. Treat yourself with care.',
    photoHint: 'Take a photo of your self-care activity or products',
  },
  {
    id: 'face-refresh',
    icon: '💧',
    title: 'Face Refresh',
    description: 'Wash your face with cold water',
    duration: 2,
    difficulty: 'easy' as const,
    scrollTimeReward: 5,
    instruction: 'Go to the sink. Splash cold water on your face. Feel the instant refresh.',
    photoHint: 'Take a photo of yourself with water drops or wet face',
  },
  {
    id: 'window-wipe',
    icon: '🪟',
    title: 'Window Cleaning',
    description: 'Clean one window or mirror',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Grab a cloth. Clean one window or mirror until it sparkles.',
    photoHint: 'Take a photo of the clean, streak-free window or mirror',
  },
  {
    id: 'shoe-organize',
    icon: '👟',
    title: 'Shoe Organization',
    description: 'Line up and organize your shoes',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Gather all your shoes. Line them up neatly. Create order from chaos.',
    photoHint: 'Take a photo of your organized shoe collection',
  },
  {
    id: 'desk-tidy',
    icon: '🖥️',
    title: 'Desk Declutter',
    description: 'Clear and organize your desk',
    duration: 4,
    difficulty: 'easy' as const,
    scrollTimeReward: 10,
    instruction: 'Clear everything from your desk. Wipe it down. Put back only what you need.',
    photoHint: 'Take a photo of your clean, organized desk',
  },
  {
    id: 'dance-break',
    icon: '💃',
    title: 'Dance Break',
    description: 'Dance to one song',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Put on your favorite song. Dance like nobody\'s watching. Let loose.',
    photoHint: 'Take a photo of yourself mid-dance or your music playing',
  },
  {
    id: 'aromatherapy',
    icon: '🕯️',
    title: 'Aromatherapy Moment',
    description: 'Light a candle or use essential oils',
    duration: 4,
    difficulty: 'easy' as const,
    scrollTimeReward: 10,
    instruction: 'Light a candle or diffuse essential oils. Breathe deeply. Be present.',
    photoHint: 'Take a photo of your candle or aromatherapy setup',
  },
  {
    id: 'hand-care',
    icon: '🤲',
    title: 'Hand Massage',
    description: 'Give yourself a hand massage',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Use lotion or oil. Massage each finger, palm, and wrist. Be gentle with yourself.',
    photoHint: 'Take a photo of your hands with lotion or during the massage',
  },
  {
    id: 'balance-pose',
    icon: '🦩',
    title: 'Balance Practice',
    description: 'Hold a balance pose for 2 minutes',
    duration: 2,
    difficulty: 'easy' as const,
    scrollTimeReward: 5,
    instruction: 'Stand on one leg. Hold tree pose or flamingo stand. Focus on your center.',
    photoHint: 'Take a photo of yourself in a balance pose',
  },
  {
    id: 'bathroom-quick',
    icon: '🚿',
    title: 'Bathroom Tidy',
    description: 'Quick bathroom counter cleanup',
    duration: 4,
    difficulty: 'easy' as const,
    scrollTimeReward: 10,
    instruction: 'Clear the counter. Put away products. Wipe down surfaces. Quick reset.',
    photoHint: 'Take a photo of your clean bathroom counter',
  },
  {
    id: 'affirmations',
    icon: '✨',
    title: 'Daily Affirmations',
    description: 'Say 5 positive affirmations',
    duration: 3,
    difficulty: 'easy' as const,
    scrollTimeReward: 8,
    instruction: 'Look in the mirror. Say 5 positive affirmations out loud. Mean them.',
    photoHint: 'Take a selfie or photo of written affirmations',
  },
];

// Hard Challenges - More involved activities (~10-20 minutes)
const HARD_CHALLENGES = [
  {
    id: 'deep-reading',
    icon: '📚',
    title: 'Deep Reading',
    description: 'Read for 10 minutes straight',
    duration: 10,
    difficulty: 'hard' as const,
    scrollTimeReward: 20,
    instruction: 'Pick up a book. Read for a full 10 minutes. No phone. No distractions. Just you and the pages.',
    photoHint: 'Take a photo of the open book with a bookmark showing your progress',
  },
  {
    id: 'full-meal-cooking',
    icon: '👨‍🍳',
    title: 'Cook a Full Meal',
    description: 'Prepare and cook an actual meal',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Plan, prep, and cook a complete meal from scratch. Be present with every step.',
    photoHint: 'Take a photo of your finished meal plated nicely',
  },
  {
    id: 'analog-game',
    icon: '🎲',
    title: 'Analog Game Session',
    description: 'Play a board game or complete a puzzle section',
    duration: 10,
    difficulty: 'hard' as const,
    scrollTimeReward: 20,
    instruction: 'Cards, puzzle, board game. Play something physical and engaging for 10 minutes.',
    photoHint: 'Take a photo of the game or puzzle you\'re playing',
  },
  {
    id: 'handwritten-letter',
    icon: '✉️',
    title: 'Write a Heartfelt Letter',
    description: 'Write a full letter to someone',
    duration: 10,
    difficulty: 'hard' as const,
    scrollTimeReward: 20,
    instruction: 'Pen and paper. Write a meaningful letter to someone you care about. Take your time.',
    photoHint: 'Take a photo of the handwritten letter (can blur personal details)',
  },
  {
    id: 'tea-ceremony',
    icon: '☕',
    title: 'Mindful Tea Ceremony',
    description: 'Prepare and savor tea or coffee slowly',
    duration: 10,
    difficulty: 'hard' as const,
    scrollTimeReward: 20,
    instruction: 'Slow down completely. Boil water, steep tea or brew coffee. Sit and savor every sip.',
    photoHint: 'Take a photo of your tea or coffee setup',
  },
  {
    id: 'deep-meditation',
    icon: '🧘',
    title: 'Extended Meditation',
    description: 'Meditate for 15 minutes',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Find a quiet space. Sit comfortably. Close your eyes. Meditate for a full 15 minutes.',
    photoHint: 'Take a photo of your meditation space',
  },
  {
    id: 'journal-deep',
    icon: '📓',
    title: 'Deep Journaling',
    description: 'Write 2-3 full pages in your journal',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Open your journal. Write deeply about your thoughts, feelings, dreams, or reflections.',
    photoHint: 'Take a photo of your journal pages (can blur text)',
  },
  {
    id: 'workout-session',
    icon: '🏋️',
    title: 'Full Workout',
    description: 'Complete a 15-minute exercise routine',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Do a complete workout: warmup, exercises, cooldown. Push yourself. No phone.',
    photoHint: 'Take a photo showing yourself sweaty and accomplished after the workout',
  },
  {
    id: 'room-deep-clean',
    icon: '🧼',
    title: 'Deep Clean a Room',
    description: 'Thoroughly clean and organize an entire room',
    duration: 20,
    difficulty: 'hard' as const,
    scrollTimeReward: 40,
    instruction: 'Pick a room. Clean it top to bottom. Vacuum, dust, organize. Transform the space.',
    photoHint: 'Take before and after photos of the room',
  },
  {
    id: 'nature-walk',
    icon: '🌲',
    title: 'Mindful Nature Walk',
    description: 'Take a 15-minute walk in nature',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Walk outside for 15 minutes. No phone, no music. Just you and nature.',
    photoHint: 'Take a photo of the natural scene you explored',
  },
  {
    id: 'creative-project',
    icon: '🎨',
    title: 'Creative Project',
    description: 'Work on an art or craft project',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Draw, paint, craft, build something. Lose yourself in creative flow for 15 minutes.',
    photoHint: 'Take a photo of your creative work in progress',
  },
  {
    id: 'practice-instrument',
    icon: '🎸',
    title: 'Musical Practice',
    description: 'Practice an instrument for 15 minutes',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Pick up an instrument. Practice deliberately for 15 minutes. Feel the music.',
    photoHint: 'Take a photo of yourself with your instrument',
  },
  {
    id: 'podcast-reflection',
    icon: '🎧',
    title: 'Podcast + Reflection',
    description: 'Listen to educational content and reflect',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Listen to a podcast or audiobook chapter. Then write down 3 key takeaways.',
    photoHint: 'Take a photo of your notes with the 3 takeaways',
  },
  {
    id: 'skill-practice',
    icon: '📖',
    title: 'Learn Something New',
    description: 'Practice a skill for 15 minutes',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Work on learning a language, coding, or any skill. 15 minutes of focused practice.',
    photoHint: 'Take a photo showing your learning materials or practice',
  },
  {
    id: 'phone-free-socializing',
    icon: '💬',
    title: 'Phone-Free Conversation',
    description: 'Talk to someone face-to-face for 10 minutes',
    duration: 10,
    difficulty: 'hard' as const,
    scrollTimeReward: 20,
    instruction: 'Have a real conversation with someone. No phones allowed. Just connection.',
    photoHint: 'Take a photo after the conversation (with their permission)',
  },
  {
    id: 'planning-session',
    icon: '📋',
    title: 'Life Planning Session',
    description: 'Plan your week or goals on paper',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Use pen and paper. Plan your week, set goals, organize your life. Think deeply.',
    photoHint: 'Take a photo of your planning pages',
  },
  {
    id: 'yoga-flow',
    icon: '🧘‍♂️',
    title: 'Full Yoga Flow',
    description: 'Complete a 15-minute yoga sequence',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Flow through a complete yoga sequence. Breathe, stretch, find balance.',
    photoHint: 'Take a photo of yourself in a yoga pose',
  },
  {
    id: 'batch-cooking',
    icon: '🥘',
    title: 'Meal Prep Session',
    description: 'Prepare multiple meals for the week',
    duration: 20,
    difficulty: 'hard' as const,
    scrollTimeReward: 40,
    instruction: 'Prep and cook multiple meals at once. Be mindful and organized.',
    photoHint: 'Take a photo of your prepped meals',
  },
  {
    id: 'photo-walk',
    icon: '📷',
    title: 'Photography Walk',
    description: 'Take a walk focused on photography',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Walk outside with just a camera. Capture beauty. Be an artist, not a scroller.',
    photoHint: 'Take a photo of your best shot from the walk',
  },
  {
    id: 'wardrobe-organize',
    icon: '👔',
    title: 'Organize Your Wardrobe',
    description: 'Sort through and organize your clothes',
    duration: 20,
    difficulty: 'hard' as const,
    scrollTimeReward: 40,
    instruction: 'Go through your closet. Organize, fold, donate what you don\'t need. Create order.',
    photoHint: 'Take a photo of your organized closet or wardrobe',
  },
  {
    id: 'bathroom-deep',
    icon: '🧼',
    title: 'Deep Clean Bathroom',
    description: 'Thoroughly clean entire bathroom',
    duration: 20,
    difficulty: 'hard' as const,
    scrollTimeReward: 40,
    instruction: 'Scrub toilet, sink, tub, mirrors. Wipe everything. Make it shine.',
    photoHint: 'Take a photo of your sparkling clean bathroom',
  },
  {
    id: 'kitchen-deep',
    icon: '🍽️',
    title: 'Deep Clean Kitchen',
    description: 'Clean and organize kitchen thoroughly',
    duration: 20,
    difficulty: 'hard' as const,
    scrollTimeReward: 40,
    instruction: 'Wipe counters, clean appliances, organize cabinets. Reset your cooking space.',
    photoHint: 'Take a photo of your clean kitchen',
  },
  {
    id: 'digital-detox-plan',
    icon: '📵',
    title: 'Digital Detox Planning',
    description: 'Create a digital wellness plan',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Write down screen time goals, app limits, phone-free times. Design your ideal digital life.',
    photoHint: 'Take a photo of your written digital detox plan',
  },
  {
    id: 'vision-board',
    icon: '🎯',
    title: 'Vision Board Creation',
    description: 'Create a visual goal board',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Cut out images, write goals, create a visual representation of your dreams.',
    photoHint: 'Take a photo of your completed vision board',
  },
  {
    id: 'drawer-system',
    icon: '🗄️',
    title: 'Drawer Organization System',
    description: 'Create a complete drawer organization',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Empty drawers. Sort items. Use dividers. Create a sustainable organization system.',
    photoHint: 'Take a photo of your organized drawer system',
  },
  {
    id: 'skill-tutorial',
    icon: '🎓',
    title: 'Skill Tutorial + Practice',
    description: 'Watch tutorial and practice new skill',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Find a tutorial for something you want to learn. Watch it, then practice immediately.',
    photoHint: 'Take a photo of yourself practicing or your practice results',
  },
  {
    id: 'stretch-routine',
    icon: '🤸',
    title: 'Full Body Stretch',
    description: 'Complete stretching routine',
    duration: 15,
    difficulty: 'hard' as const,
    scrollTimeReward: 30,
    instruction: 'Stretch every major muscle group. Hold each stretch 30 seconds. Be thorough.',
    photoHint: 'Take a photo of yourself stretching',
  },
  {
    id: 'gratitude-letter',
    icon: '💌',
    title: 'Gratitude Letter Writing',
    description: 'Write a heartfelt thank you letter',
    duration: 10,
    difficulty: 'hard' as const,
    scrollTimeReward: 20,
    instruction: 'Think of someone who impacted your life. Write them a detailed letter of gratitude.',
    photoHint: 'Take a photo of your letter (can blur personal details)',
  },
  {
    id: 'new-recipe',
    icon: '👨‍🍳',
    title: 'Try New Recipe',
    description: 'Cook something you\'ve never made',
    duration: 20,
    difficulty: 'hard' as const,
    scrollTimeReward: 40,
    instruction: 'Find a new recipe. Follow it carefully. Challenge yourself in the kitchen.',
    photoHint: 'Take a photo of the finished dish',
  },
  {
    id: 'storage-organize',
    icon: '📦',
    title: 'Storage Space Organization',
    description: 'Organize garage, closet, or storage',
    duration: 20,
    difficulty: 'hard' as const,
    scrollTimeReward: 40,
    instruction: 'Tackle a storage space. Sort, label, create order from chaos.',
    photoHint: 'Take a photo of your organized storage space',
  },
];

interface HomeScreenProps {
  onNavigate?: (route: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { progress, heartState } = useGame();
  const { earnScrollTime, scrollTime } = useScrollTime();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentQuote, setCurrentQuote] = useState(
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );
  const [selectedDuration, setSelectedDuration] = useState<2 | 5 | 10>(5);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'hard' | null>(null);
  type Challenge = typeof EASY_CHALLENGES[number] | typeof HARD_CHALLENGES[number];

// Use a type-safe initial state
const initialChallenge: Challenge = EASY_CHALLENGES[0];
const [currentChallenge, setCurrentChallenge] = useState<Challenge>(initialChallenge);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const haloAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Daily Login Reward State
  const [dailyReward, setDailyReward] = useState<DailyLoginReward | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [nextReward, setNextReward] = useState<{ day: number; gems: number; xp: number; description: string } | null>(null);

  // Check and claim daily login reward on mount
  useEffect(() => {
    async function checkDailyReward() {
      const reward = await checkAndClaimIfNeeded();
      if (reward) {
        setDailyReward(reward);
        setShowRewardModal(true);
      }
      const next = await getNextReward();
      setNextReward(next);
    }
    checkDailyReward();
  }, []);

  // Quote rotation - changes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(
        MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Gentle pulse animation for button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );

    // Progress halo ring animation
    const halo = Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(haloAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();
    halo.start();

    return () => {
      pulse.stop();
      glow.stop();
      halo.stop();
    };
  }, []);

  // Timer effect - counts down when challenge is active
  useEffect(() => {
    if (challengeActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Challenge timer complete - now request proof photo
            setChallengeActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0 && challengeActive) {
      setChallengeActive(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [challengeActive, timeRemaining]);

  const handleStopScrolling = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Button click down animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show difficulty selection modal
    setShowDifficultyModal(true);

    // Fade in modal
    Animated.timing(modalFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectDifficulty = (difficulty: 'easy' | 'hard') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDifficulty(difficulty);

    // Pick random challenge from selected difficulty
    const challenges = difficulty === 'easy' ? EASY_CHALLENGES : HARD_CHALLENGES;
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
  };

  const handleSkipChallenge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get challenges from current difficulty
    const challenges = currentChallenge.difficulty === 'easy' ? EASY_CHALLENGES : HARD_CHALLENGES;

    // Filter out current challenge and pick a different one
    const availableChallenges = challenges.filter(c => c.id !== currentChallenge.id);
    const newChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];

    setCurrentChallenge(newChallenge);

    // Reset any active state
    setChallengeActive(false);
    setTimeRemaining(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartChallenge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Start the timer
    setChallengeActive(true);
    setTimeRemaining(currentChallenge.duration * 60); // Convert minutes to seconds
  };

  const handleRequestProof = async () => {
    // Clean up timer
    setChallengeActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Request camera permission if needed
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access to verify challenge completion.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    // Show camera
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      setShowCamera(false);
      setIsVerifying(true);

      // Verify with AI
      const result = await verifyChallengeCompletion({
        challengeId: currentChallenge.id,
        photoBase64: photo.base64,
        verificationPrompt: getVerificationPrompt(currentChallenge.id),
      });

      setVerificationResult(result);
      setIsVerifying(false);

      if (result.success) {
        // Success! Show celebration
        handleChallengeSuccess(result);
      } else {
        // Failed verification
        handleVerificationFailed(result);
      }
    } catch (error) {
      console.error('Photo error:', error);
      setIsVerifying(false);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChallengeSuccess = async (result: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Award scroll time based on challenge difficulty
    await earnScrollTime(currentChallenge.scrollTimeReward);

    setChallengeComplete(true);

    // Confetti animation
    Animated.sequence([
      Animated.spring(confettiAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset everything
      setShowDifficultyModal(false);
      setChallengeComplete(false);
      setTimeRemaining(0);
      setVerificationResult(null);
      setSelectedDifficulty(null);
      modalFadeAnim.setValue(0);
      confettiAnim.setValue(0);
    });
  };

  const handleVerificationFailed = (result: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      'Challenge Not Verified',
      `${result.reasoning}\n\nTry again or choose a different challenge.`,
      [
        { text: 'Retake Photo', onPress: () => setShowCamera(true) },
        { text: 'Cancel', style: 'cancel', onPress: handleCloseDifficultyModal },
      ]
    );
  };

  const handleCloseDifficultyModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Clean up timer if running
    setChallengeActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Fade out modal
    Animated.timing(modalFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowDifficultyModal(false);
      setChallengeComplete(false);
      setTimeRemaining(0);
      setSelectedDifficulty(null);
    });
  };

  return (
    <View style={styles.container}>
      {/* Universal Header */}
      <View style={styles.headerWrapper}>
        <UniversalHeader
          hearts={heartState?.currentHearts || 5}
          streak={progress?.streak || 0}
          gems={progress?.xp || 0}
          onProfilePress={() => onNavigate?.('profile-screen')}
        />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Quote at top */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{currentQuote}</Text>
        </View>

        {/* Stop Scrolling Button */}
        <View style={styles.buttonContainer}>
          {/* Animated glow effect */}
          <Animated.View
            style={[
              styles.buttonGlow,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Progress Halo Ring */}
          <Animated.View
            style={[
              styles.haloRing,
              {
                opacity: haloAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 0.8],
                }),
                transform: [
                  {
                    rotate: haloAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Button with gentle pulse and click animation */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }, { scale: buttonScaleAnim }],
            }}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStopScrolling}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Stop{'\n'}Scrolling</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Time Selector */}
        <View style={styles.timeSelectorContainer}>
          <Text style={styles.timeSelectorLabel}>How long do you want to reset?</Text>
          <View style={styles.timePillsContainer}>
            {[2, 5, 10].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.timePill,
                  selectedDuration === duration && styles.timePillSelected,
                ]}
                onPress={() => {
                  setSelectedDuration(duration as 2 | 5 | 10);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.timePillText,
                    selectedDuration === duration && styles.timePillTextSelected,
                  ]}
                >
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reward Feedback */}
        <View style={styles.rewardFeedbackContainer}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardText}>⭐ Earn +20 Focus Points</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardText}>🔥 Keep your streak alive</Text>
          </View>
        </View>

        {/* Bottom Supportive Elements */}
        <View style={styles.bottomLinksContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.bottomLinkText}>Recent challenges</Text>
          </TouchableOpacity>
          <Text style={styles.bottomLinkSeparator}>•</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.bottomLinkText}>Customize challenges</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Difficulty Selection Modal */}
      {showDifficultyModal && (
        <Animated.View
          style={[
            styles.difficultyModal,
            {
              opacity: modalFadeAnim,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseDifficultyModal}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.difficultyContent}>
            {!selectedDifficulty ? (
              <>
                {/* Difficulty Selection */}
                <Text style={styles.difficultyTitle}>Choose Your Challenge</Text>
                <Text style={styles.difficultySubtitle}>
                  Pick a difficulty level that fits your time and energy
                </Text>

                {/* Easy Button */}
                <TouchableOpacity
                  style={styles.difficultyButton}
                  onPress={() => handleSelectDifficulty('easy')}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#10B981', '#34D399']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.difficultyButtonGradient}
                  >
                    <View style={styles.difficultyButtonContent}>
                      <Text style={styles.difficultyButtonEmoji}>⚡</Text>
                      <View style={styles.difficultyButtonTextContainer}>
                        <Text style={styles.difficultyButtonTitle}>Easy Challenges</Text>
                        <Text style={styles.difficultyButtonDescription}>
                          30 quick activities • 2-5 minutes
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Hard Button */}
                <TouchableOpacity
                  style={styles.difficultyButton}
                  onPress={() => handleSelectDifficulty('hard')}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#EF4444', '#F97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.difficultyButtonGradient}
                  >
                    <View style={styles.difficultyButtonContent}>
                      <Text style={styles.difficultyButtonEmoji}>🔥</Text>
                      <View style={styles.difficultyButtonTextContainer}>
                        <Text style={styles.difficultyButtonTitle}>Hard Challenges</Text>
                        <Text style={styles.difficultyButtonDescription}>
                          30 involved activities • 10-20 minutes
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : !challengeComplete ? (
              <>
                {/* Challenge Display */}
                <Text style={styles.challengeModalIcon}>{currentChallenge.icon}</Text>
                <Text style={styles.challengeModalTitle}>{currentChallenge.title}</Text>
                <Text style={styles.challengeModalDescription}>
                  {currentChallenge.instruction}
                </Text>

                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>
                    {currentChallenge.duration} minute{currentChallenge.duration > 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Timer Display */}
                {challengeActive && timeRemaining > 0 && (
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.timerLabel}>TIME REMAINING</Text>
                  </View>
                )}

                {/* Timer Done - Show Proof Button */}
                {!challengeActive && timeRemaining === 0 && !isVerifying && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleRequestProof}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.startButtonGradient}
                    >
                      <Text style={styles.startButtonText}>📸 Take Proof Photo</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Start Button */}
                {!challengeActive && timeRemaining !== 0 && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartChallenge}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.startButtonGradient}
                    >
                      <Text style={styles.startButtonText}>Start Challenge</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Photo Hint */}
                {challengeActive && (
                  <View style={styles.photoHintContainer}>
                    <Text style={styles.photoHintText}>
                      💡 {currentChallenge.photoHint}
                    </Text>
                  </View>
                )}

                {/* Skip Challenge Button - Only show before starting */}
                {!challengeActive && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkipChallenge}
                  >
                    <Text style={styles.skipButtonText}>🔄 Skip Challenge</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Animated.View
                style={[
                  styles.celebrationContainer,
                  {
                    opacity: confettiAnim,
                    transform: [
                      {
                        scale: confettiAnim,
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={styles.celebrationTitle}>You did it!</Text>
                <Text style={styles.celebrationSubtitle}>
                  {currentChallenge.duration} minutes of focus completed
                </Text>
                <View style={styles.celebrationRewardContainer}>
                  <Text style={styles.celebrationRewardEmoji}>📱</Text>
                  <Text style={styles.celebrationReward}>
                    +{currentChallenge.scrollTimeReward} minutes of scroll time earned!
                  </Text>
                </View>
                <Text style={styles.celebrationMessage}>Your mind just got stronger</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Camera View Modal */}
      {showCamera && (
        <View style={styles.cameraModal}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <Text style={styles.cameraTitle}>Take Proof Photo</Text>
                <Text style={styles.cameraHint}>{currentChallenge.photoHint}</Text>
              </View>

              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cameraCancelButton}
                  onPress={() => setShowCamera(false)}
                >
                  <Text style={styles.cameraCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleTakePhoto}
                >
                  <View style={styles.cameraButtonInner} />
                </TouchableOpacity>

                <View style={{ width: 80 }} />
              </View>
            </View>
          </CameraView>
        </View>
      )}

      {/* AI Verification Loading */}
      {isVerifying && (
        <View style={styles.verificationModal}>
          <View style={styles.verificationContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.verificationText}>AI is verifying your photo...</Text>
            <Text style={styles.verificationSubtext}>This may take a moment</Text>
          </View>
        </View>
      )}

      {/* Daily Login Reward Modal */}
      {showRewardModal && dailyReward && (
        <View style={styles.rewardModalOverlay}>
          <Animated.View
            style={[
              styles.rewardModalContainer,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })}],
              },
            ]}
          >
            <LinearGradient
              colors={dailyReward.isBonus ? ['#FFD700', '#FFA500'] : ['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rewardModalHeader}
            >
              <Text style={styles.rewardModalTitle}>Daily Reward!</Text>
              <Text style={styles.rewardModalSubtitle}>{dailyReward.description}</Text>
            </LinearGradient>
            <View style={styles.rewardModalBody}>
              <Text style={styles.rewardDayLabel}>Day {dailyReward.day} Streak</Text>
              <View style={styles.rewardValuesContainer}>
                <View style={styles.rewardValueItem}>
                  <Text style={styles.rewardValueEmoji}>💎</Text>
                  <Text style={styles.rewardValueNumber}>+{dailyReward.gems}</Text>
                  <Text style={styles.rewardValueLabel}>Gems</Text>
                </View>
                <View style={styles.rewardValueDivider} />
                <View style={styles.rewardValueItem}>
                  <Text style={styles.rewardValueEmoji}>⭐</Text>
                  <Text style={styles.rewardValueNumber}>+{dailyReward.xp}</Text>
                  <Text style={styles.rewardValueLabel}>XP</Text>
                </View>
              </View>
              {nextReward && (
                <View style={styles.nextRewardContainer}>
                  <Text style={styles.nextRewardLabel}>Next: Day {nextReward.day}</Text>
                  <Text style={styles.nextRewardValue}>
                    💎 {nextReward.gems} + ⭐ {nextReward.xp}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.rewardClaimButton}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowRewardModal(false);
                }}
              >
                <Text style={styles.rewardClaimButtonText}>Claim!</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Universal Footer */}
      <UniversalFooter
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          if (tab === 'home') {
            // Already here
          } else if (tab === 'path') {
            onNavigate?.('progress-tree');
          } else if (tab === 'practice') {
            onNavigate?.('practice');
          } else if (tab === 'shield') {
            onNavigate?.('focus-shield');
          } else if (tab === 'premium') {
            onNavigate?.('premium');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  headerWrapper: {
    marginTop: -5,
  },
  mainContent: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 100,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  quoteContainer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#10B981',
    opacity: 0.4,
  },
  haloRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'solid',
  },
  primaryButton: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 38,
  },
  subtextContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 16,
    marginBottom: 24,
  },
  subtextText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  timeSelectorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  timePillsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timePillSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  timePillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timePillTextSelected: {
    color: '#10B981',
  },
  rewardFeedbackContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 6,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  bottomLinkText: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  bottomLinkSeparator: {
    fontSize: 12,
    color: '#6B7280',
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 999,
  },
  difficultyModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0F1C',
    zIndex: 1000,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  difficultyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  difficultySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 40,
  },
  difficultyButton: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  difficultyButtonGradient: {
    paddingVertical: 28,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  difficultyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyButtonEmoji: {
    fontSize: 48,
    marginRight: 20,
  },
  difficultyButtonTextContainer: {
    flex: 1,
  },
  difficultyButtonTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  difficultyButtonDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  challengeModalIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  challengeModalTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  challengeModalDescription: {
    fontSize: 17,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  durationBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  durationBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#A5B4FC',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startButton: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  startButtonGradient: {
    paddingVertical: 22,
    paddingHorizontal: 48,
    borderRadius: 24,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A5B4FC',
    textAlign: 'center',
  },
  photoHintContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  photoHintText: {
    fontSize: 14,
    color: '#A5B4FC',
    textAlign: 'center',
    lineHeight: 20,
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  celebrationTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  celebrationSubtitle: {
    fontSize: 18,
    color: '#F9FAFB',
    marginBottom: 12,
  },
  celebrationMessage: {
    fontSize: 15,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  celebrationRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  celebrationRewardEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  celebrationReward: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  cameraModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cameraHint: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  cameraCancelButton: {
    width: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  cameraCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  verificationModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 15, 28, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
  },
  verificationContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  verificationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 24,
    textAlign: 'center',
  },
  verificationSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  // Daily Login Reward Modal
  rewardModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 15, 28, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2500,
  },
  rewardModalContainer: {
    width: SCREEN_WIDTH - 48,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  rewardModalHeader: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  rewardModalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rewardModalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  rewardModalBody: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  rewardDayLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardValuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardValueItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  rewardValueEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  rewardValueNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  rewardValueLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rewardValueDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#334155',
  },
  nextRewardContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 12,
  },
  nextRewardLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  nextRewardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818CF8',
  },
  rewardClaimButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 4,
  },
  rewardClaimButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
