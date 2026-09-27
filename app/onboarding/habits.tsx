import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { OnboardingProgress } from '@/components/ui/OnboardingProgress';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import { HABIT_PRESETS } from '@/lib/habitPresets';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function HabitsStep() {
  const theme = useTheme();
  const { draftHabits, toggleHabit, addCustomHabit } = useOnboardingStore();
  const [customText, setCustomText] = useState('');
  const atLimit = draftHabits.length >= 3;

  const presetsToShow = HABIT_PRESETS.filter((p) => p.category !== 'custom');

  const handleAddCustom = () => {
    if (!customText.trim()) return;
    addCustomHabit(customText);
    setCustomText('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <IconButton name="chevronLeft" accessibilityLabel="Go back" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <OnboardingProgress step={1} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '800', marginTop: 8 }}>Choose 1–3 habits</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, marginTop: 8, lineHeight: 21 }}>
          Pick what you'd like to gently work on. You can add more, or change these, any time later.
        </Text>

        <View style={{ marginTop: 24, gap: 10 }}>
          {presetsToShow.map((preset) => {
            const selected = draftHabits.some((h) => h.category === preset.category);
            const disabled = !selected && atLimit;
            return (
              <Pressable
                key={preset.category}
                onPress={() => toggleHabit(preset.category, preset.title)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                accessibilityLabel={preset.title}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 20,
                  backgroundColor: selected ? theme[preset.accent].soft : theme.card,
                  borderWidth: 1.5,
                  borderColor: selected ? theme[preset.accent].base : theme.border,
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: theme[preset.accent].soft,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <IconGlyph name={preset.icon as IconName} size={20} color={theme[preset.accent].base} />
                </View>
                <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 }}>{preset.title}</Text>
                {selected && <IconGlyph name="check" size={18} color={theme[preset.accent].base} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 24, marginBottom: 10 }}>OR CREATE YOUR OWN</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            value={customText}
            onChangeText={setCustomText}
            placeholder="Name your own habit"
            placeholderTextColor={theme.textMuted}
            editable={!atLimit}
            accessibilityLabel="Custom habit name"
            style={{
              flex: 1,
              backgroundColor: theme.cardAlt,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: theme.textPrimary,
              fontSize: 15,
            }}
            onSubmitEditing={handleAddCustom}
            returnKeyType="done"
          />
          <IconButton name="plus" accessibilityLabel="Add custom habit" variant="filled" onPress={handleAddCustom} />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <Button
          label={`Continue${draftHabits.length ? ` (${draftHabits.length} selected)` : ''}`}
          disabled={draftHabits.length === 0}
          onPress={() => router.push('/onboarding/reminder')}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
