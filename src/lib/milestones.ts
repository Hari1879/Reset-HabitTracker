import type { Milestone, MilestoneId } from '@/types';

export const MILESTONES: Milestone[] = [
  { id: 'day1', days: 1, label: 'Day 1', shortLabel: '1d' },
  { id: 'day3', days: 3, label: '3 days', shortLabel: '3d' },
  { id: 'week1', days: 7, label: '1 week', shortLabel: '1wk' },
  { id: 'week2', days: 14, label: '2 weeks', shortLabel: '2wk' },
  { id: 'day30', days: 30, label: '30 days', shortLabel: '30d' },
  { id: 'day90', days: 90, label: '90 days', shortLabel: '90d' },
  { id: 'year1', days: 365, label: '1 year', shortLabel: '1yr' },
];

export function getMilestoneById(id: MilestoneId): Milestone {
  return MILESTONES.find((m) => m.id === id)!;
}

/** The most advanced milestone the current streak has already reached (or undefined). */
export function getReachedMilestone(streakDays: number): Milestone | undefined {
  return [...MILESTONES].reverse().find((m) => streakDays >= m.days);
}

/** The next milestone still ahead of the current streak (or undefined once past 1 year). */
export function getNextMilestone(streakDays: number): Milestone | undefined {
  return MILESTONES.find((m) => streakDays < m.days);
}

export interface MilestoneProgress {
  next?: Milestone;
  daysRemaining: number;
  /** 0-1 progress from the previous milestone (or 0) toward the next one. */
  progress: number;
}

export function getMilestoneProgress(streakDays: number): MilestoneProgress {
  const next = getNextMilestone(streakDays);
  if (!next) {
    return { next: undefined, daysRemaining: 0, progress: 1 };
  }
  const reachedIndex = MILESTONES.findIndex((m) => m.id === next.id) - 1;
  const previousDays = reachedIndex >= 0 ? MILESTONES[reachedIndex].days : 0;
  const span = next.days - previousDays;
  const progressed = streakDays - previousDays;
  return {
    next,
    daysRemaining: Math.max(next.days - streakDays, 0),
    progress: span > 0 ? Math.min(Math.max(progressed / span, 0), 1) : 1,
  };
}
