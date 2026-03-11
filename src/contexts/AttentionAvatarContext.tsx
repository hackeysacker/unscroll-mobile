import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useGame } from './GameContext';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '@/lib/storage';
import { 
  getAvatarStage, 
  getEvolutionProgress, 
  determineAvatarMood,
  shouldShowEffect,
  type AvatarState, 
  type AvatarStage, 
  type AvatarMood,
  type AvatarSkin,
  AVATAR_EVOLUTIONS,
} from '@/lib/avatar-evolution';
import * as Haptics from 'expo-haptics';

interface AttentionAvatarContextValue {
  avatarState: AvatarState;
  currentEvolution: ReturnType<typeof AVATAR_EVOLUTIONS[AvatarStage]>;
  updateMood: (mood: AvatarMood) => void;
  updateName: (name: string) => Promise<void>;
  triggerReaction: (reaction: 'success' | 'failure' | 'milestone' | 'evolution') => void;
  changeSkin: (skin: AvatarSkin) => Promise<void>;
  unlockCustomization: (type: 'wings' | 'crown' | 'aura') => Promise<void>;
}

const AttentionAvatarContext = createContext<AttentionAvatarContextValue | null>(null);

export function useAttentionAvatar() {
  const context = useContext(AttentionAvatarContext);
  if (!context) {
    throw new Error('useAttentionAvatar must be used within AttentionAvatarProvider');
  }
  return context;
}

export function AttentionAvatarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { progress, heartState, stats } = useGame();
  
  const [avatarState, setAvatarState] = useState<AvatarState>({
    stage: 'spark',
    mood: 'idle',
    skin: 'default',
    name: 'Spark', // Default name
    lastInteraction: Date.now(),
    evolutionProgress: 0,
    customizations: {
      hasWings: false,
      hasCrown: false,
      hasAura: false,
      particleEffect: 'none',
    },
  });

  const previousStageRef = useRef<AvatarStage>('spark');

  // Load avatar state from storage
  useEffect(() => {
    if (!user) return;

    const loadAvatarState = async () => {
      const saved = await loadFromStorage<AvatarState>(`${STORAGE_KEYS.AVATAR_STATE}_${user.id}`);
      if (saved) {
        setAvatarState(saved);
        previousStageRef.current = saved.stage;
      }
    };

    loadAvatarState();
  }, [user]);

  // Update avatar based on progress
  useEffect(() => {
    if (!progress || !heartState) return;

    const newStage = getAvatarStage(progress.level);
    const evolutionProgress = getEvolutionProgress(progress.level);
    
    const mood = determineAvatarMood({
      hearts: heartState.currentHearts,
      maxHearts: heartState.maxHearts,
      streak: progress.streak,
      lastSessionTime: stats?.lastSessionTimestamp,
      recentPerformance: stats?.averageAccuracy,
    });

    const effect = shouldShowEffect({
      streak: progress.streak,
      recentAchievement: false, // TODO: Track recent achievements
      isPremium: user?.isPremium,
    });

    // Check if avatar evolved
    if (newStage !== previousStageRef.current) {
      triggerReaction('evolution');
      previousStageRef.current = newStage;
    }

    setAvatarState(prev => {
      const updated = {
        ...prev,
        stage: newStage,
        mood,
        evolutionProgress,
        lastInteraction: Date.now(),
        customizations: {
          ...prev.customizations,
          particleEffect: effect.show ? effect.effect : 'none',
        },
      };

      // Save to storage
      if (user) {
        saveToStorage(`${STORAGE_KEYS.AVATAR_STATE}_${user.id}`, updated);
      }

      return updated;
    });
  }, [progress, heartState, stats, user]);

  const updateMood = (mood: AvatarMood) => {
    setAvatarState(prev => ({ ...prev, mood }));
  };

  const updateName = async (name: string) => {
    setAvatarState(prev => {
      const updated = { ...prev, name };
      if (user) {
        saveToStorage(`${STORAGE_KEYS.AVATAR_STATE}_${user.id}`, updated);
      }
      return updated;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const triggerReaction = (reaction: 'success' | 'failure' | 'milestone' | 'evolution') => {
    // Haptic feedback
    switch (reaction) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateMood('happy');
        break;
      case 'failure':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        updateMood('sad');
        break;
      case 'milestone':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateMood('celebrating');
        break;
      case 'evolution':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        updateMood('excited');
        // Reset to happy after celebration
        setTimeout(() => updateMood('happy'), 3000);
        break;
    }

    // Reset to idle after reaction
    if (reaction !== 'evolution') {
      setTimeout(() => updateMood('idle'), 2000);
    }
  };

  const changeSkin = async (skin: AvatarSkin) => {
    setAvatarState(prev => {
      const updated = { ...prev, skin };
      if (user) {
        saveToStorage(`${STORAGE_KEYS.AVATAR_STATE}_${user.id}`, updated);
      }
      return updated;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const unlockCustomization = async (type: 'wings' | 'crown' | 'aura') => {
    setAvatarState(prev => {
      const updated = {
        ...prev,
        customizations: {
          ...prev.customizations,
          hasWings: type === 'wings' ? true : prev.customizations.hasWings,
          hasCrown: type === 'crown' ? true : prev.customizations.hasCrown,
          hasAura: type === 'aura' ? true : prev.customizations.hasAura,
        },
      };
      if (user) {
        saveToStorage(`${STORAGE_KEYS.AVATAR_STATE}_${user.id}`, updated);
      }
      return updated;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const currentEvolution = AVATAR_EVOLUTIONS[avatarState.stage];

  return (
    <AttentionAvatarContext.Provider
      value={{
        avatarState,
        currentEvolution,
        updateMood,
        updateName,
        triggerReaction,
        changeSkin,
        unlockCustomization,
      }}
    >
      {children}
    </AttentionAvatarContext.Provider>
  );
}

