import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Achievement,
  CheckIn,
  CopingAction,
  CravingLog,
  Habit,
  HabitCategory,
  Slip,
  SlipTrigger,
  Mood,
  GoalMode,
  WidgetConfig,
  WidgetStyle,
  AccentColor,
  WidgetSyncSnapshot,
} from '@/types';
import { generateId } from '@/lib/id';
import { createSeedHabits } from '@/lib/seed';
import { getPresetForCategory } from '@/lib/habitPresets';
import { getCurrentStreakDays, applySlipToHabit } from '@/lib/streaks';
import { getMilestoneProgress } from '@/lib/milestones';
import { evaluateNewAchievements } from '@/lib/achievements';
import { todayKey } from '@/lib/dates';
import { syncAllWidgetsForHabit, clearWidgetSnapshot } from '../../modules/reset-widget-bridge';

interface HabitState {
  habits: Habit[];
  checkIns: CheckIn[];
  slips: Slip[];
  cravings: CravingLog[];
  achievements: Achievement[];
  widgetConfigs: WidgetConfig[];
  hasHydrated: boolean;
  lastUnlockedAchievement: Achievement | null;

  setHasHydrated: (value: boolean) => void;
  seedIfEmpty: () => void;
  clearLastUnlocked: () => void;

  addHabit: (input: { category: HabitCategory; title: string; startDate?: string }) => Habit;
  updateHabit: (id: string, patch: Partial<Pick<Habit, 'title' | 'motivationNote' | 'accent' | 'costPerDay' | 'costUnit' | 'minutesPerDay' | 'goalMode' | 'dailyTarget' | 'baselinePerDay'>>) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  checkInToday: (habitId: string, note?: string, reflection?: { mood?: Mood; craving?: number; journal?: string; copingAction?: CopingAction }) => void;
  logCraving: (habitId: string, intensity: number, trigger?: SlipTrigger, action?: CopingAction, resolved?: boolean) => void;
  setGoal: (habitId: string, goalMode: GoalMode, dailyTarget?: number, baselinePerDay?: number) => void;
  recordSlip: (habitId: string, trigger?: SlipTrigger, note?: string) => void;
  restoreData: (data: Partial<Pick<HabitState, 'habits' | 'checkIns' | 'slips' | 'cravings' | 'achievements' | 'widgetConfigs'>>) => void;

  addWidgetConfig: (habitId: string, style: WidgetStyle, accent: AccentColor, platform: 'ios' | 'android', size?: 'small' | 'medium' | 'large') => WidgetConfig;
  updateWidgetConfig: (id: string, patch: Partial<Pick<WidgetConfig, 'style' | 'accent' | 'size'>>) => void;
  removeWidgetConfig: (id: string) => void;

  getSnapshot: (habitId: string) => WidgetSyncSnapshot | null;
}

