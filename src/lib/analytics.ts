/**
 * Analytics Event Tracking System
 * Privacy-focused analytics with local aggregation and optional cloud sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const ANALYTICS_STORAGE_KEY = '@focusflow_analytics';
const ANALYTICS_BATCH_SIZE = 50;
const ANALYTICS_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Event types
 */
export enum AnalyticsEvent {
  // App lifecycle
  APP_OPENED = 'app_opened',
  APP_CLOSED = 'app_closed',
  APP_BACKGROUNDED = 'app_backgrounded',

  // User actions
  CHALLENGE_STARTED = 'challenge_started',
  CHALLENGE_COMPLETED = 'challenge_completed',
  CHALLENGE_FAILED = 'challenge_failed',
  CHALLENGE_ABANDONED = 'challenge_abandoned',

  // Progress
  LEVEL_UP = 'level_up',
  XP_EARNED = 'xp_earned',
  STREAK_UPDATED = 'streak_updated',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',

  // Hearts
  HEART_LOST = 'heart_lost',
  HEART_GAINED = 'heart_gained',
  HEART_REFILL_ACTION = 'heart_refill_action',

  // Social
  FRIEND_REQUEST_SENT = 'friend_request_sent',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  ACHIEVEMENT_SHARED = 'achievement_shared',

  // Daily challenge
  DAILY_CHALLENGE_STARTED = 'daily_challenge_started',
  DAILY_CHALLENGE_COMPLETED = 'daily_challenge_completed',

  // Navigation
  SCREEN_VIEW = 'screen_view',
  FEATURE_DISCOVERED = 'feature_discovered',
  TOUR_STARTED = 'tour_started',
  TOUR_COMPLETED = 'tour_completed',

  // Settings
  SETTING_CHANGED = 'setting_changed',
  THEME_CHANGED = 'theme_changed',
  ACCESSIBILITY_ENABLED = 'accessibility_enabled',

  // Premium
  PREMIUM_VIEWED = 'premium_viewed',
  PREMIUM_PURCHASED = 'premium_purchased',
  PREMIUM_CANCELLED = 'premium_cancelled',

  // Errors
  ERROR_OCCURRED = 'error_occurred',
  CRASH_REPORTED = 'crash_reported',
}

/**
 * Event properties interface
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Tracked event interface
 */
interface TrackedEvent {
  id: string;
  event: AnalyticsEvent;
  properties: EventProperties;
  timestamp: number;
  sessionId: string;
  userId?: string;
  synced: boolean;
}

/**
 * Session data
 */
interface SessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  eventsCount: number;
  challengesCompleted: number;
  xpEarned: number;
}

/**
 * Analytics Manager
 */
class AnalyticsManager {
  private events: TrackedEvent[] = [];
  private currentSession: SessionData | null = null;
  private userId: string | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Initialize analytics
   */
  async initialize(userId?: string) {
    if (this.isInitialized) return;

    this.userId = userId || null;
    this.currentSession = this.startNewSession();

    // Load persisted events
    await this.loadEvents();

    // Start sync interval
    this.startSyncInterval();

    this.isInitialized = true;

    // Track app opened
    this.track(AnalyticsEvent.APP_OPENED);
  }

