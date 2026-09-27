import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { AchievementCard } from '@/components/AchievementCard';
import { IconGlyph } from '@/components/IconGlyph';
import { useHabitStore } from '@/store/useHabitStore';

export default function Achievements() {
  const theme = useTheme();
  const achievements = useHabitStore((s) => s.achievements);
  const habits = useHabitStore((s) => s.habits);

  const sorted = useMemo(
    () => [...achievements].sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()),
    [achievements],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }} accessibilityRole="header">Achievements</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6, marginBottom: 20 }}>
          Quiet recognition for the choices you've kept making.
        </Text>

        {sorted.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <IconGlyph name="ring" size={32} color={theme.textMuted} />
            <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 16 }}>Nothing unlocked yet</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center', maxWidth: 260 }}>
              Your first achievement arrives the moment you check in.
            </Text>
          </View>
        ) : (
          sorted.map((a) => (
            <AchievementCard key={a.id} achievement={a} habitTitle={habits.find((h) => h.id === a.habitId)?.title} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
