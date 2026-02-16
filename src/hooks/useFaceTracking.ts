/**
 * useFaceTracking Hook
 *
 * Provides face tracking functionality for challenges
 * Detects when user looks away and penalizes focus score
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { FaceTrackingAPI, type FaceTrackingData } from '@/lib/face-tracking';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';

export interface FaceTrackingState {
  isLookingAtScreen: boolean;
  isFaceDetected: boolean;
  attentionScore: number;
  gazeDirection: string;
  trackingMode: 'arkit' | 'vision' | 'none';
  isReady: boolean;
  hasPermission: boolean;
  lookAwayCount: number;
  totalLookAwayTime: number; // in milliseconds
}

export interface UseFaceTrackingOptions {
  enabled?: boolean;
  onLookAway?: () => void;
  onLookBack?: () => void;
  lookAwayThreshold?: number; // Seconds before triggering look away
  minAttentionScore?: number; // Minimum attention score (0-1) to consider "looking"
}

export function useFaceTracking(options: UseFaceTrackingOptions = {}) {
  const {
    enabled = true,
    onLookAway,
    onLookBack,
    lookAwayThreshold = 1, // 1 second
    minAttentionScore = 0.5,
  } = options;

  const haptics = useHaptics();
  const sound = useSound();

  const [state, setState] = useState<FaceTrackingState>({
    isLookingAtScreen: false,
    isFaceDetected: false,
    attentionScore: 0,
    gazeDirection: 'unknown',
    trackingMode: 'none',
    isReady: false,
    hasPermission: false,
    lookAwayCount: 0,
    totalLookAwayTime: 0,
  });

  const trackingSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const lookAwayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookAwayStartTimeRef = useRef<number | null>(null);
  const wasLookingRef = useRef(false);

  // Request camera permission and initialize tracking
  const initializeTracking = useCallback(async () => {
    if (!enabled) return;

    try {
      // Request camera permission
      const { status } = await Camera.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        setState(prev => ({ ...prev, hasPermission: false, isReady: true }));
        return;
      }

      setState(prev => ({ ...prev, hasPermission: true }));

      // Check if face tracking is supported
      const isSupported = await FaceTrackingAPI.isSupported();

      if (!isSupported) {
        setState(prev => ({ ...prev, isReady: true }));
        return;
      }

      // Start face tracking
      const result = await FaceTrackingAPI.startTracking();

      if (!result.success) {
        setState(prev => ({ ...prev, isReady: true }));
        return;
      }

      setState(prev => ({
        ...prev,
        trackingMode: result.trackingMode as 'arkit' | 'vision',
        isReady: true,
      }));

      // Subscribe to tracking updates
      trackingSubscriptionRef.current = FaceTrackingAPI.onTrackingUpdate((data: FaceTrackingData) => {
        handleTrackingUpdate(data);
      });

    } catch (error) {
      console.error('Face tracking initialization error:', error);
      setState(prev => ({ ...prev, isReady: true }));
    }
  }, [enabled]);

  // Handle tracking data updates
  const handleTrackingUpdate = useCallback((data: FaceTrackingData) => {
    const isLooking = data.isFacePresent &&
                      data.attentionScore >= minAttentionScore &&
                      (data.gazeDirection === 'centered' || data.gazeDirection === 'unknown');

    setState(prev => ({
      ...prev,
      isLookingAtScreen: isLooking,
      isFaceDetected: data.isFacePresent,
      attentionScore: data.attentionScore,
      gazeDirection: data.gazeDirection,
    }));

    // Detect look away
    if (wasLookingRef.current && !isLooking) {
      // User looked away
      lookAwayStartTimeRef.current = Date.now();

      // Start timer for look away threshold
      if (lookAwayTimerRef.current) {
        clearTimeout(lookAwayTimerRef.current);
      }

      lookAwayTimerRef.current = setTimeout(() => {
        // Trigger look away callback after threshold
        haptics.notificationWarning();
        sound.warning();
        onLookAway?.();

        setState(prev => ({
          ...prev,
          lookAwayCount: prev.lookAwayCount + 1,
        }));
      }, lookAwayThreshold * 1000);

    } else if (!wasLookingRef.current && isLooking) {
      // User looked back
      if (lookAwayTimerRef.current) {
        clearTimeout(lookAwayTimerRef.current);
        lookAwayTimerRef.current = null;
      }

      // Calculate look away duration
      if (lookAwayStartTimeRef.current) {
        const lookAwayDuration = Date.now() - lookAwayStartTimeRef.current;
        setState(prev => ({
          ...prev,
          totalLookAwayTime: prev.totalLookAwayTime + lookAwayDuration,
        }));
        lookAwayStartTimeRef.current = null;
      }

      onLookBack?.();
    }

    wasLookingRef.current = isLooking;
  }, [minAttentionScore, lookAwayThreshold, onLookAway, onLookBack]);

  // Initialize on mount
  useEffect(() => {
    initializeTracking();

    return () => {
      // Cleanup
      if (trackingSubscriptionRef.current) {
        trackingSubscriptionRef.current.remove();
        trackingSubscriptionRef.current = null;
      }

      if (lookAwayTimerRef.current) {
        clearTimeout(lookAwayTimerRef.current);
      }

      FaceTrackingAPI.stopTracking();
    };
  }, [initializeTracking]);

  // Calculate focus penalty based on look away time
  const getFocusPenalty = useCallback(() => {
    // Penalty is based on percentage of time looking away
    // Each second away = 5% penalty
    const penaltyPerSecond = 5;
    const secondsAway = state.totalLookAwayTime / 1000;
    return Math.min(100, secondsAway * penaltyPerSecond);
  }, [state.totalLookAwayTime]);

  return {
    ...state,
    getFocusPenalty,
    resetTracking: () => {
      setState(prev => ({
        ...prev,
        lookAwayCount: 0,
        totalLookAwayTime: 0,
      }));
    },
  };
}
