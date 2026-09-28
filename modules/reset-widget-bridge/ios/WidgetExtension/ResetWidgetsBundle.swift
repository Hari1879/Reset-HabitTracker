import WidgetKit
import SwiftUI

// MARK: - Widget Bundle
//
// This file replaces the @main annotation on ResetWidget.
// If ResetWidget.swift has "@main" on its struct, remove it —
// only one @main is allowed per extension target.

@main
struct ResetWidgetBundle: WidgetBundle {
    var body: some Widget {
        ResetWidget()
        TasksWidget()
    }
}
