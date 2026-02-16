import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Button } from '@/components/ui/Button';
import type { OnboardingData } from '@/types';

interface HabitGraphProps {
  onboardingData: Partial<OnboardingData>;
  onNext: () => void;
}

interface HabitMetric {
  label: string;
  value: 'high' | 'moderate' | 'low';
  percentage: number;
}

export function HabitGraph({ onboardingData, onNext }: HabitGraphProps) {
  const [showGraph, setShowGraph] = useState(false);
  const animatedValues = useRef<Animated.Value[]>([]);

  const getHabitMetrics = (): HabitMetric[] => {
    const metrics: HabitMetric[] = [];

    // Night scrolling intensity
    if (onboardingData.worstScrollTime === 'late_night' || onboardingData.worstScrollTime === 'evenings') {
      metrics.push({ label: 'Night scrolling', value: 'high', percentage: 85 });
    } else if (onboardingData.worstScrollTime === 'morning_bed') {
      metrics.push({ label: 'Night scrolling', value: 'low', percentage: 25 });
    } else {
      metrics.push({ label: 'Night scrolling', value: 'moderate', percentage: 50 });
    }

    // App usage
    const appLabel = onboardingData.primaryDistractionApp === 'tiktok' ? 'TikTok usage' :
      onboardingData.primaryDistractionApp === 'instagram' ? 'Instagram usage' :
      onboardingData.primaryDistractionApp === 'youtube' ? 'YouTube usage' :
      onboardingData.primaryDistractionApp === 'snapchat' ? 'Snapchat usage' :
      'App usage';

    if ((onboardingData.dailyScrollHours || 0) >= 4) {
      metrics.push({ label: appLabel, value: 'high', percentage: 90 });
    } else if ((onboardingData.dailyScrollHours || 0) >= 2) {
      metrics.push({ label: appLabel, value: 'moderate', percentage: 60 });
    } else {
      metrics.push({ label: appLabel, value: 'low', percentage: 30 });
    }

    // Morning control
    if (onboardingData.worstScrollTime === 'morning_bed') {
      metrics.push({ label: 'Morning control', value: 'low', percentage: 20 });
    } else if (onboardingData.worstScrollTime === 'work_breaks' || onboardingData.worstScrollTime === 'after_school') {
      metrics.push({ label: 'Morning control', value: 'moderate', percentage: 55 });
    } else {
      metrics.push({ label: 'Morning control', value: 'high', percentage: 80 });
    }

    return metrics;
  };

  const metrics = getHabitMetrics();

  useEffect(() => {
    const timer = setTimeout(() => setShowGraph(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Initialize animated values
    if (animatedValues.current.length === 0) {
      metrics.forEach(() => {
        animatedValues.current.push(new Animated.Value(0));
      });
    }

    // Animate bars when graph is shown
    if (showGraph) {
      animatedValues.current.forEach((animValue, index) => {
        Animated.timing(animValue, {
          toValue: metrics[index].percentage,
          duration: 1000,
          delay: index * 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [showGraph, metrics.length]);

  const getBarColor = (value: 'high' | 'moderate' | 'low') => {
    switch (value) {
      case 'high':
        return '#ef4444';
      case 'moderate':
        return '#f59e0b';
      case 'low':
        return '#6366f1';
    }
  };

  const getValueLabel = (value: 'high' | 'moderate' | 'low') => {
    switch (value) {
      case 'high':
        return 'High';
      case 'moderate':
        return 'Moderate';
      case 'low':
        return 'Low';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Attention Profile</Text>
          <Text style={styles.subtitle}>
            This is your starting baseline. It will update as you improve.
          </Text>
        </View>

        <View style={styles.graphContainer}>
          {metrics.map((metric, index) => {
            const barColor = getBarColor(metric.value);
            const animValue = animatedValues.current[index] || new Animated.Value(0);
            const width = animValue.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            });

            return (
              <View key={index} style={styles.metricRow}>
                <View style={styles.metricLabel}>
                  <Text style={styles.metricText}>{metric.label}</Text>
                  <View style={[styles.valueBadge, { backgroundColor: barColor + '20' }]}>
                    <Text style={[styles.valueText, { color: barColor }]}>
                      {getValueLabel(metric.value)}
                    </Text>
                  </View>
                </View>
                <View style={styles.barContainer}>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        width: width,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't worry if these look high. FocusFlow will help you improve.
          </Text>
          <Button onPress={onNext} size="lg" style={styles.button}>
            Continue
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: '33%',
    left: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 100,
  },
  orb2: {
    position: 'absolute',
    bottom: '33%',
    right: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 100,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  graphContainer: {
    gap: 24,
    marginBottom: 32,
  },
  metricRow: {
    gap: 12,
  },
  metricLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  valueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barContainer: {
    height: 12,
    backgroundColor: '#1f2937',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
    minWidth: 0,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
});

