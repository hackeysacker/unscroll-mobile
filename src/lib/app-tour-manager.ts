/**
 * App Tour Manager
 * Manages feature tours and tooltips for onboarding users to new features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // ID of element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onPress: () => void;
  };
  dismissable?: boolean;
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
  triggerCondition?: 'first_launch' | 'feature_unlocked' | 'manual';
  completed: boolean;
}

const TOUR_STORAGE_KEY = '@focusflow_completed_tours';

/**
 * Predefined app tours
 */
export const APP_TOURS: Record<string, Tour> = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Tour',
    triggerCondition: 'first_launch',
    completed: false,
    steps: [
      {
        id: 'welcome_1',
        title: 'Welcome to FocusFlow! 👋',
        description: 'Train your attention with science-backed exercises designed to build focus and resist distractions.',
        position: 'center',
        dismissable: false,
      },
      {
        id: 'welcome_2',
        title: 'Your Journey Path 🗺️',
        description: 'Progress through 250 levels of challenges. Each level builds on the last to strengthen your focus.',
        targetElement: 'progress-tree-tab',
        position: 'bottom',
        dismissable: false,
      },
      {
        id: 'welcome_3',
        title: 'Daily Challenges 🎯',
        description: 'Complete daily challenges for bonus rewards and build your streak!',
        targetElement: 'daily-challenge-card',
        position: 'top',
        dismissable: false,
      },
      {
        id: 'welcome_4',
        title: 'Hearts System ❤️',
        description: 'You have 5 hearts. Failing challenges costs hearts, but perfect scores earn them back!',
        targetElement: 'hearts-display',
        position: 'bottom',
        dismissable: false,
      },
      {
        id: 'welcome_5',
        title: "Let's Begin! 🚀",
        description: 'Ready to train your focus? Start with your first challenge!',
        position: 'center',
        action: {
          label: 'Start Training',
          onPress: () => {},
        },
        dismissable: true,
      },
    ],
  },

  achievements: {
    id: 'achievements',
    name: 'Achievements Tour',
    triggerCondition: 'feature_unlocked',
    completed: false,
    steps: [
      {
        id: 'achievement_1',
        title: 'Achievement Unlocked! 🏆',
        description: 'You just earned your first achievement! Achievements reward you for milestones and special accomplishments.',
        position: 'center',
        dismissable: true,
      },
      {
        id: 'achievement_2',
        title: 'Track Your Progress 📊',
        description: 'View all your achievements in your profile. Share them with friends to inspire them!',
        targetElement: 'achievements-button',
        position: 'bottom',
        dismissable: true,
      },
    ],
  },

  leaderboard: {
    id: 'leaderboard',
    name: 'Leaderboard Tour',
    triggerCondition: 'feature_unlocked',
    completed: false,
    steps: [
      {
        id: 'leaderboard_1',
        title: 'Compete with Others! 🏅',
        description: 'See how you rank against other FocusFlow users. Can you make it to the top 10?',
        position: 'center',
        dismissable: true,
      },
      {
        id: 'leaderboard_2',
        title: 'Weekly & Monthly Leagues 📅',
        description: 'Rankings reset weekly and monthly, giving you fresh chances to climb the ranks!',
        targetElement: 'leaderboard-tabs',
        position: 'top',
        dismissable: true,
      },
      {
        id: 'leaderboard_3',
        title: 'Add Friends 👥',
        description: 'Connect with friends to see their progress and motivate each other!',
        targetElement: 'friends-tab',
        position: 'top',
        dismissable: true,
      },
    ],
  },

  premium: {
    id: 'premium',
    name: 'Premium Features Tour',
    triggerCondition: 'manual',
    completed: false,
    steps: [
      {
        id: 'premium_1',
        title: 'Unlock Premium ⭐',
        description: 'Get unlimited hearts, exclusive challenges, and advanced analytics with FocusFlow Premium!',
        position: 'center',
        dismissable: true,
      },
      {
        id: 'premium_2',
        title: 'Unlimited Hearts ❤️',
        description: 'Never worry about running out of hearts. Practice as much as you want!',
        position: 'center',
        dismissable: true,
      },
      {
        id: 'premium_3',
        title: 'Advanced Analytics 📈',
        description: 'Get detailed insights into your progress with charts, trends, and personalized recommendations.',
        position: 'center',
        dismissable: true,
      },
    ],
  },

  focusShield: {
    id: 'focusShield',
    name: 'Focus Shield Tour',
    triggerCondition: 'feature_unlocked',
    completed: false,
    steps: [
      {
        id: 'shield_1',
        title: 'Focus Shield Active! 🛡️',
        description: 'Block distracting apps while you train. Stay focused on what matters!',
        position: 'center',
        dismissable: true,
      },
      {
        id: 'shield_2',
        title: 'Customize Your Shield ⚙️',
        description: 'Choose which apps to block and set your focus duration.',
        targetElement: 'shield-settings',
        position: 'top',
        dismissable: true,
      },
    ],
  },
};

