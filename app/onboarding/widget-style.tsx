import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { OnboardingProgress } from '@/components/ui/OnboardingProgress';
import { WidgetPreview } from '@/components/WidgetPreview';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHabitStore } from '@/store/useHabitStore';
import { getPresetForCategory } from '@/lib/habitPresets';
import type { WidgetStyle } from '@/types';

const STYLE_OPTIONS: { id: WidgetStyle; title: string; description: string }[] = [
  { id: 'progressRing', title: 'Progress Ring', description: 'A circular ring that fills as you approach your next milestone.' },
  { id: 'dotGrid', title: 'Dot Grid', description: 'Dots fill in one by one as each day passes.' },
  { id: 'minimalCountdown', title: 'Minimal Countdown', description: 'A simple bar and a single clear number.' },
];

export default function WidgetStyleStep() {
  const theme = useTheme();
  const { draftHabits, reminderTime, widgetStyle, setWidgetStyle, reset } = useOnboardingStore();
  const { completeOnboarding, addReminder, setPreferredWidgetStyle } = useSettingsStore();
  const { addHabit, addWidgetConfig } = useHabitStore();
  const [finishing, setFinishing] = useState(false);

  const previewHabit = draftHabits[0];
  const previewPreset = previewHabit ? getPresetForCategory(previewHabit.category) : getPresetForCategory('custom');

  const handleFinish = async () => {
    setFinishing(true);
    try {
      const createdHabits = draftHabits.map((d) => addHabit({ category: d.category, title: d.title }));

      if (reminderTime) {
        await addReminder(reminderTime, [0, 1, 2, 3, 4, 5, 6], undefined, 'Reset');
      }

      setPreferredWidgetStyle(widgetStyle);

      if (createdHabits[0]) {
        addWidgetConfig(createdHabits[0].id, widgetStyle, createdHabits[0].accent, Platform.OS === 'ios' ? 'ios' : 'android');
      }

      completeOnboarding();
      reset();
      router.replace('/(tabs)');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <IconButton name="chevronLeft" accessibilityLabel="Go back" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <OnboardingProgress step={3} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '800', marginTop: 8 }}>Pick a widget style</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, marginTop: 8, lineHeight: 21 }}>
          You can add this to your home screen later and change it any time from the Widgets tab.
        </Text>

        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <WidgetPreview
            widgetStyle={widgetStyle}
            size="medium"
            accent={previewPreset.accent}
            icon={previewPreset.icon as any}
            habitTitle={previewHabit?.title ?? previewPreset.title}
            streakDays={1}
            nextMilestoneLabel="2 days until 3 days"
            progress={0.33}
          />
        </View>

        <View style={{ gap: 12 }}>
          {STYLE_OPTIONS.map((opt) => {
            const selected = widgetStyle === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setWidgetStyle(opt.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={opt.title}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  backgroundColor: selected ? theme.teal.soft : theme.card,
                  borderWidth: 1.5,
                  borderColor: selected ? theme.teal.base : theme.border,
                }}
              >
                <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700' }}>{opt.title}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>{opt.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <Button label="Start my journey" onPress={handleFinish} loading={finishing} fullWidth accessibilityHint="Sets up your habits and takes you to the home screen" />
      </View>
    </SafeAreaView>
  );
}
