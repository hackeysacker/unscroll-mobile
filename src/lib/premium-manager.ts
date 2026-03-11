/**
 * Premium Subscription Manager
 * Handles premium subscriptions, purchases, and feature access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const PREMIUM_STATUS_KEY = '@focusflow_premium_status';

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM_MONTHLY = 'premium_monthly',
  PREMIUM_YEARLY = 'premium_yearly',
  PREMIUM_LIFETIME = 'premium_lifetime',
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  period: 'month' | 'year' | 'lifetime';
  features: string[];
  popular?: boolean;
  savings?: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  tier: SubscriptionTier;
  expiresAt?: Date;
  purchasedAt?: Date;
  autoRenew: boolean;
  trialEndsAt?: Date;
}

/**
 * Premium feature flags
 */
export const PREMIUM_FEATURES = {
  UNLIMITED_HEARTS: 'unlimited_hearts',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_THEMES: 'custom_themes',
  OFFLINE_MODE: 'offline_mode',
  NO_ADS: 'no_ads',
  PRIORITY_SUPPORT: 'priority_support',
  EXCLUSIVE_CHALLENGES: 'exclusive_challenges',
  STREAK_FREEZE: 'streak_freeze',
  CHALLENGE_REPLAY: 'challenge_replay',
  DETAILED_INSIGHTS: 'detailed_insights',
} as const;

/**
 * Subscription plans
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: SubscriptionTier.PREMIUM_MONTHLY,
    name: 'Monthly',
    displayName: 'Premium Monthly',
    price: 9.99,
    currency: 'USD',
    period: 'month',
    features: [
      'Unlimited Hearts',
      'Advanced Analytics',
      'Custom Themes',
      'Offline Mode',
      'No Ads',
      'Priority Support',
      'Exclusive Challenges',
      'Streak Freeze',
    ],
  },
  {
    id: SubscriptionTier.PREMIUM_YEARLY,
    name: 'Yearly',
    displayName: 'Premium Yearly',
    price: 79.99,
    currency: 'USD',
    period: 'year',
    features: [
      'All Monthly Features',
      'Save 33%',
      'Detailed Progress Insights',
      'Challenge Replay Mode',
      'Early Access to Features',
    ],
    popular: true,
    savings: 'Save $40/year',
  },
  {
    id: SubscriptionTier.PREMIUM_LIFETIME,
    name: 'Lifetime',
    displayName: 'Premium Lifetime',
    price: 199.99,
    currency: 'USD',
    period: 'lifetime',
    features: [
      'All Premium Features',
      'Pay Once, Use Forever',
      'All Future Updates',
      'Lifetime Priority Support',
      'Exclusive Lifetime Badge',
    ],
    savings: 'Best Value',
  },
];

/**
 * Premium Manager Class
 */
class PremiumManager {
  private premiumStatus: PremiumStatus = {
    isPremium: false,
    tier: SubscriptionTier.FREE,
    autoRenew: false,
  };

  private listeners: Set<(status: PremiumStatus) => void> = new Set();

  /**
   * Initialize premium status
   */
  async initialize(userId: string) {
    // Load from local storage first
    const cached = await this.loadCachedStatus();
    if (cached) {
      this.premiumStatus = cached;
      this.notifyListeners();
    }

    // Fetch latest from backend
    await this.refreshStatus(userId);
  }

