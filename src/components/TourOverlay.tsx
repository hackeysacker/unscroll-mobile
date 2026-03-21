/**
 * Tour Overlay Component
 * Displays interactive tour steps with spotlight effect
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { tourManager, type Tour, type TourStep } from '@/lib/app-tour-manager';
import { hapticPatterns } from '@/lib/haptic-patterns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourOverlayProps {
  onComplete?: () => void;
}

export function TourOverlay({ onComplete }: TourOverlayProps) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState<TourStep | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const spotlightAnim = useRef(new Animated.Value(0)).current;

  // Subscribe to tour manager
  useEffect(() => {
    const unsubscribe = tourManager.addListener((tour, step) => {
      setActiveTour(tour);
      setCurrentStep(step);
      setProgress(tourManager.getProgress());

      if (tour && step) {
        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(spotlightAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();

        hapticPatterns.lightTouch();
      } else {
        // Animate out
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete?.();
        });
      }
    });

    return () => { unsubscribe(); };
  }, []);

  const handleNext = () => {
    hapticPatterns.lightTouch();
    const hasNext = tourManager.nextStep();
    if (!hasNext) {
      // Tour completed
      onComplete?.();
    }
  };

  const handleBack = () => {
    hapticPatterns.lightTouch();
    tourManager.previousStep();
  };

  const handleSkip = () => {
    hapticPatterns.impactMedium();
    tourManager.skipTour();
  };

  if (!activeTour || !currentStep) return null;

  const isFirstStep = progress.current === 1;
  const isLastStep = progress.current === progress.total;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Dark overlay with spotlight effect */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.darkOverlay} />
        {currentStep.targetElement && (
          <Animated.View
            style={[
              styles.spotlight,
              {
                opacity: spotlightAnim,
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Tooltip content */}
      <Animated.View
        style={[
          styles.tooltipContainer,
          getTooltipPosition(currentStep.position),
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        <BlurView intensity={90} tint="dark" style={styles.tooltip}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.2)', 'rgba(67, 56, 202, 0.2)']}
            style={styles.tooltipGradient}
          >
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressDots}>
                {Array.from({ length: progress.total }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index + 1 <= progress.current && styles.progressDotActive,
                    ]}
                  />
                ))}
              </View>
              {currentStep.dismissable && (
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Title */}
            <Text style={styles.title}>{currentStep.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{currentStep.description}</Text>

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              {!isFirstStep && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}

              <View style={styles.buttonSpacer} />

              {currentStep.action ? (
                <TouchableOpacity
                  onPress={() => {
                    currentStep.action?.onPress();
                    handleNext();
                  }}
                  style={styles.primaryButton}
                >
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={styles.primaryButtonText}>
                      {currentStep.action.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleNext} style={styles.primaryButton}>
                  <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isLastStep ? 'Finish' : 'Next →'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </View>
  );
}

function getTooltipPosition(position?: string) {
  switch (position) {
    case 'top':
      return { top: 100, left: 20, right: 20 };
    case 'bottom':
      return { bottom: 100, left: 20, right: 20 };
    case 'left':
      return { left: 20, top: SCREEN_HEIGHT / 2 - 150, width: SCREEN_WIDTH * 0.7 };
    case 'right':
      return { right: 20, top: SCREEN_HEIGHT / 2 - 150, width: SCREEN_WIDTH * 0.7 };
    case 'center':
    default:
      return {
        top: SCREEN_HEIGHT / 2 - 150,
        left: 20,
        right: 20,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  spotlight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: SCREEN_HEIGHT / 2 - 100,
    left: SCREEN_WIDTH / 2 - 100,
  },
  tooltipContainer: {
    position: 'absolute',
  },
  tooltip: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  tooltipGradient: {
    padding: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#6366F1',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonSpacer: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
