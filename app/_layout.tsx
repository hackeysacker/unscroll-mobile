import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/AppProvider';
import { ScreenFrame } from '@/components/ui/ScreenFrame';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
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

