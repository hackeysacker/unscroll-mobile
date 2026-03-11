import { createContext, useContext, type ReactNode } from 'react';
import type { AvatarEvolutionStage, AvatarMood, AvatarReaction } from '@/types';

export const EVOLUTION_STAGES: AvatarEvolutionStage[] = [
  'spark',
  'ember',
  'orb',
  'sprite',
  'guardian',
  'sentinel',
  'master',
  'transcendent',
];

interface Avatar {
  evolutionStage: AvatarEvolutionStage;
  mood: AvatarMood;
  name?: string;
}

interface AvatarContextType {
  avatar: Avatar;
  currentReaction: AvatarReaction | null;
  getSkinColors: () => { primary: string; secondary: string; accent: string };
  triggerReaction: (reaction: AvatarReaction) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: ReactNode }) {
  const defaultAvatar: Avatar = {
    evolutionStage: 'spark',
    mood: 'neutral',
  };

  const contextValue: AvatarContextType = {
    avatar: defaultAvatar,
    currentReaction: null,
    getSkinColors: () => ({
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#c4b5fd',
    }),
    triggerReaction: () => {},
  };

  return <AvatarContext.Provider value={contextValue}>{children}</AvatarContext.Provider>;
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within AvatarProvider');
  }
  return context;
}
