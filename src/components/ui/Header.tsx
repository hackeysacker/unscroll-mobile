import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBack?: boolean;
}

export function Header({ title, onBack, rightAction, showBack = true }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: Math.max(insets.top, 8),
        backgroundColor: 'transparent',
      }
    ]}>
      <View style={styles.row}>
        {/* Back Button - Always takes space for alignment */}
        <View style={styles.leftSection}>
          {showBack && onBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              accessibilityHint="Navigate to previous screen"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Action */}
        <View style={styles.rightSection}>
          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  leftSection: {
    width: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightSection: {
    width: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