  /**
   * Load cached premium status
   */
  private async loadCachedStatus(): Promise<PremiumStatus | null> {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
          purchasedAt: parsed.purchasedAt ? new Date(parsed.purchasedAt) : undefined,
          trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : undefined,
        };
      }
    } catch (error) {
      console.error('Error loading premium status:', error);
    }
    return null;
  }

  /**
   * Save premium status to cache
   */
  private async saveCachedStatus() {
    try {
      await AsyncStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify(this.premiumStatus));
    } catch (error) {
      console.error('Error saving premium status:', error);
    }
  }

  /**
   * Refresh premium status from backend
   */
  async refreshStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        this.premiumStatus = {
          isPremium: data.is_active,
          tier: data.subscription_tier as SubscriptionTier,
          expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
          purchasedAt: data.purchased_at ? new Date(data.purchased_at) : undefined,
          autoRenew: data.auto_renew || false,
          trialEndsAt: data.trial_ends_at ? new Date(data.trial_ends_at) : undefined,
        };
      } else {
        // No subscription found - set to free
        this.premiumStatus = {
          isPremium: false,
          tier: SubscriptionTier.FREE,
          autoRenew: false,
        };
      }

      await this.saveCachedStatus();
      this.notifyListeners();
    } catch (error) {
      console.error('Error refreshing premium status:', error);
    }
  }

  /**
   * Check if user has premium
   */
  isPremium(): boolean {
    return this.premiumStatus.isPremium;
  }

  /**
   * Check if user has specific feature
   */
  hasFeature(feature: string): boolean {
    if (!this.isPremium()) return false;

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.premiumStatus.tier);
    if (!plan) return false;

    // Check if feature is in plan
    return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  /**
   * Get current premium status
   */
  getStatus(): PremiumStatus {
    return { ...this.premiumStatus };
  }

  /**
   * Get subscription plan
   */
  getPlan(): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(p => p.id === this.premiumStatus.tier) || null;
  }

  /**
   * Add status listener
   */
  addListener(listener: (status: PremiumStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.premiumStatus));
  }

  /**
   * Purchase subscription (placeholder - integrate with app store)
   */
  async purchaseSubscription(
    userId: string,
    planId: SubscriptionTier,
    purchaseToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // This would integrate with RevenueCat or similar service
      // For now, we'll just update the database

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return { success: false, error: 'Invalid plan' };
      }

      let expiresAt: Date | undefined;
      if (plan.period === 'month') {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (plan.period === 'year') {
        expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      // Lifetime doesn't expire

      const { error } = await supabase.from('user_subscriptions').upsert({
        user_id: userId,
        subscription_tier: planId,
        is_active: true,
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt?.toISOString(),
        auto_renew: plan.period !== 'lifetime',
        purchase_token: purchaseToken,
      });

      if (error) throw error;

      // Refresh status
      await this.refreshStatus(userId);

      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          auto_renew: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      await this.refreshStatus(userId);

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore purchases (for app store)
   */
  async restorePurchases(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would integrate with app store restore
      // For now, just refresh from database
      await this.refreshStatus(userId);
      return { success: true };
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start free trial
   */
  async startFreeTrial(
    userId: string,
    durationDays: number = 7
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + durationDays);

      const { error } = await supabase.from('user_subscriptions').upsert({
        user_id: userId,
        subscription_tier: SubscriptionTier.PREMIUM_MONTHLY,
        is_active: true,
        trial_ends_at: trialEndsAt.toISOString(),
        auto_renew: false,
      });

      if (error) throw error;

      await this.refreshStatus(userId);

      return { success: true };
    } catch (error: any) {
      console.error('Error starting free trial:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if trial is available
   */
  async isTrialAvailable(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('trial_ends_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Trial available if never used before
      return !data || !data.trial_ends_at;
    } catch (error) {
      console.error('Error checking trial availability:', error);
      return false;
    }
  }

  /**
   * Get days remaining in subscription
   */
  getDaysRemaining(): number | null {
    if (!this.premiumStatus.expiresAt) return null;

    const now = new Date();
    const expires = this.premiumStatus.expiresAt;
    const diff = expires.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Is subscription expiring soon?
   */
  isExpiringSoon(daysThreshold: number = 7): boolean {
    const daysRemaining = this.getDaysRemaining();
    if (daysRemaining === null) return false;
    return daysRemaining <= daysThreshold && daysRemaining > 0;
  }
}

// Singleton instance
export const premiumManager = new PremiumManager();
