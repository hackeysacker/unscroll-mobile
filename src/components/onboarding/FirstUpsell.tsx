import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';

interface FirstUpsellProps {
  onUpgrade: () => void;
  onContinueFree: () => void;
}

const premiumFeatures = [
  'Accurate daily scroll tracking',
  'Real trend graphs and insights',
  'Smart personalized difficulty levels',
  'Unlock 20+ advanced exercises',
  'Detailed progress analytics',
  'No ads, unlimited hearts',
];

export function FirstUpsell({ onUpgrade, onContinueFree }: FirstUpsellProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Unlock Screen Time Auto-Sync</Text>
        <Text style={styles.subtitle}>Get the full experience with premium features</Text>
      </View>

      {/* Features list */}
      <View style={styles.featuresCard}>
        {premiumFeatures.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Pricing */}
      <View style={styles.pricingContainer}>
        <Text style={styles.trialText}>Try free for 7 days</Text>
        <Text style={styles.price}>
          $4.99<Text style={styles.priceUnit}>/month</Text>
        </Text>
        <Text style={styles.cancelText}>Cancel anytime</Text>
      </View>

      {/* CTAs */}
      <View style={styles.buttonsContainer}>
        <Button
          onPress={onUpgrade}
          size="lg"
          style={[styles.button, styles.upgradeButton]}
        >
          Try Free For 7 Days
        </Button>
        <TouchableOpacity
          onPress={onContinueFree}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>Continue Free</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#1e3a8a',
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  pricingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trialText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  priceUnit: {
    fontSize: 18,
    color: '#6b7280',
  },
  cancelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  upgradeButton: {
    backgroundColor: '#6366f1',
  },
  continueButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

