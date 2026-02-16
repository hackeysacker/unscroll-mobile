/**
 * Challenge Icon Components
 *
 * Professional SVG icons for all challenge types
 * Replaces emoji icons with pixel-perfect vector graphics
 */

import Svg, { Path, Circle, Rect, G, Polygon, Ellipse, Line } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

// ============================================================================
// REALM 1: AWAKENING
// ============================================================================

export function EyeIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12.5" r="3.5" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12.5" r="1.5" fill={color} />
    </Svg>
  );
}

export function TargetIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  );
}

export function LungsIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v6m0 0c-2 0-3 1-4 3-1 2-2 5-2 7 0 1.5 1 2.5 2.5 2.5S11 20.5 11 19V9m1 0c2 0 3 1 4 3 1 2 2 5 2 7 0 1.5-1 2.5-2.5 2.5S13 20.5 13 19V9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ============================================================================
// REALM 2: BREATH
// ============================================================================

export function WindIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SquareIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function MeditationIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="6" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M12 10v4m0 0l-3 3m3-3l3 3M6 16l3-2m6 2l-3-2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 21h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function MusicNoteIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18V5l12-2v13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" />
      <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

// ============================================================================
// REALM 3: STILLNESS
// ============================================================================

export function FingerIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2v8m0 0c-1.5 0-2 1-2 2v8c0 1.5 1 2 2 2s2-.5 2-2v-8c0-1-0.5-2-2-2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="3" r="1.5" fill={color} />
    </Svg>
  );
}

export function SparkleIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14l-6-4.8h7.6L12 2z"
        fill={color}
      />
      <Circle cx="6" cy="6" r="1.5" fill={color} opacity="0.6" />
      <Circle cx="18" cy="6" r="1.5" fill={color} opacity="0.6" />
    </Svg>
  );
}

export function TurtleIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx="12" cy="13" rx="8" ry="5" stroke={color} strokeWidth="2" />
      <Path
        d="M12 8c-2 0-3.5 1-4.5 2M12 8c2 0 3.5 1 4.5 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="9" cy="11" r="1" fill={color} />
      <Circle cx="15" cy="11" r="1" fill={color} />
      <Path d="M4 15l-2 3M20 15l2 3M8 17l-2 3M16 17l2 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ============================================================================
// REALM 4: CLARITY
// ============================================================================

export function CheckmarkIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M8 12l3 3 5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LightningIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill={color}
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyesIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx="7" cy="12" rx="3" ry="4" stroke={color} strokeWidth="2" />
      <Ellipse cx="17" cy="12" rx="3" ry="4" stroke={color} strokeWidth="2" />
      <Circle cx="7" cy="12" r="1.5" fill={color} />
      <Circle cx="17" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

export function RainbowIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 20c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      <Path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <Path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 20c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ============================================================================
// REALM 5: FLOW
// ============================================================================

export function PencilIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MagnifyingGlassIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="11" cy="11" r="4" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

export function WaveIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </Svg>
  );
}

// ============================================================================
// REALM 6: DISCIPLINE
// ============================================================================

export function HandStopIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 2v6m0 0h8V2m-8 6H6v10c0 2 1 4 6 4s6-2 6-4V8h-2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 2v6m4-6v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function StopwatchIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth="2" />
      <Path d="M12 9v4l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Rect x="9" y="2" width="6" height="2" rx="1" stroke={color} strokeWidth="2" />
      <Path d="M15 5l2 2M9 5L7 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function PauseIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Rect x="9" y="8" width="2" height="8" rx="1" fill={color} />
      <Rect x="13" y="8" width="2" height="8" rx="1" fill={color} />
    </Svg>
  );
}

// ============================================================================
// REALM 7: RESILIENCE
// ============================================================================

export function BellOffIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="2" y1="2" x2="22" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function BlockIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function ClipboardIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="4" width="14" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Rect x="9" y="2" width="6" height="4" rx="1" stroke={color} strokeWidth="2" />
      <Path d="M9 12h6M9 16h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function DiamondIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l-8 6 8 14 8-14-8-6z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M12 2v20M4 8h16" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

// ============================================================================
// REALM 8: INSIGHT
// ============================================================================

export function BrainIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4c-3 0-5 2-5 5 0 2 1 3 1 5s-1 3-1 5c0 3 2 5 5 5s5-2 5-5c0-2-1-3-1-5s1-3 1-5c0-3-2-5-5-5z"
        stroke={color}
        strokeWidth="2"
      />
      <Path d="M12 4v20M9 7c-1 1-1 2-1 3M15 7c1 1 1 2 1 3" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

