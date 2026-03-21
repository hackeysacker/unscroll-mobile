/**
 * Offline Indicator Component
 * Shows online/offline status and sync progress
 */

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  useNetworkStatus,
  useSyncStatus,
  NetworkStatus,
  SyncStatus,
} from '@/lib/network-manager';

export function OfflineIndicator() {
  const networkState = useNetworkStatus();
  const syncState = useSyncStatus();

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isOffline = networkState.status === NetworkStatus.OFFLINE;
  const isPoorConnection = networkState.status === NetworkStatus.POOR;
  const hasPendingSync = syncState.queuedItems > 0;
  const isSyncing = syncState.status === SyncStatus.SYNCING;

  const shouldShow = isOffline || isPoorConnection || hasPendingSync || isSyncing;

  useEffect(() => {
    if (shouldShow) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShow]);

  if (!shouldShow && (slideAnim as any).__getValue() === -100) {
    return null;
  }

  const getStatusColor = () => {
    if (isOffline) return '#EF4444'; // Red
    if (isPoorConnection) return '#F59E0B'; // Orange
    if (isSyncing) return '#3B82F6'; // Blue
    if (hasPendingSync) return '#6366F1'; // Indigo
    return '#10B981'; // Green
  };

  const getStatusIcon = () => {
    if (isOffline) return '📡';
    if (isPoorConnection) return '⚠️';
    if (isSyncing) return '🔄';
    if (hasPendingSync) return '⏳';
    return '✓';
  };

  const getStatusText = () => {
    if (isOffline) return 'Offline - Changes will sync when online';
    if (isPoorConnection) return 'Poor connection - Sync may be slow';
    if (isSyncing) return `Syncing ${syncState.queuedItems} items...`;
    if (hasPendingSync) {
      return `${syncState.queuedItems} item${syncState.queuedItems !== 1 ? 's' : ''} pending sync`;
    }
    return 'All changes synced';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View
          style={[
            styles.content,
            {
              borderLeftColor: getStatusColor(),
            },
          ]}
        >
          <Text style={styles.icon}>{getStatusIcon()}</Text>
          <Text style={styles.text}>{getStatusText()}</Text>
          {syncState.error && (
            <Text style={styles.error} numberOfLines={1}>
              {syncState.error}
            </Text>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 1000,
  },
  blur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    borderLeftWidth: 4,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  error: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },
});

/**
 * Compact sync status badge (for status bar)
 */
export function SyncStatusBadge() {
  const syncState = useSyncStatus();

  if (syncState.queuedItems === 0 && syncState.status !== SyncStatus.SYNCING) {
    return null;
  }

  return (
    <View style={badgeStyles.container}>
      <View
        style={[
          badgeStyles.badge,
          {
            backgroundColor:
              syncState.status === SyncStatus.SYNCING ? '#3B82F6' : '#6366F1',
          },
        ]}
      >
        <Text style={badgeStyles.text}>
          {syncState.status === SyncStatus.SYNCING ? '↻' : syncState.queuedItems}
        </Text>
      </View>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
