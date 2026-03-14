/**
 * FOCUS SPRINT CHALLENGE
 * High-intensity focused attention training with rapid tasks
 *
 * Used in Realm 9 (Ascension) - 180s intense focus training
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BaseChallengeWrapper, ChallengeConfig } from './BaseChallengeWrapper';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { soundManager as sound } from '@/lib/sound-manager';
import { HapticPatterns as haptics } from '@/lib/haptic-patterns';

interface FocusSprintChallengeProps {
  duration: number;
  onComplete: (score: number, duration: number) => void;
  onBack?: () => void;
  level?: number;
}

type TaskType = 'math' | 'color' | 'word' | 'pattern' | 'count';

interface Task {
  type: TaskType;
  question: string;
  options: string[];
  correctAnswer: number;
  emoji: string;
  timeLimit: number;
}

const config: ChallengeConfig = {
  name: 'Focus Sprint',
  icon: '⚡',
  description: 'High-intensity focused attention training. Solve rapid-fire tasks while maintaining laser focus under pressure.',
  duration: 180,
  xpReward: 25,
  difficulty: 'hard',
  instructions: [
    'Complete tasks as quickly and accurately as possible',
    'Maintain focus despite time pressure',
    'Each correct answer extends your streak',
    'Wrong answers break your focus flow',
  ],
  benefits: [
    'Builds sustained intense focus',
    'Improves cognitive agility',
    'Enhances performance under pressure',
    'Strengthens executive attention',
  ],
  colors: {
    background: '#1a0a00',
    primary: '#FF6D00',
    secondary: '#FF8F00',
  },
};

export function FocusSprintChallenge({ duration, onComplete, onBack, level = 1 }: FocusSprintChallengeProps) {
  const themeStyles = useThemeStyles();

  // State
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskTimeLeft, setTaskTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Tracking refs
  const correctAnswers = useRef(0);
  const totalTasks = useRef(0);
  const currentStreak = useRef(0);
  const maxStreak = useRef(0);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate random math task
  const generateMathTask = (): Task => {
    const operations = ['+', '-', '×'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;
    
    if (op === '-' && a < b) [a, b] = [b, a]; // Ensure positive results
    
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const wrong1 = answer + Math.floor(Math.random() * 10) - 5;
    const wrong2 = answer + Math.floor(Math.random() * 10) - 5;
    
    const options = [answer, wrong1, wrong2].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(answer);
    
    return {
      type: 'math',
      question: `${a} ${op} ${b} = ?`,
      options: options.map(String),
      correctAnswer: correctIndex,
      emoji: '🔢',
      timeLimit: 8,
    };
  };

  // Generate color matching task
  const generateColorTask = (): Task => {
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
    const displayColors = ['#FF5722', '#2196F3', '#4CAF50', '#FFEB3B', '#9C27B0'];
    
    const wordColor = colors[Math.floor(Math.random() * colors.length)];
    const textColor = displayColors[Math.floor(Math.random() * displayColors.length)];
    const correctColorName = colors[displayColors.indexOf(textColor)];
    
    const shuffled = [...colors].sort(() => Math.random() - 0.5).slice(0, 3);
    if (!shuffled.includes(correctColorName)) {
      shuffled[0] = correctColorName;
    }
    
    return {
      type: 'color',
      question: `Color of the word: ${wordColor}`,
      options: shuffled,
      correctAnswer: shuffled.indexOf(correctColorName),
      emoji: '🌈',
      timeLimit: 6,
    };
  };

  // Generate word count task
  const generateCountTask = (): Task => {
    const words = ['FOCUS', 'MIND', 'ATTENTION', 'FLOW', 'CLEAR'];
    const sentence = Array.from({ length: 8 }, () => 
      words[Math.floor(Math.random() * words.length)]
    ).join(' ');
    
    const targetWord = words[Math.floor(Math.random() * words.length)];
    const actualCount = (sentence.match(new RegExp(targetWord, 'g')) || []).length;
    
    const options = [actualCount, actualCount + 1, actualCount - 1].filter(n => n >= 0);
    while (options.length < 3) options.push(actualCount + 2);
    
    return {
      type: 'count',
      question: `Count "${targetWord}": ${sentence}`,
      options: options.slice(0, 3).map(String),
      correctAnswer: 0,
      emoji: '📝',
      timeLimit: 10,
    };
  };

  // Generate new task
  const generateNewTask = (): Task => {
    const taskTypes = [generateMathTask, generateColorTask, generateCountTask];
    const generator = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    return generator();
  };

  // Timer countdown
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

  // Task timer
  useEffect(() => {
    if (!isActive || !currentTask) return;

    const taskTimer = setInterval(() => {
      setTaskTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - treat as wrong answer
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(taskTimer);
  }, [isActive, currentTask]);

  // Progress animation
  useEffect(() => {
    if (!isActive) return;
    const progress = ((duration - timeLeft) / duration) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, isActive, duration]);

  // Task animation
  useEffect(() => {
    if (currentTask) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Urgent pulse for time pressure
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentTask]);

  // Start new task
  const startNewTask = () => {
    const task = generateNewTask();
    setCurrentTask(task);
    setTaskTimeLeft(task.timeLimit);
    setSelectedAnswer(null);
    totalTasks.current += 1;
  };

  // Handle answer selection
  const handleAnswer = (answerIndex: number) => {
    if (!currentTask) return;

    const isCorrect = answerIndex === currentTask.correctAnswer;
    
    if (isCorrect) {
      correctAnswers.current += 1;
      currentStreak.current += 1;
      if (currentStreak.current > maxStreak.current) {
        maxStreak.current = currentStreak.current;
      }
      haptics.impactMedium();
      sound.success();
    } else {
      currentStreak.current = 0;
      haptics.impactHeavy();
      sound.error();
    }

    setSelectedAnswer(answerIndex);
    
    // Brief pause then start new task
    setTimeout(() => {
      startNewTask();
    }, 800);
  };

  // Initialize first task
  useEffect(() => {
    if (isActive && !currentTask) {
      startNewTask();
    }
  }, [isActive]);

  const handleComplete = () => {
    setIsActive(false);

    const accuracy = totalTasks.current > 0 ? (correctAnswers.current / totalTasks.current) * 100 : 0;
    const streakBonus = maxStreak.current * 5;
    const speedBonus = Math.min(totalTasks.current * 2, 20);
    const score = Math.min(100, accuracy + streakBonus + speedBonus);

    if (score >= 80) {
      haptics.notificationSuccess();
      sound.complete();
    } else {
      haptics.notificationWarning();
      sound.warning();
    }

    onComplete(score, duration - timeLeft);
  };

  const getStreakColor = () => {
    if (currentStreak.current >= 10) return '#4CAF50';
    if (currentStreak.current >= 5) return '#FF9800';
    return '#9E9E9E';
  };

  return (
    <BaseChallengeWrapper
      config={config}
      onStart={() => setIsActive(true)}
      onBack={onBack || (() => {})}
      isActive={isActive}
    >
      <LinearGradient
        colors={['#1a0a00', '#2a1500', '#1a0a00']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Correct</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {correctAnswers.current}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={[styles.statValue, { color: getStreakColor() }]}>
              {currentStreak.current}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>

        {/* Task Area */}
        {currentTask && (
          <View style={styles.taskArea}>
            <Animated.View
              style={[
                styles.taskCard,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.taskEmoji}>{currentTask.emoji}</Text>
              <Text style={styles.taskQuestion}>{currentTask.question}</Text>
              <Text style={styles.taskTimer}>{taskTimeLeft}s</Text>
            </Animated.View>

            {/* Answer Options */}
            <View style={styles.optionsContainer}>
              {currentTask.options.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleAnswer(index)}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && {
                      backgroundColor: index === currentTask.correctAnswer ? '#4CAF50' : '#f44336',
                    },
                  ]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.realmText}>Realm 9 - Ascension</Text>
        </View>
      </LinearGradient>
    </BaseChallengeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 109, 0, 0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6D00',
    borderRadius: 4,
  },

  // Task Area
  taskArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 109, 0, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FF6D00',
  },
  taskEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  taskQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  taskTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6D00',
  },

  // Options
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 109, 0, 0.3)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  realmText: {
    fontSize: 12,
    color: 'rgba(255, 109, 0, 0.7)',
    fontWeight: '600',
  },
});