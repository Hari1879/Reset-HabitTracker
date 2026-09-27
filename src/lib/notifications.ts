import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

const REMINDER_TITLES = [
  'A quiet check-in',
  'Still on your path',
  'A gentle nudge',
];

/** Schedules a repeating local reminder for the given time/day set; returns the platform notification id. */
export async function scheduleReminder(reminder: Reminder, habitTitle: string): Promise<string | undefined> {
  if (!reminder.enabled) return undefined;
  const [hour, minute] = reminder.time.split(':').map(Number);
  const title = REMINDER_TITLES[Math.floor(Math.random() * REMINDER_TITLES.length)];

  if (Platform.OS === 'web') return undefined;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: `How is "${habitTitle}" going today?`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

export async function cancelReminder(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
