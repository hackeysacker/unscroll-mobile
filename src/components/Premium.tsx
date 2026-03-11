import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumProps {
  onBack: () => void;
}

const features = [
  { emoji: '❤️', title: 'Unlimited Hearts', description: 'Train anytime without limits' },
  { emoji: '🧠', title: 'Personalized Training', description: 'AI-powered adaptive coaching' },
  { emoji: '📊', title: 'Deep Analytics', description: 'Track your progress in detail' },
  { emoji: '🌙', title: 'Wind-Down Mode', description: 'Guided breathing exercises' },
  { emoji: '✨', title: 'All Premium Features', description: 'Unlock everything, now and future' },
];

export function Premium({ onBack }: PremiumProps) {
  const { user, upgradeToPremium } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user) return null;

  const handleUpgrade = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await upgradeToPremium();
    Alert.alert('Success', 'Premium upgrade successful! (Demo mode - no payment processed)');
    onBack();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.crownEmoji}>👑</Text>
          <Text style={styles.title}>Premium</Text>
          <Text style={styles.subtitle}>Unlock unlimited training and advanced features</Text>
        </View>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$9.99</Text>
            <Text style={styles.priceUnit}>/month</Text>
          </View>
          <Text style={styles.trialText}>Try free for 7 days</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresList}>
          {features.map((feature) => (
            <View key={feature.title} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{feature.emoji}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleUpgrade}
          style={styles.upgradeButton}
          activeOpacity={0.8}
        >
          <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Cancel anytime</Text>

        <View style={{ height: Math.max(insets.bottom, 40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  crownEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priceUnit: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  trialText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  featuresList: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
