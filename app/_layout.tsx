import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/AppProvider';
import { ScreenFrame } from '@/components/ui/ScreenFrame';
import * as Sentry from '@sentry/react-native';
import * as Linking from 'expo-linking';

// Initialize Sentry for error tracking
// Replace with your own Sentry DSN from sentry.io
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  debug: __DEV__,
});

const prefix = Linking.createURL('/');

export const linking = {
  prefixes: [prefix, 'focusflow://'],
  config: {
    screens: {
      index: 'home',
      'focus-session': 'focus',
      settings: 'settings',
      achievements: 'achievements',
      leaderboard: 'leaderboard',
    },
  },
};

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

