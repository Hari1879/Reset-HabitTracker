import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';
import type { TodoItem } from '@/store/useTodoStore';

const native = requireOptionalNativeModule<{
  writeSnapshot(key: string, json: string): Promise<void>;
  reloadWidgets(): Promise<void>;
}>('ResetWidgetBridge');

export const TASKS_WIDGET_KEY = 'tasks_widget';

export async function syncTaskWidget(items: TodoItem[]): Promise<void> {
  if (!native || Platform.OS !== 'ios') return;
  try {
    const myDayItems = items.filter((i) => i.isMyDay && !i.completed);
    const payload = {
      myDayCount: myDayItems.length,
      myDayTasks: myDayItems.slice(0, 10).map((i) => ({
        id: i.id,
        title: i.title,
        priority: i.priority,
        completed: i.completed,
      })),
      totalOpen: items.filter((i) => !i.completed).length,
      date: new Date().toISOString().slice(0, 10),
    };
    await native.writeSnapshot(TASKS_WIDGET_KEY, JSON.stringify(payload));
    await native.reloadWidgets();
  } catch {
    // widget sync is best-effort
  }
}
