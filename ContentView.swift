import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = ChallengeViewModel()
    @State private var selectedChallenge: Challenge?
    @Namespace private var namespace
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Animated gradient background
                AnimatedGradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Hero section with Liquid Glass
                        HeroSection()
                            .padding(.top, 20)
                        
                        // Challenge input section
                        ChallengeInputSection(viewModel: viewModel)
                        
                        // Recent challenges with Liquid Glass cards
                        if !viewModel.challenges.isEmpty {
                            RecentChallengesSection(
                                challenges: viewModel.challenges,
                                selectedChallenge: $selectedChallenge,
                                namespace: namespace
                            )
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("AI Challenges")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        viewModel.clearAllChallenges()
                    } label: {
                        Image(systemName: "trash")
                    }
                    .buttonStyle(.glass)
                }
                
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        // Settings action
                    } label: {
                        Image(systemName: "gearshape.fill")
                    }
                    .buttonStyle(.glass)
                }
            }
            .sheet(item: $selectedChallenge) { challenge in
                ChallengeDetailView(challenge: challenge)
                    .navigationTransition(.zoom(sourceID: challenge.id, in: namespace))
            }
        }
    }
}

// MARK: - Hero Section
struct HeroSection: View {
    var body: some View {
        GlassEffectContainer(spacing: 30) {
            VStack(spacing: 16) {
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 60))
                    .foregroundStyle(.white)
                    .glassEffect(.regular.tint(.purple).interactive(), in: .circle)
                
                Text("AI Challenge Verifier")
                    .font(.title.bold())
                    .foregroundStyle(.white)
                
                Text("Test your prompts with Claude AI")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding(32)
            .glassEffect(.regular, in: .rect(cornerRadius: 24))
        }
    }
}

// MARK: - Challenge Input Section
struct ChallengeInputSection: View {
    @ObservedObject var viewModel: ChallengeViewModel
    @State private var challengeText = ""
    @State private var isSubmitting = false
    
    var body: some View {
        VStack(spacing: 16) {
            // Input field with Liquid Glass
            TextEditor(text: $challengeText)
                .frame(height: 120)
                .padding()
                .background(.clear)
                .foregroundStyle(.white)
                .glassEffect(.regular, in: .rect(cornerRadius: 16))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(.white.opacity(0.2), lineWidth: 1)
                )
            
            // Submit button with Liquid Glass
            Button {
                submitChallenge()
            } label: {
                HStack {
                    if isSubmitting {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "paperplane.fill")
                        Text("Submit Challenge")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
            }
            .buttonStyle(.glassProminent)
            .disabled(challengeText.isEmpty || isSubmitting)
        }
    }
    
    private func submitChallenge() {
        isSubmitting = true
        
        Task {
            await viewModel.submitChallenge(challengeText)
            challengeText = ""
            isSubmitting = false
        }
    }
}

// MARK: - Recent Challenges Section
struct RecentChallengesSection: View {
    let challenges: [Challenge]
    @Binding var selectedChallenge: Challenge?
    var namespace: Namespace.ID
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Recent Challenges")
                .font(.title2.bold())
                .foregroundStyle(.white)
                .padding(.horizontal)
            
            GlassEffectContainer(spacing: 20) {
                LazyVStack(spacing: 16) {
                    ForEach(challenges) { challenge in
                        ChallengeCard(challenge: challenge)
                            .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 20))
                            .glassEffectID(challenge.id, in: namespace)
                            .onTapGesture {
                                withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                                    selectedChallenge = challenge
                                }
                            }
                    }
                }
            }
        }
    }
}

// MARK: - Challenge Card
struct ChallengeCard: View {
    let challenge: Challenge
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: statusIcon)
                    .foregroundStyle(statusColor)
                    .font(.title2)
                
                Spacer()
                
                Text(challenge.timestamp, style: .time)
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.7))
            }
            
            Text(challenge.prompt)
                .font(.body)
                .foregroundStyle(.white)
                .lineLimit(3)
            
            if let response = challenge.response {
                Text(response)
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
                    .lineLimit(2)
            }
        }
        .padding(20)
    }
    
    private var statusIcon: String {
        switch challenge.status {
        case .pending: return "clock.fill"
        case .success: return "checkmark.circle.fill"
        case .failed: return "xmark.circle.fill"
        }
    }
    
    private var statusColor: Color {
        switch challenge.status {
        case .pending: return .yellow
        case .success: return .green
        case .failed: return .red
        }
    }
}

// MARK: - Animated Gradient Background
struct AnimatedGradientBackground: View {
    @State private var animateGradient = false
    
    var body: some View {
        LinearGradient(
            colors: [
                .purple.opacity(0.6),
                .blue.opacity(0.6),
                .pink.opacity(0.6),
                .orange.opacity(0.6)
            ],
            startPoint: animateGradient ? .topLeading : .bottomLeading,
            endPoint: animateGradient ? .bottomTrailing : .topTrailing
        )
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 5.0).repeatForever(autoreverses: true)) {
                animateGradient = true
            }
        }
    }
}

#Preview {
    ContentView()
}
