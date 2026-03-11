import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { generateUUID } from '@/lib/utils';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/lib/storage';
import type { WindDownSession, WindDownSettings } from '@/types';

interface WindDownModeProps {
  onBack: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATH_PATTERNS = {
  box: { inhale: 4, hold: 4, exhale: 4, rest: 4, name: 'Box Breathing', description: 'Equal 4-second intervals for balance' },
  relaxing: { inhale: 4, hold: 2, exhale: 6, rest: 2, name: 'Relaxing Breath', description: 'Longer exhales for calm' },
  sleep: { inhale: 4, hold: 7, exhale: 8, rest: 0, name: '4-7-8 Sleep Breath', description: 'Dr. Weil\'s technique for sleep' },
};

export function WindDownMode({ onBack }: WindDownModeProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [settings, setSettings] = useState<WindDownSettings | null>(null);
  const [currentSession, setCurrentSession] = useState<WindDownSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<number | undefined>(undefined);
  const prevPhaseRef = useRef<BreathPhase>('inhale');

  useEffect(() => {
    if (!user) return;

    const savedSettings = loadFromStorage<WindDownSettings>(STORAGE_KEYS.WIND_DOWN_SETTINGS);
    if (savedSettings && savedSettings.userId === user.id) {
      setSettings(savedSettings);
    } else {
      const defaultSettings: WindDownSettings = {
        userId: user.id,
        enabled: true,
        duration: 10,
        breathingPattern: 'relaxing',
      };
      setSettings(defaultSettings);
      saveToStorage(STORAGE_KEYS.WIND_DOWN_SETTINGS, defaultSettings);
    }
  }, [user]);

  useEffect(() => {
    if (!isActive || !settings) return;

    const pattern = BREATH_PATTERNS[settings.breathingPattern];
    const phases: BreathPhase[] = ['inhale', 'hold', 'exhale'];
    if (pattern.rest > 0) phases.push('rest');

    let startTime = Date.now();
    let currentPhaseIndex = 0;
    let currentPhaseName = phases[0];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const phaseDuration = pattern[currentPhaseName] * 1000;
      const progress = Math.min(100, (elapsed / phaseDuration) * 100);

      setPhaseProgress(progress);
      setSessionTime(prev => prev + 16);

      // Animate circle scale
      let targetScale = 0.5;
      if (currentPhaseName === 'inhale') {
        targetScale = 0.5 + (progress / 100) * 0.5;
      } else if (currentPhaseName === 'hold') {
        targetScale = 1;
      } else if (currentPhaseName === 'exhale') {
        targetScale = 1 - (progress / 100) * 0.5;
      } else {
        targetScale = 0.5;
      }

      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: 16,
        useNativeDriver: true,
      }).start();

      if (progress >= 100) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        currentPhaseName = phases[currentPhaseIndex];
        setCurrentPhase(currentPhaseName);
        startTime = Date.now();

        if (currentPhaseName === 'inhale') {
          setBreathCount(prev => prev + 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, settings]);

  const startSession = () => {
    if (!user || !settings) return;

    const session: WindDownSession = {
      id: generateUUID(),
      userId: user.id,
      startedAt: Date.now(),
      duration: 0,
      breathingExercises: 0,
      completed: false,
    };

    setCurrentSession(session);
    setIsActive(true);
    setBreathCount(0);
    setSessionTime(0);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const completeSession = async () => {
    if (!currentSession || !user) return;

    const completedSession: WindDownSession = {
      ...currentSession,
      completedAt: Date.now(),
      duration: sessionTime,
      breathingExercises: breathCount,
      completed: true,
    };

    const allSessions = loadFromStorage<WindDownSession[]>(STORAGE_KEYS.WIND_DOWN_SESSIONS) || [];
    allSessions.push(completedSession);
    await saveToStorage(STORAGE_KEYS.WIND_DOWN_SESSIONS, allSessions);

    // Sync to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      db.saveWindDownSession(user.id, {
        duration: sessionTime,
        exercises_completed: breathCount > 0 ? ['breathing'] : [],
      }).catch((error) => {
        console.error('Failed to sync wind down session to Supabase:', error);
      });
    }

