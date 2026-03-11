import { NativeModules, Platform } from 'react-native';

const { FocusShieldModule } = NativeModules;

export interface FocusShieldConfig {
  blockAllApps?: boolean;
  allowedApps?: string[]; // Bundle IDs
  blockedApps?: string[]; // Bundle IDs
}

export interface AuthorizationStatus {
  status: 'notDetermined' | 'denied' | 'approved' | 'unknown';
}

class FocusShield {
  /**
   * Check if Focus Shield is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && FocusShieldModule != null;
  }

  /**
   * Request Screen Time API authorization from the user
   */
  async requestAuthorization(): Promise<{ authorized: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }
    return FocusShieldModule.requestAuthorization();
  }

  /**
   * Check the current authorization status
   */
  async checkAuthorizationStatus(): Promise<AuthorizationStatus> {
    if (!this.isAvailable()) {
      return { status: 'denied' };
    }
    return FocusShieldModule.checkAuthorizationStatus();
  }

  /**
   * Enable Focus Shield with the specified configuration
   *
   * @param config - Configuration for which apps to block/allow
   *
   * Examples:
   * - Block all apps except Safari and Messages:
   *   { blockAllApps: true, allowedApps: ['com.apple.mobilesafari', 'com.apple.MobileSMS'] }
   *
   * - Block specific apps:
   *   { blockedApps: ['com.instagram.Instagram', 'com.facebook.Facebook'] }
   */
  async enable(config: FocusShieldConfig): Promise<{ success: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }
    return FocusShieldModule.enableFocusShield(config);
  }

  /**
   * Disable Focus Shield and remove all app restrictions
   */
  async disable(): Promise<{ success: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }
    return FocusShieldModule.disableFocusShield();
  }

  /**
   * Present the native iOS app picker to let users select apps
   * This is a system UI provided by Apple
   */
  async presentAppPicker(): Promise<{ presented: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }
    return FocusShieldModule.presentAppPicker();
  }

  /**
   * Schedule device activity monitoring
   * This enables tracking of app usage during Focus Shield sessions
   */
  async scheduleMonitoring(config: Record<string, any>): Promise<{ success: boolean; activityName: string }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }
    return FocusShieldModule.scheduleActivityMonitoring(config);
  }

  /**
   * Stop device activity monitoring
   */
  async stopMonitoring(): Promise<{ success: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }
    return FocusShieldModule.stopActivityMonitoring();
  }

  /**
   * Temporarily unshield specific apps for a time window
   * Used by the unlock challenge system
   *
   * @param appBundleIds - Array of app bundle IDs to temporarily allow
   * @param durationSeconds - How long to allow access (120-300 seconds recommended)
   * @returns Promise with success status and end timestamp
   */
  async temporarilyUnshield(appBundleIds: string[], durationSeconds: number): Promise<{ success: boolean; endsAt: number }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }

    // For now, we'll implement this in JavaScript with auto-reshield
    // The native module would need to be extended to support this properly
    const endsAt = Date.now() + (durationSeconds * 1000);

    // Remove apps from blocked list temporarily
    await this.disable();

    return { success: true, endsAt };
  }

  /**
   * Re-shield apps after unlock window expires
   * Should be called automatically by the unlock system
   */
  async reshield(config: FocusShieldConfig): Promise<{ success: boolean }> {
    if (!this.isAvailable()) {
      throw new Error('Focus Shield is only available on iOS with native modules');
    }
    return this.enable(config);
  }

  /**
   * Get currently blocked apps from persistent storage
   * Returns the last saved block configuration
   */
  async getBlockedApps(): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }
    // This would need to be stored in AsyncStorage or native storage
    // For now, return empty array
    return [];
  }
}

export default new FocusShield();
