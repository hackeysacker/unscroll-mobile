import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FocusShield, { AuthorizationStatus } from '../modules/FocusShield';

export function FocusShieldControl() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthorizationStatus['status']>('notDetermined');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const status = await FocusShield.checkAuthorizationStatus();
      setAuthStatus(status.status);
    } catch (error) {
      console.error('Failed to check authorization:', error);
    }
  };

  const requestPermission = async () => {
    if (!FocusShield.isAvailable()) {
      Alert.alert(
        'Not Available',
        'Focus Shield is only available on iOS devices with native modules enabled.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await FocusShield.requestAuthorization();
      if (result.authorized) {
        setAuthStatus('approved');
        Alert.alert('Success', 'Screen Time permission granted!');
      }
    } catch (error: any) {
      Alert.alert('Permission Denied', error.message || 'Failed to request permission');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFocusShield = async (value: boolean) => {
    if (authStatus !== 'approved') {
      Alert.alert(
        'Permission Required',
        'You need to grant Screen Time permission first.',
        [{ text: 'Grant Permission', onPress: requestPermission }]
      );
      return;
    }

    setIsLoading(true);
    try {
      if (value) {
        // Enable Focus Shield - block all apps except essential ones
        await FocusShield.enable({
          blockAllApps: true,
          allowedApps: [
            'com.apple.mobilesafari', // Safari
            'com.apple.MobileSMS', // Messages
            'com.apple.mobilephone', // Phone
            // Add your app's bundle ID here so users can still access FocusFlow
          ],
        });

        // Start monitoring
        await FocusShield.scheduleMonitoring({});

        setIsEnabled(true);
        Alert.alert('Focus Shield Activated', 'Distracting apps are now blocked!');
      } else {
        // Disable Focus Shield
        await FocusShield.disable();
        await FocusShield.stopMonitoring();

        setIsEnabled(false);
        Alert.alert('Focus Shield Deactivated', 'All apps are now accessible.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to toggle Focus Shield');
      setIsEnabled(!value); // Revert the toggle
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthorizationPrompt = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#d946ef']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Focus Shield</Text>
          <Text style={styles.description}>
            Block distracting apps during your focus sessions
          </Text>

          <View style={styles.featureList}>
            <Text style={styles.feature}>🛡️ Real app blocking</Text>
            <Text style={styles.feature}>⏱️ Scheduled protection</Text>
            <Text style={styles.feature}>🎯 Customizable app lists</Text>
          </View>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            disabled={isLoading}
          >
            <Text style={styles.permissionButtonText}>
              {isLoading ? 'Requesting...' : 'Grant Permission'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footnote}>
            This uses iOS Screen Time API to block apps at the system level
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  if (!FocusShield.isAvailable()) {
    return (
      <View style={styles.unavailableContainer}>
        <Text style={styles.unavailableText}>
          Focus Shield requires iOS with native modules
        </Text>
      </View>
    );
  }

  if (authStatus !== 'approved') {
    return renderAuthorizationPrompt();
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isEnabled ? ['#10b981', '#059669'] : ['#374151', '#1f2937']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Focus Shield</Text>
            <Switch
              value={isEnabled}
              onValueChange={toggleFocusShield}
              disabled={isLoading}
              trackColor={{ false: '#4b5563', true: '#34d399' }}
              thumbColor={isEnabled ? '#10b981' : '#9ca3af'}
            />
          </View>

          <Text style={styles.statusText}>
            {isEnabled ? 'Active - Apps are blocked' : 'Inactive - Apps are accessible'}
          </Text>

          {isEnabled && (
            <View style={styles.activeInfo}>
              <Text style={styles.activeInfoText}>
                🛡️ Distracting apps are now blocked system-wide
              </Text>
              <Text style={styles.activeInfoText}>
                You can only access essential apps
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.configureButton}
            onPress={() => FocusShield.presentAppPicker()}
          >
            <Text style={styles.configureButtonText}>
              Configure Blocked Apps
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  gradient: {
    padding: 20,
  },
  content: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  featureList: {
    gap: 8,
    marginVertical: 8,
  },
  feature: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  activeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  activeInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  configureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  configureButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableContainer: {
    padding: 20,
    backgroundColor: '#374151',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  unavailableText: {
    color: '#9ca3af',
    textAlign: 'center',
  },
});
