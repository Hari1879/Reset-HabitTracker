# Android Glance widgets — manual setup

These files are reference implementations for Reset's home-screen widgets. They live in
the **app** Android module (not this Expo Module library), because `AppWidgetProvider`
classes must be declared in the app's `AndroidManifest.xml` and the app module is what
Android actually packages as installable widgets.

## Steps (after `npx expo prebuild`)

1. Copy `ResetGlanceWidget.kt` and `WidgetRefreshReceiver.kt` into:
   `android/app/src/main/java/app/reset/habits/widget/`
2. Add to `android/app/src/main/AndroidManifest.xml` (see `AndroidManifest.snippet.xml`
   in this folder for the exact receiver + meta-data blocks — one per widget size).
3. Add `androidx.glance:glance-appwidget:1.1.1` to `android/app/build.gradle` dependencies.
4. Create `res/xml/reset_widget_info_small.xml` (and `_medium`, `_large`) describing each
   widget's `minWidth`/`minHeight`/`resizeMode`, pointing at `ResetGlanceWidgetReceiver`.
5. Rebuild the dev client (`npx expo run:android`) — the widgets will then be selectable
   from the Android home screen "Widgets" picker.

Data flow: `ResetWidgetBridgeModule.kt` (the Expo Module) writes JSON into
`SharedPreferences("reset_widget_prefs")` and broadcasts `WIDGET_REFRESH`.
`WidgetRefreshReceiver` listens for that broadcast and calls `ResetGlanceWidget().updateAll()`,
which reads the same SharedPreferences to redraw every configured widget instance.
