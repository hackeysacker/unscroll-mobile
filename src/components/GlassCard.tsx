import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
}

export function GlassCard({ 
  children, 
  style, 
  intensity = 20,
  tint = 'dark' 
}: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={styles.blur}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

export function GlassButton({ 
  children, 
  style,
  onPress,
  disabled = false,
}: { 
  children: React.ReactNode; 
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.buttonContainer, disabled && styles.buttonDisabled, style]}>
      <BlurView
        intensity={15}
        tint="dark"
        style={styles.buttonBlur}
      />
      <View style={styles.buttonContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
  },
  buttonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
