# Reset

Reset helps people reduce or quit habits — smoking, alcohol, late-night scrolling, junk food,
gambling, and more — through calm, non-shaming progress tracking. No streaks are erased by a
hard day; a slip is recorded supportively and the app keeps every bit of history.

Built with Expo + React Native + TypeScript. Fully offline-first: everything lives in
AsyncStorage on-device, there's no backend, login, or analytics.

## Getting started

```bash
npm install
npx expo start
```

- Press `i` for the iOS Simulator, `a` for an Android emulator, or scan the QR code with
  Expo Go on a physical device.
- Works fully in **Expo Go** — real home-screen widgets require a development build (see
  [Widgets](#widgets--native-integration) below), but every other feature works out of the box.

First launch seeds three demo habits (No smoking · 12 days, No late-night scrolling · 4 days,
No junk food · 21 days) so the dashboard feels alive immediately, then walks you through
onboarding to add your own.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` | Start and open a native simulator/emulator |
| `npm run web` | Run in a browser (useful for quick UI iteration; widgets are preview-only) |
| `npm run typecheck` | `tsc --noEmit` |

## Project structure

```
app/                          Expo Router routes (file-based navigation)
  _layout.tsx                 Root providers: theme, gesture handler, hydration gate
  index.tsx                   Redirects to onboarding or the tab navigator
  onboarding/                 Welcome → habits → reminder → widget style
  (tabs)/                     Home, Widgets, Achievements, Settings
  habit/
    add.tsx                   New habit modal
    [id]/index.tsx            Habit detail (hero ring, timeline, heatmap, insights)
    [id]/edit.tsx             Edit habit modal

src/
  components/                 HabitCard, ProgressRing, DotProgress, MilestoneTimeline,
                               HeatmapCalendar, AchievementCard, AchievementUnlockToast,
                               WidgetPreview, SupportiveSlipSheet, IconGlyph, ui/*
  store/                      Zustand stores (useHabitStore, useSettingsStore, useOnboardingStore)
  lib/                        Pure logic: streaks, milestones, achievements, dates,
                               notifications, seed data, JSON export, storage helpers
  theme/                      Dark/light color tokens, typography, ThemeProvider
  types/                      Habit, CheckIn, Slip, Milestone, Achievement, Reminder, WidgetConfig

modules/reset-widget-bridge/  Native widget bridge (Expo Module) — see below
```

## Data model

All types live in [`src/types/index.ts`](src/types/index.ts): `Habit`, `CheckIn`, `Slip`,
`Milestone`, `Achievement`, `Reminder`, `WidgetConfig`, plus `WidgetSyncSnapshot`, the small
payload handed to the native widget bridge on every data change.

Key design choices:

- **Streaks are derived, not stored.** A habit only stores `startDate`; the current streak is
  always `today − startDate` in local calendar days ([`src/lib/streaks.ts`](src/lib/streaks.ts)),
  so it's correct across time zone changes and DST without any background job.
- **A slip never deletes history.** Recording a slip pushes a `Slip` row (preserving
  `previousStreakDays`) and resets `habit.startDate` to now — longest streak, achievements, and
  past check-ins are untouched.
- **Everything persists via Zustand's `persist` middleware backed by AsyncStorage**
  ([`src/store/useHabitStore.ts`](src/store/useHabitStore.ts),
  [`src/store/useSettingsStore.ts`](src/store/useSettingsStore.ts)).

## Widgets & native integration

The in-app **Widgets** tab lets you preview nine original widget styles — Progress Ring, Dot
Grid, Minimal Countdown, Grid Blocks, Terminal, Bold Block, Pulse Bars, Week Grid, and Sticky
Note — at small/medium/large, in any accent color, for any habit, rendered with the same
SVG/Reanimated components used elsewhere in the app
([`src/components/WidgetPreview.tsx`](src/components/WidgetPreview.tsx)). Onboarding offers the
first three as a quick start; all nine live in the Widgets tab. This works in Expo Go with no
native setup.

The native WidgetKit/Glance scaffolds in `modules/reset-widget-bridge` implement Progress Ring,
Dot Grid, and Minimal Countdown natively; Grid Blocks, Terminal, and Bold Block currently fall
back to the native Progress Ring view (see the comment beside each platform's style switch) —
follow the same pattern to add native views for them if you want full parity.

Real home-screen widgets need native code, which Expo Go cannot load. The bridge is isolated
behind [`modules/reset-widget-bridge`](modules/reset-widget-bridge), a local Expo Module:

```
modules/reset-widget-bridge/
  index.ts                         JS API the app calls — no-ops safely if native isn't linked
  expo-module.config.json
  ios/
    ResetWidgetBridge.podspec
    ResetWidgetBridgeModule.swift  Writes snapshots to an App Group + reloads WidgetKit timelines
    WidgetExtension/
      ResetWidgets.swift           Reference SwiftUI widget (all 3 styles × 3 sizes)
  android/
    ResetWidgetBridgeModule.kt     Writes snapshots to SharedPreferences + broadcasts a refresh
    glance/
      ResetGlanceWidget.kt         Reference Jetpack Glance widget (all 3 styles, responsive)
      WidgetRefreshReceiver.kt
      AndroidManifest.snippet.xml
      README.md                   Manifest/registration steps for this platform
```

**How the app stays safe in Expo Go:** `modules/reset-widget-bridge/index.ts` calls
`requireOptionalNativeModule`, which resolves to `null` — never throws — when the native module
isn't built into the running binary. Every store action that touches widgets
(`checkInToday`, `recordSlip`, `updateHabit`, widget config changes) calls this bridge, and it
silently no-ops until you've done the one-time native setup below.

### One-time setup for real widgets

1. `npx expo prebuild` to generate the `ios/` and `android/` native projects (the local module
   in `modules/reset-widget-bridge` is autolinked automatically).
2. **iOS:** open `ios/Reset.xcworkspace` in Xcode.
   - Add the **App Groups** capability to the main app target, with group
     `group.app.reset.habits` (already referenced by `ResetWidgetBridgeModule.swift`).
   - File → New → Target → **Widget Extension**, name it `ResetWidgets`, and give it the same
     App Group capability.
   - Copy the contents of `modules/reset-widget-bridge/ios/WidgetExtension/ResetWidgets.swift`
     into the new target.
   - Build once from Xcode so the extension embeds into the app.
3. **Android:** follow `modules/reset-widget-bridge/android/glance/README.md` — copy the two
   Kotlin files into `android/app/src/main/java/app/reset/habits/widget/`, merge the manifest
   snippet into `android/app/src/main/AndroidManifest.xml`, add the Glance dependency to
   `android/app/build.gradle`, and rebuild with `npx expo run:android`.
4. From then on, `npx expo run:ios` / `run:android` produce dev-client builds where the Widgets
   tab's "development build required" notice disappears and widgets you add from the app
   actually appear in the OS widget picker, refreshing automatically on every check-in, slip,
   or edit.

## Design notes

- Dark-first, ink/navy background (`#0A0E17`) with a teal/aqua/lavender/coral/gold accent
  system defined once in [`src/theme/colors.ts`](src/theme/colors.ts) and mirrored in
  `tailwind.config.js` for NativeWind usage.
- All iconography in [`src/components/IconGlyph.tsx`](src/components/IconGlyph.tsx) is original
  hand-drawn line art — no icon library.
- Every interactive element carries `accessibilityRole`/`accessibilityLabel`, text uses
  `allowFontScaling` for Dynamic Type, and color choices meet contrast guidelines in both themes.

## Out of scope for v1

No backend, login, payments, ads, or social feed — by design. All data stays on-device; the
Settings tab's **Export data to JSON** is the only way data leaves the app, and only when you
trigger it.
