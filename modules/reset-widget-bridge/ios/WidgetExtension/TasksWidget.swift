import WidgetKit
import SwiftUI

// MARK: - Tasks Widget (home screen + lock screen)
//
// Setup — add this file to your existing ResetWidgets Xcode target:
//   1. In Xcode Project Navigator, select the ResetWidgets target.
//   2. Drag this file into the ResetWidgets group.
//   3. In ResetWidgetsBundle.swift, add TasksWidget() to the bundle body.
//   4. Clean & rebuild (Cmd+Shift+K, then Cmd+B).
//
// Supported families:
//   Home screen  — systemSmall, systemMedium, systemLarge
//   Lock screen  — accessoryRectangular, accessoryCircular, accessoryInline (iOS 16+)

// MARK: - Data model

private struct TaskWidgetPayload: Codable {
    struct Task: Codable {
        let id: String
        let title: String
        let priority: String
        let completed: Bool
    }
    let myDayCount: Int
    let myDayTasks: [Task]
    let totalOpen: Int
    let date: String
}

// MARK: - Timeline

struct TaskWidgetEntry: TimelineEntry {
    let date: Date
    let payload: TaskWidgetPayload?
}

struct TaskWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> TaskWidgetEntry {
        TaskWidgetEntry(date: Date(), payload: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (TaskWidgetEntry) -> Void) {
        completion(TaskWidgetEntry(date: Date(), payload: read()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TaskWidgetEntry>) -> Void) {
        let entry = TaskWidgetEntry(date: Date(), payload: read())
        let refresh = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(refresh)))
    }

    private func read() -> TaskWidgetPayload? {
        guard
            let defaults = UserDefaults(suiteName: "group.app.reset.habits"),
            let raw = defaults.string(forKey: "tasks_widget"),
            let data = raw.data(using: .utf8),
            let decoded = try? JSONDecoder().decode(TaskWidgetPayload.self, from: data)
        else { return nil }
        return decoded
    }
}

// MARK: - Colors

private let lavender = Color(red: 0.612, green: 0.537, blue: 0.918)
private let inkBg    = Color(red: 0.047, green: 0.039, blue: 0.094)

private func priorityDot(_ p: String) -> Color? {
    switch p {
    case "high":   return Color(red: 1.0,  green: 0.42, blue: 0.42)
    case "medium": return Color(red: 0.91, green: 0.72, blue: 0.36)
    case "low":    return Color(red: 0.42, green: 0.80, blue: 0.47)
    default:       return nil
    }
}

// MARK: - Home screen views

private struct TaskRowView: View {
    let title: String
    let priority: String

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .stroke(lavender.opacity(0.45), lineWidth: 1.5)
                .frame(width: 14, height: 14)
            Text(title)
                .font(.caption)
                .foregroundColor(.white)
                .lineLimit(1)
            Spacer()
            if let dot = priorityDot(priority) {
                Circle().fill(dot).frame(width: 6, height: 6)
            }
        }
    }
}

struct TasksSmallView: View {
    let payload: TaskWidgetPayload?

    var body: some View {
        ZStack {
            inkBg
            VStack(spacing: 5) {
                Text("☀️").font(.title2)
                Text("\(payload?.myDayCount ?? 0)")
                    .font(.system(size: 38, weight: .heavy))
                    .foregroundColor(.white)
                Text(payload?.myDayCount == 1 ? "task today" : "tasks today")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.55))
            }
            .padding()
        }
    }
}

struct TasksMediumView: View {
    let payload: TaskWidgetPayload?

