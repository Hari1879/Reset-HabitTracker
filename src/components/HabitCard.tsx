import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DotProgress } from '@/components/DotProgress';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import { getCurrentStreakDays, getMoneyTimeSaved } from '@/lib/streaks';
import { getMilestoneProgress } from '@/lib/milestones';
import { formatFriendlyDate, todayKey } from '@/lib/dates';
import type { CheckIn, Habit } from '@/types';

interface Props {
  habit: Habit;
  checkIns: CheckIn[];
  onCheckIn: () => void;
  onSlip: () => void;
}

/** Home-feed card: icon, streak, compact dot progress toward the next milestone, gentle action. */
export function HabitCard({ habit, checkIns, onCheckIn, onSlip }: Props) {
  const theme = useTheme();
  const accentValue = theme[habit.accent].base;
  const streakDays = getCurrentStreakDays(habit);
  const { next, daysRemaining, progress } = getMilestoneProgress(streakDays);
  const checkedInToday = checkIns.some((c) => c.habitId === habit.id && c.date === todayKey());
  const filledDots = Math.round(progress * 20);
  const saved = getMoneyTimeSaved(habit, streakDays);

  return (
    <Pressable
      onPress={() => router.push(`/habit/${habit.id}`)}
      // Web renders accessibilityRole="button" as a real <button>, and this card contains
      // its own nested Button components — nesting <button> inside <button> is invalid HTML
      // and breaks hydration. Native has no such restriction, so keep the proper role there.
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      accessibilityLabel={`${habit.title}, ${streakDays} days free. View details.`}
      style={{ marginBottom: 16 }}
    >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme[habit.accent].soft,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <IconGlyph name={habit.icon as IconName} size={22} color={accentValue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '700' }} numberOfLines={1}>
              {habit.title}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
              {streakDays} {streakDays === 1 ? 'day' : 'days'} free · since {formatFriendlyDate(habit.startDate)}
            </Text>
            {saved.money !== undefined && (
              <Text style={{ color: accentValue, fontSize: 12, fontWeight: '700', marginTop: 3 }}>
                {habit.costUnit ?? '$'}{saved.money} saved
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <DotProgress filled={filledDots} total={20} columns={10} dotSize={7} gap={5} color={accentValue} trackColor={theme.cardAlt} />
        </View>

        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 10 }}>
          {next ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} until ${next.label}` : 'Every milestone reached'}
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <Button
            label={checkedInToday ? 'Checked in today' : 'Check in'}
            variant={checkedInToday ? 'secondary' : 'primary'}
            accent={habit.accent}
            disabled={checkedInToday}
            onPress={onCheckIn}
            style={{ flex: 1, marginRight: 10 }}
            accessibilityHint="Marks today as a good day for this habit"
          />
          <Button
            label="I had a slip"
            variant="ghost"
            onPress={onSlip}
            style={{ flex: 1 }}
            accessibilityHint="Opens a supportive way to record a slip without losing your progress"
          />
        </View>
      </Card>
    </Pressable>
  );
}
