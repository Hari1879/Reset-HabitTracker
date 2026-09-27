import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/lib/id';
import { todayKey } from '@/lib/dates';

export interface RoutineItem {
  id: string;
  label: string;
  emoji: string;
  order: number;
}

interface PlannerState {
  routines: RoutineItem[];
  completedToday: Record<string, string[]>; // dateKey -> itemIds completed
  addRoutine: (label: string, emoji: string) => void;
  removeRoutine: (id: string) => void;
  reorderRoutine: (id: string, direction: 'up' | 'down') => void;
  toggleComplete: (itemId: string) => void;
  isCompleted: (itemId: string) => boolean;
  todayCount: () => number;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      routines: [
        { id: 'r1', label: 'Drink a glass of water', emoji: '💧', order: 0 },
        { id: 'r2', label: 'Take medication / vitamins', emoji: '💊', order: 1 },
        { id: 'r3', label: 'Move your body (5 min)', emoji: '🚶', order: 2 },
        { id: 'r4', label: 'Check in on your habits', emoji: '✅', order: 3 },
      ],
      completedToday: {},

      addRoutine: (label, emoji) => {
        const maxOrder = Math.max(-1, ...get().routines.map((r) => r.order));
        set((s) => ({
          routines: [...s.routines, { id: generateId('routine'), label, emoji, order: maxOrder + 1 }],
        }));
      },

      removeRoutine: (id) => set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      reorderRoutine: (id, direction) => {
        const sorted = [...get().routines].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((r) => r.id === id);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;
        const newOrder = sorted[swapIdx].order;
        sorted[swapIdx] = { ...sorted[swapIdx], order: sorted[idx].order };
        sorted[idx] = { ...sorted[idx], order: newOrder };
        set({ routines: sorted });
      },

      toggleComplete: (itemId) => {
        const key = todayKey();
        const current = get().completedToday[key] ?? [];
        const isNowDone = current.includes(itemId);
        set((s) => ({
          completedToday: {
            ...s.completedToday,
            [key]: isNowDone ? current.filter((id) => id !== itemId) : [...current, itemId],
          },
        }));
      },

      isCompleted: (itemId) => {
        const key = todayKey();
        return (get().completedToday[key] ?? []).includes(itemId);
      },

      todayCount: () => {
        const key = todayKey();
        return (get().completedToday[key] ?? []).length;
      },
    }),
    {
      name: 'reset:plannerStore',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
