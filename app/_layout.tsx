import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { AppProvider } from '@/AppProvider';
import { ScreenFrame } from '@/components/ui/ScreenFrame';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { addNotificationReceivedListener, addNotificationResponseListener } from '@/lib/notifications';

// Initialize Sentry - DSN should be set in SENTRY_DSN environment variable
// For production, add SENTRY_DSN to your .env file
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  // Enable in debug for development
  debug: __DEV__,
});

// Configure notification handlers
function setupNotifications() {
  // Handle notifications received while app is in foreground
  addNotificationReceivedListener((notification) => {
    if (__DEV__) {
      console.log('Notification received:', notification.request.content.title);
    }
  });

  // Handle notification taps
  addNotificationResponseListener((response) => {
    if (__DEV__) {
      console.log('Notification tapped:', response.notification.request.content.title);
    }
  });
}

function RootLayoutInner() {
  setupNotifications();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <ScreenFrame>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
            </Stack>
          </ScreenFrame>
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayoutInner);

