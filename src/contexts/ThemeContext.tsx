import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { Animated } from 'react-native';
import type { ThemeType, UserTheme } from '@/types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/lib/storage';
import { useAuth } from './AuthContext';
import * as db from '@/lib/database';
import { getThemeColors, type ThemeColors } from '@/lib/theme-colors';
import * as Haptics from 'expo-haptics';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => Promise<void>;
  availableThemes: ThemeType[];
  colors: ThemeColors;
  isTransitioning: boolean;
  fadeAnim: Animated.Value;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ALL_THEMES: ThemeType[] = [
  'noir-cinema',
  'tokyo-neon',
  'aura-glass',
  'paper-craft',
  'arctic-aurora',
  'rose-quartz',
  'matcha-zen',
  'cosmic-void',
];

const DEFAULT_THEME: ThemeType = 'noir-cinema';

// Helper to validate and migrate old theme names to new ones
function validateTheme(themeName: string): ThemeType {
  if (ALL_THEMES.includes(themeName as ThemeType)) {
    return themeName as ThemeType;
  }
  // Old theme -> new theme migration
  return DEFAULT_THEME;
}

// Filter available themes to only include valid ones
function validateAvailableThemes(themes: string[]): ThemeType[] {
  const valid = themes.filter(t => ALL_THEMES.includes(t as ThemeType)) as ThemeType[];
  return valid.length > 0 ? valid : [DEFAULT_THEME];
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [theme, setThemeState] = useState<ThemeType>('noir-cinema');
  const [availableThemes, setAvailableThemes] = useState<ThemeType[]>(['noir-cinema']);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevThemeRef = useRef<ThemeType>('noir-cinema');

  useEffect(() => {
    async function loadTheme() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to load from Supabase first if authenticated
        if (session) {
          const supabaseTheme = await db.getUserTheme(user.id);
          if (supabaseTheme) {
            // Validate theme name (migrate old themes to new ones)
            const validTheme = validateTheme(supabaseTheme.theme_name);
            setThemeState(validTheme);
            const unlocked = user.isPremium ? ALL_THEMES : [DEFAULT_THEME];
            setAvailableThemes(unlocked);

            // Update local storage with validated theme
            const localTheme: UserTheme = {
              userId: user.id,
              selectedTheme: validTheme,
              unlocked,
            };
            await saveToStorage(STORAGE_KEYS.USER_THEME, localTheme);
            
            // If theme was migrated, sync back to Supabase
            if (validTheme !== supabaseTheme.theme_name) {
              db.updateUserTheme(user.id, { theme_name: validTheme });
            }
            
            setIsLoading(false);
            return;
          }
        }

        // Fall back to local storage
        const savedTheme = await loadFromStorage<UserTheme>(STORAGE_KEYS.USER_THEME);

        if (savedTheme && savedTheme.userId === user.id) {
          // Validate saved theme (migrate old themes to new ones)
          const validTheme = validateTheme(savedTheme.selectedTheme);
          const validUnlocked = validateAvailableThemes(savedTheme.unlocked);
          
          setThemeState(validTheme);
          setAvailableThemes(user.isPremium ? ALL_THEMES : validUnlocked);
          
          // Update storage if theme was migrated
          if (validTheme !== savedTheme.selectedTheme) {
            const updatedTheme: UserTheme = {
              ...savedTheme,
              selectedTheme: validTheme,
              unlocked: user.isPremium ? ALL_THEMES : validUnlocked,
            };
            await saveToStorage(STORAGE_KEYS.USER_THEME, updatedTheme);
          }
        } else {
          // Create default theme settings
          const defaultTheme: UserTheme = {
            userId: user.id,
            selectedTheme: DEFAULT_THEME,
            unlocked: user.isPremium ? ALL_THEMES : [DEFAULT_THEME],
          };
          await saveToStorage(STORAGE_KEYS.USER_THEME, defaultTheme);
          setThemeState(defaultTheme.selectedTheme);
          setAvailableThemes(defaultTheme.unlocked);

          // Sync to Supabase
          if (session) {
            db.updateUserTheme(user.id, {
              theme_name: defaultTheme.selectedTheme,
            });
          }
        }

        // Update theme when premium status changes
        if (user.isPremium) {
          const currentTheme = await loadFromStorage<UserTheme>(STORAGE_KEYS.USER_THEME);
          if (currentTheme && currentTheme.unlocked.length < ALL_THEMES.length) {
            const updatedTheme: UserTheme = {
              ...currentTheme,
              selectedTheme: validateTheme(currentTheme.selectedTheme),
              unlocked: ALL_THEMES,
            };
            await saveToStorage(STORAGE_KEYS.USER_THEME, updatedTheme);
            setAvailableThemes(ALL_THEMES);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // On error, set defaults
        setThemeState(DEFAULT_THEME);
        setAvailableThemes([DEFAULT_THEME]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTheme();
  }, [user, session]);

  const setTheme = async (newTheme: ThemeType) => {
    if (!user) return;
    if (!availableThemes.includes(newTheme)) return;
    if (newTheme === theme) return; // Already set

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Smooth theme transition with fade animation
    setIsTransitioning(true);
    prevThemeRef.current = theme;
    
    // Fade out smoothly
    Animated.timing(fadeAnim, {
      toValue: 0.2,
      duration: 300,
      easing: Animated.Easing.out(Animated.Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // Change theme
      setThemeState(newTheme);
      
      // Fade back in smoothly with new theme colors
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Animated.Easing.inOut(Animated.Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioning(false);
      });
    });

    const currentTheme = await loadFromStorage<UserTheme>(STORAGE_KEYS.USER_THEME);
    if (currentTheme) {
      const updatedTheme: UserTheme = {
        ...currentTheme,
        selectedTheme: newTheme,
      };
      await saveToStorage(STORAGE_KEYS.USER_THEME, updatedTheme);

      // Sync to Supabase
      if (session) {
        db.updateUserTheme(user.id, {
          theme_name: newTheme,
        });
      }
    }
  };

  // Get current theme colors
  const colors = getThemeColors(theme);

  // Show loading state while initializing
  if (isLoading) {
    return null; // Or return a loading component
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes, colors, isTransitioning, fadeAnim }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
