-- =============================================================================
-- Add Push Token to User Settings
-- =============================================================================
-- Fixes: push notifications require storing device push token
-- Created: 2026-09-30
-- =============================================================================

-- Add push_token column to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS push_token TEXT;