    setCurrentSession(null);
    setIsActive(false);
    setBreathCount(0);
    setSessionTime(0);
  };

  const changePattern = async (pattern: 'box' | 'relaxing' | 'sleep') => {
    if (!user || !settings) return;

    const newSettings = { ...settings, breathingPattern: pattern };
    setSettings(newSettings);
    await saveToStorage(STORAGE_KEYS.WIND_DOWN_SETTINGS, newSettings);

    // Sync to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      db.updateWindDownSettings(user.id, {
        preferred_exercises: [pattern],
      }).catch((error) => {
        console.error('Failed to sync wind down settings to Supabase:', error);
      });
    }

    if (isActive) {
      setIsActive(false);
      setPhaseProgress(0);
    }
  };

  if (!user?.isPremium) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Card style={styles.card}>
          <Text style={styles.premiumText}>Wind-Down Mode is a premium feature.</Text>
        </Card>
      </ScrollView>
    );
  }

  if (!settings) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading...</Text>
      </View>
    );
  }

  const pattern = BREATH_PATTERNS[settings.breathingPattern];
  const targetBreaths = Math.floor((settings.duration * 60 * 1000) / ((pattern.inhale + pattern.hold + pattern.exhale + pattern.rest) * 1000));
  const sessionProgress = targetBreaths > 0 ? (breathCount / targetBreaths) * 100 : 0;

  const getPhaseColor = (phase: BreathPhase) => {
    switch (phase) {
      case 'inhale': return '#60a5fa';
      case 'hold': return '#a78bfa';
      case 'exhale': return '#34d399';
      case 'rest': return '#6b7280';
    }
  };

  // Animate color transitions smoothly
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      // Reset animation and smoothly transition to new color
      colorAnim.setValue(0);
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 800,
        easing: Animated.Easing.inOut(Animated.Easing.ease),
        useNativeDriver: false, // backgroundColor doesn't support native driver
      }).start();
      prevPhaseRef.current = currentPhase;
    }
  }, [currentPhase, colorAnim]);

  const animatedPhaseColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [getPhaseColor(prevPhaseRef.current), getPhaseColor(currentPhase)],
  });

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Wind-Down Mode</Text>
        <Text style={styles.subtitle}>Guided breathing for relaxation</Text>
      </View>

      {/* Pattern Selection */}
      {!isActive && (
        <View style={styles.patternSection}>
          <Text style={styles.sectionTitle}>Breathing Pattern</Text>
          <View style={styles.patternGrid}>
            {Object.entries(BREATH_PATTERNS).map(([key, pattern]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.patternCard,
                  settings.breathingPattern === key && styles.patternCardActive,
                ]}
                onPress={() => changePattern(key as any)}
              >
                <Text style={styles.patternName}>{pattern.name}</Text>
                <Text style={styles.patternDescription}>{pattern.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Breathing Circle */}
      <View style={styles.breathingContainer}>
        <Animated.View
          style={[
            styles.breathCircle,
            {
              backgroundColor: animatedPhaseColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
          <Text style={styles.phaseTime}>
            {Math.ceil((pattern[currentPhase] * 1000 - (phaseProgress / 100) * pattern[currentPhase] * 1000) / 1000)}s
          </Text>
        </Animated.View>
      </View>

      {/* Session Stats */}
      {isActive && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{breathCount}</Text>
            <Text style={styles.statLabel}>Breaths</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.floor(sessionTime / 1000 / 60)}m</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {!isActive && !currentSession && (
          <Button onPress={startSession} size="lg" style={styles.button}>
            Start Session
          </Button>
        )}
        {isActive && (
          <>
            <Button onPress={pauseSession} size="lg" style={styles.button}>
              Pause
            </Button>
            <Button onPress={completeSession} size="lg" style={[styles.button, styles.completeButton]}>
              Complete
            </Button>
          </>
        )}
        {!isActive && currentSession && (
          <Button onPress={resumeSession} size="lg" style={styles.button}>
            Resume
          </Button>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030712',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 16,
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
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  patternSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  patternGrid: {
    gap: 12,
  },
  patternCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  patternCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  patternName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  patternDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    minHeight: 300,
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  phaseTime: {
    fontSize: 18,
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  controlsContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});

