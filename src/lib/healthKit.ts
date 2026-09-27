import { Platform } from 'react-native';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.MindfulSession],
    write: [AppleHealthKit.Constants.Permissions.MindfulSession],
  },
};

/** Request HealthKit read/write for MindfulSession. Resolves on success, rejects on denial/error. */
export function requestHealthKitPermissions(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') { resolve(); return; }
    AppleHealthKit.initHealthKit(PERMISSIONS, (err) => {
      if (err) reject(new Error(err));
      else resolve();
    });
  });
}

/**
 * Write a 1-minute mindful session to HealthKit representing today's sobriety check-in.
 * Fires-and-forgets — errors are silently swallowed so a HealthKit failure never blocks the app.
 */
export function writeSobrietyCheckIn(habitTitle: string, date: Date = new Date()): void {
  if (Platform.OS !== 'ios') return;
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);
  const end = new Date(start.getTime() + 60_000);
  AppleHealthKit.saveMindfulSession(
    {
      value: 0,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      metadata: { HKMetadataKeyNote: `Reset check-in: ${habitTitle}` } as any,
    },
    () => {}, // ignore result
  );
}
