import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { WidgetPreview } from '@/components/WidgetPreview';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import { useHabitStore } from '@/store/useHabitStore';
import { isWidgetBridgeAvailable } from '../../modules/reset-widget-bridge';
import type { AccentColor, WidgetSize, WidgetStyle } from '@/types';

const STYLE_OPTIONS: { id: WidgetStyle; label: string }[] = [
  { id: 'progressRing', label: 'Progress Ring' },
  { id: 'dotGrid', label: 'Dot Grid' },
  { id: 'minimalCountdown', label: 'Countdown' },
  { id: 'gridBlocks', label: 'Grid' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'boldBlock', label: 'Bold Block' },
  { id: 'pulseBars', label: 'Pulse Bars' },
  { id: 'weekGrid', label: 'Week Grid' },
  { id: 'stickyNote', label: 'Sticky Note' },
];
const SIZE_OPTIONS: { id: WidgetSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];
const ACCENT_OPTIONS: AccentColor[] = ['teal', 'aqua', 'lavender', 'coral', 'gold'];

export default function Widgets() {
  const theme = useTheme();
  const allHabits = useHabitStore((s) => s.habits);
  const habits = useMemo(() => allHabits.filter((h) => !h.archived), [allHabits]);
  const widgetConfigs = useHabitStore((s) => s.widgetConfigs);
  const addWidgetConfig = useHabitStore((s) => s.addWidgetConfig);
  const removeWidgetConfig = useHabitStore((s) => s.removeWidgetConfig);
  const getSnapshot = useHabitStore((s) => s.getSnapshot);

  const [habitId, setHabitId] = useState(habits[0]?.id);
  const [style, setStyle] = useState<WidgetStyle>('progressRing');
  const [size, setSize] = useState<WidgetSize>('medium');
  const [accent, setAccent] = useState<AccentColor>('teal');

  const selectedHabit = habits.find((h) => h.id === habitId) ?? habits[0];
  const snapshot = selectedHabit ? getSnapshot(selectedHabit.id) : null;
  const bridgeAvailable = useMemo(() => isWidgetBridgeAvailable(), []);

  const handleSave = () => {
    if (!selectedHabit) return;
    addWidgetConfig(selectedHabit.id, style, accent, Platform.OS === 'ios' ? 'ios' : 'android', size);
  };

  if (!selectedHabit || !snapshot) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
        <View style={{ padding: 20 }}>
          <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: '800' }}>Widgets</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 12 }}>Add a habit first to configure a widget for it.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }} accessibilityRole="header">Widgets</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6 }}>
          Design a home-screen widget. It stays in sync automatically with your check-ins.
        </Text>

        {!bridgeAvailable && (
          <View style={{ backgroundColor: theme.gold.soft, borderRadius: 16, padding: 14, marginTop: 16, borderWidth: 1, borderColor: theme.gold.base }}>
            <Text style={{ color: theme.textPrimary, fontSize: 13, lineHeight: 18 }}>
              Live home-screen widgets need a native development build. In Expo Go, this screen shows an accurate
              in-app preview only — see the README for how to enable real widgets.
            </Text>
          </View>
        )}

        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
          <WidgetPreview
            widgetStyle={style}
            size={size}
            accent={accent}
            icon={selectedHabit.icon as IconName}
            habitTitle={selectedHabit.title}
            streakDays={snapshot.streakDays}
            nextMilestoneLabel={snapshot.nextMilestoneLabel}
            progress={snapshot.progressToNextMilestone}
          />
        </View>

        <SectionLabel theme={theme}>HABIT</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row' }}>
            {habits.map((h) => (
              <Chip key={h.id} label={h.title} selected={habitId === h.id || (!habitId && h.id === habits[0].id)} onPress={() => setHabitId(h.id)} accent={h.accent} />
            ))}
          </View>
        </ScrollView>

        <SectionLabel theme={theme}>STYLE</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {STYLE_OPTIONS.map((opt) => (
            <Chip key={opt.id} label={opt.label} selected={style === opt.id} onPress={() => setStyle(opt.id)} accent={accent} />
          ))}
        </View>

        <SectionLabel theme={theme}>SIZE</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {SIZE_OPTIONS.map((opt) => (
            <Chip key={opt.id} label={opt.label} selected={size === opt.id} onPress={() => setSize(opt.id)} accent={accent} />
          ))}
        </View>

        <SectionLabel theme={theme}>COLOR THEME</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {ACCENT_OPTIONS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setAccent(a)}
              accessibilityRole="button"
              accessibilityLabel={`${a} accent`}
              accessibilityState={{ selected: accent === a }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme[a].base,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: accent === a ? 3 : 0,
                borderColor: theme.textPrimary,
              }}
            >
              {accent === a && <IconGlyph name="check" size={15} color="#0A0E17" />}
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 24 }}>
          <Button label="Save this widget" onPress={handleSave} accent={accent} fullWidth />
        </View>

        {widgetConfigs.length > 0 && (
          <>
            <SectionLabel theme={theme}>YOUR WIDGETS</SectionLabel>
            {widgetConfigs.map((config) => {
              const h = habits.find((x) => x.id === config.habitId);
              if (!h) return null;
              const snap = getSnapshot(h.id);
              if (!snap) return null;
              return (
                <Card key={config.id} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>{h.title}</Text>
                      <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                        {STYLE_OPTIONS.find((s) => s.id === config.style)?.label} · {config.size} · {config.platform}
                      </Text>
                    </View>
                    <IconButton name="trash" accessibilityLabel={`Remove widget for ${h.title}`} onPress={() => removeWidgetConfig(config.id)} />
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children, theme }: { children: React.ReactNode; theme: any }) {
  return <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '700', marginTop: 22, marginBottom: 10 }}>{children}</Text>;
}
