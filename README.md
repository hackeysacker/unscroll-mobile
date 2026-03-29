# FocusFlow

A gamified attention training iOS app that transforms your phone usage into focus-building challenges.

## Current Version: v1.2.0

### What's Built
- **Gamification**: Gems, Hearts, XP/Leveling, Streak tracking
- **Challenge System**: 42 challenge types across 5 categories (Focus, Memory, Reaction, Discipline, Breathing)
- **Progress Path**: 250 levels across 10 realms with nodes
- **Attention Avatar**: Evolves based on your training consistency
- **Cloud Sync**: Supabase backend with email/password, Apple, and Google auth
- **Push Notifications**: Server-side via Expo Push + Supabase Edge Functions
- **iOS Widgets**: Home screen widgets showing streak, level, gems, focus minutes
- **Sentry Integration**: Error tracking (activate by adding EXPO_PUBLIC_SENTRY_DSN to .env)
- **Offline Mode**: Full functionality offline with cloud sync on reconnect
- **Focus Shield**: Screen time tracking integration (native module stub)
- **Leaderboards & Achievements**: Social features with badge system
- **Personalized Training Plans**: AI-generated focus routines
- **TestFlight Ready**: Build configuration complete

### Build Status
```
✅ TypeScript: 0 errors
✅ iOS Bundle: 6.27 MB (entry-*.hbc)
✅ Git: clean, pushed to origin/master
✅ CI/CD: GitHub Actions (typecheck + iOS build verification)
```

### Tech Stack
- React Native (Expo SDK 54)
- TypeScript
- Supabase (Auth, Database, Edge Functions)
- Sentry (Error Tracking)
- WidgetKit (iOS Home Screen Widgets)
- AppIntents (iOS 17+ Smart Stack)
- Native Modules (Swift/Objective-C)

## Getting Started

```bash
# Install dependencies
npm install

# Generate iOS project files
npx expo prebuild --platform ios

# Install CocoaPods
cd ios && pod install && cd ..

# Open in Xcode
open ios/FocusFlow.xcworkspace
```

### Environment Setup
```bash
cp .env.example .env
# Add your Supabase URL and anon key
```

### Build for TestFlight
```bash
eas build --profile testflight --platform ios
```

## Project Structure

```
├── app/                    # Expo Router screens
├── src/
│   ├── components/        # React Native components
│   │   ├── challenges/     # 42 challenge types
│   │   ├── onboarding/     # Onboarding flow
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # 10 React contexts (Game, Auth, Theme, etc.)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Core game mechanics
│   └── types/               # TypeScript definitions
├── ios/
│   ├── LocalPods/          # Native Swift modules
│   └── FocusFlowWidgets/   # WidgetKit extension
├── supabase/
│   └── functions/          # Edge functions (push notifications)
└── .github/workflows/      # CI/CD pipelines
```

## TestFlight Submission

Requires user action (Apple credentials in eas.json):
1. Add `appleId`, `ascAppId`, `appleTeamId` to eas.json
2. Add `SUPABASE_ACCESS_TOKEN` for edge function deployment
3. Run: `eas build --profile testflight --platform ios`

## Changelog

See CHANGELOG.md for full version history.