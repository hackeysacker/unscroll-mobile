import { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';

interface ScreenFrameProps {
  children: React.ReactNode;
}

// A reusable wrapper that draws a subtle border around the whole screen and
// provides interactive edge zones (top/right/bottom/left). These can be wired
// to navigation or feature launchers later.
export function ScreenFrame({ children }: ScreenFrameProps) {
  const [lastEdge, setLastEdge] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  const triggerPulse = (edge: string) => {
    setLastEdge(edge);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.timing(pulse, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start();
  };

  const borderColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['#334155', '#60a5fa'],
  });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.border, { borderColor }]} />

      {/* Edge zones - hidden on mobile for cleaner UI */}
      {/* Uncomment if you want edge navigation features
      <TouchableOpacity
        accessibilityLabel="Top Edge"
        onPress={() => triggerPulse('Top')}
        activeOpacity={0.6}
        style={styles.topEdge}
      >
        <Text style={styles.edgeLabel}>Top</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Right Edge"
        onPress={() => triggerPulse('Right')}
        activeOpacity={0.6}
        style={styles.rightEdge}
      >
        <Text style={styles.edgeLabelVertical}>Right</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Bottom Edge"
        onPress={() => triggerPulse('Bottom')}
        activeOpacity={0.6}
        style={styles.bottomEdge}
      >
        <Text style={styles.edgeLabel}>Bottom</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Left Edge"
        onPress={() => triggerPulse('Left')}
        activeOpacity={0.6}
        style={styles.leftEdge}
      >
        <Text style={styles.edgeLabelVertical}>Left</Text>
      </TouchableOpacity>
      */}

      {/* Main content */}
      <View style={styles.content}>{children}</View>

      {/* Subtle toast for last edge */}
      {lastEdge && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{lastEdge} edge tapped</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0, // Hidden border for cleaner mobile UI
    borderRadius: 0,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  edgeLabelVertical: {
    fontSize: 12,
    color: '#94a3b8',
    transform: [{ rotate: '-90deg' }],
  },
  toast: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toastText: {
    color: '#e5e7eb',
    fontSize: 12,
  },
});





