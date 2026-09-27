import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { HabitCard } from '@/components/HabitCard';
import { SupportiveSlipSheet } from '@/components/SupportiveSlipSheet';
import { AchievementUnlockToast } from '@/components/AchievementUnlockToast';
import { IconGlyph } from '@/components/IconGlyph';
import { useHabitStore } from '@/store/useHabitStore';
import { getMomentumSummary } from '@/lib/streaks';
import { formatLongDate, getGreeting } from '@/lib/dates';
import type { SlipTrigger } from '@/types';
import AdBanner from '@/components/AdBanner';
import { getDailyQuote } from '@/lib/quotes';
import { BannerAdSize } from 'react-native-google-mobile-ads';

export default function Home() {
  const theme = useTheme();
  const habits = useHabitStore((s) => s.habits);
  const checkIns = useHabitStore((s) => s.checkIns);
  const slips = useHabitStore((s) => s.slips);
  const checkInToday = useHabitStore((s) => s.checkInToday);
  const recordSlip = useHabitStore((s) => s.recordSlip);

  const [slipHabitId, setSlipHabitId] = useState<string | null>(null);

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const momentum = useMemo(() => getMomentumSummary(habits, slips), [habits, slips]);
  const slipHabit = activeHabits.find((h) => h.id === slipHabitId);

  const handleRecordSlip = (trigger: SlipTrigger | undefined, note: string | undefined) => {
    if (!slipHabitId) return;
    recordSlip(slipHabitId, trigger, note);
    setSlipHabitId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <AchievementUnlockToast />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textMuted, fontSize: 14, fontWeight: '600' }}>{formatLongDate()}</Text>
        <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 2 }} accessibilityRole="header">
          {getGreeting()}
        </Text>

        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 16, marginTop: 16, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 }}>TODAY'S THOUGHT</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 21, fontStyle: 'italic' }}>"{getDailyQuote()}"</Text>
        </View>

        <LinearGradient
          colors={[theme.teal.soft, theme.lavender.soft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 20, marginTop: 20, borderWidth: 1, borderColor: theme.border }}
        >
          <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }}>Your momentum</Text>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <Stat label="Active days" value={`${momentum.totalActiveStreakDays}`} theme={theme} />
            <Stat label="Strongest streak" value={`${momentum.strongestStreakDays}d`} theme={theme} />
            <Stat label="Weekly consistency" value={`${momentum.weeklyConsistencyPercent}%`} theme={theme} last />
          </View>
        </LinearGradient>

        <AdBanner size={BannerAdSize.LARGE_BANNER} style={{ marginTop: 20 }} />

        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <Pressable onPress={() => router.push('/craving')} style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }} accessibilityRole="button" accessibilityLabel="Open craving support">
              <IconGlyph name="flame" size={19} color={theme.coral.base} />
              <Text style={{ color: theme.textPrimary, fontWeight: '700', marginTop: 8 }}>Craving support</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>Pause and reset</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/review')} style={{ flex: 1, padding: 14, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }} accessibilityRole="button" accessibilityLabel="Open weekly review">
              <IconGlyph name="spark" size={19} color={theme.gold.base} />
              <Text style={{ color: theme.textPrimary, fontWeight: '700', marginTop: 8 }}>Weekly review</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 3 }}>See your patterns</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push('/planner')} style={{ padding: 14, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }} accessibilityRole="button" accessibilityLabel="Open ADHD planner">
            <Text style={{ fontSize: 19 }}>🧠</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>ADHD Planner</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>Your daily routine checklist</Text>
            </View>
            <View style={{ flex: 1 }} />
            <IconGlyph name="chevronRight" size={16} color={theme.textMuted} />
          </Pressable>
          {activeHabits.length === 0 ? (
            <EmptyState theme={theme} />
          ) : (
            activeHabits.flatMap((habit, idx) => {
              const card = (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  checkIns={checkIns}
                  onCheckIn={() => checkInToday(habit.id)}
                  onSlip={() => setSlipHabitId(habit.id)}
                />
              );
              // Inject a banner ad after every 2nd card
              if ((idx + 1) % 2 === 0 && idx < activeHabits.length - 1) {
                return [card, <AdBanner key={`ad-${idx}`} size={BannerAdSize.LARGE_BANNER} style={{ marginVertical: 8 }} />];
              }
              return [card];
            })
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push('/habit/add')}
        accessibilityRole="button"
        accessibilityLabel="Add a new habit"
        style={{
          position: 'absolute',
          right: 20,
          bottom: 28,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: theme.teal.base,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <IconGlyph name="plus" size={26} color="#0A0E17" />
      </Pressable>

      <SupportiveSlipSheet
        visible={!!slipHabit}
        habitTitle={slipHabit?.title ?? ''}
        onKeepGoing={() => setSlipHabitId(null)}
        onRecord={handleRecordSlip}
      />
      <AdBanner />
    </SafeAreaView>
  );
}

function Stat({ label, value, theme, last }: { label: string; value: string; theme: any; last?: boolean }) {
  return (
    <View style={{ flex: 1, borderRightWidth: last ? 0 : 1, borderRightColor: theme.border }}>
      <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function EmptyState({ theme }: { theme: any }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48 }}>
      <IconGlyph name="spark" size={32} color={theme.textMuted} />
      <Text style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '700', marginTop: 16 }}>No habits yet</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center', maxWidth: 260 }}>
        Tap the + button to start tracking your first habit.
      </Text>
    </View>
  );
}
