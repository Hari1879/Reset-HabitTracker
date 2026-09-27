import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { IconButton } from '@/components/ui/IconButton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ProgressRing';
import { MilestoneTimeline } from '@/components/MilestoneTimeline';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { SupportiveSlipSheet } from '@/components/SupportiveSlipSheet';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import { useHabitStore } from '@/store/useHabitStore';
import { getCurrentStreakDays, getLongestStreakDays, getResetCount, getSuccessRate, getMoneyTimeSaved } from '@/lib/streaks';
import { getMilestoneProgress } from '@/lib/milestones';
import { formatFriendlyDate } from '@/lib/dates';
import type { SlipTrigger } from '@/types';

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const habits = useHabitStore((s) => s.habits);
  const checkIns = useHabitStore((s) => s.checkIns);
  const slips = useHabitStore((s) => s.slips);
  const checkInToday = useHabitStore((s) => s.checkInToday);
  const recordSlip = useHabitStore((s) => s.recordSlip);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const [slipVisible, setSlipVisible] = useState(false);

  const habit = habits.find((h) => h.id === id);

  const streakDays = habit ? getCurrentStreakDays(habit) : 0;
  const { next, daysRemaining, progress } = getMilestoneProgress(streakDays);
  const longest = habit ? getLongestStreakDays(habit, slips) : 0;
  const resets = habit ? getResetCount(habit.id, slips) : 0;
  const successRate = habit ? getSuccessRate(habit.id, slips) : 0;
  const saved = habit ? getMoneyTimeSaved(habit, streakDays) : {};

  const accentValue = habit ? theme[habit.accent].base : theme.teal.base;

  const handleRecordSlip = (trigger: SlipTrigger | undefined, note: string | undefined) => {
    if (!habit) return;
    recordSlip(habit.id, trigger, note);
    setSlipVisible(false);
  };

  const handleArchive = () => {
    if (!habit) return;
    Alert.alert('Archive this habit?', 'It will move out of your active feed but its history is kept.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', onPress: () => { archiveHabit(habit.id); router.back(); } },
    ]);
  };

  const handleDelete = () => {
    if (!habit) return;
    Alert.alert('Delete this habit?', 'This permanently removes its history. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteHabit(habit.id); router.back(); } },
    ]);
  };

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScreenHeader />
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>Habit not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScreenHeader
        title={habit.title}
        right={
          <IconButton name="edit" accessibilityLabel="Edit habit" onPress={() => router.push(`/habit/${habit.id}/edit`)} />
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <ProgressRing progress={progress} size={190} strokeWidth={14} color={accentValue} trackColor={theme.cardAlt}>
            <IconGlyph name={habit.icon as IconName} size={26} color={accentValue} />
            <Text style={{ color: theme.textPrimary, fontSize: 40, fontWeight: '800', marginTop: 4 }}>{streakDays}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>days free</Text>
          </ProgressRing>
          <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 14 }}>Since {formatFriendlyDate(habit.startDate)}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>
            {next ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} until ${next.label}` : 'Every milestone reached'}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Button
            label="Check in for today"
            accent={habit.accent}
            onPress={() => checkInToday(habit.id)}
            fullWidth
            accessibilityHint="Marks today as a good day for this habit"
          />
          <View style={{ height: 10 }} />
          <Button label="I had a slip" variant="ghost" onPress={() => setSlipVisible(true)} fullWidth />
        </View>

        <SectionTitle theme={theme}>Milestones</SectionTitle>
        <MilestoneTimeline streakDays={streakDays} accent={habit.accent} />

        <SectionTitle theme={theme}>History</SectionTitle>
        <HeatmapCalendar habitId={habit.id} checkIns={checkIns} slips={slips} accent={habit.accent} />

        <SectionTitle theme={theme}>Insights</SectionTitle>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <InsightCard label="Longest streak" value={`${longest}d`} theme={theme} />
          <InsightCard label="Resets" value={`${resets}`} theme={theme} />
          <InsightCard label="30-day success" value={`${successRate}%`} theme={theme} />
          {saved.money !== undefined && <InsightCard label="Money saved" value={`${habit.costUnit ?? '$'}${saved.money}`} theme={theme} />}
          {saved.minutes !== undefined && <InsightCard label="Time saved" value={`${Math.round(saved.minutes / 60)}h`} theme={theme} />}
        </View>

        {!!habit.motivationNote && (
          <>
            <SectionTitle theme={theme}>Why this matters</SectionTitle>
            <View style={{ paddingHorizontal: 20 }}>
              <Card>
                <Text style={{ color: theme.textSecondary, fontSize: 15, lineHeight: 22, fontStyle: 'italic' }}>"{habit.motivationNote}"</Text>
              </Card>
            </View>
          </>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 28, gap: 10 }}>
          <Button label="Archive habit" variant="secondary" onPress={handleArchive} fullWidth />
          <Button label="Delete habit" variant="danger" onPress={handleDelete} fullWidth />
        </View>
      </ScrollView>

      <SupportiveSlipSheet
        visible={slipVisible}
        habitTitle={habit.title}
        onKeepGoing={() => setSlipVisible(false)}
        onRecord={handleRecordSlip}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ children, theme }: { children: React.ReactNode; theme: any }) {
  return (
    <Text style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '700', paddingHorizontal: 20, marginTop: 28, marginBottom: 12 }}>
      {children}
    </Text>
  );
}

function InsightCard({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={{ flexGrow: 1, minWidth: '30%', backgroundColor: theme.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: theme.border }}>
      <Text style={{ color: theme.textPrimary, fontSize: 19, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>{label}</Text>
    </View>
  );
}
