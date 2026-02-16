import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '@/hooks/useHaptics';
import { useSound } from '@/hooks/useSound';
import { Button } from '@/components/ui/Button';
import { ExerciseOverview, type ExerciseStats } from '@/components/ExerciseOverview';
import { BaseChallengeWrapper } from './BaseChallengeWrapper';
import { getChallengeConfig } from '@/lib/challenge-configs';

const { width, height } = Dimensions.get('window');

interface PopupIgnoreChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  level?: number;
}

type PopupType = 'modal' | 'banner' | 'corner' | 'fullscreen' | 'toast' | 'cookie' | 'subscription' | 'warning';

interface PopupContent {
  type: PopupType;
  title: string;
  message: string;
  buttonText: string;
  colors: string[];
  urgency: 'low' | 'medium' | 'high' | 'extreme';
  icon?: string;
  hasCloseButton?: boolean;
}

interface Popup {
  id: number;
  content: PopupContent;
  position: { x: number; y: number };
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
  shakeAnim: Animated.Value;
}

// Realistic intrusive popup library
const POPUP_LIBRARY: Record<PopupType, PopupContent[]> = {
  modal: [
    { type: 'modal', title: '🎁 Congratulations!', message: 'You\'ve won a FREE iPhone 15!', buttonText: 'CLAIM NOW', colors: ['#DC2626', '#EF4444'], urgency: 'extreme', hasCloseButton: false },
    { type: 'modal', title: '⚠️ Security Alert', message: 'Your device may be infected!', buttonText: 'Scan Now', colors: ['#DC2626', '#B91C1C'], urgency: 'extreme', hasCloseButton: true },
    { type: 'modal', title: '💰 Last Chance!', message: '90% OFF - Offer expires in 2 minutes', buttonText: 'Shop Now', colors: ['#EA580C', '#DC2626'], urgency: 'extreme', hasCloseButton: false },
    { type: 'modal', title: '📧 Email Verification', message: 'Please verify your email to continue', buttonText: 'Verify', colors: ['#2563EB', '#3B82F6'], urgency: 'high', hasCloseButton: true },
  ],
  banner: [
    { type: 'banner', title: '🍪 Cookies Required', message: 'We use cookies to improve your experience', buttonText: 'Accept All', colors: ['#1F2937', '#374151'], urgency: 'medium', hasCloseButton: true },
    { type: 'banner', title: '🔔 Enable Notifications', message: 'Stay updated with our latest offers', buttonText: 'Allow', colors: ['#7C3AED', '#8B5CF6'], urgency: 'medium', hasCloseButton: true },
    { type: 'banner', title: '📱 Get Our App!', message: 'Download now for exclusive deals', buttonText: 'Download', colors: ['#059669', '#10B981'], urgency: 'low', hasCloseButton: true },
  ],
  corner: [
    { type: 'corner', title: '💬 Chat with us!', message: 'Need help?', buttonText: 'Start Chat', colors: ['#0891B2', '#06B6D4'], urgency: 'low', icon: '💬', hasCloseButton: true },
    { type: 'corner', title: '🔥 Hot Deal!', message: 'Limited time offer', buttonText: 'View', colors: ['#DC2626', '#EF4444'], urgency: 'high', icon: '🔥', hasCloseButton: true },
    { type: 'corner', title: '⭐ Rate Us!', message: '5 stars?', buttonText: 'Rate', colors: ['#D97706', '#F59E0B'], urgency: 'low', icon: '⭐', hasCloseButton: true },
  ],
  fullscreen: [
    { type: 'fullscreen', title: '🎉 Special Offer!', message: 'Sign up now and get 50% off your first purchase!', buttonText: 'SIGN UP NOW', colors: ['#7C3AED', '#8B5CF6', '#A78BFA'], urgency: 'extreme', hasCloseButton: true },
    { type: 'fullscreen', title: '📺 Watch This!', message: 'You won\'t believe what happens next...', buttonText: 'WATCH VIDEO', colors: ['#DC2626', '#EF4444', '#F87171'], urgency: 'high', hasCloseButton: true },
  ],
  toast: [
    { type: 'toast', title: '✅ Success!', message: 'Your changes have been saved', buttonText: 'OK', colors: ['#059669', '#10B981'], urgency: 'low', hasCloseButton: false },
    { type: 'toast', title: '🎁 New Reward!', message: 'You earned 100 points!', buttonText: 'Claim', colors: ['#D97706', '#F59E0B'], urgency: 'medium', hasCloseButton: false },
  ],
  cookie: [
    { type: 'cookie', title: '🍪 Cookie Consent', message: 'We use cookies to personalize content and ads. By continuing, you accept our use of cookies.', buttonText: 'Accept All Cookies', colors: ['#1F2937', '#374151'], urgency: 'medium', hasCloseButton: true },
    { type: 'cookie', title: '🔒 Privacy Notice', message: 'We value your privacy. Review our updated privacy policy.', buttonText: 'I Understand', colors: ['#1E40AF', '#2563EB'], urgency: 'medium', hasCloseButton: true },
  ],
  subscription: [
    { type: 'subscription', title: '📰 Subscribe to Newsletter', message: 'Get exclusive updates and offers delivered to your inbox!', buttonText: 'Subscribe Now', colors: ['#7C3AED', '#8B5CF6'], urgency: 'high', hasCloseButton: true },
    { type: 'subscription', title: '🔔 Don\'t Miss Out!', message: 'Join 10,000+ subscribers for daily tips', buttonText: 'Join Free', colors: ['#DC2626', '#EF4444'], urgency: 'high', hasCloseButton: true },
  ],
  warning: [
    { type: 'warning', title: '⚠️ Connection Not Secure', message: 'Your connection is not private. Attackers might be trying to steal your information.', buttonText: 'Protect Now', colors: ['#DC2626', '#B91C1C'], urgency: 'extreme', hasCloseButton: false },
    { type: 'warning', title: '🛡️ Virus Detected!', message: '3 viruses found on your device. Immediate action required.', buttonText: 'Remove Viruses', colors: ['#DC2626', '#991B1B'], urgency: 'extreme', hasCloseButton: false },
  ],
};

