/**
 * Animation Performance Monitor
 * Tracks FPS, dropped frames, and provides optimization utilities
 */

import { InteractionManager } from 'react-native';

interface PerformanceMetrics {
  fps: number;
  droppedFrames: number;
  averageFrameTime: number;
  worstFrameTime: number;
  totalFrames: number;
}

interface FrameCallback {
  (frameTime: number): void;
}

class PerformanceMonitor {
  private isMonitoring = false;
  private frameCallbacks: Set<FrameCallback> = new Set();
  private metrics: PerformanceMetrics = {
    fps: 60,
    droppedFrames: 0,
    averageFrameTime: 16.67,
    worstFrameTime: 16.67,
    totalFrames: 0,
  };

  private lastFrameTime = 0;
  private frameTimes: number[] = [];
  private maxFrameHistory = 60; // Keep last 60 frames (1 second at 60fps)

  private rafId: number | null = null;

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameTimes = [];
    this.metrics = {
      fps: 60,
      droppedFrames: 0,
      averageFrameTime: 16.67,
      worstFrameTime: 16.67,
      totalFrames: 0,
    };

    this.monitorFrame();
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Monitor a single frame
   */
  private monitorFrame = () => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;

    // Record frame time
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }

    // Update metrics
    this.metrics.totalFrames++;

    // Check for dropped frames (>16.67ms for 60fps)
    if (frameTime > 16.67) {
      this.metrics.droppedFrames++;
    }

    // Calculate average frame time
    this.metrics.averageFrameTime =
      this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;

    // Track worst frame time
    this.metrics.worstFrameTime = Math.max(this.metrics.worstFrameTime, frameTime);

    // Calculate FPS
    this.metrics.fps = 1000 / this.metrics.averageFrameTime;

    // Notify callbacks
    this.frameCallbacks.forEach(callback => callback(frameTime));

    this.lastFrameTime = currentTime;
    this.rafId = requestAnimationFrame(this.monitorFrame);
  };

  /**
   * Add a frame callback
   */
  onFrame(callback: FrameCallback) {
    this.frameCallbacks.add(callback);
    return () => this.frameCallbacks.delete(callback);
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if performance is good
   */
  isPerformanceGood(): boolean {
    return this.metrics.fps >= 55 && this.metrics.averageFrameTime < 18;
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      fps: 60,
      droppedFrames: 0,
      averageFrameTime: 16.67,
      worstFrameTime: 16.67,
      totalFrames: 0,
    };
    this.frameTimes = [];
  }

  /**
   * Log performance summary
   */
  logSummary() {
    console.log('=== Performance Summary ===');
    console.log(`FPS: ${this.metrics.fps.toFixed(2)}`);
    console.log(`Average Frame Time: ${this.metrics.averageFrameTime.toFixed(2)}ms`);
    console.log(`Worst Frame Time: ${this.metrics.worstFrameTime.toFixed(2)}ms`);
    console.log(`Dropped Frames: ${this.metrics.droppedFrames}/${this.metrics.totalFrames} (${((this.metrics.droppedFrames / this.metrics.totalFrames) * 100).toFixed(2)}%)`);
    console.log('========================');
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Optimize animation by deferring until interactions complete
 */
export function runAfterInteractions<T>(callback: () => T): Promise<T> {
  return new Promise(resolve => {
    InteractionManager.runAfterInteractions(() => {
      resolve(callback());
    });
  });
}

/**
 * Debounce expensive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle expensive operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request animation frame with cleanup
 */
export function useRAF(callback: FrameRequestCallback): () => void {
  const rafId = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(rafId);
}

/**
 * Batch multiple state updates
 */
export function batchUpdates<T>(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Check if device can handle smooth animations
 */
export function canHandleSmoothAnimations(): boolean {
  // Check FPS performance
  const metrics = performanceMonitor.getMetrics();
  return metrics.fps >= 50;
}

/**
 * Get recommended animation duration based on performance
 */
export function getOptimizedDuration(baseDuration: number): number {
  const metrics = performanceMonitor.getMetrics();

  if (metrics.fps >= 55) {
    // Good performance - use full duration
    return baseDuration;
  } else if (metrics.fps >= 40) {
    // Moderate performance - reduce by 20%
    return baseDuration * 0.8;
  } else {
    // Poor performance - reduce by 50%
    return baseDuration * 0.5;
  }
}

/**
 * Performance warning levels
 */
export enum PerformanceLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  MODERATE = 'moderate',
  POOR = 'poor',
}

/**
 * Get current performance level
 */
export function getPerformanceLevel(): PerformanceLevel {
  const metrics = performanceMonitor.getMetrics();

  if (metrics.fps >= 58) {
    return PerformanceLevel.EXCELLENT;
  } else if (metrics.fps >= 50) {
    return PerformanceLevel.GOOD;
  } else if (metrics.fps >= 40) {
    return PerformanceLevel.MODERATE;
  } else {
    return PerformanceLevel.POOR;
  }
}

/**
 * Hook for monitoring component render performance
 */
export function measureRenderTime(componentName: string, renderFn: () => void) {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (renderTime > 16.67) {
    console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (>16.67ms threshold)`);
  }

  if (__DEV__) {
    console.log(`📊 ${componentName} render: ${renderTime.toFixed(2)}ms`);
  }

  return renderTime;
}

/**
 * Memory usage monitor (if available)
 */
export function getMemoryUsage(): number | null {
  if (performance && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize / 1048576; // Convert to MB
  }
  return null;
}

/**
 * Log memory usage
 */
export function logMemoryUsage() {
  const memoryMB = getMemoryUsage();
  if (memoryMB !== null) {
    console.log(`💾 Memory Usage: ${memoryMB.toFixed(2)} MB`);
  }
}

/**
 * Detect if running on low-end device
 */
export function isLowEndDevice(): boolean {
  const metrics = performanceMonitor.getMetrics();
  const memoryMB = getMemoryUsage();

  // Consider low-end if:
  // - FPS consistently below 45
  // - Memory usage above 512MB (if available)
  return metrics.fps < 45 || (memoryMB !== null && memoryMB > 512);
}

/**
 * Get animation config based on device capability
 */
export function getOptimizedAnimationConfig() {
  const level = getPerformanceLevel();

  switch (level) {
    case PerformanceLevel.EXCELLENT:
      return {
        useNativeDriver: true,
        enableComplexAnimations: true,
        particleCount: 50,
        shadowsEnabled: true,
        blurEnabled: true,
      };

    case PerformanceLevel.GOOD:
      return {
        useNativeDriver: true,
        enableComplexAnimations: true,
        particleCount: 30,
        shadowsEnabled: true,
        blurEnabled: false,
      };

    case PerformanceLevel.MODERATE:
      return {
        useNativeDriver: true,
        enableComplexAnimations: false,
        particleCount: 15,
        shadowsEnabled: false,
        blurEnabled: false,
      };

    case PerformanceLevel.POOR:
      return {
        useNativeDriver: true,
        enableComplexAnimations: false,
        particleCount: 5,
        shadowsEnabled: false,
        blurEnabled: false,
      };
  }
}
