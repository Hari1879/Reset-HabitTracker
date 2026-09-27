import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import { HABIT_PRESETS, getPresetForCategory } from '@/lib/habitPresets';
import { useHabitStore } from '@/store/useHabitStore';
import type { HabitCategory } from '@/types';

export default function AddHabit() {
  const theme = useTheme();
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);

  const [category, setCategory] = useState<HabitCategory>('smoking');
  const [title, setTitle] = useState(getPresetForCategory('smoking').title);
  const [motivationNote, setMotivationNote] = useState('');
  const [costPerDay, setCostPerDay] = useState('');

  const handleSelectCategory = (c: HabitCategory) => {
    setCategory(c);
    const preset = getPresetForCategory(c);
    if (c !== 'custom') setTitle(preset.title);
    else setTitle('');
    setMotivationNote(preset.motivationNote);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const habit = addHabit({ category, title });
    const cost = parseFloat(costPerDay);
    if (motivationNote.trim() || !Number.isNaN(cost)) {
      updateHabit(habit.id, {
        motivationNote: motivationNote.trim() || undefined,
        costPerDay: Number.isNaN(cost) ? undefined : cost,
        costUnit: Number.isNaN(cost) ? undefined : '$',
      });
    }
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '800' }}>New habit</Text>
        <IconButton name="close" accessibilityLabel="Close" onPress={() => router.back()} variant="filled" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>CHOOSE A TYPE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {HABIT_PRESETS.map((preset) => {
            const selected = category === preset.category;
            return (
              <Pressable
                key={preset.category}
                onPress={() => handleSelectCategory(preset.category)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={preset.title}
                style={{
                  width: '31%',
                  aspectRatio: 1,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? theme[preset.accent].soft : theme.card,
                  borderWidth: 1.5,
                  borderColor: selected ? theme[preset.accent].base : theme.border,
                  padding: 6,
                }}
              >
                <IconGlyph name={preset.icon as IconName} size={22} color={selected ? theme[preset.accent].base : theme.textSecondary} />
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 6, textAlign: 'center' }} numberOfLines={2}>
                  {preset.category === 'custom' ? 'Custom' : preset.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 24, marginBottom: 8 }}>HABIT NAME</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. No smoking"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Habit name"
          style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, color: theme.textPrimary, fontSize: 16 }}
        />

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>WHY THIS MATTERS (OPTIONAL)</Text>
        <TextInput
          value={motivationNote}
          onChangeText={setMotivationNote}
          placeholder="A personal reminder for yourself"
          placeholderTextColor={theme.textMuted}
          multiline
          accessibilityLabel="Personal motivation note"
          style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, minHeight: 72, color: theme.textPrimary, fontSize: 15, textAlignVertical: 'top' }}
        />

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>COST PER DAY (OPTIONAL)</Text>
        <TextInput
          value={costPerDay}
          onChangeText={setCostPerDay}
          placeholder="e.g. 9"
          placeholderTextColor={theme.textMuted}
          keyboardType="decimal-pad"
          accessibilityLabel="Estimated cost saved per day"
          style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 14, color: theme.textPrimary, fontSize: 15 }}
        />

        <View style={{ marginTop: 28 }}>
          <Button label="Add habit" onPress={handleCreate} disabled={!title.trim()} fullWidth accent={getPresetForCategory(category).accent} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
