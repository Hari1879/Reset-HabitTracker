import type { Habit } from '@/types';
import { getPresetForCategory } from './habitPresets';

function daysAgo(days: number): string {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** First-run demo data so the dashboard feels alive immediately, not empty. */
export function createSeedHabits(): Habit[] {
  const now = new Date().toISOString();
  const smoking = getPresetForCategory('smoking');
  const social = getPresetForCategory('social_media');
  const junkFood = getPresetForCategory('junk_food');

  return [
    {
      id: 'seed-smoking',
      title: smoking.title,
      category: smoking.category,
      icon: smoking.icon,
      accent: smoking.accent,
      startDate: daysAgo(12),
      createdAt: now,
      archived: false,
      motivationNote: smoking.motivationNote,
      costPerDay: 9,
      costUnit: '$',
      minutesPerDay: 20,
    },
    {
      id: 'seed-social',
      title: 'No late-night scrolling',
      category: social.category,
      icon: 'moonOff',
      accent: social.accent,
      startDate: daysAgo(4),
      createdAt: now,
      archived: false,
      motivationNote: 'For better sleep and calmer mornings.',
      minutesPerDay: 45,
    },
    {
      id: 'seed-junkfood',
      title: junkFood.title,
      category: junkFood.category,
      icon: junkFood.icon,
      accent: junkFood.accent,
      startDate: daysAgo(21),
      createdAt: now,
      archived: false,
      motivationNote: junkFood.motivationNote,
      costPerDay: 6,
      costUnit: '$',
    },
  ];
}
