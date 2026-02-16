/**
 * Icon Component Index
 *
 * Central export for all icon components
 * Provides IconRenderer for easy icon usage throughout the app
 */

export * from './ChallengeIcons';
export * from './SettingsIcons';

import React from 'react';
import type { ActivityType } from '@/lib/journey-levels';
import type { ExerciseType } from '@/lib/exercise-types';
import {
  // Realm 1: Awakening
  EyeIcon,
  TargetIcon,
  LungsIcon,

  // Realm 2: Breath
  WindIcon,
  SquareIcon,
  MeditationIcon,
  MusicNoteIcon,

  // Realm 3: Stillness
  FingerIcon,
  SparkleIcon,
  TurtleIcon,

  // Realm 4: Clarity
  CheckmarkIcon,
  LightningIcon,
  EyesIcon,
  RainbowIcon,

  // Realm 5: Flow
  PencilIcon,
  MagnifyingGlassIcon,
  WaveIcon,

  // Realm 6: Discipline
  HandStopIcon,
  StopwatchIcon,
  PauseIcon,

  // Realm 7: Resilience
  BellOffIcon,
  BlockIcon,
  ClipboardIcon,
  DiamondIcon,

  // Realm 8: Insight
  BrainIcon,
  HashIcon,
  LightbulbIcon,
  CrystalBallIcon,
  CircusTentIcon,

  // Realm 9: Ascension
  BoltIcon,
  ExplosionIcon,
  RocketIcon,
  ThoughtIcon,

  // Realm 10: Absolute
  CrownIcon,
  StarIcon,
  RefreshIcon,
  SheetMusicIcon,
  StatueIcon,

  // UI Icons
  TrophyIcon,
  ClockIcon,
  MuscleIcon,
  FireIcon,
  ShieldIcon,
  BookIcon,
  PartyIcon,
  ConfettiIcon,
} from './ChallengeIcons';

import {
  // Settings Icons
  PersonIcon,
  FlameIcon,
  SettingsIcon,
  VibrateIcon,
  VolumeIcon,
  NotificationsIcon,
  FlashIcon,
  EyeOffIcon,
  CalendarIcon,
  BulbIcon,
  ColorPaletteIcon,
  ShieldCheckIcon,
  LockIcon,
  DocumentIcon,
  DownloadIcon,
  MailIcon,
  BookOpenIcon,
  ChatBubblesIcon,
  FlaskIcon,
  CodeIcon,
  PersonCircleIcon,
  RefreshCircleIcon,
  TrashIcon,
  LogOutIcon,
  ChevronForwardIcon,
  StarOutlineIcon,
} from './SettingsIcons';

// Map activity types to their icon components
const activityIconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  // Realm 1: Awakening
  'gaze_hold': EyeIcon,
  'focus_hold': TargetIcon,
  'slow_breathing': LungsIcon,

  // Realm 2: Breath
  'breath_pacing': WindIcon,
  'box_breathing': SquareIcon,
  'controlled_breathing': MeditationIcon,
  'rhythm_tap': MusicNoteIcon,

  // Realm 3: Stillness
  'stillness_test': MeditationIcon,
  'finger_hold': FingerIcon,
  'body_scan': SparkleIcon,
  'slow_tracking': TurtleIcon,

  // Realm 4: Clarity
  'tap_only_correct': CheckmarkIcon,
  'memory_flash': LightningIcon,
  'multi_object_tracking': EyesIcon,
  'five_senses': RainbowIcon,

  // Realm 5: Flow
  'finger_tracing': PencilIcon,
  'moving_target': TargetIcon,
  'calm_visual': WaveIcon,
  'precision_track': MagnifyingGlassIcon,

  // Realm 6: Discipline
  'reaction_inhibition': HandStopIcon,
  'delay_unlock': StopwatchIcon,
  'urge_surfing': WaveIcon,
  'impulse_delay': PauseIcon,

  // Realm 7: Resilience
  'fake_notifications': BellOffIcon,
  'popup_ignore': BlockIcon,
  'distraction_log': ClipboardIcon,
  'deep_focus': DiamondIcon,

  // Realm 8: Insight
  'memory_master': BrainIcon,
  'tap_pattern': HashIcon,
  'thought_reframe': LightbulbIcon,
  'self_inquiry': CrystalBallIcon,
  'advanced_track': CircusTentIcon,

  // Realm 9: Ascension
  'multi_task_tap': BoltIcon,
  'impulse_spike_test': ExplosionIcon,
  'focus_sprint': RocketIcon,
  'fast_stop': HandStopIcon,
  'speed_memory': ThoughtIcon,

  // Realm 10: Absolute
  'multi_mastery': CrownIcon,
  'impulse_master': StarIcon,
  'mental_reset': RefreshIcon,
  'intent_setting': TargetIcon,
  'pattern_master': SheetMusicIcon,
  'ultimate_still': StatueIcon,
};

