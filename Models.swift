import Foundation

// MARK: - Challenge Model
struct Challenge: Identifiable, Codable {
    let id: UUID
    let prompt: String
    var response: String?
    var status: Status
    let timestamp: Date
    
    enum Status: String, Codable {
        case pending
        case success
        case failed
    }
    
    init(id: UUID = UUID(), prompt: String, response: String? = nil, status: Status = .pending) {
        self.id = id
        self.prompt = prompt
        self.response = response
        self.status = status
        self.timestamp = Date()
    }
}

// MARK: - Anthropic API Models
struct AnthropicRequest: Codable {
    let model: String
    let maxTokens: Int
    let messages: [Message]
    
    struct Message: Codable {
        let role: String
        let content: String
    }
    
    enum CodingKeys: String, CodingKey {
        case model
        case maxTokens = "max_tokens"
        case messages
    }
}

struct AnthropicResponse: Codable {
    let id: String
    let type: String
    let role: String
    let content: [Content]
    let model: String
    let stopReason: String?
    
    struct Content: Codable {
        let type: String
        let text: String
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case type
        case role
        case content
        case model
        case stopReason = "stop_reason"
    }
}

struct AnthropicError: Codable {
    let type: String
    let error: ErrorDetail
    
    struct ErrorDetail: Codable {
        let type: String
        let message: String
    }
}
