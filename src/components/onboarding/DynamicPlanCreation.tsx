import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Button } from '@/components/ui/Button';

interface DynamicPlanCreationProps {
  onNext: () => void;
}

const planDays = [
  { day: 1, exercise: 'Focus Hold' },
  { day: 2, exercise: 'Finger Hold' },
  { day: 3, exercise: 'Reaction Inhibition' },
  { day: 4, exercise: 'Scroll Resistance' },
  { day: 5, exercise: 'Combined Drill' },
];

const dayColors = ['#6366f1', '#a855f7', '#6366f1', '#a855f7', '#6366f1'];

export function DynamicPlanCreation({ onNext }: DynamicPlanCreationProps) {
  const [visibleCards, setVisibleCards] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (visibleCards < planDays.length) {
      const timer = setTimeout(() => {
        setVisibleCards((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (visibleCards >= planDays.length) {
      const timer = setTimeout(() => setShowButton(true), 500);
      return () => clearTimeout(timer);
    }
  }, [visibleCards]);

  return (
    <View style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Your attention plan is ready</Text>
          <Text style={styles.subtitle}>
            A personalized 21-day journey to rebuild your focus
          </Text>
        </View>

        {/* Animated card stack */}
        <View style={styles.cardsContainer}>
          {planDays.map((item, index) => {
            const opacity = index < visibleCards ? 1 : 0;
            const translateY = index < visibleCards ? 0 : 16;

            return (
              <Animated.View
                key={item.day}
                style={[
                  styles.card,
                  {
                    opacity,
                    transform: [{ translateY }],
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.dayBadge, { backgroundColor: dayColors[index] }]}>
                    <Text style={styles.dayNumber}>{item.day}</Text>
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.dayLabel}>Day {item.day}</Text>
                    <Text style={styles.exerciseName}>{item.exercise}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}

          {visibleCards >= planDays.length && (
            <View style={styles.moreText}>
              <Text style={styles.moreTextContent}>
                + 16 more exercises with increasing difficulty
              </Text>
            </View>
          )}
        </View>

        {showButton && (
          <View style={styles.buttonContainer}>
            <Button onPress={onNext} size="lg" style={styles.button}>
              Continue
            </Button>
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
    top: 0,
    left: '50%',
    width: 200,
    height: 200,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 100,
    marginLeft: -100,
  },
  orb2: {
    position: 'absolute',
    bottom: 0,
    right: '50%',
    width: 200,
    height: 200,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 100,
    marginRight: -100,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    zIndex: 10,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dayNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  moreText: {
    paddingTop: 8,
    alignItems: 'center',
  },
  moreTextContent: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    width: '100%',
  },
});

