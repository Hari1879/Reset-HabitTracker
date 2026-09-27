import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MILESTONES } from './milestones';
import type { Habit } from '@/types';

const MILESTONE_MESSAGES: Record<string, { title: string; body: string }> = {
  day1:  { title: 'Day 1 complete',  body: 'Your first full day. That matters more than you know.' },
  day3:  { title: '3 days strong',   body: 'The hardest part is often behind you now.' },
  week1: { title: 'One full week',   body: "Seven days in. You're proving something to yourself." },
  week2: { title: 'Two weeks',       body: 'Your brain is starting to rewire. Keep going.' },
  day30: { title: '30 days',         body: 'A whole month of choosing yourself. This is real.' },
  day90: { title: '90 days',         body: 'Ninety days. You have built something lasting.' },
  year1: { title: 'One year',        body: 'A full year. You did something most people never do.' },
};

export async function scheduleMilestoneNotifications(habit: Habit): Promise<string[]> {
  if (Platform.OS === 'web') return [];

  const ids: string[] = [];
  const startTime = new Date(habit.startDate).getTime();
  const now = Date.now();

  for (const milestone of MILESTONES) {
    const triggerTime = startTime + milestone.days * 24 * 60 * 60 * 1000;
    if (triggerTime <= now) continue;

    const message = MILESTONE_MESSAGES[milestone.id];
    if (!message) continue;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${habit.title} · ${message.title}`,
          body: message.body,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(triggerTime),
        },
      });
      ids.push(id);
    } catch {
      // skip if scheduling fails for this milestone
    }
  }

  return ids;
}

export async function cancelMilestoneNotifications(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
  );
}
