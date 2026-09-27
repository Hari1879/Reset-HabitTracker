import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHabitStore } from '@/store/useHabitStore';
import { getCurrentStreakDays } from '@/lib/streaks';
import AdBanner from '@/components/AdBanner';
import { BannerAdSize } from 'react-native-google-mobile-ads';

const DAY_MS = 24 * 60 * 60 * 1000;
const FEEDBACK_EMAIL = 'harigmindia7@gmail.com';

type FeedbackType = 'bug' | 'feature' | 'other';
const FEEDBACK_TYPES: { id: FeedbackType; label: string; emoji: string }[] = [
  { id: 'bug',     label: 'Bug report',      emoji: '🐛' },
  { id: 'feature', label: 'Feature request',  emoji: '✨' },
  { id: 'other',   label: 'General feedback', emoji: '💬' },
];

export default function WeeklyReview() {
  const theme = useTheme();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!feedbackText.trim()) return;
    const label = FEEDBACK_TYPES.find((t) => t.id === feedbackType)?.label ?? 'Feedback';
    const subject = encodeURIComponent(`Reset App — ${label}`);
    const body = encodeURIComponent(`Type: ${label}\n\n${feedbackText.trim()}`);
    Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).then(() => {
      setFeedbackText('');
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    }).catch(() => {});
  };
  const habits = useHabitStore((state) => state.habits);
  const checkIns = useHabitStore((state) => state.checkIns);
  const slips = useHabitStore((state) => state.slips);
  const cravings = useHabitStore((state) => state.cravings);
  const since = Date.now() - 7 * DAY_MS;
  const activeHabits = habits.filter((habit) => !habit.archived);

  const review = useMemo(() => {
    const recentCheckIns = checkIns.filter((item) => new Date(item.createdAt).getTime() >= since);
    const recentSlips = slips.filter((item) => new Date(item.dateTime).getTime() >= since);
    const recentCravings = cravings.filter((item) => new Date(item.createdAt).getTime() >= since);
    const moodCounts = recentCheckIns.reduce<Record<string, number>>((counts, item) => {
      if (item.mood) counts[item.mood] = (counts[item.mood] ?? 0) + 1;
      return counts;
    }, {});
    const triggerCounts = [...recentSlips.map((item) => item.trigger), ...recentCravings.map((item) => item.trigger)]
      .filter(Boolean)
      .reduce<Record<string, number>>((counts, trigger) => {
        const key = trigger as string;
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {});
    const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      checkIns: recentCheckIns.length,
      slips: recentSlips.length,
      cravings: recentCravings.length,
      resolvedCravings: recentCravings.filter((item) => item.resolved).length,
      moodCounts,
      topTrigger: topTrigger?.[0]?.replace('_', ' ') ?? 'none yet',
    };
  }, [checkIns, slips, cravings, since]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }} accessibilityRole="header">Weekly review</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6, lineHeight: 20 }}>A quiet look at the last seven days. Progress is information, not a verdict.</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
          <Metric value={`${review.checkIns}`} label="check-ins" theme={theme} />
          <Metric value={`${review.cravings}`} label="cravings" theme={theme} />
          <Metric value={`${review.resolvedCravings}`} label="cravings passed" theme={theme} />
          <Metric value={`${review.slips}`} label="slips" theme={theme} />
        </View>

        <AdBanner size={BannerAdSize.LARGE_BANNER} style={{ marginTop: 20, marginBottom: 4 }} />

        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 12 }}>Your patterns</Text>
        <Card>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 21 }}>Most common trigger</Text>
          <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 4, textTransform: 'capitalize' }}>{review.topTrigger}</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 14 }}>Mood check-ins</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4 }}>{formatMood(review.moodCounts)}</Text>
        </Card>

        <AdBanner size={BannerAdSize.LARGE_BANNER} style={{ marginTop: 20, marginBottom: 4 }} />

        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 12 }}>Keep going</Text>
        {activeHabits.map((habit) => (
          <Card key={habit.id} style={{ marginBottom: 10 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700' }}>{habit.title}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6 }}>{getCurrentStreakDays(habit)} days in your current run</Text>
            {habit.goalMode === 'reduce' && habit.dailyTarget !== undefined && (
              <Text style={{ color: theme.teal.base, fontSize: 13, marginTop: 8 }}>Reduction goal: {habit.dailyTarget} per day</Text>
            )}
          </Card>
        ))}

        {/* Feedback section */}
        <AdBanner size={BannerAdSize.LARGE_BANNER} style={{ marginTop: 20, marginBottom: 4 }} />

        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '700', marginTop: 24, marginBottom: 10 }}>SEND FEEDBACK</Text>
        <Card>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 14 }}>
            Found a bug or have an idea? Let us know — we read every message.
          </Text>

          {/* Type selector */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {FEEDBACK_TYPES.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setFeedbackType(t.id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: feedbackType === t.id ? theme.teal.soft : theme.cardAlt,
                  borderWidth: feedbackType === t.id ? 1.5 : 1,
                  borderColor: feedbackType === t.id ? theme.teal.base : theme.border,
                }}
              >
                <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
                <Text style={{ color: feedbackType === t.id ? theme.teal.base : theme.textMuted, fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>
                  {t.id === 'bug' ? 'Bug' : t.id === 'feature' ? 'Feature' : 'Other'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Message input */}
          <TextInput
            value={feedbackText}
            onChangeText={(v) => { setFeedbackText(v); setSent(false); }}
            placeholder={feedbackType === 'bug' ? 'Describe what happened…' : feedbackType === 'feature' ? 'Describe the feature you'd love…' : 'What's on your mind?'}
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              backgroundColor: theme.cardAlt,
              borderRadius: 14,
              padding: 14,
              color: theme.textPrimary,
              fontSize: 14,
              lineHeight: 21,
              minHeight: 100,
              marginBottom: 14,
            }}
          />

          {sent ? (
            <View style={{ backgroundColor: theme.teal.soft, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: theme.teal.base, fontWeight: '700', fontSize: 14 }}>Mail app opened — thanks for the feedback!</Text>
            </View>
          ) : (
            <Button
              label="Send feedback"
              onPress={handleSend}
              disabled={!feedbackText.trim()}
              fullWidth
            />
          )}
        </Card>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

function Metric({ value, label, theme }: { value: string; label: string; theme: any }) {
  return (
    <View style={{ width: '47%', backgroundColor: theme.card, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: theme.border }}>
      <Text style={{ color: theme.textPrimary, fontSize: 23, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function formatMood(counts: Record<string, number>) {
  const entries = Object.entries(counts);
  return entries.length ? entries.map(([mood, count]) => `${mood}: ${count}`).join('  ·  ') : 'Add a mood to your next check-in';
}
