/**
 * Settings Icons
 *
 * Custom SVG icons for the Settings screen
 * These icons are distinct from challenge/target icons to avoid confusion
 */

import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Person Icon (Profile)
export function PersonIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Flame Icon (Streak)
export function FlameIcon({ size = 24, color = '#EF4444' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C8.5 7 7 10 7 13C7 16.866 9.13401 20 12 20C14.866 20 17 16.866 17 13C17 10 15.5 7 12 3Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16C11 16 10 15 10 13.5C10 12 11 11 12 9C13 11 14 12 14 13.5C14 15 13 16 12 16Z"
        fill="#FFF"
        opacity="0.4"
      />
    </Svg>
  );
}

// Settings/Gear Icon
export function SettingsIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Vibrate Icon
export function VibrateIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="7" y="4" width="10" height="16" rx="2" stroke={color} strokeWidth="2" />
      <Line x1="2" y1="8" x2="2" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="22" y1="8" x2="22" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="4" y1="10" x2="4" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="20" y1="10" x2="20" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Volume/Sound Icon
export function VolumeIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H3C2.44772 9 2 9.44772 2 10V14C2 14.5523 2.44772 15 3 15H6L11 19V5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 9C16 10 16.5 11 16.5 12C16.5 13 16 14 15 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M18 7C19.5 8.5 20.5 10 20.5 12C20.5 14 19.5 15.5 18 17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Notifications/Bell Icon
export function NotificationsIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Flash/Lightning Icon
export function FlashIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Eye Off Icon
export function EyeOffIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3L21 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M10.584 10.587C10.2087 10.962 9.99778 11.4708 9.99756 12.0018C9.99734 12.5328 10.2078 13.0418 10.5828 13.417C10.9578 13.7922 11.4666 14.0031 11.9976 14.0033C12.5286 14.0035 13.0376 13.7931 13.413 13.418"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M9.363 5.365C10.2204 5.11972 11.1082 4.99684 12 5C19 5 22 12 22 12C21.393 13.187 20.586 14.262 19.618 15.182M17.357 17.349C15.726 18.449 13.942 19 12 19C5 19 2 12 2 12C3.369 9.605 5.196 7.825 7.243 6.658"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Calendar Icon
export function CalendarIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Bulb/Lightbulb Icon
export function BulbIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18H15M12 2C8.68629 2 6 4.68629 6 8C6 10.5 7 12 8 14C8.5 15 9 16 9 18V19C9 19.5523 9.44772 20 10 20H14C14.5523 20 15 19.5523 15 19V18C15 16 15.5 15 16 14C17 12 18 10.5 18 8C18 4.68629 15.3137 2 12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 22H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Color Palette Icon
export function ColorPaletteIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C13.5 22 14 21.5 14 20C14 19.4 13.7 18.9 13.4 18.5C13.2 18.1 13 17.6 13 17C13 15.9 13.9 15 15 15H17C19.8 15 22 12.8 22 10C22 5.6 17.5 2 12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="7" cy="9" r="1.5" fill={color} />
      <Circle cx="10" cy="6" r="1.5" fill={color} />
      <Circle cx="14" cy="6" r="1.5" fill={color} />
      <Circle cx="17" cy="9" r="1.5" fill={color} />
    </Svg>
  );
}

// Shield with Checkmark Icon
export function ShieldCheckIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="9 12 11 14 15 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Lock Icon
export function LockIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="11" rx="2" stroke={color} strokeWidth="2" />
      <Path
        d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
    </Svg>
  );
}

// Document Icon
export function DocumentIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="8" y1="17" x2="16" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Download Icon
export function DownloadIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3V16M12 16L8 12M12 16L16 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M3 17V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Mail Icon
export function MailIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M3 7L12 13L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Book/Tutorial Icon
export function BookOpenIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6.25C10.5 4.75 8.5 4 6.5 4C5 4 3.5 4.5 2.5 5.5V19C3.5 18 5 17.5 6.5 17.5C8.5 17.5 10.5 18.25 12 19.75M12 6.25C13.5 4.75 15.5 4 17.5 4C19 4 20.5 4.5 21.5 5.5V19C20.5 18 19 17.5 17.5 17.5C15.5 17.5 13.5 18.25 12 19.75M12 6.25V19.75"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Chatbubbles/FAQ Icon
export function ChatBubblesIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 10H8.01M12 10H12.01M16 10H16.01M9 18L3 21V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H12L9 18Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Flask/Testing Icon
export function FlaskIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 2V10L4 19C3.5 20 4 21 5 21H19C20 21 20.5 20 20 19L15 10V2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} opacity="0.6" />
      <Circle cx="16" cy="17" r="1" fill={color} opacity="0.6" />
    </Svg>
  );
}

// Code Icon
export function CodeIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4L4 12L8 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 4L20 12L16 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="14" y1="6" x2="10" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Person Circle Icon
export function PersonCircleIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M6.5 19C7.5 17 9.5 16 12 16C14.5 16 16.5 17 17.5 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Refresh Icon
export function RefreshCircleIcon({ size = 24, color = '#EF4444' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C14.5 4 16.7 5.2 18 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path d="M18 3V7H14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Trash Icon
export function TrashIcon({ size = 24, color = '#EF4444' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Log Out Icon
export function LogOutIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Chevron Forward Icon
export function ChevronForwardIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6L15 12L9 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Star Icon (for upgrade button)
export function StarOutlineIcon({ size = 24, color = '#6366F1' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
