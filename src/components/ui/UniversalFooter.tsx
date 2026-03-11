/**
 * Universal Bottom Navigation Component
 *
 * Consistent bottom navigation bar with animated tab switching
 * Can be used across the entire app
 */

import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export type TabType = 'home' | 'path' | 'practice' | 'shield' | 'premium';

interface UniversalFooterProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabIconProps {
  isActive: boolean;
  size?: number;
}

/**
 * Home Icon - Path/Journey visualization
 */
function HomeIcon({ isActive, size = 24 }: TabIconProps) {
  const color = isActive ? '#FFFFFF' : '#8E8E93';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Practice Icon - Target/Focus symbol
 */
function PracticeIcon({ isActive, size = 24 }: TabIconProps) {
  const color = isActive ? '#FFFFFF' : '#8E8E93';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  );
}

/**
 * Shield Icon - Focus Shield
 */
function ShieldIcon({ isActive, size = 24 }: TabIconProps) {
  const color = isActive ? '#FFFFFF' : '#8E8E93';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 2.18l6 3V12c0 4.52-2.98 8.69-6 9.93-3.02-1.24-6-5.41-6-9.93V7.18l6-3z"
        fill={color}
      />
      <Path
        d="M10 12l2 2 4-4"
        stroke={isActive ? '#1C1C1E' : '#2C2C2E'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Path Icon - Journey/Progress visualization
 */
function PathIcon({ isActive, size = 24 }: TabIconProps) {
  const color = isActive ? '#FFFFFF' : '#8E8E93';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C12 2 4 8 4 14a8 8 0 1016 0c0-6-8-12-8-12z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="14" r="3" fill={color} />
    </Svg>
  );
}

/**
 * Premium Icon - Crown/Diamond
 */
function PremiumIcon({ isActive, size = 24 }: TabIconProps) {
  const color = isActive ? '#FFD700' : '#8E8E93';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L9 9H1l6.5 5L5 22l7-5.5L19 22l-2.5-8L23 9h-8z"
        fill={color}
      />
      <Circle cx="12" cy="10" r="1.5" fill={isActive ? '#FFF' : '#2C2C2E'} opacity="0.8" />
    </Svg>
  );
}

/**
 * Animated Tab Button
 */
function TabButton({
  tab,
  icon: Icon,
  label,
  isActive,
  onPress,
}: {
  tab: TabType;
  icon: React.ComponentType<TabIconProps>;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;
  const colorAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.9,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(colorAnim, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [isActive]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(99, 102, 241, 0)', 'rgba(99, 102, 241, 0.2)'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      {/* Outer view for scale (native driver) */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Inner view for backgroundColor (non-native driver) */}
        <Animated.View
          style={[
            styles.tabButtonInner,
            {
              backgroundColor,
            },
          ]}
        >
          <Icon isActive={isActive} size={24} />
          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function UniversalFooter({ activeTab, onTabChange }: UniversalFooterProps) {
  const insets = useSafeAreaInsets();

  // Animated indicator for active tab
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const tabIndex = {
      home: 0,
      path: 1,
      practice: 2,
      shield: 3,
      premium: 4,
    }[activeTab] ?? 0;

    Animated.spring(indicatorAnim, {
      toValue: tabIndex,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, 20, 40, 60, 80], // Percentage-based positions for 5 tabs
  });

  return (
    <View
      style={[
        styles.footer,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {/* Animated indicator bar */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [
              {
                translateX: indicatorTranslateX.interpolate({
                  inputRange: [0, 75],
                  outputRange: [0, 300], // Adjust based on screen width
                }),
              },
            ],
          },
        ]}
      />

      {/* Tab buttons */}
      <TabButton
        tab="home"
        icon={HomeIcon}
        label="Home"
        isActive={activeTab === 'home'}
        onPress={() => onTabChange('home')}
      />
      <TabButton
        tab="path"
        icon={PathIcon}
        label="Path"
        isActive={activeTab === 'path'}
        onPress={() => onTabChange('path')}
      />
      <TabButton
        tab="practice"
        icon={PracticeIcon}
        label="Practice"
        isActive={activeTab === 'practice'}
        onPress={() => onTabChange('practice')}
      />
      <TabButton
        tab="shield"
        icon={ShieldIcon}
        label="Shield"
        isActive={activeTab === 'shield'}
        onPress={() => onTabChange('shield')}
      />
      <TabButton
        tab="premium"
        icon={PremiumIcon}
        label="Premium"
        isActive={activeTab === 'premium'}
        onPress={() => onTabChange('premium')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 4,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '20%',
    height: 2,
    backgroundColor: '#6366F1',
    borderRadius: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
});
