/**
 * UI Icon Component
 *
 * Renders SVG icons for UI elements (trophy, clock, diamond, etc.)
 * Replaces emoji-based UI icons with professional SVG graphics
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { UIIconName } from '@/components/icons';
import { IconRenderer } from '@/components/icons';

interface UIIconProps {
  name: UIIconName;
  size?: number;
  color?: string;
  backgroundColor?: string;
  withBackground?: boolean;
  style?: any;
}

export function UIIcon({
  name,
  size = 24,
  color = '#6366F1',
  backgroundColor = 'rgba(99, 102, 241, 0.1)',
  withBackground = false,
  style,
}: UIIconProps) {
  const icon = <IconRenderer uiIcon={name} size={size} color={color} />;

  if (!withBackground) {
    return icon;
  }

  const containerSize = size * 1.8;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      {icon}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
