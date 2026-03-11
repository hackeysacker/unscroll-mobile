import { type ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AttentionAvatarProvider } from './contexts/AttentionAvatarContext';
import { ScrollTimeProvider } from './contexts/ScrollTimeContext';
import { ThemeWrapper } from './components/ThemeWrapper';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GameProvider>
        <AttentionAvatarProvider>
          <ScrollTimeProvider>
            <SettingsProvider>
              <ThemeProvider>
                <ThemeWrapper>
                  {children}
                </ThemeWrapper>
              </ThemeProvider>
            </SettingsProvider>
          </ScrollTimeProvider>
        </AttentionAvatarProvider>
      </GameProvider>
    </AuthProvider>
  );
}

