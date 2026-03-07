/**
 * Error Boundary Component
 * Catches React errors anywhere in the component tree
 * Provides fallback UI and recovery mechanisms
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

const ERROR_COUNT_KEY = '@focusflow_error_count';
const MAX_ERRORS_BEFORE_RESET = 3;

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Track error count
    const errorCount = await this.incrementErrorCount();

    this.setState({
      errorInfo,
      errorCount,
    });

    // Log to analytics or crash reporting service here
    this.logErrorToService(error, errorInfo);

    // If too many errors, suggest app reload
    if (errorCount >= MAX_ERRORS_BEFORE_RESET) {
      console.warn(`${MAX_ERRORS_BEFORE_RESET} errors detected, suggesting app reload`);
    }
  }

  async incrementErrorCount(): Promise<number> {
    try {
      const countStr = await AsyncStorage.getItem(ERROR_COUNT_KEY);
      const count = countStr ? parseInt(countStr, 10) : 0;
      const newCount = count + 1;
      await AsyncStorage.setItem(ERROR_COUNT_KEY, newCount.toString());
      return newCount;
    } catch {
      return 1;
    }
  }

  async resetErrorCount() {
    try {
      await AsyncStorage.removeItem(ERROR_COUNT_KEY);
    } catch (error) {
      console.error('Failed to reset error count:', error);
    }
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Send to Sentry for error tracking
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Also log locally for debugging
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };

    console.log('Error sent to Sentry:', errorData);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = async () => {
    try {
      // Reset error count
      await this.resetErrorCount();

      // Reload the app
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
      } else {
        // In development, just reset state
        this.handleReset();
      }
    } catch (error) {
      console.error('Failed to reload app:', error);
      this.handleReset();
    }
  };

  handleClearData = async () => {
    try {
      // Clear all app data and reload
      await AsyncStorage.clear();
      await this.handleReload();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleReset);
      }

      // Default fallback UI
      return (
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, your progress is saved.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack}>
                    {this.state.error.stack}
                  </Text>
                )}
              </ScrollView>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleReload}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Reload App</Text>
              </TouchableOpacity>

              {this.state.errorCount >= MAX_ERRORS_BEFORE_RESET && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={this.handleClearData}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.secondaryButtonText, { color: '#EF4444' }]}>
                    Clear Data & Restart
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {this.state.errorCount >= 2 && (
              <Text style={styles.persistentError}>
                Multiple errors detected ({this.state.errorCount}). If this continues, try reloading the app.
              </Text>
            )}
          </View>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  persistentError: {
    marginTop: 16,
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
  },
});
