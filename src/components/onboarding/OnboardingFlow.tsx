import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AvatarNaming } from './AvatarNaming';
import { UIIcon } from '@/components/ui/UIIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Onboarding screen types
type OnboardingScreen =
  | 'welcome'
  | 'hook'
  | 'vision'
  | 'how-it-works'
  | 'habit-questions'
  | 'motivation'
  | 'commitment'
  | 'avatar-naming'
  | 'baseline-intro'
  | 'baseline-test'
  | 'results'
  | 'program-intro'
  | 'account'
  | 'notifications'
  | 'complete';

interface OnboardingData {
  // Habit data
  screenTime: number; // hours per day
  peakDistraction: string; // morning, afternoon, evening, night
  problemApps: string[]; // tiktok, instagram, youtube, games, etc
  bedtimeScrolling: boolean;

  // Motivation data
  primaryGoal: string; // work, school, creativity, mental-health, self-discipline
  motivation: string; // career, relationships, health, personal-growth
  commitmentLevel: number; // 1-5

  // Baseline test results
  baselineScore: number;
  reactionTime: number;
  stability: number;
  focusDuration: number;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentScreen, setCurrentScreen] = useState<OnboardingScreen>('welcome');
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const transitionTo = (screen: OnboardingScreen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(screen);
      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleSkipOnboarding = () => {
    // Complete onboarding with default values
    const defaultData: OnboardingData = {
      screenTime: 4,
      peakDistraction: 'evening',
      problemApps: [],
      bedtimeScrolling: false,
      primaryGoal: 'work',
      motivation: 'personal-growth',
      commitmentLevel: 3,
      baselineScore: 60,
      reactionTime: 300,
      stability: 75,
      focusDuration: 8,
    };
    onComplete(defaultData);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen 
            onNext={() => transitionTo('hook')}
            onSkip={handleSkipOnboarding}
          />
        );
      case 'hook':
        return (
          <HookScreen onNext={() => transitionTo('vision')} />
        );
      case 'vision':
        return (
          <VisionScreen onNext={() => transitionTo('how-it-works')} />
        );
      case 'how-it-works':
        return (
          <HowItWorksScreen onNext={() => transitionTo('habit-questions')} />
        );
      case 'habit-questions':
        return (
          <HabitQuestionsScreen
            onNext={(habitData) => {
              updateData(habitData);
              transitionTo('motivation');
            }}
          />
        );
      case 'motivation':
        return (
          <MotivationScreen
            onNext={(motivationData) => {
              updateData(motivationData);
              transitionTo('commitment');
            }}
          />
        );
      case 'commitment':
        return (
          <CommitmentScreen
            onNext={(level) => {
              updateData({ commitmentLevel: level });
              transitionTo('avatar-naming');
            }}
          />
        );
      
      case 'avatar-naming':
        return <AvatarNaming onNext={() => transitionTo('baseline-intro')} />;
      case 'baseline-intro':
        return (
          <BaselineIntroScreen onNext={() => transitionTo('baseline-test')} />
        );
      case 'baseline-test':
        return (
          <BaselineTestScreen
            onComplete={(results) => {
              updateData(results);
              transitionTo('results');
            }}
          />
        );
      case 'results':
        return (
          <ResultsScreen
            data={data}
            onNext={() => transitionTo('program-intro')}
          />
        );
      case 'program-intro':
        return (
          <ProgramIntroScreen
            data={data}
            onNext={() => transitionTo('account')}
          />
        );
      case 'account':
        return (
          <AccountScreen onNext={() => transitionTo('notifications')} />
        );
      case 'notifications':
        return (
          <NotificationsScreen onNext={() => transitionTo('complete')} />
        );
      case 'complete':
        return (
          <CompleteScreen
            onFinish={() => onComplete(data as OnboardingData)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.screenContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

// Screen Components

function WelcomeScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <UIIcon name="target" size={64} color="#6366F1" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>Train Your Attention</Text>
        <Text style={styles.subtitle}>
          Build real focus in just 5 minutes a day
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipButtonText}>Skip onboarding</Text>
      </TouchableOpacity>
    </View>
  );
}

function HookScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.hookText}>
          The average person checks their phone{'\n'}
          <Text style={styles.highlight}>96 times per day</Text>
        </Text>
        <Text style={styles.hookSubtext}>
          That's once every 10 minutes.{'\n'}
          Your attention is being hijacked.
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>I want to change this</Text>
      </TouchableOpacity>
    </View>
  );
}

function VisionScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.visionText}>
          Imagine being able to focus{'\n'}
          <Text style={styles.highlight}>whenever you want</Text>
        </Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitRow}>
            <UIIcon name="checkmark" size={16} color="#10B981" />
            <Text style={styles.benefitText}>Deep work without distractions</Text>
          </View>
          <View style={styles.benefitRow}>
            <UIIcon name="checkmark" size={16} color="#10B981" />
            <Text style={styles.benefitText}>Present in conversations</Text>
          </View>
          <View style={styles.benefitRow}>
            <UIIcon name="checkmark" size={16} color="#10B981" />
            <Text style={styles.benefitText}>Control over your impulses</Text>
          </View>
          <View style={styles.benefitRow}>
            <UIIcon name="checkmark" size={16} color="#10B981" />
            <Text style={styles.benefitText}>Peaceful, clear mind</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>This is what I want</Text>
      </TouchableOpacity>
    </View>
  );
}

function HowItWorksScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Quick daily exercises</Text>
              <Text style={styles.stepDesc}>5-minute attention training sessions</Text>
            </View>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Progressive difficulty</Text>
              <Text style={styles.stepDesc}>Challenges adapt to your level</Text>
            </View>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Track your progress</Text>
              <Text style={styles.stepDesc}>See real improvements over time</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

