import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface PatternInterruptProps {
  onNext: () => void;
}

export function PatternInterrupt({ onNext }: PatternInterruptProps) {
  const [count, setCount] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const targetCount = 2.5;

  useEffect(() => {
    if (count < targetCount) {
      const timer = setTimeout(() => {
        const newCount = Math.min(count + 0.1, targetCount);
        setCount(newCount);
        if (newCount >= targetCount) {
          setShowButton(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [count]);

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - count / targetCount);

  return (
    <View style={styles.container}>
      {/* Ambient gradient orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.content}>
        {/* Counter animation */}
        <View style={styles.counterContainer}>
          <View style={styles.circleContainer}>
            {/* Glowing outer ring */}
            <View style={styles.glowRing} />

            {/* Circular progress */}
            <Svg width={192} height={192} style={styles.svg}>
              <Circle
                cx="96"
                cy="96"
                r={radius}
                stroke="#1f2937"
                strokeWidth="8"
                fill="none"
              />
              <Circle
                cx="96"
                cy="96"
                r={radius}
                stroke="#818cf8"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 96 96)"
              />
            </Svg>
            <View style={styles.counterTextContainer}>
              <Text style={styles.counterText}>{count.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.label}>Average person scrolls</Text>
            <Text style={styles.hoursText}>{count.toFixed(1)} hours a day</Text>
          </View>
        </View>

        {/* Reveal text */}
        {showButton && (
          <View style={styles.revealContainer}>
            <Text style={styles.revealText}>You might be higher.</Text>

            <TouchableOpacity style={styles.button} onPress={onNext}>
              <Text style={styles.buttonText}>Let's check your habits</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
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
  orb1: {
    position: 'absolute',
    top: '25%',
    right: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 100,
  },
  orb2: {
    position: 'absolute',
    bottom: '25%',
    left: -100,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 100,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    zIndex: 10,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  circleContainer: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  glowRing: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  svg: {
    position: 'absolute',
  },
  counterTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  textContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#818cf8',
  },
  revealContainer: {
    alignItems: 'center',
    width: '100%',
  },
  revealText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

