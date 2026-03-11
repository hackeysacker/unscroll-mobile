/**
 * Supabase Retry Logic
 * Handles failed syncs with exponential backoff and retry strategies
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'ECONNABORTED',
    'ENOTFOUND',
    'ECONNRESET',
    'ETIMEDOUT',
    '503', // Service unavailable
    '504', // Gateway timeout
    '429', // Rate limit
  ],
};

// Queue for offline operations
const SYNC_QUEUE_KEY = '@focusflow_sync_queue';

interface QueuedOperation {
  id: string;
  operation: string;
  params: any;
  timestamp: number;
  retryCount: number;
}

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, options: RetryOptions = {}): number {
  const initialDelay = options.initialDelay || RETRY_CONFIG.initialDelayMs;
  const maxDelay = options.maxDelay || RETRY_CONFIG.maxDelayMs;
  const multiplier = options.backoffMultiplier || RETRY_CONFIG.backoffMultiplier;

  const delay = initialDelay * Math.pow(multiplier, attempt - 1);

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay; // 0-30% jitter

  return Math.min(delay + jitter, maxDelay);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorString = String(error.message || error.code || error);

  return RETRY_CONFIG.retryableErrors.some(retryableError =>
    errorString.includes(retryableError)
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for async operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries || RETRY_CONFIG.maxRetries;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await operation();

      // Success! Return the result
      return result;
    } catch (error: any) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = attempt <= maxRetries && isRetryableError(error);

      if (!shouldRetry) {
        // Non-retryable error or max retries exceeded
        throw error;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt, options);

      // Call retry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt, error);
      }

      console.log(
        `Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms. Error: ${error.message || error}`
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError;
}

/**
 * Add operation to sync queue
 */
export async function queueOperation(
  operation: string,
  params: any
): Promise<void> {
  try {
    const queue = await getSyncQueue();

    const queuedOp: QueuedOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      params,
      timestamp: Date.now(),
      retryCount: 0,
    };

    queue.push(queuedOp);
    await saveSyncQueue(queue);

    console.log(`Queued operation: ${operation}`);
  } catch (error) {
    console.error('Failed to queue operation:', error);
  }
}

/**
 * Get sync queue from storage
 */
export async function getSyncQueue(): Promise<QueuedOperation[]> {
  try {
    const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch (error) {
    console.error('Failed to get sync queue:', error);
    return [];
  }
}

/**
 * Save sync queue to storage
 */
async function saveSyncQueue(queue: QueuedOperation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save sync queue:', error);
  }
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    console.log('Sync queue cleared');
  } catch (error) {
    console.error('Failed to clear sync queue:', error);
  }
}

/**
 * Remove specific operation from queue
 */
export async function removeFromQueue(operationId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter(op => op.id !== operationId);
    await saveSyncQueue(filtered);
  } catch (error) {
    console.error('Failed to remove from queue:', error);
  }
}

/**
 * Process sync queue
 * Returns number of successful operations
 */
export async function processSyncQueue(
  operationHandlers: Record<string, (params: any) => Promise<any>>
): Promise<{ success: number; failed: number }> {
  const queue = await getSyncQueue();

  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }

  console.log(`Processing ${queue.length} queued operations...`);

  let successCount = 0;
  let failedCount = 0;
  const remainingQueue: QueuedOperation[] = [];

  for (const op of queue) {
    const handler = operationHandlers[op.operation];

    if (!handler) {
      console.warn(`No handler found for operation: ${op.operation}`);
      failedCount++;
      continue;
    }

    try {
      // Try to execute the operation with retry
      await withRetry(
        () => handler(op.params),
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            console.log(`Retrying queued operation ${op.operation} (attempt ${attempt})`);
          },
        }
      );

      successCount++;
      console.log(`Successfully processed queued operation: ${op.operation}`);
    } catch (error) {
      console.error(`Failed to process queued operation ${op.operation}:`, error);

      // Increment retry count
      op.retryCount++;

      // If we haven't exceeded max retries, keep it in queue
      if (op.retryCount < RETRY_CONFIG.maxRetries) {
        remainingQueue.push(op);
      } else {
        console.warn(`Max retries exceeded for operation ${op.operation}, discarding`);
        failedCount++;
      }
    }
  }

  // Save remaining queue
  await saveSyncQueue(remainingQueue);

  console.log(`Sync queue processed: ${successCount} success, ${failedCount} failed, ${remainingQueue.length} remaining`);

  return { success: successCount, failed: failedCount };
}

/**
 * Wrapper for Supabase operations with automatic retry and queuing
 */
export async function withSupabaseRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  operationParams?: any,
  options: RetryOptions = {}
): Promise<T | null> {
  try {
    // Try with retry
    const result = await withRetry(operation, options);
    return result;
  } catch (error: any) {
    console.error(`Supabase operation ${operationName} failed after retries:`, error);

    // Queue for later if params provided
    if (operationParams) {
      await queueOperation(operationName, operationParams);
    }

    // Return null to allow app to continue functioning
    return null;
  }
}

/**
 * Batch retry wrapper - retries multiple operations together
 */
export async function batchWithRetry<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<T | null>> {
  const results: Array<T | null> = [];

  for (const operation of operations) {
    try {
      const result = await withRetry(operation, options);
      results.push(result);
    } catch (error) {
      console.error('Batch operation failed:', error);
      results.push(null);
    }
  }

  return results;
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  // In React Native, we'd typically use NetInfo here
  // For now, assume online (can be enhanced with @react-native-community/netinfo)
  return true;
}

/**
 * Get sync queue stats
 */
export async function getSyncQueueStats(): Promise<{
  count: number;
  oldestTimestamp: number | null;
  operations: Record<string, number>;
}> {
  const queue = await getSyncQueue();

  const stats = {
    count: queue.length,
    oldestTimestamp: queue.length > 0 ? Math.min(...queue.map(op => op.timestamp)) : null,
    operations: {} as Record<string, number>,
  };

  // Count operations by type
  queue.forEach(op => {
    stats.operations[op.operation] = (stats.operations[op.operation] || 0) + 1;
  });

  return stats;
}
