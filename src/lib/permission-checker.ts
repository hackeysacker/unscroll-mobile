/**
 * Permission Checker
 *
 * Checks which device permissions are available for challenges.
 * Used by the unlock challenge system to determine which challenges can be presented.
 */

import { DeviceMotion } from 'expo-sensors';
import { Camera } from 'expo-camera';

export type PermissionType = 'MOTION' | 'SPEECH' | 'LOCATION' | 'CAMERA';

interface PermissionStatus {
  granted: boolean;
  canRequest: boolean;
}

/**
 * Get all available permissions for challenge selection
 */
export async function getAvailablePermissions(): Promise<PermissionType[]> {
  const permissions: PermissionType[] = [];

  // Check MOTION (accelerometer/gyro)
  if (await checkMotionPermission()) {
    permissions.push('MOTION');
  }

  // Check CAMERA (for face detection)
  if (await checkCameraPermission().then(s => s.granted)) {
    permissions.push('CAMERA');
  }

  // SPEECH and LOCATION are not installed - mark as available but use fallbacks
  // They will fall back to simpler challenges when unavailable
  permissions.push('SPEECH');
  permissions.push('LOCATION');

  return permissions;
}

/**
 * Check if motion sensors are available
 */
export async function checkMotionPermission(): Promise<boolean> {
  try {
    // Check if device has accelerometer
    const available = await DeviceMotion.isAvailableAsync();
    return available;
  } catch {
    return false;
  }
}

/**
 * Check camera permission status
 */
export async function checkCameraPermission(): Promise<PermissionStatus> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return {
      granted: status === 'granted',
      canRequest: status === 'undetermined',
    };
  } catch {
    return { granted: false, canRequest: false };
  }
}

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Check if a specific permission is available
 */
export async function hasPermission(permission: PermissionType): Promise<boolean> {
  const available = await getAvailablePermissions();
  return available.includes(permission);
}