    var body: some View {
        ZStack {
            inkBg
            if let p = payload, p.myDayCount > 0 {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("☀️  My Day")
                            .font(.caption).fontWeight(.bold)
                            .foregroundColor(lavender)
                        Spacer()
                        Text("\(p.myDayCount) tasks")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.45))
                    }
                    Divider().background(Color.white.opacity(0.08))
                    ForEach(p.myDayTasks.prefix(3), id: \.id) { task in
                        TaskRowView(title: task.title, priority: task.priority)
                    }
                    if p.myDayCount > 3 {
                        Text("+\(p.myDayCount - 3) more")
                            .font(.caption2).foregroundColor(.white.opacity(0.35))
                    }
                    Spacer()
                }
                .padding()
            } else {
                VStack(spacing: 6) {
                    Text("☀️").font(.title3)
                    Text("No tasks for today")
                        .font(.caption).foregroundColor(.white.opacity(0.55))
                        .multilineTextAlignment(.center)
                }
                .padding()
            }
        }
    }
}

struct TasksLargeView: View {
    let payload: TaskWidgetPayload?

    var body: some View {
        ZStack {
            inkBg
            if let p = payload {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("☀️  My Day")
                            .font(.subheadline).fontWeight(.bold)
                            .foregroundColor(lavender)
                        Spacer()
                        Text("\(p.myDayCount) tasks")
                            .font(.caption).foregroundColor(.white.opacity(0.45))
                    }
                    Divider().background(Color.white.opacity(0.08))
                    ForEach(p.myDayTasks.prefix(7), id: \.id) { task in
                        TaskRowView(title: task.title, priority: task.priority)
                    }
                    Spacer()
                    Text("\(p.totalOpen) total open tasks")
                        .font(.caption2).foregroundColor(.white.opacity(0.3))
                }
                .padding()
            } else {
                Text("Open Reset to add tasks")
                    .font(.caption).foregroundColor(.white.opacity(0.5))
                    .padding()
            }
        }
    }
}

// MARK: - Lock screen views (iOS 16+)

@available(iOSApplicationExtension 16.0, *)
private struct TasksLockRectView: View {
    let payload: TaskWidgetPayload?

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Label("\(payload?.myDayCount ?? 0) tasks · My Day", systemImage: "sun.max")
                .font(.caption).fontWeight(.semibold)
            ForEach(payload?.myDayTasks.prefix(2) ?? [], id: \.id) { task in
                Text("· \(task.title)")
                    .font(.caption2)
                    .lineLimit(1)
            }
        }
    }
}

@available(iOSApplicationExtension 16.0, *)
private struct TasksLockCircularView: View {
    let payload: TaskWidgetPayload?

    var body: some View {
        ZStack {
            Circle().stroke(.white.opacity(0.2), lineWidth: 3)
            VStack(spacing: 0) {
                Text("\(payload?.myDayCount ?? 0)")
                    .font(.system(size: 20, weight: .bold))
                Text("today")
                    .font(.system(size: 8))
                    .opacity(0.6)
            }
        }
    }
}

// MARK: - Entry view (dispatch by family)

struct TasksWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: TaskWidgetEntry

    var body: some View {
        switch family {
        case .systemSmall:
            TasksSmallView(payload: entry.payload)
        case .systemLarge:
            TasksLargeView(payload: entry.payload)
        case .accessoryRectangular:
            if #available(iOSApplicationExtension 16.0, *) {
                TasksLockRectView(payload: entry.payload)
            }
        case .accessoryCircular:
            if #available(iOSApplicationExtension 16.0, *) {
                TasksLockCircularView(payload: entry.payload)
            }
        case .accessoryInline:
            Text("☀️ \(entry.payload?.myDayCount ?? 0) tasks today")
        default:
            TasksMediumView(payload: entry.payload)
        }
    }
}

// MARK: - Widget declaration

struct TasksWidget: Widget {
    let kind = "ResetTasksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TaskWidgetProvider()) { entry in
            TasksWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Reset Tasks")
        .description("Your My Day tasks, always visible.")
        .supportedFamilies(supportedFamilies)
    }

    private var supportedFamilies: [WidgetFamily] {
        if #available(iOSApplicationExtension 16.0, *) {
            return [
                .systemSmall, .systemMedium, .systemLarge,
                .accessoryRectangular, .accessoryCircular, .accessoryInline,
            ]
        }
        return [.systemSmall, .systemMedium, .systemLarge]
    }
}
