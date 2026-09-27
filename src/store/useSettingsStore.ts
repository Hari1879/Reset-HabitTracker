import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, EmergencyContact, Reminder, WidgetStyle } from '@/types';
import { cancelReminder, scheduleReminder } from '@/lib/notifications';
import { generateId } from '@/lib/id';
import { requestHealthKitPermissions } from '@/lib/healthKit';
import * as LocalAuthentication from 'expo-local-authentication';

interface SettingsState {
  settings: AppSettings;
  reminders: Reminder[];
  preferredWidgetStyle: WidgetStyle;
  emergencyContact: EmergencyContact | null;
  healthKitEnabled: boolean;
  biometricLockEnabled: boolean;
  hasHydrated: boolean;
  setTheme: (theme: AppSettings['theme']) => void;
  setStrictPrivacyMode: (enabled: boolean) => void;
  setPreferredWidgetStyle: (style: WidgetStyle) => void;
  completeOnboarding: () => void;
  setEmergencyContact: (contact: EmergencyContact | null) => void;
  enableHealthKit: () => Promise<void>;
  setBiometricLock: (enabled: boolean) => void;
  addReminder: (time: string, days: number[], habitId?: string, habitTitle?: string) => Promise<void>;
  toggleReminder: (id: string, enabled: boolean, habitTitle: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  setHasHydrated: (value: boolean) => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  strictPrivacyMode: false,
  onboardingComplete: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      reminders: [],
      preferredWidgetStyle: 'progressRing',
      emergencyContact: null,
      healthKitEnabled: false,
      biometricLockEnabled: false,
      hasHydrated: false,

      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      setStrictPrivacyMode: (enabled) => set((s) => ({ settings: { ...s.settings, strictPrivacyMode: enabled } })),
      setPreferredWidgetStyle: (style) => set({ preferredWidgetStyle: style }),
      completeOnboarding: () => set((s) => ({ settings: { ...s.settings, onboardingComplete: true } })),
      setEmergencyContact: (contact) => set({ emergencyContact: contact }),

      setBiometricLock: (enabled) => set({ biometricLockEnabled: enabled }),

      enableHealthKit: async () => {
        try {
          await requestHealthKitPermissions();
          set({ healthKitEnabled: true });
        } catch {
          set({ healthKitEnabled: false });
        }
      },

      addReminder: async (time, days, habitId, habitTitle) => {
        const id = generateId('reminder');
        const notificationId = await scheduleReminder({ id, habitId, time, days, enabled: true }, habitTitle ?? 'your habit');
        const reminder: Reminder = { id, habitId, time, days, enabled: true, notificationId };
        set((s) => ({ reminders: [...s.reminders, reminder] }));
      },

      toggleReminder: async (id, enabled, habitTitle) => {
        const reminder = get().reminders.find((r) => r.id === id);
        if (!reminder) return;
        if (!enabled) {
          await cancelReminder(reminder.notificationId);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? { ...r, enabled, notificationId: undefined } : r)),
          }));
        } else {
          const notificationId = await scheduleReminder({ ...reminder, enabled }, habitTitle);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? { ...r, enabled, notificationId } : r)),
          }));
        }
      },

      removeReminder: async (id) => {
        const reminder = get().reminders.find((r) => r.id === id);
        await cancelReminder(reminder?.notificationId);
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'reset:settingsStore',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
