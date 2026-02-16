import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, GoalType, OnboardingData } from '@/types';
import { STORAGE_KEYS, saveToStorage, loadFromStorage, clearAllStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileUpdate {
  displayName?: string;
  avatarEmoji?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isOnboarded: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  completeOnboarding: (goal: GoalType) => Promise<void>;
  updateOnboardingData: (data: Partial<OnboardingData>) => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  // Legacy support
  login: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to app User type
  const convertSupabaseUser = (supabaseUser: SupabaseUser, profile?: any): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    createdAt: new Date(supabaseUser.created_at).getTime(),
    goal: profile?.goal,
    isPremium: profile?.is_premium ?? true,
    onboardingData: undefined,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession?.user && mounted) {
          setSession(currentSession);

          // Fetch profile from database
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          // Check onboarding status
          const { data: onboarding } = await supabase
            .from('user_onboarding')
            .select('completed_at')
            .eq('user_id', currentSession.user.id)
            .single();

          const appUser = convertSupabaseUser(currentSession.user, profile);
          setUser(appUser);
          setIsOnboarded(!!profile?.goal || !!onboarding?.completed_at);

          // Cache locally
          await saveToStorage(STORAGE_KEYS.USER, appUser);
        } else if (mounted) {
          // No session, try loading from local storage (offline support)
          const savedUser = await loadFromStorage<User>(STORAGE_KEYS.USER);
          if (savedUser) {
            setUser(savedUser);
            setIsOnboarded(!!savedUser.goal);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Fallback to local storage
        const savedUser = await loadFromStorage<User>(STORAGE_KEYS.USER);
        if (savedUser && mounted) {
          setUser(savedUser);
          setIsOnboarded(!!savedUser.goal);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newSession.user.id)
          .single();

        const { data: onboarding } = await supabase
          .from('user_onboarding')
          .select('completed_at')
          .eq('user_id', newSession.user.id)
          .single();

        const appUser = convertSupabaseUser(newSession.user, profile);
        setUser(appUser);
        setIsOnboarded(!!profile?.goal || !!onboarding?.completed_at);
        await saveToStorage(STORAGE_KEYS.USER, appUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsOnboarded(false);
        await clearAllStorage();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsOnboarded(false);
    await clearAllStorage();
  };

  // Legacy login - creates anonymous local user
  const login = async (email?: string) => {
    // If email provided, try to sign in or sign up
    if (email) {
      // For now, just create local user - actual auth requires password
      const newUser: User = {
        id: crypto.randomUUID?.() || `local-${Date.now()}`,
        email,
        createdAt: Date.now(),
        goal: undefined,
        isPremium: true,
      };
      setUser(newUser);
      await saveToStorage(STORAGE_KEYS.USER, newUser);
    }
  };

  // Legacy logout
  const logout = async () => {
    await signOut();
  };

  const completeOnboarding = async (goal: GoalType) => {
    if (!user) return;

    const updatedUser = { ...user, goal };
    setUser(updatedUser);
    setIsOnboarded(true);
    await saveToStorage(STORAGE_KEYS.USER, updatedUser);

    // Sync to Supabase if authenticated
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ goal, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);

      await supabase
        .from('user_onboarding')
        .upsert({
          user_id: session.user.id,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
  };

  const updateOnboardingData = async (data: Partial<OnboardingData>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      onboardingData: {
        ...user.onboardingData,
        ...data,
      },
    };
    setUser(updatedUser);
    await saveToStorage(STORAGE_KEYS.USER, updatedUser);

    // Sync to Supabase if authenticated
    if (session?.user) {
      const onboardingUpdate: Record<string, any> = {
        user_id: session.user.id,
        updated_at: new Date().toISOString(),
      };

      // Map onboarding data fields
      if (data.dailyScrollHours !== undefined) onboardingUpdate.daily_scroll_hours = data.dailyScrollHours;
      if (data.primaryDistractionApp !== undefined) onboardingUpdate.primary_distraction_app = data.primaryDistractionApp;
      if (data.worstScrollTime !== undefined) onboardingUpdate.worst_scroll_time = data.worstScrollTime;
      if (data.improvementReason !== undefined) onboardingUpdate.improvement_reason = data.improvementReason;
      if (data.wantsAutoTracking !== undefined) onboardingUpdate.wants_auto_tracking = data.wantsAutoTracking;
      if (data.baselineScore !== undefined) onboardingUpdate.baseline_score = data.baselineScore;
      if (data.goalResult !== undefined) onboardingUpdate.goal_result = data.goalResult;
      if (data.dailyTrainingMinutes !== undefined) onboardingUpdate.daily_training_minutes = data.dailyTrainingMinutes;
      if (data.personalityType !== undefined) onboardingUpdate.personality_type = data.personalityType;
      if (data.notificationsAccepted !== undefined) onboardingUpdate.notifications_accepted = data.notificationsAccepted;
      if (data.screentimeAccepted !== undefined) onboardingUpdate.screentime_accepted = data.screentimeAccepted;
      if (data.dailyCheckinAccepted !== undefined) onboardingUpdate.daily_checkin_accepted = data.dailyCheckinAccepted;

      await supabase
        .from('user_onboarding')
        .upsert(onboardingUpdate);
    }
  };

  const updateProfile = async (data: ProfileUpdate) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...data,
    };
    setUser(updatedUser);
    await saveToStorage(STORAGE_KEYS.USER, updatedUser);

    // Sync to Supabase if authenticated
    if (session?.user) {
      const profileUpdate: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (data.displayName !== undefined) profileUpdate.display_name = data.displayName;
      if (data.avatarEmoji !== undefined) profileUpdate.avatar_emoji = data.avatarEmoji;

      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', session.user.id);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;

    const updatedUser = { ...user, isPremium: true };
    setUser(updatedUser);
    await saveToStorage(STORAGE_KEYS.USER, updatedUser);

    // Sync to Supabase if authenticated
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ is_premium: true, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
    }
  };

  const resetOnboarding = async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      goal: undefined,
      onboardingData: undefined,
    };
    setUser(updatedUser);
    setIsOnboarded(false);
    await saveToStorage(STORAGE_KEYS.USER, updatedUser);

    // Sync to Supabase if authenticated
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ goal: null, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);

      await supabase
        .from('user_onboarding')
        .delete()
        .eq('user_id', session.user.id);
    }
  };

  // Show loading state while initializing
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isOnboarded,
        isLoading,
        signUp,
        signIn,
        signOut,
        completeOnboarding,
        updateOnboardingData,
        updateProfile,
        upgradeToPremium,
        resetOnboarding,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
