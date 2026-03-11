# Unscroll Mobile App

A gamified attention training iOS app built with React Native (Expo) and native iOS modules.

## Getting Started on Mac

### Prerequisites
- Node.js 18+ (`brew install node`)
- Xcode 15+ (from App Store)
- CocoaPods (`sudo gem install cocoapods`)

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Generate iOS project files (this creates the Xcode workspace)
npx expo prebuild --platform ios

# 3. Install CocoaPods
cd ios && pod install && cd ..

# 4. Open in Xcode
open ios/UnscrollMobile.xcworkspace
```

Then press Cmd+R in Xcode to build and run.

### Alternative: Run via Expo CLI
```bash
npx expo run:ios
```

## Project Structure

```
├── app/              # Expo Router screens
├── src/
│   ├── components/   # React Native components (51 files)
│   │   ├── challenges/   # 42 challenge types
│   │   ├── exercises/    # 28 exercise types
│   │   ├── onboarding/   # Onboarding flow
│   │   └── ui/           # Reusable UI components
│   ├── contexts/     # 10 React contexts
│   ├── hooks/        # 5 custom hooks
│   ├── lib/          # Core game mechanics
│   └── types/        # TypeScript definitions
├── ios/              # Native iOS modules
│   ├── FaceTracking/     # ARKit face detection
│   └── FocusShieldModule/
├── assets/
└── supabase/         # Backend schema
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

## Troubleshooting

### Build fails in Xcode
```bash
cd ios
pod deintegrate
pod cache clean --all
pod install
```

### Metro bundler issues
```bash
npx expo start --clear
```
