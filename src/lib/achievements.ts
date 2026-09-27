import type { Achievement, AchievementType, Habit, Slip } from '@/types';
import { getCurrentStreakDays } from './streaks';
import { parseISO, getDay, addDays, isBefore } from 'date-fns';

export const ACHIEVEMENT_COPY: Record<AchievementType, { title: string; description: string }> = {
  first_day: { title: 'First day', description: 'You began. That is the whole game.' },
  full_week: { title: 'A full week', description: 'Seven days of showing up for yourself.' },
  weekend_warrior: { title: 'Weekend warrior', description: 'You carried your streak through a whole weekend.' },
  one_month: { title: 'One month', description: 'Thirty days of quiet, steady choices.' },
  ninety_days: { title: '90 days strong', description: 'A season of consistency.' },
  one_year: { title: 'One year', description: 'A full year. Remarkable.' },
  strong_comeback: { title: 'Strong comeback', description: 'You returned, and that took real strength.' },
};

function hasFullWeekendWithin(startDate: string, now: Date): boolean {
  const start = parseISO(startDate);
  let sawSaturday = false;
  let sawSundayAfterSaturday = false;
  let cursor = start;
  while (isBefore(cursor, now)) {
    const dow = getDay(cursor);
    if (dow === 6) sawSaturday = true;
    if (dow === 0 && sawSaturday) sawSundayAfterSaturday = true;
    cursor = addDays(cursor, 1);
  }
  return sawSundayAfterSaturday;
}

/** Given current state, returns any achievements not yet recorded that should now unlock. */
export function evaluateNewAchievements(
  habit: Habit,
  slips: Slip[],
  existing: Achievement[],
  now: Date = new Date(),
): Omit<Achievement, 'id'>[] {
  const streakDays = getCurrentStreakDays(habit, now);
  const unlockedTypes = new Set(existing.filter((a) => a.habitId === habit.id).map((a) => a.type));
  const newOnes: Omit<Achievement, 'id'>[] = [];

  const maybeUnlock = (type: AchievementType, condition: boolean) => {
    if (condition && !unlockedTypes.has(type)) {
      const copy = ACHIEVEMENT_COPY[type];
      newOnes.push({ habitId: habit.id, type, unlockedAt: now.toISOString(), ...copy });
    }
  };

  maybeUnlock('first_day', streakDays >= 1);
  maybeUnlock('full_week', streakDays >= 7);
  maybeUnlock('weekend_warrior', hasFullWeekendWithin(habit.startDate, now));
  maybeUnlock('one_month', streakDays >= 30);
  maybeUnlock('ninety_days', streakDays >= 90);
  maybeUnlock('one_year', streakDays >= 365);

  const habitSlips = slips.filter((s) => s.habitId === habit.id);
  const hadMeaningfulStreakBefore = habitSlips.some((s) => s.previousStreakDays >= 7);
  maybeUnlock('strong_comeback', hadMeaningfulStreakBefore && streakDays >= 3);

  return newOnes;
}
