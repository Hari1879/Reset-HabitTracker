import ExpoModulesCore
import WidgetKit

// MARK: - NATIVE INTEGRATION POINT (iOS)
//
// This Expo Module is the bridge between the React Native app and the iOS
// WidgetKit extension. It writes JSON snapshots into an **App Group** shared
// container so the widget extension (a separate target, added manually in
// Xcode — see modules/reset-widget-bridge/ios/WidgetExtension) can read them.
//
// Setup required once, after `npx expo prebuild`:
//   1. In Xcode, select the app target -> Signing & Capabilities -> "+ Capability"
//      -> App Groups -> add `group.app.reset.habits`.
//   2. Add a new target: File -> New -> Target -> Widget Extension, name it
//      "ResetWidgets". Give that target the same App Group capability.
//   3. Copy the SwiftUI code in ./WidgetExtension into the new target.
//   4. Build once from Xcode so the widget extension is embedded in the app.
//
// After that, this module keeps the shared store fresh automatically; no
// further native code changes are needed to add/remove widgets from the app.

let appGroupIdentifier = "group.app.reset.habits"

public class ResetWidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ResetWidgetBridge")

    AsyncFunction("writeSnapshot") { (configId: String, snapshotJson: String) in
      guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return }
      defaults.set(snapshotJson, forKey: "widget_\(configId)")
    }

    AsyncFunction("clearSnapshot") { (configId: String) in
      guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return }
      defaults.removeObject(forKey: "widget_\(configId)")
    }

    AsyncFunction("reloadWidgets") {
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
