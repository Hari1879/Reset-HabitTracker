import { create } from 'zustand';
import type { HabitCategory, WidgetStyle } from '@/types';

export interface DraftHabit {
  category: HabitCategory;
  title: string;
}

interface OnboardingState {
  draftHabits: DraftHabit[];
  reminderTime: string | null;
  widgetStyle: WidgetStyle;
  toggleHabit: (category: HabitCategory, title: string) => void;
  addCustomHabit: (title: string) => void;
  setReminderTime: (time: string | null) => void;
  setWidgetStyle: (style: WidgetStyle) => void;
  reset: () => void;
}

const initialState = {
  draftHabits: [] as DraftHabit[],
  reminderTime: null as string | null,
  widgetStyle: 'progressRing' as WidgetStyle,
};

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  ...initialState,

  toggleHabit: (category, title) => {
    const exists = get().draftHabits.some((h) => h.category === category);
    if (exists) {
      set((s) => ({ draftHabits: s.draftHabits.filter((h) => h.category !== category) }));
    } else if (get().draftHabits.length < 3) {
      set((s) => ({ draftHabits: [...s.draftHabits, { category, title }] }));
    }
  },

  addCustomHabit: (title) => {
    if (get().draftHabits.length >= 3 || !title.trim()) return;
    set((s) => ({ draftHabits: [...s.draftHabits, { category: 'custom', title: title.trim() }] }));
  },

  setReminderTime: (time) => set({ reminderTime: time }),
  setWidgetStyle: (style) => set({ widgetStyle: style }),
  reset: () => set(initialState),
}));
