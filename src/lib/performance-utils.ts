/**
 * Performance optimization utilities for smooth animations
 */

import { InteractionManager, LayoutAnimation, UIManager, Platform } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Custom layout animation presets
 */
export const LayoutAnimations = {
  smooth: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  },
  
  spring: {
    duration: 400,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.7,
    },
  },
  
  fade: {
    duration: 200,
    create: {
      type: LayoutAnimation.Types.easeIn,
      property: LayoutAnimation.Properties.opacity,
    },
    delete: {
      type: LayoutAnimation.Types.easeOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },
};

/**
 * Run expensive operations after animations complete
 */
export function runAfterInteractions(callback: () => void): void {
  InteractionManager.runAfterInteractions(() => {
    requestAnimationFrame(callback);
  });
}

/**
 * Debounce function for performance-critical operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memory-efficient array chunking for large lists
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Performance monitoring (development only)
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private marks: Map<string, number> = new Map();
  
  start(label?: string): void {
    this.startTime = Date.now();
    if (label) {
      this.marks.set(label, this.startTime);
    }
  }
  
  mark(label: string): void {
    this.marks.set(label, Date.now());
  }
  
  measure(label: string): number {
    const markTime = this.marks.get(label);
    if (!markTime) {
      console.warn(`No mark found for: ${label}`);
      return 0;
    }
    return Date.now() - markTime;
  }
  
  end(label?: string): number {
    const duration = Date.now() - this.startTime;
    if (__DEV__ && label) {
      console.log(`⚡ ${label}: ${duration}ms`);
    }
    return duration;
  }
  
  logAll(): void {
    if (__DEV__) {
      console.log('📊 Performance Marks:');
      this.marks.forEach((time, label) => {
        console.log(`  ${label}: ${Date.now() - time}ms ago`);
      });
    }
  }
}

/**
 * Optimize FlatList/ScrollView performance
 */
export const ScrollOptimizations = {
  windowSize: 10,
  maxToRenderPerBatch: 5,
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 10,
  removeClippedSubviews: true,
  scrollEventThrottle: 16,
};

/**
 * Animation frame scheduler
 */
export class AnimationScheduler {
  private queue: Array<() => void> = [];
  private isProcessing: boolean = false;
  
  schedule(callback: () => void): void {
    this.queue.push(callback);
    if (!this.isProcessing) {
      this.process();
    }
  }
  
  private process(): void {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    requestAnimationFrame(() => {
      const callback = this.queue.shift();
      if (callback) {
        callback();
      }
      this.process();
    });
  }
  
  clear(): void {
    this.queue = [];
    this.isProcessing = false;
  }
}

/**
 * Resource cleanup helper
 */
export class ResourceManager {
  private resources: Array<() => void> = [];
  
  register(cleanup: () => void): void {
    this.resources.push(cleanup);
  }
  
  cleanup(): void {
    this.resources.forEach(cleanup => cleanup());
    this.resources = [];
  }
}
























