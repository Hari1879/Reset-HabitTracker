import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { IconGlyph } from '@/components/IconGlyph';
import { useHabitStore } from '@/store/useHabitStore';
import { Chip } from '@/components/ui/Chip';
import type { AccentColor, GoalMode } from '@/types';

const ACCENTS: AccentColor[] = ['teal', 'aqua', 'lavender', 'coral', 'gold'];

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const habits = useHabitStore((s) => s.habits);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const habit = habits.find((h) => h.id === id);

  const [title, setTitle] = useState(habit?.title ?? '');
  const [motivationNote, setMotivationNote] = useState(habit?.motivationNote ?? '');
  const [accent, setAccent] = useState<AccentColor>(habit?.accent ?? 'teal');
  const [costPerDay, setCostPerDay] = useState(habit?.costPerDay?.toString() ?? '');
  const [goalMode, setGoalMode] = useState<GoalMode>(habit?.goalMode ?? 'abstain');
  const [dailyTarget, setDailyTarget] = useState(habit?.dailyTarget?.toString() ?? '');
  const [baselinePerDay, setBaselinePerDay] = useState(habit?.baselinePerDay?.toString() ?? '');

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>Habit not found.</Text>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    const cost = parseFloat(costPerDay);
    const target = parseFloat(dailyTarget);
    const baseline = parseFloat(baselinePerDay);
    updateHabit(habit.id, {
      title: title.trim() || habit.title,
      motivationNote: motivationNote.trim() || undefined,
      accent,
      costPerDay: Number.isNaN(cost) ? undefined : cost,
      costUnit: Number.isNaN(cost) ? undefined : (habit.costUnit ?? '$'),
      goalMode,
      dailyTarget: goalMode === 'reduce' && !Number.isNaN(target) ? target : undefined,
      baselinePerDay: goalMode === 'reduce' && !Number.isNaN(baseline) ? baseline : undefined,
    });
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '800' }}>Edit habit</Text>
        <IconButton name="close" accessibilityLabel="Close" onPress={() => router.back()} variant="filled" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>HABIT NAME</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Habit name"
          style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, color: theme.textPrimary, fontSize: 16 }}
        />

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>ACCENT COLOR</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {ACCENTS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setAccent(a)}
              accessibilityRole="button"
              accessibilityLabel={`${a} accent`}
              accessibilityState={{ selected: accent === a }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme[a].base,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: accent === a ? 3 : 0,
                borderColor: theme.textPrimary,
              }}
            >
              {accent === a && <IconGlyph name="check" size={16} color="#0A0E17" />}
            </Pressable>
          ))}
        </View>

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>WHY THIS MATTERS</Text>
        <TextInput
          value={motivationNote}
          onChangeText={setMotivationNote}
          placeholderTextColor={theme.textMuted}
          multiline
          accessibilityLabel="Personal motivation note"
          style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, minHeight: 72, color: theme.textPrimary, fontSize: 15, textAlignVertical: 'top' }}
        />

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>COST PER DAY (OPTIONAL)</Text>
        <TextInput
          value={costPerDay}
          onChangeText={setCostPerDay}
          placeholderTextColor={theme.textMuted}
          keyboardType="decimal-pad"
          accessibilityLabel="Estimated cost saved per day"
          style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, color: theme.textPrimary, fontSize: 15 }}
        />

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>GOAL TYPE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="Quit completely" selected={goalMode === 'abstain'} onPress={() => setGoalMode('abstain')} accent="teal" />
          <Chip label="Reduce gradually" selected={goalMode === 'reduce'} onPress={() => setGoalMode('reduce')} accent="teal" />
        </View>
        {goalMode === 'reduce' && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <TextInput value={baselinePerDay} onChangeText={setBaselinePerDay} placeholder="Current / day" placeholderTextColor={theme.textMuted} keyboardType="decimal-pad" accessibilityLabel="Current daily amount" style={{ flex: 1, backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, color: theme.textPrimary }} />
            <TextInput value={dailyTarget} onChangeText={setDailyTarget} placeholder="Target / day" placeholderTextColor={theme.textMuted} keyboardType="decimal-pad" accessibilityLabel="Target daily amount" style={{ flex: 1, backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, color: theme.textPrimary }} />
          </View>
        )}

        <View style={{ marginTop: 28 }}>
          <Button label="Save changes" onPress={handleSave} fullWidth accent={accent} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
