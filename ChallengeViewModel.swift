import Foundation
import SwiftUI

@MainActor
class ChallengeViewModel: ObservableObject {
    @Published var challenges: [Challenge] = []
    @Published var errorMessage: String?
    
    private let apiKey: String
    private let apiURL = "https://api.anthropic.com/v1/messages"
    
    init() {
        // Load API key from environment or config
        self.apiKey = Configuration.anthropicAPIKey
        loadChallenges()
    }
    
    // MARK: - Submit Challenge
    func submitChallenge(_ prompt: String) async {
        let challenge = Challenge(prompt: prompt, status: .pending)
        challenges.insert(challenge, at: 0)
        saveChallenges()
        
        do {
            let response = try await callAnthropicAPI(prompt: prompt)
            updateChallenge(id: challenge.id, response: response, status: .success)
        } catch {
            updateChallenge(id: challenge.id, response: error.localizedDescription, status: .failed)
        }
    }
    
    // MARK: - Call Anthropic API
    private func callAnthropicAPI(prompt: String) async throws -> String {
        guard let url = URL(string: apiURL) else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        
        let apiRequest = AnthropicRequest(
            model: "claude-3-5-sonnet-20241022",
            maxTokens: 1024,
            messages: [
                AnthropicRequest.Message(role: "user", content: prompt)
            ]
        )
        
        request.httpBody = try JSONEncoder().encode(apiRequest)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        
        guard httpResponse.statusCode == 200 else {
            // Try to parse error response
            if let errorResponse = try? JSONDecoder().decode(AnthropicError.self, from: data) {
                throw NSError(
                    domain: "AnthropicAPI",
                    code: httpResponse.statusCode,
                    userInfo: [NSLocalizedDescriptionKey: errorResponse.error.message]
                )
            }
            throw URLError(.badServerResponse)
        }
        
        let apiResponse = try JSONDecoder().decode(AnthropicResponse.self, from: data)
        
        guard let firstContent = apiResponse.content.first else {
            throw NSError(
                domain: "AnthropicAPI",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "No content in response"]
            )
        }
        
        return firstContent.text
    }
    
    // MARK: - Update Challenge
    private func updateChallenge(id: UUID, response: String, status: Challenge.Status) {
        if let index = challenges.firstIndex(where: { $0.id == id }) {
            challenges[index].response = response
            challenges[index].status = status
            saveChallenges()
        }
    }
    
    // MARK: - Clear All Challenges
    func clearAllChallenges() {
        challenges.removeAll()
        saveChallenges()
    }
    
    // MARK: - Persistence
    private func saveChallenges() {
        if let encoded = try? JSONEncoder().encode(challenges) {
            UserDefaults.standard.set(encoded, forKey: "challenges")
        }
    }
    
    private func loadChallenges() {
        if let data = UserDefaults.standard.data(forKey: "challenges"),
           let decoded = try? JSONDecoder().decode([Challenge].self, from: data) {
            challenges = decoded
        }
    }
}

// MARK: - Configuration
enum Configuration {
    static var anthropicAPIKey: String {
        // In a real app, this should be loaded from a secure location
        // For now, we'll read from the environment or return a placeholder
        if let key = ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"], !key.isEmpty {
            return key
        }
        
        // Default to placeholder - set ANTHROPIC_API_KEY env var
        return ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"] ?? "YOUR_API_KEY_HERE"
    }
}
