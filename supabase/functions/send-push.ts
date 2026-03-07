// Supabase Edge Function for sending Expo push notifications
// This enables server-side push notifications to FocusFlow users

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Expo Push API endpoint
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send'

interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: string
  badge?: number
}

interface SendPushRequest {
  userId?: string // Send to specific user (by their user_id)
  token?: string // Send to specific Expo push token
  payload: PushNotificationPayload
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { userId, token, payload }: SendPushRequest = await req.json()

    if (!payload || !payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: 'Missing required payload fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let pushTokens: string[] = []

    // Get push token(s) to send to
    if (token) {
      // Direct token provided
      pushTokens = [token]
    } else if (userId) {
      // Look up token from user_settings
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('expo_push_token')
        .eq('user_id', userId)
        .single()

      if (error || !settings?.expo_push_token) {
        return new Response(JSON.stringify({ error: 'User not found or no push token' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      pushTokens = [settings.expo_push_token]
    } else {
      return new Response(JSON.stringify({ error: 'Must provide either userId or token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Send push notifications via Expo
    const messages = pushTokens.map(t => ({
      to: t,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      sound: payload.sound || 'default',
      badge: payload.badge || 0
    }))

    const responses = await Promise.all(
      messages.map(async (msg) => {
        const response = await fetch(EXPO_PUSH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(msg),
        })
        return response.json()
      })
    )

    return new Response(JSON.stringify({
      success: true,
      sent: pushTokens.length,
      responses
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error sending push notification:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