  /**
   * Start new session
   */
  private startNewSession(): SessionData {
    return {
      sessionId: this.generateId(),
      startTime: Date.now(),
      eventsCount: 0,
      challengesCompleted: 0,
      xpEarned: 0,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Track event
   */
  track(event: AnalyticsEvent, properties: EventProperties = {}) {
    if (!this.currentSession) {
      console.warn('Analytics not initialized');
      return;
    }

    const trackedEvent: TrackedEvent = {
      id: this.generateId(),
      event,
      properties: {
        ...properties,
        platform: 'mobile',
        version: '1.0.0', // App version
      },
      timestamp: Date.now(),
      sessionId: this.currentSession.sessionId,
      userId: this.userId || undefined,
      synced: false,
    };

    this.events.push(trackedEvent);
    this.currentSession.eventsCount++;

    // Update session stats
    if (event === AnalyticsEvent.CHALLENGE_COMPLETED) {
      this.currentSession.challengesCompleted++;
    }
    if (properties.xp) {
      this.currentSession.xpEarned += Number(properties.xp);
    }

    // Persist events periodically
    if (this.events.length % 10 === 0) {
      this.saveEvents();
    }

    // Auto-sync if batch size reached
    if (this.events.filter(e => !e.synced).length >= ANALYTICS_BATCH_SIZE) {
      this.syncEvents();
    }

    // Log in development
    if (__DEV__) {
      console.log(`📊 Analytics: ${event}`, properties);
    }
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties: EventProperties = {}) {
    this.track(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track timing
   */
  trackTiming(category: string, variable: string, timeMs: number, label?: string) {
    this.track(AnalyticsEvent.CHALLENGE_COMPLETED, {
      category,
      variable,
      time_ms: timeMs,
      label,
    });
  }

  /**
   * Set user ID
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * End session
   */
  endSession() {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.track(AnalyticsEvent.APP_CLOSED, {
      session_duration: this.currentSession.endTime - this.currentSession.startTime,
      events_count: this.currentSession.eventsCount,
      challenges_completed: this.currentSession.challengesCompleted,
      xp_earned: this.currentSession.xpEarned,
    });

    this.saveEvents();
    this.currentSession = null;
  }

  /**
   * Load events from storage
   */
  private async loadEvents() {
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading analytics events:', error);
    }
  }

  /**
   * Save events to storage
   */
  private async saveEvents() {
    try {
      await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  /**
   * Sync events to backend
   */
  async syncEvents() {
    const unsyncedEvents = this.events.filter(e => !e.synced);
    if (unsyncedEvents.length === 0) return;

    try {
      // Batch events
      const batches = this.chunkArray(unsyncedEvents, ANALYTICS_BATCH_SIZE);

      for (const batch of batches) {
        const { error } = await supabase.from('analytics_events').insert(
          batch.map(event => ({
            event_id: event.id,
            user_id: event.userId,
            session_id: event.sessionId,
            event_type: event.event,
            properties: event.properties,
            timestamp: new Date(event.timestamp).toISOString(),
          }))
        );

        if (error) throw error;

        // Mark as synced
        batch.forEach(event => {
          event.synced = true;
        });
      }

      await this.saveEvents();

      // Clean up old synced events (keep last 1000)
      if (this.events.length > 1000) {
        const syncedEvents = this.events.filter(e => e.synced);
        const unsyncedEvents = this.events.filter(e => !e.synced);
        this.events = [
          ...syncedEvents.slice(-500),
          ...unsyncedEvents,
        ];
        await this.saveEvents();
      }
    } catch (error) {
      console.error('Error syncing analytics events:', error);
    }
  }

  /**
   * Start sync interval
   */
  private startSyncInterval() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncEvents();
    }, ANALYTICS_SYNC_INTERVAL);
  }

  /**
   * Stop sync interval
   */
  private stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    return {
      totalEvents: this.events.length,
      unsyncedEvents: this.events.filter(e => !e.synced).length,
      currentSession: this.currentSession,
    };
  }

  /**
   * Clear all events
   */
  async clearEvents() {
    this.events = [];
    await AsyncStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }

  /**
   * Shutdown
   */
  shutdown() {
    this.endSession();
    this.stopSyncInterval();
    this.saveEvents();
  }
}

// Singleton instance
export const analytics = new AnalyticsManager();

/**
 * Convenience functions
 */

export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  analytics.track(event, properties);
}

export function trackScreen(screenName: string, properties?: EventProperties) {
  analytics.trackScreen(screenName, properties);
}

export function trackChallengeStart(challengeType: string, difficulty: number) {
  analytics.track(AnalyticsEvent.CHALLENGE_STARTED, {
    challenge_type: challengeType,
    difficulty,
  });
}

export function trackChallengeComplete(
  challengeType: string,
  score: number,
  duration: number,
  xp: number,
  isPerfect: boolean
) {
  analytics.track(AnalyticsEvent.CHALLENGE_COMPLETED, {
    challenge_type: challengeType,
    score,
    duration_ms: duration,
    xp,
    is_perfect: isPerfect,
  });
}

export function trackAchievementUnlock(achievementId: string, achievementTitle: string) {
  analytics.track(AnalyticsEvent.ACHIEVEMENT_UNLOCKED, {
    achievement_id: achievementId,
    achievement_title: achievementTitle,
  });
}

export function trackLevelUp(newLevel: number, totalXp: number) {
  analytics.track(AnalyticsEvent.LEVEL_UP, {
    new_level: newLevel,
    total_xp: totalXp,
  });
}

export function trackError(errorType: string, errorMessage: string, stack?: string) {
  analytics.track(AnalyticsEvent.ERROR_OCCURRED, {
    error_type: errorType,
    error_message: errorMessage,
    stack: stack?.substring(0, 500), // Limit stack trace length
  });
}
