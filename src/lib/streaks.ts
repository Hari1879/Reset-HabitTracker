import type { Habit, Slip } from '@/types';
import { calendarDaysBetween, todayKey, toDateKey } from './dates';

/** Days free since the current streak's startDate, timezone-safe (local calendar days). Never negative. */
export function getCurrentStreakDays(habit: Habit, now: Date = new Date()): number {
  return Math.max(calendarDaysBetween(habit.startDate, now), 0);
}

/** The best streak ever recorded for a habit, including the streak currently in progress. */
export function getLongestStreakDays(habit: Habit, slips: Slip[], now: Date = new Date()): number {
  const past = slips.filter((s) => s.habitId === habit.id).map((s) => s.previousStreakDays);
  const current = getCurrentStreakDays(habit, now);
  return Math.max(current, ...past, 0);
}

export function getResetCount(habitId: string, slips: Slip[]): number {
  return slips.filter((s) => s.habitId === habitId).length;
}

/** Percent of the last N days (default 30) that were not interrupted by a slip. */
export function getSuccessRate(habitId: string, slips: Slip[], days = 30, now: Date = new Date()): number {
  const cutoffKey = toDateKey(new Date(now.getTime() - days * 86_400_000));
  const slipsInWindow = slips.filter((s) => s.habitId === habitId && toDateKey(s.dateTime) >= cutoffKey);
  const slipDays = new Set(slipsInWindow.map((s) => toDateKey(s.dateTime)));
  const cleanDays = days - slipDays.size;
  return Math.round((cleanDays / days) * 100);
}

export interface MomentumSummary {
  totalActiveStreakDays: number;
  strongestStreakDays: number;
  weeklyConsistencyPercent: number;
}

/** Aggregate "Your momentum" figures across every active (non-archived) habit. */
export function getMomentumSummary(habits: Habit[], slips: Slip[], now: Date = new Date()): MomentumSummary {
  const active = habits.filter((h) => !h.archived);
  const totalActiveStreakDays = active.reduce((sum, h) => sum + getCurrentStreakDays(h, now), 0);
  const strongestStreakDays = active.reduce(
    (max, h) => Math.max(max, getLongestStreakDays(h, slips, now)),
    0,
  );

  const last7Keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    last7Keys.push(toDateKey(new Date(now.getTime() - i * 86_400_000)));
  }
  const totalSlots = active.length * 7;
  let interrupted = 0;
  for (const h of active) {
    for (const key of last7Keys) {
      const wasSlipped = slips.some((s) => s.habitId === h.id && toDateKey(s.dateTime) === key);
      if (wasSlipped) interrupted++;
    }
  }
  const weeklyConsistencyPercent = totalSlots > 0 ? Math.round(((totalSlots - interrupted) / totalSlots) * 100) : 100;

  return { totalActiveStreakDays, strongestStreakDays, weeklyConsistencyPercent };
}

/** Applies a slip: preserves the ended streak length, then restarts the streak from now. */
export function applySlipToHabit(habit: Habit, now: Date = new Date()): { habit: Habit; slip: Omit<Slip, 'id' | 'habitId'> } {
  const previousStreakDays = getCurrentStreakDays(habit, now);
  return {
    habit: { ...habit, startDate: now.toISOString() },
    slip: { dateTime: now.toISOString(), previousStreakDays },
  };
}

export function getMoneyTimeSaved(habit: Habit, streakDays: number): { money?: number; minutes?: number } {
  const money = habit.costPerDay ? Math.round(habit.costPerDay * streakDays * 100) / 100 : undefined;
  const minutes = habit.minutesPerDay ? habit.minutesPerDay * streakDays : undefined;
  return { money, minutes };
}

export { todayKey };
