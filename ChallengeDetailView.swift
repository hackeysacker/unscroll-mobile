import SwiftUI

struct ChallengeDetailView: View {
    let challenge: Challenge
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Animated gradient background
                AnimatedGradientBackground()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Status section with Liquid Glass
                        StatusSection(status: challenge.status)
                        
                        // Prompt section
                        DetailSection(
                            title: "Your Prompt",
                            icon: "text.bubble.fill",
                            content: challenge.prompt
                        )
                        
                        // Response section
                        if let response = challenge.response {
                            DetailSection(
                                title: "AI Response",
                                icon: "brain.head.profile",
                                content: response
                            )
                        }
                        
                        // Timestamp section
                        DetailSection(
                            title: "Submitted",
                            icon: "clock.fill",
                            content: challenge.timestamp.formatted(date: .long, time: .shortened)
                        )
                        
                        // Action buttons
                        ActionButtons(challenge: challenge)
                    }
                    .padding()
                }
            }
            .navigationTitle("Challenge Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                    }
                    .buttonStyle(.glass)
                }
            }
        }
    }
}

// MARK: - Status Section
struct StatusSection: View {
    let status: Challenge.Status
    
    var body: some View {
        GlassEffectContainer(spacing: 20) {
            HStack(spacing: 16) {
                Image(systemName: statusIcon)
                    .font(.system(size: 40))
                    .foregroundStyle(statusColor)
                    .glassEffect(.regular.tint(statusColor).interactive(), in: .circle)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Status")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.7))
                    
                    Text(statusText)
                        .font(.title2.bold())
                        .foregroundStyle(.white)
                }
                
                Spacer()
            }
            .padding(24)
            .glassEffect(.regular, in: .rect(cornerRadius: 20))
        }
    }
    
    private var statusIcon: String {
        switch status {
        case .pending: return "clock.fill"
        case .success: return "checkmark.circle.fill"
        case .failed: return "xmark.circle.fill"
        }
    }
    
    private var statusColor: Color {
        switch status {
        case .pending: return .yellow
        case .success: return .green
        case .failed: return .red
        }
    }
    
    private var statusText: String {
        switch status {
        case .pending: return "Processing..."
        case .success: return "Success"
        case .failed: return "Failed"
        }
    }
}

// MARK: - Detail Section
struct DetailSection: View {
    let title: String
    let icon: String
    let content: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundStyle(.white.opacity(0.8))
                Text(title)
                    .font(.headline)
                    .foregroundStyle(.white)
            }
            
            Text(content)
                .font(.body)
                .foregroundStyle(.white.opacity(0.9))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .glassEffect(.regular, in: .rect(cornerRadius: 16))
    }
}

// MARK: - Action Buttons
struct ActionButtons: View {
    let challenge: Challenge
    
    var body: some View {
        GlassEffectContainer(spacing: 12) {
            HStack(spacing: 12) {
                Button {
                    shareChallenge()
                } label: {
                    Label("Share", systemImage: "square.and.arrow.up")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.glass)
                .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 12))
                
                Button {
                    copyToClipboard()
                } label: {
                    Label("Copy", systemImage: "doc.on.doc")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.glass)
                .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 12))
            }
        }
        .padding(.top, 8)
    }
    
    private func shareChallenge() {
        // Share functionality
        let text = """
        Prompt: \(challenge.prompt)
        Response: \(challenge.response ?? "No response")
        """
        
        let activityVC = UIActivityViewController(
            activityItems: [text],
            applicationActivities: nil
        )
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootVC = window.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
    
    private func copyToClipboard() {
        let text = """
        Prompt: \(challenge.prompt)
        Response: \(challenge.response ?? "No response")
        """
        UIPasteboard.general.string = text
    }
}

#Preview {
    ChallengeDetailView(
        challenge: Challenge(
            prompt: "What is the meaning of life?",
            response: "The meaning of life is a philosophical question concerning the purpose and significance of existence.",
            status: .success
        )
    )
}
