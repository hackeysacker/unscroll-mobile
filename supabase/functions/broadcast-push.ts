// Supabase Edge Function for broadcasting push notifications to multiple users
// Useful for announcements, streak reminders, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send'

interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: string
  badge?: number
}

interface BroadcastRequest {
  userIds?: string[] // Send to multiple users
  filter?: string // SQL filter for user selection (e.g., 'streak > 5')
  payload: PushNotificationPayload
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { userIds, filter, payload }: BroadcastRequest = await req.json()

    if (!payload || !payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: 'Missing required payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let pushTokens: string[] = []

    if (userIds && userIds.length > 0) {
      // Get tokens for specific users
      const { data: settings } = await supabase
        .from('user_settings')
        .select('expo_push_token')
        .in('user_id', userIds)
        .not('expo_push_token', 'is', null)

      pushTokens = settings?.map(s => s.expo_push_token).filter(Boolean) || []
    } else if (filter) {
      // Get all users matching filter (with push tokens)
      // Note: This is a simplified query - in production you'd build this more carefully
      const { data: settings } = await supabase
        .from('user_settings')
        .select('expo_push_token')
        .not('expo_push_token', 'is', null)
        .limit(100) // Limit to avoid rate limits

      pushTokens = settings?.map(s => s.expo_push_token).filter(Boolean) || []
    } else {
      return new Response(JSON.stringify({ error: 'Must provide userIds or filter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (pushTokens.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: 'No push tokens found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Send in batches of 100 (Expo limit)
    const results = []
    const batchSize = 100
    
    for (let i = 0; i < pushTokens.length; i += batchSize) {
      const batch = pushTokens.slice(i, i + batchSize)
      const messages = batch.map(t => ({
        to: t,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || 'default'
      }))

      const batchResults = await Promise.all(
        messages.map(msg => 
          fetch(EXPO_PUSH_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
          }).then(r => r.json())
        )
      )
      results.push(...batchResults)
    }

    return new Response(JSON.stringify({
      success: true,
      sent: pushTokens.length,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error broadcasting:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