// UI Icon names
export type UIIconName =
  | 'trophy'
  | 'crown'
  | 'diamond'
  | 'clock'
  | 'muscle'
  | 'fire'
  | 'shield'
  | 'book'
  | 'target'
  | 'party'
  | 'confetti'
  | 'star'
  | 'lightning'
  | 'checkmark'
  | 'flame'
  | 'person'
  | 'settings'
  | 'vibrate'
  | 'volume-high'
  | 'notifications'
  | 'flash'
  | 'eye-off'
  | 'calendar'
  | 'bulb'
  | 'color-palette'
  | 'shield-checkmark'
  | 'lock-closed'
  | 'document-text'
  | 'download'
  | 'mail'
  | 'book-open'
  | 'chatbubbles'
  | 'flask'
  | 'code-slash'
  | 'person-circle'
  | 'refresh'
  | 'trash'
  | 'log-out'
  | 'chevron-forward'
  | 'star-outline';

const uiIconMap: Record<UIIconName, React.ComponentType<{ size?: number; color?: string }>> = {
  trophy: TrophyIcon,
  crown: CrownIcon,
  diamond: DiamondIcon,
  clock: ClockIcon,
  muscle: MuscleIcon,
  fire: FireIcon,
  shield: ShieldIcon,
  book: BookIcon,
  target: TargetIcon,
  party: PartyIcon,
  confetti: ConfettiIcon,
  star: StarIcon,
  lightning: LightningIcon,
  checkmark: CheckmarkIcon,
  flame: FlameIcon,
  person: PersonIcon,
  settings: SettingsIcon,
  vibrate: VibrateIcon,
  'volume-high': VolumeIcon,
  notifications: NotificationsIcon,
  flash: FlashIcon,
  'eye-off': EyeOffIcon,
  calendar: CalendarIcon,
  bulb: BulbIcon,
  'color-palette': ColorPaletteIcon,
  'shield-checkmark': ShieldCheckIcon,
  'lock-closed': LockIcon,
  'document-text': DocumentIcon,
  download: DownloadIcon,
  mail: MailIcon,
  'book-open': BookOpenIcon,
  chatbubbles: ChatBubblesIcon,
  flask: FlaskIcon,
  'code-slash': CodeIcon,
  'person-circle': PersonCircleIcon,
  refresh: RefreshCircleIcon,
  trash: TrashIcon,
  'log-out': LogOutIcon,
  'chevron-forward': ChevronForwardIcon,
  'star-outline': StarOutlineIcon,
};

// Icon Renderer Component
interface IconRendererProps {
  activityType?: ActivityType | ExerciseType | string;
  uiIcon?: UIIconName;
  size?: number;
  color?: string;
}

export function IconRenderer({ activityType, uiIcon, size = 24, color = '#6366F1' }: IconRendererProps) {
  if (uiIcon) {
    const IconComponent = uiIconMap[uiIcon];
    if (IconComponent) {
      return <IconComponent size={size} color={color} />;
    }
  }

  if (activityType) {
    const IconComponent = activityIconMap[activityType];
    if (IconComponent) {
      return <IconComponent size={size} color={color} />;
    }
  }

  // Fallback to target icon
  return <TargetIcon size={size} color={color} />;
}

// Helper to get icon component by activity type
export function getIconComponent(activityType: ActivityType | ExerciseType | string) {
  return activityIconMap[activityType] || TargetIcon;
}

// Helper to get UI icon component
export function getUIIconComponent(iconName: UIIconName) {
  return uiIconMap[iconName] || TargetIcon;
}
