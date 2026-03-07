import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getPushToken } from './notification-manager';

/**
 * Sync the Expo push token to Supabase for remote notifications
 * Call this after user authentication
 */
export async function syncPushTokenToSupabase(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in, skipping push token sync');
      return false;
    }

    // Get or create push token
    let pushToken = await AsyncStorage.getItem('expo_push_token');
    
    if (!pushToken) {
      pushToken = await getPushToken();
    }

    if (!pushToken) {
      console.log('No push token available');
      return false;
    }

    // Upsert push token to user_settings
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        expo_push_token: pushToken,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error syncing push token:', error);
      return false;
    }

    console.log('Push token synced to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Error in syncPushTokenToSupabase:', error);
    return false;
  }
}

/**
 * Get push token for current user from Supabase
 */
export async function getUserPushToken(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('expo_push_token')
      .eq('user_id', user.id)
      .single();

    if (error || !data?.expo_push_token) {
      return null;
    }

    return data.expo_push_token;
  } catch (error) {
    console.error('Error getting user push token:', error);
    return null;
  }
}
