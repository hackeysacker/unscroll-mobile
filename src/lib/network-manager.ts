/**
 * Network Manager
 * Handles online/offline detection and sync status tracking
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';
import { getSyncQueueStats } from './supabase-retry';

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  POOR = 'poor', // Connected but slow/unstable
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  ERROR = 'error',
  PENDING = 'pending', // Has items to sync
}

export interface NetworkState {
  status: NetworkStatus;
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

export interface SyncState {
  status: SyncStatus;
  queuedItems: number;
  lastSyncAt: Date | null;
  error: string | null;
}

/**
 * Network Manager Class
 */
class NetworkManager {
  private networkState: NetworkState = {
    status: NetworkStatus.ONLINE,
    isConnected: true,
    isInternetReachable: true,
    type: null,
  };

  private syncState: SyncState = {
    status: SyncStatus.IDLE,
    queuedItems: 0,
    lastSyncAt: null,
    error: null,
  };

  private listeners: Set<(state: NetworkState) => void> = new Set();
  private syncListeners: Set<(state: SyncState) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize network monitoring
   */
  initialize() {
    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);

    // Get initial state
    NetInfo.fetch().then(this.handleNetworkChange);

    // Check sync queue periodically
    this.startSyncQueueMonitoring();
  }

  /**
   * Handle network state change
   */
  private handleNetworkChange = (state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable ?? false;

    let status: NetworkStatus;
    if (!isConnected || !isInternetReachable) {
      status = NetworkStatus.OFFLINE;
    } else if (this.isSlowConnection(state)) {
      status = NetworkStatus.POOR;
    } else {
      status = NetworkStatus.ONLINE;
    }

    this.networkState = {
      status,
      isConnected,
      isInternetReachable,
      type: state.type,
    };

    this.notifyNetworkListeners();

    // Update sync status based on network
    if (status === NetworkStatus.OFFLINE && this.syncState.queuedItems > 0) {
      this.updateSyncState({ status: SyncStatus.PENDING });
    }
  };

  /**
   * Check if connection is slow
   */
  private isSlowConnection(state: NetInfoState): boolean {
    // Check for slow connection types
    if (state.type === 'cellular') {
      const details = state.details as any;
      if (details?.cellularGeneration === '2g') {
        return true;
      }
    }
    return false;
  }

  /**
   * Start monitoring sync queue
   */
  private startSyncQueueMonitoring() {
    setInterval(async () => {
      const stats = await getSyncQueueStats();
      this.updateSyncState({ queuedItems: stats.count });
    }, 10000); // Check every 10 seconds
  }

  /**
   * Update sync state
   */
  updateSyncState(updates: Partial<SyncState>) {
    this.syncState = { ...this.syncState, ...updates };
    this.notifySyncListeners();
  }

  /**
   * Add network listener
   */
  addNetworkListener(listener: (state: NetworkState) => void) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.networkState);
    return () => this.listeners.delete(listener);
  }

  /**
   * Add sync listener
   */
  addSyncListener(listener: (state: SyncState) => void) {
    this.syncListeners.add(listener);
    // Immediately call with current state
    listener(this.syncState);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Notify network listeners
   */
  private notifyNetworkListeners() {
    this.listeners.forEach(listener => listener(this.networkState));
  }

  /**
   * Notify sync listeners
   */
  private notifySyncListeners() {
    this.syncListeners.forEach(listener => listener(this.syncState));
  }

  /**
   * Get current network state
   */
  getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Is online
   */
  isOnline(): boolean {
    return this.networkState.status !== NetworkStatus.OFFLINE;
  }

  /**
   * Has good connection
   */
  hasGoodConnection(): boolean {
    return this.networkState.status === NetworkStatus.ONLINE;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.unsubscribe?.();
  }
}

// Singleton instance
export const networkManager = new NetworkManager();

/**
 * React hook for network status
 */
export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>(
    networkManager.getNetworkState()
  );

  useEffect(() => {
    return networkManager.addNetworkListener(setNetworkState);
  }, []);

  return networkState;
}

/**
 * React hook for sync status
 */
export function useSyncStatus() {
  const [syncState, setSyncState] = useState<SyncState>(networkManager.getSyncState());

  useEffect(() => {
    return networkManager.addSyncListener(setSyncState);
  }, []);

  return syncState;
}

/**
 * React hook for online status
 */
export function useIsOnline() {
  const networkState = useNetworkStatus();
  return networkState.status !== NetworkStatus.OFFLINE;
}
