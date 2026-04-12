import { View, StyleSheet } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

interface SkeletonLoaderProps {
  /**
   * Number of skeleton rows to display
   */
  rows?: number;
  /**
   * Height of each row (default: 20)
   */
  rowHeight?: number;
  /**
   * Width of each row (percentage of container, default: 100)
   */
  rowWidth?: number | string;
  /**
   * Gap between rows (default: 12)
   */
  gap?: number;
  /**
   * Additional container styles
   */
  containerStyle?: object;
}

/**
 * Skeleton Loader Component
 * Provides loading placeholder UI while data is being fetched
 */
export function SkeletonLoader({
  rows = 3,
  rowHeight = 20,
  rowWidth = '100%',
  gap = 12,
  containerStyle = {},
}: SkeletonLoaderProps) {
  const widths =
    typeof rowWidth === 'string' ? rowWidth : Array.from({ length: rows }, () => rowWidth);

  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length: rows }).map((_, index) => (
        <ShimmerEffect
          key={index}
          width={typeof widths === 'string' ? (parseInt(widths) / 100) * 300 : widths[index] || 200}
          height={rowHeight}
          borderRadius={4}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});