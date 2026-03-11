import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { AttentionAvatar } from '@/components/AttentionAvatar';
import { useAttentionAvatar } from '@/contexts/AttentionAvatarContext';
import * as Haptics from 'expo-haptics';

interface AvatarNamingProps {
  onNext: () => void;
}

const SUGGESTED_NAMES = [
  'Spark', 'Ember', 'Glow', 'Focus', 'Zen',
  'Nova', 'Pulse', 'Aura', 'Echo', 'Flux',
];

export function AvatarNaming({ onNext }: AvatarNamingProps) {
  const { avatarState, updateName } = useAttentionAvatar();
  const [customName, setCustomName] = useState(avatarState.name || '');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const handleNameSelect = async (name: string) => {
    setCustomName(name);
    setSelectedSuggestion(name);
    await updateName(name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCustomNameChange = (text: string) => {
    setCustomName(text);
    setSelectedSuggestion(null);
  };

  const handleContinue = async () => {
    const finalName = customName.trim() || 'Spark';
    await updateName(finalName);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Avatar Display */}
        <View style={styles.avatarContainer}>
          <AttentionAvatar size="large" showParticles={true} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Meet Your Attention Companion</Text>
        <Text style={styles.subtitle}>
          This companion will grow with you on your attention journey.
          Give it a name!
        </Text>

        {/* Suggested Names */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Quick picks:</Text>
          <View style={styles.suggestionsGrid}>
            {SUGGESTED_NAMES.map((name) => (
              <TouchableOpacity
                key={name}
                style={[
                  styles.suggestionChip,
                  selectedSuggestion === name && styles.suggestionChipSelected,
                ]}
                onPress={() => handleNameSelect(name)}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    selectedSuggestion === name && styles.suggestionTextSelected,
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Or create your own:</Text>
          <TextInput
            style={styles.input}
            value={customName}
            onChangeText={handleCustomNameChange}
            placeholder="Enter a name..."
            placeholderTextColor="#64748B"
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Preview */}
        {customName && (
          <View style={styles.preview}>
            <Text style={styles.previewText}>
              Your companion: <Text style={styles.previewName}>{customName}</Text>
            </Text>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !customName && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!customName}
        >
          <Text style={styles.continueButtonText}>
            Continue with {customName || 'this name'} ✨
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleContinue}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  suggestionChipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#6366F1',
  },
  suggestionText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  suggestionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  preview: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  previewText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  previewName: {
    color: '#818CF8',
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
});
























