import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { AttentionAvatar } from './AttentionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { AVATAR_EVOLUTIONS, type AvatarStage } from '@/lib/avatar-evolution';
import * as Haptics from 'expo-haptics';

interface AvatarEvolutionModalProps {
  visible: boolean;
  newStage: AvatarStage;
  onClose: () => void;
}

/**
 * Modal that celebrates avatar evolution
 * Shows the new form with an animation and message
 */
export function AvatarEvolutionModal({ visible, newStage, onClose }: AvatarEvolutionModalProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const evolution = AVATAR_EVOLUTIONS[newStage];

  useEffect(() => {
    if (visible) {
      // Haptic celebration
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Animation sequence
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { backgroundColor: colors.card },
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Celebration particles */}
          <View style={styles.celebration}>
            <Text style={styles.celebrationEmoji}>✨</Text>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationEmoji}>⭐</Text>
            <Text style={styles.celebrationEmoji}>💫</Text>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            Evolution!
          </Text>
          
          <View style={styles.avatarContainer}>
            <AttentionAvatar size="large" showParticles={true} />
          </View>

          <View style={styles.evolutionInfo}>
            <Text style={styles.stageName}>{evolution.emoji} {evolution.name}</Text>
            <Text style={[styles.stageDescription, { color: colors.mutedForeground }]}>
              {evolution.description}
            </Text>
            <Text style={[styles.unlockMessage, { color: evolution.colors.primary }]}>
              {evolution.unlockMessage}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              Amazing! ✨
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  celebration: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  celebrationEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  avatarContainer: {
    marginVertical: 32,
  },
  evolutionInfo: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  stageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  stageDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  unlockMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
























