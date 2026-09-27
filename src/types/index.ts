export type HabitCategory =
  | 'smoking'
  | 'alcohol'
  | 'social_media'
  | 'junk_food'
  | 'gambling'
  | 'pornography'
  | 'impulse_shopping'
  | 'caffeine'
  | 'custom';

export type AccentColor = 'teal' | 'aqua' | 'lavender' | 'coral' | 'gold';

export type WidgetStyle =
  | 'dotGrid'
  | 'progressRing'
  | 'minimalCountdown'
  | 'gridBlocks'
  | 'terminal'
  | 'boldBlock'
  | 'pulseBars'
  | 'weekGrid'
  | 'stickyNote';

export type WidgetSize = 'small' | 'medium' | 'large';

export type WidgetPlatform = 'ios' | 'android';

export type SlipTrigger = 'stress' | 'boredom' | 'social' | 'late_night' | 'other';

/** A habit the user is tracking. Streaks are derived at read-time from startDate + slips, never stored. */
export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  icon: string;
  accent: AccentColor;
  /** ISO date-time the current streak began (local wall-clock, stored with offset). */
  startDate: string;
  createdAt: string;
  archived: boolean;
  motivationNote?: string;
  /** Optional cost/time-saved tracking, e.g. "$8/day" avoided. */
  costPerDay?: number;
  costUnit?: string;
  minutesPerDay?: number;
}

export interface CheckIn {
  id: string;
  habitId: string;
  /** Local calendar date, yyyy-MM-dd, one per day per habit. */
  date: string;
  note?: string;
  createdAt: string;
}

export interface Slip {
  id: string;
  habitId: string;
  /** ISO date-time of the slip. */
  dateTime: string;
  trigger?: SlipTrigger;
  note?: string;
  /** Length in days of the streak that ended, preserved for "previous best" history. */
  previousStreakDays: number;
}

export type MilestoneId = 'day1' | 'day3' | 'week1' | 'week2' | 'day30' | 'day90' | 'year1';

export interface Milestone {
  id: MilestoneId;
  days: number;
  label: string;
  shortLabel: string;
}

export type AchievementType =
  | 'first_day'
  | 'full_week'
  | 'weekend_warrior'
  | 'one_month'
  | 'ninety_days'
  | 'one_year'
  | 'strong_comeback';

export interface Achievement {
  id: string;
  habitId: string;
  type: AchievementType;
  unlockedAt: string;
  title: string;
  description: string;
}

export interface Reminder {
  id: string;
  habitId?: string;
  /** HH:mm 24h local time */
  time: string;
  /** 0 (Sun) - 6 (Sat) */
  days: number[];
  enabled: boolean;
  notificationId?: string;
}

export interface WidgetConfig {
  id: string;
  habitId: string;
  style: WidgetStyle;
  size: WidgetSize;
  accent: AccentColor;
  platform: WidgetPlatform;
}

export type ThemePreference = 'system' | 'dark' | 'light';

export interface AppSettings {
  theme: ThemePreference;
  strictPrivacyMode: boolean;
  onboardingComplete: boolean;
}

/** Snapshot handed to the native widget bridge on every data-changing action. */
export interface WidgetSyncSnapshot {
  habitId: string;
  habitTitle: string;
  icon: string;
  accent: AccentColor;
  streakDays: number;
  nextMilestoneDays: number;
  nextMilestoneLabel: string;
  progressToNextMilestone: number;
}
