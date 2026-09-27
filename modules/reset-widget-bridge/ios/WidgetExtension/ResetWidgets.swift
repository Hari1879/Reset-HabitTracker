import WidgetKit
import SwiftUI

// MARK: - NATIVE INTEGRATION POINT (iOS WidgetKit Extension)
//
// This file is NOT compiled as part of the main app target. After running
// `npx expo prebuild`, create a new "Widget Extension" target in Xcode named
// "ResetWidgets", enable the same App Group capability
// (group.app.reset.habits) as the app target, then copy this file into it.
//
// It reads the JSON written by ResetWidgetBridgeModule.swift and renders one
// of three original layouts (Dot Grid, Progress Ring, Minimal Countdown) at
// small / medium / large widget families, matching the in-app WidgetPreview
// component's visual language (ink background, teal/aqua/lavender/coral/gold
// accents, rounded cards).

struct WidgetSnapshot: Codable {
  struct Config: Codable { let id: String; let habitId: String; let style: String; let size: String; let accent: String }
  struct Data: Codable {
    let habitId: String
    let habitTitle: String
    let icon: String
    let accent: String
    let streakDays: Int
    let nextMilestoneDays: Int
    let nextMilestoneLabel: String
    let progressToNextMilestone: Double
  }
  let config: Config
  let snapshot: Data
}

struct ResetWidgetEntry: TimelineEntry {
  let date: Date
  let data: WidgetSnapshot.Data?
}

struct ResetWidgetProvider: TimelineProvider {
  let configId: String

  func placeholder(in context: Context) -> ResetWidgetEntry {
    ResetWidgetEntry(date: Date(), data: nil)
  }

  func getSnapshot(in context: Context, completion: @escaping (ResetWidgetEntry) -> Void) {
    completion(ResetWidgetEntry(date: Date(), data: readSnapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<ResetWidgetEntry>) -> Void) {
    let entry = ResetWidgetEntry(date: Date(), data: readSnapshot())
    // Widgets are pushed on every check-in/slip/edit via WidgetCenter.reloadAllTimelines(),
    // so a distant refresh policy is fine — no polling required.
    let nextUpdate = Calendar.current.date(byAdding: .hour, value: 6, to: Date())!
    completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
  }

  private func readSnapshot() -> WidgetSnapshot.Data? {
    guard let defaults = UserDefaults(suiteName: "group.app.reset.habits"),
          let raw = defaults.string(forKey: "widget_\(configId)"),
          let json = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode(WidgetSnapshot.self, from: json)
    else { return nil }
    return decoded.snapshot
  }
}

func colorForAccent(_ name: String) -> Color {
  switch name {
  case "teal": return Color(red: 0.184, green: 0.749, blue: 0.682)
  case "aqua": return Color(red: 0.229, green: 0.698, blue: 0.863)
  case "lavender": return Color(red: 0.612, green: 0.537, blue: 0.918)
  case "coral": return Color(red: 1.0, green: 0.510, blue: 0.400)
  default: return Color(red: 0.910, green: 0.722, blue: 0.357) // gold
  }
}

struct ResetWidgetView: View {
  @Environment(\.widgetFamily) var family
  let style: String
  let entry: ResetWidgetEntry

  var body: some View {
    ZStack {
      Color(red: 0.039, green: 0.055, blue: 0.090) // ink-950
      if let data = entry.data {
        switch style {
        case "dotGrid": DotGridWidgetView(data: data, family: family)
        case "minimalCountdown": MinimalCountdownWidgetView(data: data, family: family)
        // "gridBlocks", "terminal", "boldBlock", "pulseBars", "weekGrid", and "stickyNote" (added alongside the original three in
        // the in-app WidgetPreview gallery) fall back to Progress Ring here — add SwiftUI
        // views for them following the pattern below if you want native pixel parity.
        default: ProgressRingWidgetView(data: data, family: family)
        }
      } else {
        Text("Open Reset to configure").font(.caption).foregroundColor(.white.opacity(0.6)).padding()
      }
    }
  }
}

struct ProgressRingWidgetView: View {
  let data: WidgetSnapshot.Data
  let family: WidgetFamily

  var body: some View {
    let accent = colorForAccent(data.accent)
    VStack(spacing: 6) {
      ZStack {
        Circle().stroke(accent.opacity(0.2), lineWidth: 8)
        Circle()
          .trim(from: 0, to: data.progressToNextMilestone)
          .stroke(accent, style: StrokeStyle(lineWidth: 8, lineCap: .round))
          .rotationEffect(.degrees(-90))
        VStack(spacing: 0) {
          Text("\(data.streakDays)").font(.system(size: family == .systemSmall ? 22 : 30, weight: .bold)).foregroundColor(.white)
          Text("days").font(.caption2).foregroundColor(.white.opacity(0.6))
        }
      }
      .frame(width: family == .systemSmall ? 70 : 92, height: family == .systemSmall ? 70 : 92)
      if family != .systemSmall {
        Text(data.habitTitle).font(.caption).foregroundColor(.white).lineLimit(1)
        Text(data.nextMilestoneLabel).font(.caption2).foregroundColor(.white.opacity(0.6))
      }
    }.padding()
  }
}

struct DotGridWidgetView: View {
  let data: WidgetSnapshot.Data
  let family: WidgetFamily

  var body: some View {
    let accent = colorForAccent(data.accent)
    let totalDots = 20
    let filled = Int(Double(totalDots) * data.progressToNextMilestone)
    let columns = family == .systemLarge ? 5 : 5
    VStack(alignment: .leading, spacing: 8) {
      Text(data.habitTitle).font(.caption).foregroundColor(.white).lineLimit(1)
      LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: columns), spacing: 6) {
        ForEach(0..<totalDots, id: \.self) { i in
          Circle().fill(i < filled ? accent : Color.white.opacity(0.12))
            .frame(width: family == .systemSmall ? 8 : 12, height: family == .systemSmall ? 8 : 12)
        }
      }
      Text("\(data.streakDays) days · \(data.nextMilestoneLabel)").font(.caption2).foregroundColor(.white.opacity(0.6))
    }.padding()
  }
}

struct MinimalCountdownWidgetView: View {
  let data: WidgetSnapshot.Data
  let family: WidgetFamily

  var body: some View {
    let accent = colorForAccent(data.accent)
    VStack(alignment: .leading, spacing: 10) {
      Text("\(data.streakDays) days stronger").font(.system(size: family == .systemSmall ? 16 : 20, weight: .bold)).foregroundColor(.white)
      GeometryReader { geo in
        ZStack(alignment: .leading) {
          Capsule().fill(Color.white.opacity(0.12)).frame(height: 8)
          Capsule().fill(accent).frame(width: geo.size.width * data.progressToNextMilestone, height: 8)
        }
      }.frame(height: 8)
      Text(data.nextMilestoneLabel).font(.caption2).foregroundColor(.white.opacity(0.6))
    }.padding()
  }
}

struct ResetWidget: Widget {
  let kind: String = "ResetWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: ResetWidgetProvider(configId: "default")) { entry in
      ResetWidgetView(style: "progressRing", entry: entry)
    }
    .configurationDisplayName("Reset")
    .description("Your streak, always in view.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}
