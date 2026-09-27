package app.reset.habits.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.text.FontWeight
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Color
import org.json.JSONObject

// NATIVE INTEGRATION POINT (Android) — see ../README.md for setup steps.
// One GlanceAppWidget renders all three styles/sizes; the style + accent are
// chosen per-instance via the WidgetConfig the user picks in the Reset app.

private val inkBackground = Color(0xFF0A0E17)

private fun accentColor(name: String): Color = when (name) {
  "teal" -> Color(0xFF2FBFAE)
  "aqua" -> Color(0xFF3AB2DC)
  "lavender" -> Color(0xFF9C89EA)
  "coral" -> Color(0xFFFF8266)
  else -> Color(0xFFE8B85B) // gold
}

data class WidgetData(
  val habitTitle: String,
  val accent: String,
  val streakDays: Int,
  val nextMilestoneLabel: String,
  val progress: Double,
)

class ResetGlanceWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Responsive(
    setOf(DpSize(110.dp, 110.dp), DpSize(220.dp, 110.dp), DpSize(220.dp, 220.dp))
  )

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val appWidgetManager = GlanceAppWidgetManager(context)
    val configId = appWidgetManager.getAppWidgetId(id).toString()
    val prefs = context.getSharedPreferences("reset_widget_prefs", Context.MODE_PRIVATE)
    val raw = prefs.getString("widget_$configId", null)
    val data = raw?.let { parseSnapshot(it) }
    val style = raw?.let { JSONObject(it).optJSONObject("config")?.optString("style") } ?: "progressRing"

    provideContent {
      Box(
        modifier = GlanceModifier.fillMaxSize().background(ColorProvider(inkBackground)).padding(16.dp),
        contentAlignment = Alignment.Center,
      ) {
        if (data == null) {
          Text("Open Reset to configure", style = TextStyle(color = ColorProvider(Color.White)))
        } else when (style) {
          "dotGrid" -> DotGridContent(data)
          "minimalCountdown" -> MinimalCountdownContent(data)
          // "gridBlocks", "terminal", "boldBlock", "pulseBars", "weekGrid", and "stickyNote" (added alongside the original three in
          // the in-app WidgetPreview gallery) fall back to Progress Ring here — add Composables
          // for them following the pattern above if you want native pixel parity.
          else -> ProgressRingContent(data)
        }
      }
    }
  }

  private fun parseSnapshot(raw: String): WidgetData {
    val obj = JSONObject(raw).getJSONObject("snapshot")
    return WidgetData(
      habitTitle = obj.getString("habitTitle"),
      accent = obj.getString("accent"),
      streakDays = obj.getInt("streakDays"),
      nextMilestoneLabel = obj.getString("nextMilestoneLabel"),
      progress = obj.getDouble("progressToNextMilestone"),
    )
  }
}

// Progress Ring, Dot Grid, and Minimal Countdown are expressed with simple Glance
// primitives (Glance has no native canvas/arc drawing); the ring uses a bordered Box
// as an approximation, matching the in-app WidgetPreview at a glance-widget fidelity level.

@androidx.compose.runtime.Composable
private fun ProgressRingContent(data: WidgetData) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Box(
      modifier = GlanceModifier.size(64.dp).background(ColorProvider(accentColor(data.accent))),
      contentAlignment = Alignment.Center,
    ) {
      Text("${data.streakDays}", style = TextStyle(color = ColorProvider(Color.White), fontWeight = FontWeight.Bold))
    }
    Spacer(modifier = GlanceModifier.height(6.dp))
    Text(data.habitTitle, style = TextStyle(color = ColorProvider(Color.White)))
    Text(data.nextMilestoneLabel, style = TextStyle(color = ColorProvider(Color.White)))
  }
}

@androidx.compose.runtime.Composable
private fun DotGridContent(data: WidgetData) {
  val totalDots = 20
  val filled = (totalDots * data.progress).toInt()
  Column {
    Text(data.habitTitle, style = TextStyle(color = ColorProvider(Color.White)))
    Spacer(modifier = GlanceModifier.height(6.dp))
    repeat(4) { row ->
      Row {
        repeat(5) { col ->
          val i = row * 5 + col
          Box(
            modifier = GlanceModifier.size(10.dp).padding(2.dp)
              .background(ColorProvider(if (i < filled) accentColor(data.accent) else Color(0x22FFFFFF))),
          ) {}
        }
      }
    }
  }
}

@androidx.compose.runtime.Composable
private fun MinimalCountdownContent(data: WidgetData) {
  Column {
    Text("${data.streakDays} days stronger", style = TextStyle(color = ColorProvider(Color.White), fontWeight = FontWeight.Bold))
    Spacer(modifier = GlanceModifier.height(8.dp))
    Box(modifier = GlanceModifier.fillMaxWidth().height(6.dp).background(ColorProvider(Color(0x22FFFFFF)))) {
      Box(modifier = GlanceModifier.fillMaxWidth(data.progress.toFloat()).height(6.dp).background(ColorProvider(accentColor(data.accent)))) {}
    }
    Text(data.nextMilestoneLabel, style = TextStyle(color = ColorProvider(Color.White)))
  }
}

class ResetGlanceWidgetReceiver : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = ResetGlanceWidget()
}
