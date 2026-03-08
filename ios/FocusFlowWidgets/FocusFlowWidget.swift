//
//  FocusFlowWidget.swift
//  FocusFlowWidgets
//
//  Small widget showing current streak and focus stats
//  Includes iOS 17+ App Intents for Smart Stack support
//

import WidgetKit
import SwiftUI
import AppIntents

// Data structure for shared app group
struct FocusFlowData: Codable {
    var currentStreak: Int
    var totalFocusMinutes: Int
    var level: Int
    var gems: Int
    var lastUpdated: Date
    
    static var placeholder: FocusFlowData {
        FocusFlowData(
            currentStreak: 5,
            totalFocusMinutes: 1250,
            level: 12,
            gems: 450,
            lastUpdated: Date()
        )
    }
}

// App Group identifier
let appGroupIdentifier = "group.com.focusflow.app"

// Helper to read data from shared container
func loadFocusFlowData() -> FocusFlowData {
    guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
        return .placeholder
    }
    
    let fileURL = containerURL.appendingPathComponent("widget_data.json")
    
    do {
        let data = try Data(contentsOf: fileURL)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(FocusFlowData.self, from: data)
    } catch {
        return .placeholder
    }
}

// Timeline entry
struct FocusFlowEntry: TimelineEntry {
    let date: Date
    let data: FocusFlowData
}

// Timeline provider
struct FocusFlowProvider: TimelineProvider {
    func placeholder(in context: Context) -> FocusFlowEntry {
        FocusFlowEntry(date: Date(), data: .placeholder)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (FocusFlowEntry) -> Void) {
        let entry = FocusFlowEntry(date: Date(), data: loadFocusFlowData())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<FocusFlowEntry>) -> Void) {
        let currentDate = Date()
        let data = loadFocusFlowData()
        
        let entry = FocusFlowEntry(date: currentDate, data: data)
        
        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
}

// App Intents for iOS 17+ Smart Stack interactivity
// These enable the widget to appear in Smart Stack and provide contextual actions

@available(iOS 17.0, *)
struct OpenFocusFlowAppIntent: AppIntent {
    static var title: LocalizedStringResource = "Open FocusFlow"
    static var description = IntentDescription("Open the FocusFlow app")
    
    func perform() async throws -> some IntentResult {
        // This will deep link to the app
        return .result()
    }
}

@available(iOS 17.0, *)
struct StartFocusSessionIntent: AppIntent {
    static var title: LocalizedStringResource = "Start Focus Session"
    static var description = IntentDescription("Start a new focus session")
    
    func perform() async throws -> some IntentResult {
        // Deep link to focus session screen
        return .result()
    }
}

@available(iOS 17.0, *)
struct ViewStreakIntent: AppIntent {
    static var title: LocalizedStringResource = "View Streak"
    static var description = IntentDescription("View your current streak details")
    
    func perform() async throws -> some IntentResult {
        return .result()
    }
}

// App Shortcuts provider for Smart Stack suggestions
@available(iOS 17.0, *)
struct FocusFlowShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenFocusFlowAppIntent(),
            phrases: [
                "Open \(.applicationName)",
                "Launch \(.applicationName)",
                "Start \(.applicationName)"
            ],
            shortTitle: "Open FocusFlow",
            systemImageName: "brain.head.profile"
        )
        AppShortcut(
            intent: StartFocusSessionIntent(),
            phrases: [
                "Start focus session in \(.applicationName)",
                "Begin focusing with \(.applicationName)",
                "Focus time in \(.applicationName)"
            ],
            shortTitle: "Start Session",
            systemImageName: "timer"
        )
    }
}

// Small widget view
struct SmallWidgetView: View {
    let entry: FocusFlowEntry
    
    var body: some View {
        Link(destination: URL(string: "focusflow://home")!) {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.orange)
                    Text("FocusFlow")
                        .font(.caption)
                        .fontWeight(.semibold)
                }
                
                Spacer()
                
                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(entry.data.currentStreak)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.orange)
                        Text("day streak")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Lv.\(entry.data.level)")
                            .font(.caption)
                            .fontWeight(.medium)
                        Text("\(entry.data.gems) 💎")
                            .font(.caption2)
                    }
                }
            }
            .padding()
        }
    }
}

// Medium widget view
struct MediumWidgetView: View {
    let entry: FocusFlowEntry
    
    var body: some View {
        Link(destination: URL(string: "focusflow://home")!) {
            HStack(spacing: 16) {
                // Streak section
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                        Text("Streak")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Text("\(entry.data.currentStreak)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.orange)
                    Text("days")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                
                // Focus time section
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Image(systemName: "brain.head.profile")
                            .foregroundColor(.purple)
                        Text("Focus")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Text("\(entry.data.totalFocusMinutes)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.purple)
                    Text("minutes")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                
                // Level section
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text("Level")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Text("\(entry.data.level)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.yellow)
                    Text("\(entry.data.gems) 💎")
                        .font(.caption2)
                }
            }
            .padding()
        }
    }
}

// Widget configuration
struct FocusFlowWidget: Widget {
    let kind: String = "FocusFlowWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FocusFlowProvider()) { entry in
            FocusFlowWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("FocusFlow Stats")
        .description("Track your focus streak and progress.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

struct FocusFlowWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: FocusFlowEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// Preview
#Preview(as: .systemSmall) {
    FocusFlowWidget()
} timeline: {
    FocusFlowEntry(date: .now, data: .placeholder)
}

#Preview(as: .systemMedium) {
    FocusFlowWidget()
} timeline: {
    FocusFlowEntry(date: .now, data: .placeholder)
}
