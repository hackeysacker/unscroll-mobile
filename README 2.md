# AI Challenge Verifier - SwiftUI Edition

A beautiful iOS app built with **SwiftUI** featuring full **Liquid Glass** design to verify AI challenges using the Anthropic Claude API.

## ✨ Features

- **Full Liquid Glass UI**: Every component uses Apple's latest Liquid Glass design language
- **Interactive Glass Effects**: Buttons and cards respond to touch with fluid animations
- **Animated Gradients**: Beautiful, constantly shifting background gradients
- **Challenge Management**: Submit prompts and view AI responses
- **Persistent Storage**: Challenges are saved locally using UserDefaults
- **Detail Views**: Tap any challenge to see full details with smooth zoom transitions

## 🎨 Liquid Glass Components

The app demonstrates various Liquid Glass features:

- ✅ `.glassEffect()` modifier on cards and buttons
- ✅ `GlassEffectContainer` for grouped elements
- ✅ `.glassProminent` button style for primary actions
- ✅ `.interactive()` glass effects that respond to touches
- ✅ `.glassEffectID()` for smooth morphing transitions
- ✅ Custom tints for different states (success, pending, failed)

## 🚀 Getting Started

### Requirements

- Xcode 15.0 or later
- iOS 17.0 or later
- An Anthropic API key

### Setup

1. Create a new Xcode project
2. Copy all Swift files into your project
3. Add your Anthropic API key:
   - Option A: Set environment variable `ANTHROPIC_API_KEY`
   - Option B: The app will use the key from your `.env` file by default

### Project Structure

```
.
├── ChallengeApp.swift          # App entry point
├── ContentView.swift            # Main view with Liquid Glass UI
├── ChallengeDetailView.swift   # Detail view with animations
├── Models.swift                 # Data models
├── ChallengeViewModel.swift    # Business logic & API calls
├── Info.plist                   # App configuration
└── README.md                    # This file
```

## 📱 UI Components

### Hero Section
Beautiful glass card with animated gradient background featuring the app icon and title.

### Challenge Input
Glass-styled text editor with a prominent glass button for submitting challenges.

### Challenge Cards
Interactive glass cards that display:
- Status indicator (pending, success, failed)
- Prompt text
- Response preview
- Timestamp

### Detail View
Full-screen view with:
- Large status indicator with custom tints
- Complete prompt and response
- Share and copy functionality
- Smooth zoom transition animations

## 🎯 Key Technologies

- **SwiftUI**: Native Apple UI framework
- **Liquid Glass**: Latest design language from Apple
- **Swift Concurrency**: async/await for API calls
- **Combine**: For reactive data flow with @Published
- **URLSession**: Native networking
- **UserDefaults**: Local persistence

## 🔧 Customization

### Change API Model
Edit `ChallengeViewModel.swift`:
```swift
model: "claude-3-5-sonnet-20241022"  // Change to your preferred model
```

### Adjust Glass Appearance
Modify glass effects in `ContentView.swift`:
```swift
.glassEffect(.regular.tint(.purple).interactive())  // Customize tint color
```

### Change Animation Timing
Adjust in the respective view:
```swift
withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
    // Your animation
}
```

## 📝 Notes

- The app uses the latest Liquid Glass APIs available in iOS 17+
- All glass effects automatically adapt to light and dark mode
- The background gradient animates continuously for a dynamic feel
- Challenges are stored locally and persist between app launches

## 🎨 Design Philosophy

This app showcases the full potential of Liquid Glass design:

1. **Depth**: Multiple layers of glass create visual hierarchy
2. **Fluidity**: Smooth animations and transitions throughout
3. **Interactivity**: Elements respond to touch in real-time
4. **Beauty**: Every component feels premium and polished

## 🔐 Security Note

**Important**: In a production app, never hardcode API keys. Use:
- Keychain for secure storage
- Environment variables
- A secure backend service

## 📄 License

This is a demonstration project. Feel free to use and modify as needed.

---

Built with ❤️ using SwiftUI and Liquid Glass design
