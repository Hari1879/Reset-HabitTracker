import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

/** Local calendar-day key, e.g. "2026-07-10". Always derived from the device's local timezone. */
export function toDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Whole calendar days between two points in time, ignoring time-of-day (timezone-safe streak math). */
export function calendarDaysBetween(from: Date | string, to: Date | string): number {
  const a = typeof from === 'string' ? parseISO(from) : from;
  const b = typeof to === 'string' ? parseISO(to) : to;
  return differenceInCalendarDays(startOfDay(b), startOfDay(a));
}

export function formatFriendlyDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatFriendlyDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatDayLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE');
}

export function formatLongDate(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d');
}

export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
