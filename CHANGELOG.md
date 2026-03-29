# Changelog

All notable changes to FocusFlow are documented here.

## [1.2.0] - 2026-03-29

### Added
- **Push Notifications**: Server-side via Expo Push + Supabase Edge Functions (send-push, broadcast-push)
- **iOS Widgets**: Home screen widgets (small + medium) showing streak, level, gems, focus minutes
- **iOS 17+ Smart Stack**: AppIntents for interactive widget actions, Siri suggestions
- **Widget Bridge**: Native Swift module for app-to-widget data sync via App Groups
- **Sentry Integration**: Error tracking with automatic error capture
- **Widget Data Sync**: Automatic widget updates when game progress changes
- **Streak Reminder Notifications**: Evening (8 PM) and recovery (10 AM) reminders
- **Push Token Sync**: Automatic Expo push token sync to Supabase on auth
- **Test Notification**: In-app notification testing in Settings
- **App Icon**: 1024x1024 App Store icon + adaptive icon
- **Google Sign-In**: Supabase OAuth integration
- **Apple Sign-In**: Native Apple authentication
- **Focus Reminder Notifications**: Customizable break reminders and daily check-ins
- **Notification Settings**: Detailed notification preferences (break interval, daily check-in time, focus session reminders)
- **Rate App & Share**: In-app rate prompt and share functionality
- **Data Export**: GDPR-compliant user data export to JSON
- **Widget Data Bridge**: Native module for syncing focus data to iOS widgets

### Fixed
- TypeScript compilation errors across 30+ files
- LinearGradient colors type assertions
- Theme style property names (textSecondary -> colors.mutedForeground)
- Sentry initialization configuration
- Missing haptic pattern definitions
- Missing sound profiles (click, notification)
- Accessibility role types
- Notification permission checks

## [1.1.0] - 2026-03-05

### Added
- **Supabase Auth**: Email/password, Apple, and Google authentication
- **Cloud Sync**: Real-time sync of game state to Supabase
- **Gems System**: Earn and spend gems with local + cloud persistence
- **Hearts System**: Life system with automatic refill
- **XP & Leveling**: Full progression system with 250 levels across 10 realms

## [1.0.0] - 2026-03-01

### Added
- Core challenge system (Focus, Memory, Reaction, Discipline, Breathing)
- 42 challenge types
- Progress path with 250 levels
- Attention avatar with evolution
- Daily challenges
- Leaderboard
- Achievements
- Onboarding flow with permissions
- Offline mode
- Premium features