function HabitQuestionsScreen({ onNext }: { onNext: (data: Partial<OnboardingData>) => void }) {
  const [step, setStep] = useState(0);
  const [screenTime, setScreenTime] = useState(4);
  const [peakDistraction, setPeakDistraction] = useState('');
  const [problemApps, setProblemApps] = useState<string[]>([]);
  const [bedtimeScrolling, setBedtimeScrolling] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      onNext({ screenTime, peakDistraction, problemApps, bedtimeScrolling });
    }
  };

  const renderQuestion = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.questionText}>
              How many hours do you spend on your phone daily?
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{screenTime}+ hours</Text>
              <View style={styles.optionRow}>
                {[2, 4, 6, 8].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.optionButton, screenTime === val && styles.optionButtonSelected]}
                    onPress={() => setScreenTime(val)}
                  >
                    <Text style={[styles.optionText, screenTime === val && styles.optionTextSelected]}>
                      {val}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.questionText}>
              When are you most distracted?
            </Text>
            <View style={styles.optionGrid}>
              {[
                { id: 'morning', label: 'Morning' },
                { id: 'afternoon', label: 'Afternoon' },
                { id: 'evening', label: 'Evening' },
                { id: 'night', label: 'Night' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.gridOption, peakDistraction === option.id && styles.gridOptionSelected]}
                  onPress={() => setPeakDistraction(option.id)}
                >
                  <Text style={[styles.gridOptionText, peakDistraction === option.id && styles.gridOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.questionText}>
              Which apps steal most of your time?
            </Text>
            <View style={styles.optionGrid}>
              {[
                { id: 'tiktok', label: 'TikTok' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'twitter', label: 'Twitter/X' },
                { id: 'games', label: 'Games' },
                { id: 'news', label: 'News' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.gridOption,
                    problemApps.includes(option.id) && styles.gridOptionSelected
                  ]}
                  onPress={() => {
                    if (problemApps.includes(option.id)) {
                      setProblemApps(problemApps.filter(a => a !== option.id));
                    } else {
                      setProblemApps([...problemApps, option.id]);
                    }
                  }}
                >
                  <Text style={[
                    styles.gridOptionText,
                    problemApps.includes(option.id) && styles.gridOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.questionText}>
              Do you scroll in bed before sleep?
            </Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.yesNoButton, bedtimeScrolling && styles.yesNoButtonSelected]}
                onPress={() => setBedtimeScrolling(true)}
              >
                <Text style={[styles.yesNoText, bedtimeScrolling && styles.yesNoTextSelected]}>
                  Yes, often
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesNoButton, !bedtimeScrolling && styles.yesNoButtonSelected]}
                onPress={() => setBedtimeScrolling(false)}
              >
                <Text style={[styles.yesNoText, !bedtimeScrolling && styles.yesNoTextSelected]}>
                  Rarely
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.progressDots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.content}>
        {renderQuestion()}
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
        <Text style={styles.primaryButtonText}>
          {step < 3 ? 'Next' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function MotivationScreen({ onNext }: { onNext: (data: Partial<OnboardingData>) => void }) {
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [motivation, setMotivation] = useState('');
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      onNext({ primaryGoal, motivation });
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {step === 0 ? (
          <>
            <Text style={styles.questionText}>
              What's your main focus goal?
            </Text>
            <View style={styles.optionList}>
              {[
                { id: 'work', label: 'Be more productive at work' },
                { id: 'school', label: 'Focus better in school' },
                { id: 'creativity', label: 'Unlock creativity' },
                { id: 'mental-health', label: 'Mental clarity & calm' },
                { id: 'self-discipline', label: 'Build self-discipline' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.listOption, primaryGoal === option.id && styles.listOptionSelected]}
                  onPress={() => setPrimaryGoal(option.id)}
                >
                  <Text style={[styles.listOptionText, primaryGoal === option.id && styles.listOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.questionText}>
              Why is this important to you?
            </Text>
            <View style={styles.optionList}>
              {[
                { id: 'career', label: 'Career advancement' },
                { id: 'relationships', label: 'Better relationships' },
                { id: 'health', label: 'Mental health' },
                { id: 'personal-growth', label: 'Personal growth' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.listOption, motivation === option.id && styles.listOptionSelected]}
                  onPress={() => setMotivation(option.id)}
                >
                  <Text style={[styles.listOptionText, motivation === option.id && styles.listOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, !(step === 0 ? primaryGoal : motivation) && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!(step === 0 ? primaryGoal : motivation)}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

function CommitmentScreen({ onNext }: { onNext: (level: number) => void }) {
  const [level, setLevel] = useState(3);

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.questionText}>
          How committed are you to improving your focus?
        </Text>
        <View style={styles.commitmentContainer}>
          {[1, 2, 3, 4, 5].map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.commitmentButton, level === val && styles.commitmentButtonSelected]}
              onPress={() => setLevel(val)}
            >
              <Text style={[styles.commitmentText, level === val && styles.commitmentTextSelected]}>
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.commitmentLabels}>
          <Text style={styles.commitmentLabel}>Curious</Text>
          <Text style={styles.commitmentLabel}>All in</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={() => onNext(level)}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

function BaselineIntroScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Attention Assessment</Text>
        <Text style={styles.baselineDesc}>
          This comprehensive test measures 4 key areas of your attention. Your results determine your personalized training program.
        </Text>
        <View style={styles.testPreview}>
          <View style={styles.testPreviewRow}>
            <UIIcon name="target" size={16} color="#6366F1" />
            <Text style={styles.testPreviewText}>Sustained Focus - Hold without breaking</Text>
          </View>
          <View style={styles.testPreviewRow}>
            <UIIcon name="flash" size={16} color="#F59E0B" />
            <Text style={styles.testPreviewText}>Reaction Speed - Tap targets quickly</Text>
          </View>
          <View style={styles.testPreviewRow}>
            <UIIcon name="shield" size={16} color="#10B981" />
            <Text style={styles.testPreviewText}>Impulse Control - Resist distractions</Text>
          </View>
          <View style={styles.testPreviewRow}>
            <UIIcon name="refresh" size={16} color="#3B82F6" />
            <Text style={styles.testPreviewText}>Task Switching - Adapt to changes</Text>
          </View>
        </View>
        <View style={styles.competitiveBox}>
          <Text style={styles.competitiveTitle}>How do you compare?</Text>
          <Text style={styles.competitiveText}>
            Average score: 52/100{'\n'}
            Top 10% score: 85+
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Begin Assessment</Text>
      </TouchableOpacity>
    </View>
  );
}

function BaselineTestScreen({ onComplete }: { onComplete: (results: Partial<OnboardingData>) => void }) {
  const [testPhase, setTestPhase] = useState<'focus' | 'reaction' | 'impulse' | 'switching' | 'complete'>('focus');
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Focus test state
  const [holdTime, setHoldTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [focusBreaks, setFocusBreaks] = useState(0);
  const holdStartRef = useRef(0);

  // Reaction test state
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showTarget, setShowTarget] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0.5, y: 0.5 });
  const targetShowTimeRef = useRef(0);
  const reactionCountRef = useRef(0);

  // Impulse test state
  const [impulseScore, setImpulseScore] = useState(100);
  const [showDistractor, setShowDistractor] = useState(false);
  const [distractorTaps, setDistractorTaps] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const impulseCountRef = useRef(0);

  // Switching test state
  const [switchMode, setSwitchMode] = useState<'tap' | 'hold'>('tap');
  const [switchScore, setSwitchScore] = useState(0);
  const [switchErrors, setSwitchErrors] = useState(0);
  const switchCountRef = useRef(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Focus test handlers
  const handleFocusPressIn = () => {
    setIsHolding(true);
    holdStartRef.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, { toValue: 1.2, friction: 3, useNativeDriver: true }).start();
  };

  const handleFocusPressOut = () => {
    setIsHolding(false);
    const duration = Date.now() - holdStartRef.current;
    const newHoldTime = holdTime + duration;
    setHoldTime(newHoldTime);

    if (duration < 2000 && newHoldTime < 8000) {
      setFocusBreaks(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    if (newHoldTime >= 8000) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setTestPhase('reaction');
        setPhaseIndex(1);
        startReactionTest();
      }, 500);
    }
  };

  // Reaction test
  const startReactionTest = () => {
    if (reactionCountRef.current >= 5) {
      setTestPhase('impulse');
      setPhaseIndex(2);
      startImpulseTest();
      return;
    }

    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setTargetPosition({
        x: 0.2 + Math.random() * 0.6,
        y: 0.3 + Math.random() * 0.4,
      });
      setShowTarget(true);
      targetShowTimeRef.current = Date.now();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, delay);
  };

  const handleReactionTap = () => {
    if (!showTarget) return;

    const reactionTime = Date.now() - targetShowTimeRef.current;
    setReactionTimes(prev => [...prev, reactionTime]);
    setShowTarget(false);
    reactionCountRef.current += 1;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (reactionCountRef.current < 5) {
      startReactionTest();
    } else {
      setTimeout(() => {
        setTestPhase('impulse');
        setPhaseIndex(2);
        startImpulseTest();
      }, 500);
    }
  };

  // Impulse test
  const startImpulseTest = () => {
    if (impulseCountRef.current >= 8) {
      setTestPhase('switching');
      setPhaseIndex(3);
      startSwitchingTest();
      return;
    }

    const showDistractorNow = Math.random() > 0.5;
    impulseCountRef.current += 1;

    setTimeout(() => {
      if (showDistractorNow) {
        setShowDistractor(true);
        setTimeout(() => {
          setShowDistractor(false);
          // Auto-advance to next target after distractor disappears
          setTimeout(() => {
            if (impulseCountRef.current < 8) {
              startImpulseTest();
            } else {
              setTestPhase('switching');
              setPhaseIndex(3);
              startSwitchingTest();
            }
          }, 300);
        }, 800);
      } else {
        setShowTarget(true);
        targetShowTimeRef.current = Date.now();
        // Auto-advance if target not tapped within time limit
        setTimeout(() => {
          if (showTarget) {
            setShowTarget(false);
            setTimeout(() => {
              if (impulseCountRef.current < 8) {
                startImpulseTest();
              } else {
                setTestPhase('switching');
                setPhaseIndex(3);
                startSwitchingTest();
              }
            }, 300);
          }
        }, 1500);
      }
    }, 500 + Math.random() * 1000);
  };

  const handleImpulseTap = (isTarget: boolean) => {
    if (isTarget && showTarget) {
      setCorrectTaps(prev => prev + 1);
      setShowTarget(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Advance to next target after successful tap
      setTimeout(() => {
        if (impulseCountRef.current < 8) {
          startImpulseTest();
        } else {
          setTestPhase('switching');
          setPhaseIndex(3);
          startSwitchingTest();
        }
      }, 300);
    } else if (!isTarget && showDistractor) {
      setDistractorTaps(prev => prev + 1);
      setImpulseScore(prev => Math.max(0, prev - 15));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Distractor disappears automatically, no need to advance here
    }
  };

  // Switching test
  const startSwitchingTest = () => {
    if (switchCountRef.current >= 6) {
      calculateFinalScore();
      return;
    }

    switchCountRef.current += 1;
    const newMode = Math.random() > 0.5 ? 'tap' : 'hold';
    setSwitchMode(newMode);

    // Pulse animation to show new mode
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleSwitchAction = (action: 'tap' | 'hold') => {
    if (action === switchMode) {
      setSwitchScore(prev => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      setSwitchErrors(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    if (switchCountRef.current < 6) {
      startSwitchingTest();
    } else {
      calculateFinalScore();
    }
  };

  const calculateFinalScore = () => {
    // Focus score (max 30 points)
    const focusScore = Math.max(0, 30 - (focusBreaks * 5));

    // Reaction score (max 25 points)
    const avgReaction = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 500;
    const reactionScore = Math.max(0, Math.min(25, 25 - ((avgReaction - 200) / 20)));

    // Impulse score (max 25 points)
    const impulsePoints = Math.round((impulseScore / 100) * 25);

    // Switching score (max 20 points)
    const switchPoints = Math.round((switchScore / 6) * 20);

    const totalScore = Math.round(focusScore + reactionScore + impulsePoints + switchPoints);
    const stability = Math.max(0, 100 - (focusBreaks * 10) - (switchErrors * 5));

    setTestPhase('complete');

    setTimeout(() => {
      onComplete({
        baselineScore: totalScore,
        reactionTime: Math.round(avgReaction),
        stability: stability,
        focusDuration: Math.round(holdTime / 1000),
      });
    }, 100);
  };

  const phaseLabels = ['Focus', 'Reaction', 'Impulse', 'Switching'];

  // Render phase indicator
  const renderPhaseIndicator = () => (
    <View style={styles.phaseIndicator}>
      {phaseLabels.map((label, i) => (
        <View key={label} style={styles.phaseItem}>
          <View style={[
            styles.phaseDot,
            i < phaseIndex && styles.phaseDotComplete,
            i === phaseIndex && styles.phaseDotActive,
          ]}>
            {i < phaseIndex && <UIIcon name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={[
            styles.phaseLabel,
            i === phaseIndex && styles.phaseLabelActive,
          ]}>{label}</Text>
        </View>
      ))}
    </View>
  );

  // Focus test UI
  if (testPhase === 'focus') {
    const progress = Math.min(100, (holdTime / 8000) * 100);
    return (
      <View style={styles.screen}>
        {renderPhaseIndicator()}
        <View style={styles.content}>
          <Text style={styles.testInstruction}>Sustained Focus</Text>
          <Text style={styles.testSubInstruction}>
            Hold the circle steady for 8 seconds{'\n'}
            {focusBreaks > 0 && `${focusBreaks} break${focusBreaks > 1 ? 's' : ''} detected`}
          </Text>
          <View style={styles.testProgressBar}>
            <View style={[styles.testProgressFill, { width: `${progress}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.testCircleContainer}
            onPressIn={handleFocusPressIn}
            onPressOut={handleFocusPressOut}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.testCircle,
                isHolding && styles.testCircleActive,
                { transform: [{ scale: scaleAnim }] }
              ]}
            />
          </TouchableOpacity>
          <Text style={styles.testHint}>
            {isHolding ? `${((holdTime + (Date.now() - holdStartRef.current)) / 1000).toFixed(1)}s` : 'Press and hold'}
          </Text>
        </View>
      </View>
    );
  }

  // Reaction test UI
  if (testPhase === 'reaction') {
    return (
      <View style={styles.screen}>
        {renderPhaseIndicator()}
        <View style={styles.content}>
          <Text style={styles.testInstruction}>Reaction Speed</Text>
          <Text style={styles.testSubInstruction}>
            Tap the target as quickly as it appears{'\n'}
            {reactionCountRef.current}/5 complete
          </Text>
          <View style={styles.reactionArea}>
            {showTarget && (
              <TouchableOpacity
                style={[
                  styles.reactionTarget,
                  {
                    left: `${targetPosition.x * 100}%`,
                    top: `${targetPosition.y * 100}%`,
                  }
                ]}
                onPress={handleReactionTap}
              >
                <View style={styles.reactionTargetInner} />
              </TouchableOpacity>
            )}
            {!showTarget && (
              <Text style={styles.waitText}>Wait for target...</Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Impulse test UI
  if (testPhase === 'impulse') {
    return (
      <View style={styles.screen}>
        {renderPhaseIndicator()}
        <View style={styles.content}>
          <Text style={styles.testInstruction}>Impulse Control</Text>
          <Text style={styles.testSubInstruction}>
            Tap GREEN targets only{'\n'}
            Ignore RED distractors
          </Text>
          <View style={styles.reactionArea}>
            {showTarget && (
              <TouchableOpacity
                style={[styles.impulseTarget, styles.impulseTargetGreen]}
                onPress={() => handleImpulseTap(true)}
              />
            )}
            {showDistractor && (
              <TouchableOpacity
                style={[styles.impulseTarget, styles.impulseTargetRed]}
                onPress={() => handleImpulseTap(false)}
              />
            )}
            {!showTarget && !showDistractor && (
              <Text style={styles.waitText}>Get ready...</Text>
            )}
          </View>
          <Text style={styles.impulseScoreText}>
            Score: {impulseScore} | Errors: {distractorTaps}
          </Text>
        </View>
      </View>
    );
  }

  // Switching test UI
  if (testPhase === 'switching') {
    return (
      <View style={styles.screen}>
        {renderPhaseIndicator()}
        <View style={styles.content}>
          <Text style={styles.testInstruction}>Task Switching</Text>
          <Text style={styles.testSubInstruction}>
            Follow the instruction shown
          </Text>
          <Animated.View style={[styles.switchInstruction, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.switchModeText}>
              {switchMode === 'tap' ? 'TAP' : 'HOLD'}
            </Text>
          </Animated.View>
          <View style={styles.switchActions}>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => handleSwitchAction('tap')}
            >
              <Text style={styles.switchButtonText}>Tap</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchButton}
              onPressIn={() => {
                setTimeout(() => handleSwitchAction('hold'), 500);
              }}
            >
              <Text style={styles.switchButtonText}>Hold</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.switchScoreText}>
            Correct: {switchScore}/6 | Errors: {switchErrors}
          </Text>
        </View>
      </View>
    );
  }

  // Complete - show loading
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.testInstruction}>Calculating Results...</Text>
        <View style={styles.testCircle} />
      </View>
    </View>
  );
}

function ResultsScreen({ data, onNext }: { data: Partial<OnboardingData>; onNext: () => void }) {
  const score = data.baselineScore || 70;

  const getScoreLabel = () => {
    if (score >= 85) return { label: 'Excellent!', color: '#10b981', percentile: 'Top 10%' };
    if (score >= 70) return { label: 'Above Average', color: '#22d3ee', percentile: 'Top 30%' };
    if (score >= 52) return { label: 'Average', color: '#f59e0b', percentile: 'Top 50%' };
    return { label: 'Needs Training', color: '#ef4444', percentile: 'Below Average' };
  };

  const { label, color, percentile } = getScoreLabel();

  // Calculate potential improvement
  const potentialScore = Math.min(100, score + 35);
  const improvementWeeks = score < 60 ? 3 : 2;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.resultsTitle}>Your Attention Score</Text>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
        </View>
        <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
        <Text style={styles.percentileText}>{percentile}</Text>

        {/* Detailed breakdown */}
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Reaction</Text>
            <Text style={styles.breakdownValue}>{data.reactionTime || 0}ms</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Stability</Text>
            <Text style={styles.breakdownValue}>{data.stability || 0}%</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Focus</Text>
            <Text style={styles.breakdownValue}>{data.focusDuration || 0}s</Text>
          </View>
        </View>

        {/* Competitive comparison */}
        <View style={styles.comparisonBox}>
          <Text style={styles.comparisonTitle}>Your Potential</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Now</Text>
              <Text style={[styles.comparisonScore, { color }]}>{score}</Text>
            </View>
            <Text style={styles.comparisonArrow}>→</Text>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>{improvementWeeks} weeks</Text>
              <Text style={[styles.comparisonScore, { color: '#10b981' }]}>{potentialScore}</Text>
            </View>
          </View>
          <Text style={styles.comparisonNote}>
            {score < 60
              ? 'Your attention is significantly below average. Training is highly recommended.'
              : score < 75
              ? 'Room for improvement. Consistent training will make a real difference.'
              : 'Good baseline! Training will help you reach peak performance.'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Build My Program</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProgramIntroScreen({ data, onNext }: { data: Partial<OnboardingData>; onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.programTitle}>Your Personal Program</Text>
        <Text style={styles.programSubtitle}>Based on your profile, we've created:</Text>
        <View style={styles.programCard}>
          <Text style={styles.programCardTitle}>7-Day Focus Reset</Text>
          <View style={styles.programDetails}>
            <Text style={styles.programDetail}>• 5 min daily sessions</Text>
            <Text style={styles.programDetail}>• Starts easy, builds gradually</Text>
            <Text style={styles.programDetail}>• Personalized challenges</Text>
            <Text style={styles.programDetail}>• Progress tracking</Text>
          </View>
        </View>
        <View style={styles.levelPreview}>
          <Text style={styles.levelPreviewText}>You'll start at Level 1</Text>
          <View style={styles.levelDots}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[styles.levelDot, level === 1 && styles.levelDotActive]}
              />
            ))}
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

function AccountScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Save Your Progress</Text>
        <Text style={styles.accountDesc}>
          Create an account to keep your progress and sync across devices.
        </Text>
        <View style={styles.authButtons}>
          <TouchableOpacity style={styles.authButton}>
            <Text style={styles.authButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.authButton}>
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.authButton}>
            <Text style={styles.authButtonText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.skipButton} onPress={onNext}>
        <Text style={styles.skipButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

function NotificationsScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <UIIcon name="notifications" size={48} color="#6366F1" style={{ marginBottom: 24, alignSelf: 'center' }} />
        <Text style={styles.sectionTitle}>Daily Reminders</Text>
        <Text style={styles.notifDesc}>
          Get a gentle reminder to practice your focus training. Most users train in the morning.
        </Text>
        <View style={styles.notifBenefits}>
          <View style={styles.benefitRow}>
            <UIIcon name="checkmark" size={16} color="#6EE7B7" />
            <Text style={styles.notifBenefit}>Users with reminders are 3x more likely to build a habit</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>Enable Reminders</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={onNext}>
        <Text style={styles.skipButtonText}>Not now</Text>
      </TouchableOpacity>
    </View>
  );
}

function CompleteScreen({ onFinish }: { onFinish: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <UIIcon name="trophy" size={64} color="#F59E0B" style={{ marginBottom: 24, alignSelf: 'center' }} />
        <Text style={styles.completeTitle}>You're all set!</Text>
        <Text style={styles.completeSubtitle}>
          Your first mission is ready.{'\n'}
          Let's start building real focus.
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
        <Text style={styles.primaryButtonText}>Start Training</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  screenContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },

  // Typography
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 32,
  },


  // Hook
  hookText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 24,
  },
  highlight: {
    color: '#818CF8',
  },
  hookSubtext: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 26,
  },

  // Vision
  visionText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 32,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#CBD5E1',
    flex: 1,
  },

  // Steps
  stepsList: {
    gap: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // Progress dots
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: '#6366f1',
  },

  // Options
  sliderContainer: {
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#818CF8',
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  optionButtonSelected: {
    backgroundColor: '#312E81',
    borderColor: '#6366f1',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  optionTextSelected: {
    color: '#A5B4FC',
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  gridOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    minWidth: '45%',
  },
  gridOptionSelected: {
    backgroundColor: '#312E81',
    borderColor: '#6366f1',
  },
  gridOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  gridOptionTextSelected: {
    color: '#A5B4FC',
  },

  yesNoButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  yesNoButtonSelected: {
    backgroundColor: '#312E81',
    borderColor: '#6366f1',
  },
  yesNoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  yesNoTextSelected: {
    color: '#A5B4FC',
  },

  optionList: {
    gap: 12,
  },
  listOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  listOptionSelected: {
    backgroundColor: '#312E81',
    borderColor: '#6366f1',
  },
  listOptionText: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  listOptionTextSelected: {
    color: '#A5B4FC',
    fontWeight: '500',
  },

  // Commitment
  commitmentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  commitmentButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  commitmentButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  commitmentText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
  },
  commitmentTextSelected: {
    color: '#ffffff',
  },
  commitmentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  commitmentLabel: {
    fontSize: 12,
    color: '#64748B',
  },

  // Baseline test
  baselineDesc: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  testPreview: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  testPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testPreviewText: {
    fontSize: 14,
    color: '#CBD5E1',
    flex: 1,
  },
  testInstruction: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 8,
  },
  testSubInstruction: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
  },
  testProgress: {
    fontSize: 24,
    fontWeight: '700',
    color: '#818CF8',
    textAlign: 'center',
    marginBottom: 16,
  },
  testProgressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 40,
    overflow: 'hidden',
  },
  testProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  testCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  testCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6366f1',
  },
  testCircleActive: {
    backgroundColor: '#10b981',
  },
  testHint: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },

  // Competitive box
  competitiveBox: {
    backgroundColor: '#312E81',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  competitiveTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A5B4FC',
    marginBottom: 8,
  },
  competitiveText: {
    fontSize: 13,
    color: '#C7D2FE',
    lineHeight: 20,
  },

  // Phase indicator
  phaseIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  phaseItem: {
    alignItems: 'center',
    flex: 1,
  },
  phaseDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#475569',
  },
  phaseDotComplete: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  phaseDotActive: {
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
  },
  phaseLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  phaseLabelActive: {
    color: '#E0E7FF',
    fontWeight: '700',
  },

  // Reaction test
  reactionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: 250,
  },
  reactionTarget: {
    position: 'absolute',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
  },
  reactionTargetInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
  },
  waitText: {
    fontSize: 16,
    color: '#64748B',
  },

  // Impulse test
  impulseTarget: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  impulseTargetGreen: {
    backgroundColor: '#10b981',
  },
  impulseTargetRed: {
    backgroundColor: '#ef4444',
  },
  impulseScoreText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },

  // Switching test
  switchInstruction: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  switchModeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  switchActions: {
    flexDirection: 'row',
    gap: 16,
  },
  switchButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  switchScoreText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },

  // Results enhancements
  percentileText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  comparisonBox: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  comparisonScore: {
    fontSize: 28,
    fontWeight: '700',
  },
  comparisonArrow: {
    fontSize: 24,
    color: '#64748B',
  },
  comparisonNote: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Results
  resultsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#334155',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  resultsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  resultsEncouragement: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // Program
  programTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 8,
  },
  programSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  programCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  programCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#818CF8',
    marginBottom: 16,
  },
  programDetails: {
    gap: 8,
  },
  programDetail: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  levelPreview: {
    alignItems: 'center',
  },
  levelPreviewText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  levelDots: {
    flexDirection: 'row',
    gap: 8,
  },
  levelDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  levelDotActive: {
    backgroundColor: '#6366f1',
  },

  // Account
  accountDesc: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  authButtons: {
    gap: 12,
  },
  authButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CBD5E1',
    textAlign: 'center',
  },

  // Notifications
  notifDesc: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  notifBenefits: {
    backgroundColor: '#064E3B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  notifBenefit: {
    fontSize: 14,
    color: '#6EE7B7',
  },

  // Complete
  completeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 26,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
  },
  skipButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
  },
});