export function HashIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function LightbulbIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21h6M12 3a6 6 0 0 1 6 6c0 3-2 4-2 7H8c0-3-2-4-2-7a6 6 0 0 1 6-6z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 17h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function CrystalBallIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="11" r="7" stroke={color} strokeWidth="2" />
      <Ellipse cx="12" cy="11" rx="3" ry="5" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <Path d="M6 18c0-1 1-2 2-2h8c1 0 2 1 2 2v2H6v-2z" stroke={color} strokeWidth="2" />
      <Circle cx="10" cy="9" r="1.5" fill={color} opacity="0.6" />
    </Svg>
  );
}

export function CircusTentIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l10 17H2L12 3z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <Path d="M12 3v17M8 10l4 10M16 10l-4 10" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

// ============================================================================
// REALM 9: ASCENSION
// ============================================================================

export function BoltIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill={color}
      />
    </Svg>
  );
}

export function ExplosionIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4zM6 14l1.5 3 3 1.5-3 1.5L6 23l-1.5-3L1.5 18.5l3-1.5L6 14zM18 14l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5 1.5-3z"
        fill={color}
      />
    </Svg>
  );
}

export function RocketIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="15" cy="9" r="1.5" fill={color} />
      <Path d="M9 12l-3 3-4-4 3-3" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  );
}

export function ThoughtIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6.5c0 2.5-3.5 4.5-8 4.5S4 9 4 6.5 7.5 2 12 2s8 2 8 4.5z"
        stroke={color}
        strokeWidth="2"
      />
      <Circle cx="16" cy="14" r="3" stroke={color} strokeWidth="2" />
      <Circle cx="10" cy="19" r="2" stroke={color} strokeWidth="2" />
      <Circle cx="6" cy="22" r="1" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ============================================================================
// REALM 10: ABSOLUTE
// ============================================================================

export function CrownIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 8l3 5 5-5 4 5 5-5 3 5v8H2V8z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M2 21h20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="7" cy="10" r="1.5" fill={color} />
      <Circle cx="12" cy="8" r="1.5" fill={color} />
      <Circle cx="17" cy="10" r="1.5" fill={color} />
    </Svg>
  );
}

export function StarIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3 6 6.5 1-4.5 5 1 6.5L12 17l-6 3.5 1-6.5-4.5-5L9 8l3-6z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M12 2v15" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

export function RefreshIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SheetMusicIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 8h14M5 12h14M5 16h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="8" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
      <Circle cx="16" cy="12" r="1.5" fill={color} />
      <Path d="M9.5 12V8m4 8V12m4-4v4" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

export function StatueIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="6" y="18" width="12" height="4" rx="1" stroke={color} strokeWidth="2" />
      <Path
        d="M9 18V10c0-1.5 1-3 3-3s3 1.5 3 3v8"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth="2" />
      <Path d="M9 11h6" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ============================================================================
// UI ICONS
// ============================================================================

export function TrophyIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 21h8M12 17v4M6 3h12v6c0 3.3-2.7 6-6 6s-6-2.7-6-6V3z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M6 5H3v2c0 1.5 1 2.5 2 2.5M18 5h3v2c0 1.5-1 2.5-2 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function ClockIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function MuscleIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 7c0-2 1-3 2.5-3s2.5 1 2.5 3v3c0 2-1 3-2.5 3S6 12 6 10V7z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M11 7h2c1.5 0 2.5 1 2.5 2.5v0c0 1.5-1 2.5-2.5 2.5h-2V7z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="16" cy="9" r="2" stroke={color} strokeWidth="2" />
      <Path d="M9 13v7c0 1 .5 2 2 2h6c1.5 0 2-1 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function FireIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2s-4 4-4 8c0 3 2 5 4 5s4-2 4-5c0-4-4-8-4-8z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M12 22s-6-4-6-9c0-3 2-5 6-5s6 2 6 5c0 5-6 9-6 9z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShieldIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l-8 3v7c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M12 2v20" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

export function BookIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path d="M8 7h8M8 11h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function PartyIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M8 9l8 6M16 9l-8 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="9" cy="8" r="1" fill={color} />
      <Circle cx="15" cy="8" r="1" fill={color} />
      <Circle cx="12" cy="16" r="1" fill={color} />
      <Path d="M5 5l2 2M19 5l-2 2M5 19l2-2M19 19l-2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function ConfettiIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="10" y="2" width="4" height="8" rx="2" fill={color} opacity="0.7" />
      <Path d="M12 10l-6 12M12 10l6 12M12 10l-2 12M12 10l2 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="6" cy="18" r="1" fill={color} />
      <Circle cx="18" cy="18" r="1" fill={color} />
      <Circle cx="10" cy="20" r="1" fill={color} />
      <Circle cx="14" cy="20" r="1" fill={color} />
    </Svg>
  );
}
