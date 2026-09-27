import type { AccentColor, HabitCategory } from '@/types';

export interface HabitPreset {
  category: HabitCategory;
  title: string;
  icon: string;
  accent: AccentColor;
  motivationNote: string;
}

export const HABIT_PRESETS: HabitPreset[] = [
  { category: 'smoking', title: 'No smoking', icon: 'noSmoke', accent: 'teal', motivationNote: 'For clearer breath and longer mornings.' },
  { category: 'alcohol', title: 'No alcohol', icon: 'noDrink', accent: 'aqua', motivationNote: 'For clearer mornings and steadier moods.' },
  { category: 'social_media', title: 'No social media after 10 PM', icon: 'moonOff', accent: 'lavender', motivationNote: 'For better sleep and a quieter mind.' },
  { category: 'junk_food', title: 'No junk food', icon: 'leaf', accent: 'gold', motivationNote: 'For more energy and feeling like yourself.' },
  { category: 'gambling', title: 'No gambling', icon: 'shield', accent: 'coral', motivationNote: 'For peace of mind and a steadier future.' },
  { category: 'pornography', title: 'No pornography', icon: 'spark', accent: 'lavender', motivationNote: 'For presence and connection.' },
  { category: 'impulse_shopping', title: 'No impulse shopping', icon: 'wallet', accent: 'gold', motivationNote: 'For intention over impulse.' },
  { category: 'caffeine', title: 'Less caffeine', icon: 'droplet', accent: 'aqua', motivationNote: 'For calmer afternoons and better sleep.' },
  { category: 'custom', title: 'Custom habit', icon: 'spark', accent: 'teal', motivationNote: '' },
];

export function getPresetForCategory(category: HabitCategory): HabitPreset {
  return HABIT_PRESETS.find((p) => p.category === category) ?? HABIT_PRESETS[HABIT_PRESETS.length - 1];
}
