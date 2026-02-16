/**
 * Activity Icon Component
 *
 * Renders SVG icons for activities instead of emojis
 * Maps activity types to their corresponding SVG icon components
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ActivityType } from '@/lib/journey-levels';
import { IconRenderer } from '@/components/icons';

interface ActivityIconProps {
  activityType: ActivityType | string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: any;
}

export function ActivityIcon({
  activityType,
  size = 40,
  color = '#FFFFFF',
  backgroundColor = 'rgba(99, 102, 241, 0.2)',
  style,
}: ActivityIconProps) {
  const containerSize = size * 1.5;
  const iconSize = size * 0.8;

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
      <IconRenderer activityType={activityType} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