// Design system constants
const CHALLENGE_COLORS = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#030712',
  cardBg: '#111827',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
};

const TEXT_STYLES = {
  title: { fontSize: 24, fontWeight: 'bold' as const, color: CHALLENGE_COLORS.textPrimary },
  subtitle: { fontSize: 16, color: CHALLENGE_COLORS.textSecondary },
  body: { fontSize: 14, color: CHALLENGE_COLORS.textSecondary },
  stat: { fontSize: 20, fontWeight: '600' as const, color: CHALLENGE_COLORS.textPrimary },
};

export function PopupIgnoreChallenge({
  duration,
  onComplete,
  onBack,
  onNextLesson,
  hasNextLesson,
  level = 1
}: PopupIgnoreChallengeProps) {
  const haptics = useHaptics();
  const sound = useSound();

  const [isActive, setIsActive] = useState(false); // Auto-start
  const config = getChallengeConfig('popup_ignore');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [showOverview, setShowOverview] = useState(false);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats | null>(null);
  const [resistanceScore, setResistanceScore] = useState(100);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const clickedPopupsRef = useRef(0);
  const totalPopupsRef = useRef(0);
  const consecutiveIgnoresRef = useRef(0);
  const resistanceAnim = useRef(new Animated.Value(100)).current;

  // Difficulty scaling
  const getSpawnInterval = () => {
    const baseInterval = 2500;
    const levelMultiplier = 1 - (level / 20);
    return Math.max(800, baseInterval * levelMultiplier);
  };

  const getPopupDuration = () => {
    const baseDuration = 3000;
    const levelMultiplier = 1 + (level / 10);
    return Math.min(6000, baseDuration * levelMultiplier);
  };

  const getMaxPopups = () => {
    return Math.min(6, 3 + Math.floor(level / 2));
  };

  // Get random popup type based on level
  const getRandomPopupType = (): PopupType => {
    const types: PopupType[] = ['modal', 'banner', 'corner', 'toast'];

    // Higher levels get more intrusive popup types
    if (level >= 3) types.push('cookie');
    if (level >= 5) types.push('subscription');
    if (level >= 7) types.push('fullscreen', 'warning');

    return types[Math.floor(Math.random() * types.length)];
  };

  // Get random position based on popup type
  const getPopupPosition = (type: PopupType): { x: number; y: number } => {
    switch (type) {
      case 'banner':
        return { x: 0, y: Math.random() < 0.5 ? 60 : height - 160 };
      case 'corner':
        return {
          x: Math.random() < 0.5 ? 20 : width - 120,
          y: Math.random() < 0.5 ? 100 : height - 180,
        };
      case 'fullscreen':
        return { x: 20, y: height / 2 - 150 };
      case 'toast':
        return { x: 20, y: 100 + Math.random() * 100 };
      case 'modal':
      case 'cookie':
      case 'subscription':
      case 'warning':
      default:
        return {
          x: 20 + Math.random() * (width - 340),
          y: 150 + Math.random() * (height - 400),
        };
    }
  };

  // Update resistance score
  const updateResistanceScore = (change: number) => {
    setResistanceScore(prev => {
      const newScore = Math.max(0, Math.min(100, prev + change));
      Animated.spring(resistanceAnim, {
        toValue: newScore,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
      return newScore;
    });
  };

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  // Popup spawner
  useEffect(() => {
    if (!isActive) return;

    const spawnPopup = () => {
      if (popups.length >= getMaxPopups()) return;

      const popupType = getRandomPopupType();
      const popupLibrary = POPUP_LIBRARY[popupType];
      const content = popupLibrary[Math.floor(Math.random() * popupLibrary.length)];
      const position = getPopupPosition(popupType);

      const newPopup: Popup = {
        id: Date.now() + Math.random(),
        content,
        position,
        scaleAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(0),
        shakeAnim: new Animated.Value(0),
      };

      setPopups(prev => [...prev, newPopup]);
      totalPopupsRef.current += 1;
      haptics.notificationWarning();
      sound.targetAppear();

      // Entrance animation
      Animated.parallel([
        Animated.spring(newPopup.scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(newPopup.opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Shake animation for extreme urgency
      if (content.urgency === 'extreme') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(newPopup.shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(newPopup.shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(newPopup.shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(newPopup.shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            Animated.delay(500),
          ])
        ).start();
      }

      // Auto-remove popup after duration
      setTimeout(() => {
        setPopups(prev => {
          const stillExists = prev.find(p => p.id === newPopup.id);
          if (stillExists) {
            consecutiveIgnoresRef.current += 1;
            setStreak(consecutiveIgnoresRef.current);
            setBestStreak(prev => Math.max(prev, consecutiveIgnoresRef.current));
            updateResistanceScore(2);
            haptics.impactLight();
          }
          return prev.filter(p => p.id !== newPopup.id);
        });
      }, getPopupDuration());
    };

    const interval = setInterval(spawnPopup, getSpawnInterval());
    spawnPopup(); // Spawn first popup immediately

    return () => clearInterval(interval);
  }, [isActive, level, popups.length]);

  const handlePopupClick = (popup: Popup) => {
    clickedPopupsRef.current += 1;
    consecutiveIgnoresRef.current = 0;
    setStreak(0);

    // Bigger penalty for more urgent popups
    const penalties = { extreme: -15, high: -10, medium: -7, low: -5 };
    updateResistanceScore(penalties[popup.content.urgency]);

    haptics.notificationError();
    sound.targetMiss();

    // Explosion animation
    Animated.parallel([
      Animated.timing(popup.scaleAnim, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(popup.opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPopups(prev => prev.filter(p => p.id !== popup.id));
    });
  };

  const handleComplete = () => {
    const ignoredPopups = totalPopupsRef.current - clickedPopupsRef.current;
    const score = totalPopupsRef.current > 0
      ? (ignoredPopups / totalPopupsRef.current) * 100
      : 100;

    // Calculate achievements
    const achievements: string[] = [];
    if (clickedPopupsRef.current === 0 && totalPopupsRef.current >= 5) achievements.push('🛡️ Iron Focus');
    if (score === 100 && totalPopupsRef.current >= 8) achievements.push('🧘 Popup Zen');
    if (score >= 95) achievements.push('🎯 Distraction Proof');
    if (bestStreak >= 10) achievements.push('⚡ Unstoppable Streak');
    if (bestStreak >= 15) achievements.push('👑 Popup Master');
    if (resistanceScore >= 90) achievements.push('💪 Strong Will');

    // Calculate XP
    const baseXP = Math.round(score * 0.5);
    const ignoredBonus = ignoredPopups * 3;
    const streakBonus = bestStreak * 2;
    const achievementXP = achievements.length * 5;
    const perfectBonus = clickedPopupsRef.current === 0 ? 30 : 0;
    const resistanceBonus = Math.round(resistanceScore / 5);
    const xpEarned = baseXP + ignoredBonus + streakBonus + achievementXP + perfectBonus + resistanceBonus;

    if (score >= 70) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    const stats: ExerciseStats = {
      score,
      duration: duration * 1000,
      correctActions: ignoredPopups,
      totalActions: totalPopupsRef.current,
      accuracy: totalPopupsRef.current > 0 ? (ignoredPopups / totalPopupsRef.current) * 100 : 0,
      xpEarned,
      achievements,
    };

    setExerciseStats(stats);
    setShowOverview(true);
  };

  const handleOverviewContinue = () => {
    if (exerciseStats) {
      onComplete(exerciseStats.score, exerciseStats.duration);
    }
  };

  if (showOverview && exerciseStats) {
    return (
      <ExerciseOverview
        challengeType="popup_ignore"
        stats={exerciseStats}
        onContinue={handleOverviewContinue}
        showHeartLoss={true}
        onNextLesson={onNextLesson}
        hasNextLesson={hasNextLesson}
      />
    );
  }

  // Removed intro screen - challenge starts immediately

  const progress = (timeLeft / duration) * 100;
  const resistanceColor = resistanceScore >= 70 ? CHALLENGE_COLORS.success : resistanceScore >= 40 ? CHALLENGE_COLORS.warning : CHALLENGE_COLORS.danger;

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#1a0a2e', '#0a0a0a']} style={styles.gradient}>
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={[styles.statValue, { color: streak >= 5 ? '#10B981' : '#F59E0B' }]}>
              {streak} 🔥
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Ignored</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {totalPopupsRef.current - clickedPopupsRef.current}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Clicked</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {clickedPopupsRef.current}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Resistance Meter */}
        <View style={styles.resistanceCard}>
          <Text style={styles.resistanceLabel}>🧠 Mental Resistance</Text>
          <View style={styles.resistanceBarBg}>
            <Animated.View
              style={[
                styles.resistanceBarFill,
                {
                  width: resistanceAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: resistanceColor,
                }
              ]}
            />
          </View>
          <Text style={[styles.resistanceValue, { color: resistanceColor }]}>
            {Math.round(resistanceScore)}%
          </Text>
        </View>

        {/* Challenge Area */}
        <View style={styles.challengeArea}>
          <View style={styles.focusPoint}>
            <Text style={styles.focusText}>👁️</Text>
            <Text style={styles.focusLabel}>Keep focus here</Text>
          </View>

          {popups.map((popup) => (
            <AnimatedPopup
              key={popup.id}
              popup={popup}
              onPress={() => handlePopupClick(popup)}
            />
          ))}
        </View>

        {/* Bottom Instruction */}
        <View style={styles.instructionFooter}>
          <Text style={styles.instructionFooterText}>
            🛡️ Resist the urge to click
          </Text>
        </View>
      </LinearGradient>
    </View>
    </BaseChallengeWrapper>
  );
}

// Animated Popup Component
function AnimatedPopup({ popup, onPress }: { popup: Popup; onPress: () => void }) {
  const { content, position, scaleAnim, opacityAnim, shakeAnim } = popup;

  const getPopupStyles = () => {
    switch (content.type) {
      case 'fullscreen':
        return styles.popupFullscreen;
      case 'banner':
        return styles.popupBanner;
      case 'corner':
        return styles.popupCorner;
      case 'toast':
        return styles.popupToast;
      case 'cookie':
        return styles.popupCookie;
      default:
        return styles.popupModal;
    }
  };

  return (
    <Animated.View
      style={[
        styles.popupBase,
        getPopupStyles(),
        {
          left: position.x,
          top: position.y,
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient colors={content.colors as any} style={styles.popupGradient}>
          {content.hasCloseButton && (
            <TouchableOpacity style={styles.closeButton} onPress={onPress}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}

          {content.icon && <Text style={styles.popupIcon}>{content.icon}</Text>}

          <Text style={styles.popupTitle}>{content.title}</Text>
          <Text style={styles.popupMessage}>{content.message}</Text>

          <View style={styles.popupButton}>
            <Text style={styles.popupButtonText}>{content.buttonText}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHALLENGE_COLORS.background,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  introCard: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLarge: {
    fontSize: 56,
  },
  centered: {
    textAlign: 'center',
  },
  instructionsBox: {
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    marginTop: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CHALLENGE_COLORS.textPrimary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: CHALLENGE_COLORS.textSecondary,
    lineHeight: 20,
  },
  levelBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A5B4FC',
  },
  startButton: {
    width: '100%',
    marginTop: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: CHALLENGE_COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CHALLENGE_COLORS.textPrimary,
  },
  progressCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CHALLENGE_COLORS.primary,
    borderRadius: 4,
  },
  resistanceCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  resistanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CHALLENGE_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  resistanceBarBg: {
    height: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  resistanceBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  resistanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  challengeArea: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusPoint: {
    alignItems: 'center',
    gap: 8,
  },
  focusText: {
    fontSize: 48,
  },
  focusLabel: {
    fontSize: 16,
    color: CHALLENGE_COLORS.textSecondary,
    fontWeight: '500',
  },
  instructionFooter: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  instructionFooterText: {
    fontSize: 16,
    fontWeight: '600',
    color: CHALLENGE_COLORS.textPrimary,
  },

  // Popup styles
  popupBase: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  popupModal: {
    width: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  popupBanner: {
    width: width - 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popupCorner: {
    width: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popupToast: {
    width: width - 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popupCookie: {
    width: width - 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  popupFullscreen: {
    width: width - 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  popupGradient: {
    padding: 20,
    gap: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  popupIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  popupMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  popupButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  popupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
