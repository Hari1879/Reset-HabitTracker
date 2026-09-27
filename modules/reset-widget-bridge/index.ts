import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import type { WidgetConfig, WidgetSyncSnapshot } from '@/types';

/**
 * JS-facing interface for the native widget bridge.
 *
 * This is a thin Expo Module wrapper. It is designed to degrade to a safe no-op when:
 *  - running in Expo Go (no custom native code available), or
 *  - the native module hasn't been built into the current dev client yet.
 *
 * The rest of the app should only ever import from this file, never reach into
 * `NativeResetWidgetBridge` directly, so Expo Go / web stay fully functional.
 */

interface NativeResetWidgetBridge {
  /** Writes one habit's data into the shared App Group (iOS) / SharedPreferences (Android) store. */
  writeSnapshot(configId: string, snapshotJson: string): Promise<void>;
  /** Asks the OS to redraw home-screen widgets (WidgetCenter.reloadAllTimelines / AppWidgetManager update). */
  reloadWidgets(): Promise<void>;
  /** Removes a widget's data when its config is deleted. */
  clearSnapshot(configId: string): Promise<void>;
}

// requireOptionalNativeModule resolves to null (never throws) when no native module is
// linked — e.g. in Expo Go or before a dev client rebuild — which is exactly the
// degrade-to-no-op behavior this bridge needs.
const native = requireOptionalNativeModule<NativeResetWidgetBridge>('ResetWidgetBridge');

export function isWidgetBridgeAvailable(): boolean {
  return native !== null && (Platform.OS === 'ios' || Platform.OS === 'android');
}

/** Pushes a fresh snapshot for a single widget config. Safe to call even when no native module is linked. */
export async function syncWidgetSnapshot(config: WidgetConfig, snapshot: WidgetSyncSnapshot): Promise<void> {
  if (!native) return;
  try {
    await native.writeSnapshot(config.id, JSON.stringify({ config, snapshot }));
    await native.reloadWidgets();
  } catch {
    // Widget sync is best-effort; never let it break the core app experience.
  }
}

/** Fans a single data change (check-in / slip / edit) out to every widget configured for that habit. */
export async function syncAllWidgetsForHabit(
  configs: WidgetConfig[],
  habitId: string,
  snapshot: WidgetSyncSnapshot,
): Promise<void> {
  const affected = configs.filter((c) => c.habitId === habitId);
  await Promise.all(affected.map((c) => syncWidgetSnapshot(c, snapshot)));
}

export async function clearWidgetSnapshot(configId: string): Promise<void> {
  if (!native) return;
  try {
    await native.clearSnapshot(configId);
    await native.reloadWidgets();
  } catch {
    // no-op
  }
}
