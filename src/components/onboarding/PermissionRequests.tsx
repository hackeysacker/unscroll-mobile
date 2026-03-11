import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import * as Notifications from 'expo-notifications';

interface PermissionRequestsProps {
  onComplete: (permissions: {
    notifications: boolean;
    screenTime: boolean;
    dailyCheckIn: boolean;
  }) => void;
}

type PermissionStep = 'notifications' | 'screenTime' | 'dailyCheckIn';

export function PermissionRequests({ onComplete }: PermissionRequestsProps) {
  const [currentStep, setCurrentStep] = useState<PermissionStep>('notifications');
  const [permissions, setPermissions] = useState({
    notifications: false,
    screenTime: false,
    dailyCheckIn: false,
  });

  const handleAllow = async () => {
    const newPermissions = { ...permissions };

    if (currentStep === 'notifications') {
      const { status } = await Notifications.requestPermissionsAsync();
      newPermissions.notifications = status === 'granted';
      setPermissions(newPermissions);
      setCurrentStep('screenTime');
    } else if (currentStep === 'screenTime') {
      // Screen time permission would be handled by native module
      newPermissions.screenTime = true;
      setPermissions(newPermissions);
      setCurrentStep('dailyCheckIn');
    } else {
      newPermissions.dailyCheckIn = true;
      onComplete(newPermissions);
    }
  };

  const handleSkip = () => {
    if (currentStep === 'notifications') {
      setCurrentStep('screenTime');
    } else if (currentStep === 'screenTime') {
      setCurrentStep('dailyCheckIn');
    } else {
      onComplete(permissions);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'notifications':
        return {
          emoji: '🔔',
          title: 'Enable Notifications',
          description: 'We remind you gently when your brain needs a break.',
          detail: 'Get helpful reminders to train daily and track your progress.',
        };
      case 'screenTime':
        return {
          emoji: '📱',
          title: 'Allow Screen Time Tracking',
          description: 'This lets us compare your training to your actual scrolling.',
          detail: 'See real data on how your habits improve over time.',
        };
      case 'dailyCheckIn':
        return {
          emoji: '📅',
          title: 'Daily Check-In',
          description: 'Quick 5 second mood and focus check every day.',
          detail: 'Help us personalize your experience and track your progress.',
        };
    }
  };

  const content = getStepContent();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Progress dots */}
      <View style={styles.progressDots}>
        <View
          style={[
            styles.dot,
            currentStep === 'notifications' && styles.dotActive,
          ]}
        />
        <View
          style={[
            styles.dot,
            currentStep === 'screenTime' && styles.dotActive,
          ]}
        />
        <View
          style={[
            styles.dot,
            currentStep === 'dailyCheckIn' && styles.dotActive,
          ]}
        />
      </View>

      {/* Permission card */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>{content.emoji}</Text>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>
        <Text style={styles.detail}>{content.detail}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button onPress={handleAllow} size="lg" style={styles.button}>
          Allow
        </Button>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
  dotActive: {
    backgroundColor: '#ffffff',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 8,
    textAlign: 'center',
  },
  detail: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  button: {
    width: '100%',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

