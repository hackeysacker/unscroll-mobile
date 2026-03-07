import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/AppProvider';
import { ScreenFrame } from '@/components/ui/ScreenFrame';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry for error tracking
// Replace with your own Sentry DSN from sentry.io
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  debug: __DEV__,
});

export default function RootLayout() {
  return (
    <Sentry.ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <ScreenFrame>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
            </Stack>
          </ScreenFrame>
        </AppProvider>
      </SafeAreaProvider>
    </Sentry.ErrorBoundary>
  );
}

