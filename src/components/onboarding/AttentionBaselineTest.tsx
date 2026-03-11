import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Button } from '@/components/ui/Button';
import { UIIcon } from '@/components/ui/UIIcon';

interface AttentionBaselineTestProps {
  onComplete: (score: number) => void;
}

export function AttentionBaselineTest({ onComplete }: AttentionBaselineTestProps) {
  const [stage, setStage] = useState<'intro' | 'testing' | 'reaction' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState(8);
  const [isHolding, setIsHolding] = useState(false);
  const [movements, setMovements] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [attentionScore, setAttentionScore] = useState(0);
  const [reactionDelay, setReactionDelay] = useState<number | null>(null);
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const reactionStartRef = useRef<number | null>(null);

  const holdStartRef = useRef<number | null>(null);
  const totalHoldTimeRef = useRef(0);
  const lastTouchPosRef = useRef({ x: 0, y: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsHolding(true);
        holdStartRef.current = Date.now();
      },
      onPanResponderRelease: () => {
        setIsHolding(false);
        if (holdStartRef.current) {
          totalHoldTimeRef.current += Date.now() - holdStartRef.current;
          holdStartRef.current = null;
        }
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const dx = pageX - lastTouchPosRef.current.x;
        const dy = pageY - lastTouchPosRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 20) {
          setMovements((prev) => prev + 1);
        }

        lastTouchPosRef.current = { x: pageX, y: pageY };
      },
    })
  ).current;

  // Countdown timer with periodic distraction pulses
  useEffect(() => {
    if (stage !== 'testing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Move to reaction check
          setStage('reaction');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  // Track hold time
  useEffect(() => {
    if (!isHolding || stage !== 'testing') {
      if (holdStartRef.current) {
        totalHoldTimeRef.current += Date.now() - holdStartRef.current;
        holdStartRef.current = null;
      }
      return;
    }

    const interval = setInterval(() => {
      setFocusTime((prev) => prev + 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isHolding, stage]);

  const calculateScore = () => {
    if (holdStartRef.current) {
      totalHoldTimeRef.current += Date.now() - holdStartRef.current;
    }

    const holdPercentage = (totalHoldTimeRef.current / 8000) * 100;
    const holdScore = Math.min(70, (holdPercentage / 100) * 70);
    const movementPenalty = Math.min(20, movements * 1.5);
    const reactionScore = reactionTimeMs ? Math.max(0, 10 - Math.min(900, reactionTimeMs) / 90) : 0;
    const finalScore = Math.max(0, Math.min(100, holdScore - movementPenalty + reactionScore));

    setAttentionScore(Math.round(finalScore));
    setStage('result');
  };

  const handleStart = () => {
    setStage('testing');
    setTimeLeft(8);
    setMovements(0);
    setFocusTime(0);
    setReactionDelay(null);
    setReactionTimeMs(null);
    totalHoldTimeRef.current = 0;
    lastTouchPosRef.current = { x: 0, y: 0 };
  };

  // Reaction stage: show prompt after a random delay, measure tap latency
  useEffect(() => {
    if (stage !== 'reaction') return;
    const delay = 600 + Math.floor(Math.random() * 1200);
    setReactionDelay(delay);
    const to = setTimeout(() => {
      reactionStartRef.current = Date.now();
    }, delay);
    return () => clearTimeout(to);
  }, [stage]);

  const handleReactionTap = () => {
    if (reactionStartRef.current && reactionTimeMs == null) {
      const rt = Date.now() - reactionStartRef.current;
      setReactionTimeMs(rt);
      // Compute final score with reaction component
      calculateScore();
    }
  };

  if (stage === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.orb} />

        <View style={styles.content}>
          <View style={styles.introContent}>
            <UIIcon name="target" size={48} color="#6366F1" style={styles.titleIcon} />
            <Text style={styles.title}>Attention Test</Text>
            <Text style={styles.description}>
              Hold the dot for 8 seconds. Stay focused and still.
            </Text>
          </View>

          <View style={styles.instructionsCard}>
            <View style={styles.instructionRow}>
              <UIIcon name="checkmark" size={16} color="#10B981" />
              <Text style={styles.instructionItem}>Eyes on center dot</Text>
            </View>
            <View style={styles.instructionRow}>
              <UIIcon name="checkmark" size={16} color="#10B981" />
              <Text style={styles.instructionItem}>Keep device still</Text>
            </View>
            <View style={styles.instructionRow}>
              <UIIcon name="checkmark" size={16} color="#10B981" />
              <Text style={styles.instructionItem}>Don't move or tap</Text>
            </View>
            <View style={styles.instructionRow}>
              <UIIcon name="checkmark" size={16} color="#10B981" />
              <Text style={styles.instructionItem}>Hold for 8 seconds</Text>
            </View>
          </View>

          <Button onPress={handleStart} size="lg" style={styles.button}>
            Start Test
          </Button>
        </View>
      </View>
    );
  }

  if (stage === 'testing') {
    return (
      <View style={styles.testContainer}>
        <View style={[styles.glow, isHolding && styles.glowActive]} />

        <View style={styles.testContent} {...panResponder.panHandlers}>
          <Text style={styles.timer}>{timeLeft}</Text>
          <View style={[styles.dot, isHolding && styles.dotActive]} />
          <Text style={styles.instruction}>
            {isHolding ? 'Keep holding...' : 'Touch and hold the dot'}
          </Text>
          <Text style={styles.metaText}>Movements: {movements}</Text>
          <Text style={styles.metaText}>Hold time: {(focusTime / 1000).toFixed(1)}s</Text>
        </View>
      </View>
    );
  }

  if (stage === 'reaction') {
    return (
      <View style={styles.testContainer}>
        <View style={styles.testContent}>
          <Text style={styles.timerSmall}>Reaction Check</Text>
          <TouchableOpacity
            onPress={handleReactionTap}
            activeOpacity={0.7}
            style={[
              styles.reactionCircle,
              reactionStartRef.current ? styles.reactionCircleActive : undefined,
            ]}
          >
            <Text style={styles.reactionLabel}>
              {reactionStartRef.current ? 'TAP!' : 'Wait...'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.instruction}>
            Tap as soon as the circle lights up
          </Text>
        </View>
      </View>
    );
  }

  if (stage === 'result') {
    const feedback =
      attentionScore >= 80
        ? 'Excellent focus! You have strong attention control.'
        : attentionScore >= 60
          ? "Good focus! There's room for improvement."
          : 'Keep practicing! Your attention will improve with training.';
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>Your Attention Score</Text>
          <Text style={styles.resultScore}>{attentionScore}</Text>
          <Text style={styles.resultDescription}>{feedback}</Text>
          <View style={styles.metricsBox}>
            <Text style={styles.metricLine}>Hold time: {(totalHoldTimeRef.current / 1000).toFixed(1)}s</Text>
            <Text style={styles.metricLine}>Movements: {movements}</Text>
            <Text style={styles.metricLine}>
              Reaction: {reactionTimeMs != null ? `${reactionTimeMs}ms` : '—'}
            </Text>
          </View>
          <Button
            onPress={() => onComplete(attentionScore)}
            size="lg"
            style={styles.button}
          >
            Continue
          </Button>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 200,
    height: 200,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 100,
    marginLeft: -100,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    zIndex: 10,
  },
  introContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 24,
    width: '100%',
    gap: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#d1d5db',
    flex: 1,
  },
  button: {
    width: '100%',
  },
  testContainer: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    opacity: 0.3,
  },
  glowActive: {
    opacity: 1,
  },
  testContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 48,
  },
  timerSmall: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    marginBottom: 24,
  },
  dotActive: {
    backgroundColor: '#818cf8',
    transform: [{ scale: 1.2 }],
  },
  instruction: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
  },
  metaText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9ca3af',
  },
  reactionCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    marginBottom: 16,
  },
  reactionCircleActive: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  reactionLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 24,
  },
  resultDescription: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  metricsBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  metricLine: {
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 6,
  },
});

