-- =============================================================================
-- Add Analytics Events Table
-- =============================================================================
-- Fixes: analytics.ts tries to insert into analytics_events but table didn't exist
-- Created: 2026-09-30
-- =============================================================================

-- Analytics Events: Raw event log for tracking user behavior
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own events
CREATE POLICY "Users can view own analytics events" ON analytics_events FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Users can insert own analytics events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Function to auto-cleanup old events (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events 
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-analytics', '0 3 * * *', 'SELECT cleanup_old_analytics_events()');