function buildSnapshot(habit: Habit): WidgetSyncSnapshot {
  const streakDays = getCurrentStreakDays(habit);
  const { next, progress } = getMilestoneProgress(streakDays);
  return {
    habitId: habit.id,
    habitTitle: habit.title,
    icon: habit.icon,
    accent: habit.accent,
    streakDays,
    nextMilestoneDays: next?.days ?? streakDays,
    nextMilestoneLabel: next ? `${next.days - streakDays}d until ${next.label}` : 'Milestone reached',
    progressToNextMilestone: progress,
  };
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      checkIns: [],
      slips: [],
      cravings: [],
      achievements: [],
      widgetConfigs: [],
      hasHydrated: false,
      lastUnlockedAchievement: null,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      seedIfEmpty: () => {
        if (get().habits.length === 0) {
          set({ habits: createSeedHabits() });
        }
      },

      clearLastUnlocked: () => set({ lastUnlockedAchievement: null }),

      addHabit: ({ category, title, startDate }) => {
        const preset = getPresetForCategory(category);
        const habit: Habit = {
          id: generateId('habit'),
          title: title.trim() || preset.title,
          category,
          icon: preset.icon,
          accent: preset.accent,
          startDate: startDate ?? new Date().toISOString(),
          createdAt: new Date().toISOString(),
          archived: false,
          motivationNote: preset.motivationNote,
        };
        set((s) => ({ habits: [...s.habits, habit] }));
        return habit;
      },

      updateHabit: (id, patch) => {
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
        const habit = get().habits.find((h) => h.id === id);
        if (habit) void syncAllWidgetsForHabit(get().widgetConfigs, id, buildSnapshot(habit));
      },

      archiveHabit: (id) => {
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)) }));
      },

      deleteHabit: (id) => {
        const configsToRemove = get().widgetConfigs.filter((c) => c.habitId === id);
        configsToRemove.forEach((c) => void clearWidgetSnapshot(c.id));
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          checkIns: s.checkIns.filter((c) => c.habitId !== id),
          slips: s.slips.filter((sl) => sl.habitId !== id),
          achievements: s.achievements.filter((a) => a.habitId !== id),
          widgetConfigs: s.widgetConfigs.filter((c) => c.habitId !== id),
        }));
      },

      checkInToday: (habitId, note, reflection) => {
        const key = todayKey();
        const already = get().checkIns.some((c) => c.habitId === habitId && c.date === key);
        if (!already) {
          const checkIn: CheckIn = { id: generateId('checkin'), habitId, date: key, note, ...reflection, createdAt: new Date().toISOString() };
          set((s) => ({ checkIns: [...s.checkIns, checkIn] }));
        } else if (reflection || note) {
          set((s) => ({ checkIns: s.checkIns.map((checkIn) => checkIn.habitId === habitId && checkIn.date === key ? { ...checkIn, note: note ?? checkIn.note, ...reflection } : checkIn) }));
        }

        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;

        const newAchievements = evaluateNewAchievements(habit, get().slips, get().achievements);
        if (newAchievements.length > 0) {
          const withIds = newAchievements.map((a) => ({ ...a, id: generateId('ach') }));
          set((s) => ({
            achievements: [...s.achievements, ...withIds],
            lastUnlockedAchievement: withIds[withIds.length - 1],
          }));
        }

        void syncAllWidgetsForHabit(get().widgetConfigs, habitId, buildSnapshot(habit));
      },

      logCraving: (habitId, intensity, trigger, action, resolved = false) => {
        const craving: CravingLog = { id: generateId('craving'), habitId, intensity, trigger, action, resolved, createdAt: new Date().toISOString() };
        set((s) => ({ cravings: [...s.cravings, craving] }));
      },

      setGoal: (habitId, goalMode, dailyTarget, baselinePerDay) => {
        set((s) => ({ habits: s.habits.map((habit) => habit.id === habitId ? { ...habit, goalMode, dailyTarget, baselinePerDay } : habit) }));
      },

      recordSlip: (habitId, trigger, note) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const { habit: updatedHabit, slip } = applySlipToHabit(habit);
        const fullSlip: Slip = { ...slip, id: generateId('slip'), habitId, trigger, note };

        set((s) => ({
          habits: s.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
          slips: [...s.slips, fullSlip],
        }));

        void syncAllWidgetsForHabit(get().widgetConfigs, habitId, buildSnapshot(updatedHabit));
      },

      restoreData: (data) => set((s) => ({
        habits: data.habits ?? s.habits,
        checkIns: data.checkIns ?? s.checkIns,
        slips: data.slips ?? s.slips,
        cravings: data.cravings ?? s.cravings,
        achievements: data.achievements ?? s.achievements,
        widgetConfigs: data.widgetConfigs ?? s.widgetConfigs,
      })),

      addWidgetConfig: (habitId, style, accent, platform, size = 'medium') => {
        const config: WidgetConfig = { id: generateId('widget'), habitId, style, size, accent, platform };
        set((s) => ({ widgetConfigs: [...s.widgetConfigs, config] }));
        const habit = get().habits.find((h) => h.id === habitId);
        if (habit) void syncAllWidgetsForHabit([config], habitId, buildSnapshot(habit));
        return config;
      },

      updateWidgetConfig: (id, patch) => {
        set((s) => ({ widgetConfigs: s.widgetConfigs.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
        const config = get().widgetConfigs.find((c) => c.id === id);
        const habit = config && get().habits.find((h) => h.id === config.habitId);
        if (config && habit) void syncAllWidgetsForHabit([config], config.habitId, buildSnapshot(habit));
      },

      removeWidgetConfig: (id) => {
        void clearWidgetSnapshot(id);
        set((s) => ({ widgetConfigs: s.widgetConfigs.filter((c) => c.id !== id) }));
      },

      getSnapshot: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId);
        return habit ? buildSnapshot(habit) : null;
      },
    }),
    {
      name: 'reset:habitStore',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.seedIfEmpty();
      },
    },
  ),
);
