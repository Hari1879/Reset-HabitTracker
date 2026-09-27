package expo.modules.resetwidgetbridge

import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Broadcast the app-level AppWidgetProvider(s) listen for; kept here since this library
 *  module cannot depend on classes that live in the app module (see glance/README.md). */
const val ACTION_REFRESH_WIDGETS = "app.reset.habits.WIDGET_REFRESH"

/**
 * NATIVE INTEGRATION POINT (Android)
 *
 * Bridge between the React Native app and Android home-screen widgets built
 * with Jetpack Glance. Writes JSON snapshots into SharedPreferences that the
 * AppWidgetProvider / Glance widgets (see ../glance) read when rendering.
 *
 * Setup required once, after `npx expo prebuild`:
 *   1. Copy the files under ./glance into android/app/src/main/java/app/reset/habits/widget/.
 *   2. Register each AppWidgetProvider in android/app/src/main/AndroidManifest.xml
 *      (see glance/AndroidManifest.snippet.xml for the exact <receiver> blocks).
 *   3. Add the `androidx.glance:glance-appwidget` dependency to android/app/build.gradle
 *      (already declared here for the Expo Module itself, but the app target needs it too
 *      since the AppWidgetProvider lives in the app module, not this library module).
 *
 * After that, this module keeps SharedPreferences fresh automatically.
 */
private const val PREFS_NAME = "reset_widget_prefs"

class ResetWidgetBridgeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ResetWidgetBridge")

    AsyncFunction("writeSnapshot") { configId: String, snapshotJson: String ->
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      prefs.edit().putString("widget_$configId", snapshotJson).apply()
    }

    AsyncFunction("clearSnapshot") { configId: String ->
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      prefs.edit().remove("widget_$configId").apply()
    }

    AsyncFunction("reloadWidgets") {
      context.sendBroadcast(Intent(ACTION_REFRESH_WIDGETS).setPackage(context.packageName))
    }
  }

  private val context
    get() = appContext.reactContext ?: throw IllegalStateException("React context unavailable")
}
