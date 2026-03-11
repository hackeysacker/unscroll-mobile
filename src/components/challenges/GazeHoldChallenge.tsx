/**
 * GAZE HOLD CHALLENGE
 * Keep your gaze fixed on the center dot
 * Uses face tracking to detect when you're looking at the screen
 * Falls back to touch-based tracking if face tracking isn't available
 *
 * Difficulty Scaling:
 * - Shorter hold times at lower levels
 * - Longer hold times at higher levels
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { Camera } from 'expo-camera';
import { FaceTrackingAPI, type FaceTrackingData } from '@/lib/face-tracking';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

interface GazeHoldChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  level?: number;
  onBack?: () => void;
}

type TrackingStatus = 'checking' | 'unsupported' | 'requesting' | 'ready' | 'tracking' | 'error' | 'touch-fallback';
type TrackingMode = 'arkit' | 'vision' | 'touch' | 'none';

export function GazeHoldChallenge({ duration, onComplete, level = 1, onBack }: GazeHoldChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  // State
  const [isActive, setIsActive] = useState(false);
  const config = getChallengeConfig('gaze_hold');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isGazing, setIsGazing] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('checking');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('none');
  const [faceData, setFaceData] = useState<FaceTrackingData | null>(null);
  const [useTouchFallback, setUseTouchFallback] = useState(false);

  // Tracking refs
  const gazeTimeRef = useRef(0);
  const breaksRef = useRef(0);
  const longestStreakRef = useRef(0);
  const currentStreakRef = useRef(0);
  const wasGazingRef = useRef(false);
  const trackingSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const lastFaceUpdateRef = useRef(0);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleCompleteRef = useRef<() => void>(() => {});

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const faceIndicatorAnim = useRef(new Animated.Value(0)).current;
  const activeAnimationsRef = useRef<Animated.CompositeAnimation[]>([]);

  // Start with touch fallback mode
  const startWithTouchMode = useCallback(() => {
    setUseTouchFallback(true);
    setTrackingMode('touch');
    setTrackingStatus('tracking');
    setIsActive(true);
  }, []);

  // Open settings to grant camera permission
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  // Initialize face tracking
  useEffect(() => {
    let mounted = true;

    async function initFaceTracking() {
      try {
        // First, check and request camera permission using expo-camera
        // This will show the native permission dialog
        setTrackingStatus('checking');
        
        const { status: existingStatus } = await Camera.getCameraPermissionsAsync();
        console.log('Existing camera permission status:', existingStatus);
        
        if (existingStatus !== 'granted') {
          setTrackingStatus('requesting');
          const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
          console.log('New camera permission status:', newStatus);
          
          if (!mounted) return;
          
          if (newStatus !== 'granted') {
            // Permission denied - show error screen with options
            setTrackingStatus('error');
            return;
          }
        }

        if (!mounted) return;

        // Permission granted - now check if face tracking API is supported
        const isSupported = await FaceTrackingAPI.isSupported();
        console.log('Face tracking API supported:', isSupported);
        
        if (!mounted) return;

        if (!isSupported) {
          // Native face tracking not available (e.g., Expo Go)
          // Use touch fallback mode
          console.log('Native face tracking not available, using touch fallback');
          startWithTouchMode();
          return;
        }

        // Try to start native face tracking
        const result = await FaceTrackingAPI.startTracking();
        if (!mounted) return;

        if (!result.success) {
          // If tracking failed to start, use touch fallback
          console.log('Face tracking failed to start, using touch fallback');
          startWithTouchMode();
          return;
        }

        setTrackingMode(result.trackingMode as TrackingMode);

        // Subscribe to updates
        trackingSubscriptionRef.current = FaceTrackingAPI.onTrackingUpdate((data) => {
          if (mounted) {
            setFaceData(data);
          }
        });

        setTrackingStatus('tracking');
        setIsActive(true);
      } catch (error) {
        console.error('Face tracking init error:', error);
        if (mounted) {
          // Offer touch fallback on error
          setTrackingStatus('error');
        }
      }
    }

    initFaceTracking();

    return () => {
      mounted = false;
      FaceTrackingAPI.stopTracking();
      trackingSubscriptionRef.current?.remove();
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [startWithTouchMode]);

  // Determine if user is gazing based on face tracking data (camera mode)
  // Throttled to reduce animation calls - only update every 100ms for fast look-away detection
  useEffect(() => {
    if (useTouchFallback || !faceData || !isActive) return;

    const now = Date.now();
    // Throttle updates to every 100ms (10fps) for faster look-away detection
    if (now - lastFaceUpdateRef.current < 100) return;
    lastFaceUpdateRef.current = now;

    // STRICT detection - user is considered gazing ONLY if:
    // 1. Face is present
    // 2. Gaze direction is EXACTLY centered (not just close)
    // 3. Attention score is HIGH (>= 0.6)
    // Break focus immediately if ANY of these fail
    const isLookingAtScreen =
      faceData.isFacePresent &&
      faceData.gazeDirection === 'centered' &&
      faceData.attentionScore >= 0.6;

    setIsGazing(isLookingAtScreen);

    // Throttle animation updates - only animate when face presence changes significantly
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      Animated.spring(faceIndicatorAnim, {
        toValue: faceData.isFacePresent ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    }, 100);
  }, [faceData, isActive, useTouchFallback, faceIndicatorAnim]);

  // Timer
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isActive]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = ((duration - timeLeft) / duration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, duration]);

  // Track gaze time
  useEffect(() => {
    if (!isGazing || !isActive) return;

    const interval = setInterval(() => {
      gazeTimeRef.current += 100;
      currentStreakRef.current += 100;

      if (currentStreakRef.current > longestStreakRef.current) {
        longestStreakRef.current = currentStreakRef.current;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGazing, isActive]);

  // Animations when gazing
  useEffect(() => {
    // Stop all previous animations
    activeAnimationsRef.current.forEach(anim => anim.stop());
    activeAnimationsRef.current = [];

    if (isGazing && isActive) {
      const scaleAnimation = Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      });

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const parallelAnimation = Animated.parallel([scaleAnimation, glowAnimation, pulseAnimation]);
      parallelAnimation.start();
      activeAnimationsRef.current = [parallelAnimation, scaleAnimation, glowAnimation, pulseAnimation];

      if (!wasGazingRef.current) {
        haptics.impactLight();
        // Light haptic only when starting to gaze - no sound to avoid overwhelming feedback
      }
    } else {
      const resetAnimation = Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      resetAnimation.start();
      activeAnimationsRef.current = [resetAnimation];
      pulseAnim.setValue(1);
    }

    return () => {
      // Cleanup animations on unmount
      activeAnimationsRef.current.forEach(anim => anim.stop());
      activeAnimationsRef.current = [];
    };
  }, [isGazing, isActive, scaleAnim, glowAnim, pulseAnim, haptics]);

  // Track breaks
  useEffect(() => {
    if (isActive && !isGazing && wasGazingRef.current && gazeTimeRef.current > 0) {
      breaksRef.current += 1;
      currentStreakRef.current = 0;
      haptics.notificationWarning();
      sound.targetMiss();
    }
    wasGazingRef.current = isGazing;
  }, [isGazing, isActive]);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    FaceTrackingAPI.stopTracking();
    trackingSubscriptionRef.current?.remove();

    const totalMs = duration * 1000;
    const accuracy = (gazeTimeRef.current / totalMs) * 100;
    const score = Math.min(100, Math.max(0, accuracy));

    if (score >= 80) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  }, [duration, timeLeft, onComplete, haptics, sound]);

  // Keep ref updated
  useEffect(() => {
    handleCompleteRef.current = handleComplete;
  }, [handleComplete]);

  // Touch handlers for fallback mode
  const handleTouchStart = useCallback(() => {
    if (useTouchFallback && isActive) {
      setIsGazing(true);
    }
  }, [useTouchFallback, isActive]);

  const handleTouchEnd = useCallback(() => {
    if (useTouchFallback && isActive) {
      setIsGazing(false);
    }
  }, [useTouchFallback, isActive]);

  const gazePercentage = gazeTimeRef.current > 0
    ? Math.round((gazeTimeRef.current / (duration * 1000)) * 100)
    : 0;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const attentionPercentage = faceData ? Math.round(faceData.attentionScore * 100) : 0;

  // Render loading/permission states
  if (trackingStatus === 'checking' || trackingStatus === 'requesting') {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        <View style={styles.centerContent}>
          <View style={styles.loadingDot}>
            <Text style={styles.loadingIcon}>📷</Text>
          </View>
          <Text style={styles.loadingText}>
            {trackingStatus === 'checking' ? 'Checking camera access...' : 'Allow camera access'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {trackingStatus === 'requesting' 
              ? 'Tap "Allow" in the popup to enable gaze tracking'
              : 'This exercise uses your camera to detect when you\'re looking at the screen'}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Permission denied - offer to open settings or use touch fallback
  if (trackingStatus === 'error') {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>📷</Text>
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorText}>
            To use gaze tracking, please allow camera access in your device settings.
          </Text>
          
          <TouchableOpacity style={styles.primaryButton} onPress={openSettings}>
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>— or —</Text>

          <TouchableOpacity style={styles.secondaryButton} onPress={startWithTouchMode}>
            <Text style={styles.secondaryButtonText}>Use Touch Mode Instead</Text>
          </TouchableOpacity>
          
          <Text style={styles.touchModeHint}>
            Touch mode: Hold the dot to track focus
          </Text>
        </View>
      </LinearGradient>
    );
  }


  // Main challenge UI
  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Focus</Text>
          <Text style={[styles.statValue, { color: gazePercentage >= 80 ? '#10B981' : '#F59E0B' }]}>
            {gazePercentage}%
          </Text>
        </View>

        {!useTouchFallback && (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Attention</Text>
            <Text style={[styles.statValue, { color: attentionPercentage >= 70 ? '#10B981' : '#F59E0B' }]}>
              {attentionPercentage}%
            </Text>
          </View>
        )}
      </View>

      {/* Face/Touch Status Indicator */}
      <View style={styles.faceStatusContainer}>
        <Animated.View 
          style={[
            styles.faceStatusDot,
            { 
              backgroundColor: useTouchFallback 
                ? (isGazing ? '#10B981' : '#F59E0B')
                : (faceData?.isFacePresent ? '#10B981' : '#EF4444'),
              transform: [{ scale: useTouchFallback ? 1 : faceIndicatorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })}]
            }
          ]}
        />
        <Text style={styles.faceStatusText}>
          {useTouchFallback 
            ? (isGazing ? '👆 Holding...' : '👆 Press and hold the dot')
            : (faceData?.isFacePresent 
              ? (isGazing ? '👁️ Looking at screen' : '👀 Look at the dot')
              : '❌ Face not detected')}
        </Text>
        {!useTouchFallback && faceData?.gazeDirection && faceData.gazeDirection !== 'unknown' && (
          <Text style={styles.gazeDirectionText}>
            Gaze: {faceData.gazeDirection}
          </Text>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
        {breaksRef.current > 0 && (
          <Text style={styles.breaksText}>
            ⚠️ Breaks: {breaksRef.current}
          </Text>
        )}
      </View>

      {/* Challenge Area */}
      <View style={styles.challengeArea}>
        <TouchableOpacity 
          style={styles.touchArea}
          onPressIn={handleTouchStart}
          onPressOut={handleTouchEnd}
          activeOpacity={1}
          disabled={!useTouchFallback}
        >
          {/* Pulse ring */}
          {isGazing && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: glowOpacity,
                },
              ]}
            />
          )}

          {/* Glow effect */}
          {isGazing && (
            <Animated.View
              style={[
                styles.glowEffect,
                { opacity: glowOpacity },
              ]}
            />
          )}

          {/* Main dot */}
          <Animated.View
            style={[
              styles.dot,
              isGazing && styles.dotActive,
              !useTouchFallback && !faceData?.isFacePresent && styles.dotWarning,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.dotIcon}>
              {isGazing ? '✓' : useTouchFallback ? '👆' : (faceData?.isFacePresent ? '👁️' : '?')}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isGazing 
            ? '✓ Great! Keep focusing...' 
            : useTouchFallback
              ? '👆 Press and hold the dot'
              : (faceData?.isFacePresent 
                ? '👁️ Focus on the center dot'
                : '📷 Position your face in view')}
        </Text>
        {isGazing && (
          <Text style={styles.gazeTime}>
            {Math.round(gazeTimeRef.current / 1000)}s focused
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.modeText}>
          {trackingMode === 'arkit' ? 'TrueDepth' : trackingMode === 'vision' ? 'Camera' : 'Touch'} Mode
        </Text>
      </View>
    </LinearGradient>
    </BaseChallengeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  // Center content (loading/error states)
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingDot: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingIcon: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  touchModeHint: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },

  faceDetectedBadge: {
    marginTop: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  faceDetectedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  trackingModeBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trackingModeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Face Status
  faceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 8,
  },
  faceStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  faceStatusText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  gazeDirectionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  breaksText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '600',
  },

  // Challenge Area
  challengeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  touchArea: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#10B981',
  },
  glowEffect: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#10B981',
  },
  dot: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  dotActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  dotWarning: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  dotIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },

  // Instructions
  instructions: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  gazeTime: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  modeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
