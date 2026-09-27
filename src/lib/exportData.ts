import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { Achievement, CheckIn, CravingLog, Habit, Reminder, Slip, WidgetConfig } from '@/types';

export interface ExportPayload {
  exportedAt: string;
  habits: Habit[];
  checkIns: CheckIn[];
  slips: Slip[];
  cravings: CravingLog[];
  achievements: Achievement[];
  reminders: Reminder[];
  widgetConfigs: WidgetConfig[];
}

/** Writes all local data to a JSON file and opens the OS share sheet. On-device only, nothing is uploaded. */
export async function exportDataAsJSON(payload: ExportPayload): Promise<void> {
  const json = JSON.stringify(payload, null, 2);

  if (Platform.OS === 'web') {
    return;
  }

  const file = new File(Paths.cache, `reset-export-${Date.now()}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Reset data' });
  }
}
