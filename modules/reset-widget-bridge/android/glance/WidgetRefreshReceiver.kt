package app.reset.habits.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.runBlocking

/** Listens for the ACTION_REFRESH_WIDGETS broadcast sent by ResetWidgetBridgeModule
 *  whenever a check-in, slip, or habit edit happens in the React Native app. */
class WidgetRefreshReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != "app.reset.habits.WIDGET_REFRESH") return
    runBlocking { ResetGlanceWidget().updateAll(context) }
  }
}