/**
 * Tour Manager Class
 */
export class TourManager {
  private completedTours: Set<string> = new Set();
  private activeTour: Tour | null = null;
  private currentStepIndex: number = 0;
  private listeners: Set<(tour: Tour | null, step: TourStep | null) => void> = new Set();

  async initialize() {
    const completed = await this.loadCompletedTours();
    this.completedTours = new Set(completed);
  }

  /**
   * Load completed tours from storage
   */
  private async loadCompletedTours(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(TOUR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading completed tours:', error);
      return [];
    }
  }

  /**
   * Save completed tours to storage
   */
  private async saveCompletedTours() {
    try {
      await AsyncStorage.setItem(
        TOUR_STORAGE_KEY,
        JSON.stringify(Array.from(this.completedTours))
      );
    } catch (error) {
      console.error('Error saving completed tours:', error);
    }
  }

  /**
   * Add tour listener
   */
  addListener(listener: (tour: Tour | null, step: TourStep | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners() {
    const currentStep = this.activeTour?.steps[this.currentStepIndex] || null;
    this.listeners.forEach(listener => listener(this.activeTour, currentStep));
  }

  /**
   * Start a tour
   */
  startTour(tourId: string) {
    const tour = APP_TOURS[tourId];
    if (!tour) {
      console.warn(`Tour ${tourId} not found`);
      return false;
    }

    if (this.completedTours.has(tourId)) {
      console.log(`Tour ${tourId} already completed`);
      return false;
    }

    this.activeTour = { ...tour };
    this.currentStepIndex = 0;
    this.notifyListeners();
    return true;
  }

  /**
   * Go to next step
   */
  nextStep() {
    if (!this.activeTour) return false;

    if (this.currentStepIndex < this.activeTour.steps.length - 1) {
      this.currentStepIndex++;
      this.notifyListeners();
      return true;
    } else {
      // Tour completed
      this.completeTour();
      return false;
    }
  }

  /**
   * Go to previous step
   */
  previousStep() {
    if (!this.activeTour) return false;

    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Skip/dismiss current tour
   */
  skipTour() {
    if (!this.activeTour) return;

    this.completeTour();
  }

  /**
   * Complete current tour
   */
  private completeTour() {
    if (!this.activeTour) return;

    this.completedTours.add(this.activeTour.id);
    this.saveCompletedTours();
    this.activeTour = null;
    this.currentStepIndex = 0;
    this.notifyListeners();
  }

  /**
   * Check if tour is completed
   */
  isTourCompleted(tourId: string): boolean {
    return this.completedTours.has(tourId);
  }

  /**
   * Get active tour
   */
  getActiveTour(): Tour | null {
    return this.activeTour;
  }

  /**
   * Get current step
   */
  getCurrentStep(): TourStep | null {
    if (!this.activeTour) return null;
    return this.activeTour.steps[this.currentStepIndex];
  }

  /**
   * Get progress
   */
  getProgress(): { current: number; total: number } {
    if (!this.activeTour) return { current: 0, total: 0 };
    return {
      current: this.currentStepIndex + 1,
      total: this.activeTour.steps.length,
    };
  }

  /**
   * Reset all tours (for testing)
   */
  async resetAllTours() {
    this.completedTours.clear();
    await AsyncStorage.removeItem(TOUR_STORAGE_KEY);
  }

  /**
   * Trigger tour based on condition
   */
  triggerTourIfNeeded(condition: 'first_launch' | 'feature_unlocked' | 'manual', featureId?: string) {
    // Find tours matching condition
    const eligibleTours = Object.values(APP_TOURS).filter(
      tour => tour.triggerCondition === condition && !this.completedTours.has(tour.id)
    );

    // If feature-specific, filter by ID
    if (featureId) {
      const tour = eligibleTours.find(t => t.id === featureId);
      if (tour) {
        this.startTour(tour.id);
      }
    } else if (eligibleTours.length > 0) {
      // Start first eligible tour
      this.startTour(eligibleTours[0].id);
    }
  }
}

// Singleton instance
export const tourManager = new TourManager();
