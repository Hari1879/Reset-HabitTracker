import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { WidgetPreview } from '@/components/WidgetPreview';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import { useHabitStore } from '@/store/useHabitStore';
import { isWidgetBridgeAvailable } from '../../modules/reset-widget-bridge';
import type { AccentColor, WidgetSize, WidgetStyle } from '@/types';
import AdBanner from '@/components/AdBanner';
import { BannerAdSize } from 'react-native-google-mobile-ads';

const STYLE_ICONS: Record<string, string> = {
  progressRing: '⭕',
  dotGrid: '🟣',
  minimalCountdown: '⏳',
  gridBlocks: '🔲',
  terminal: '💻',
  boldBlock: '⬛',
  pulseBars: '📊',
  weekGrid: '📅',
  stickyNote: '📝',
};

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
const SIZE_VISUALS: Record<WidgetSize, { w: number; h: number }> = {
  small:  { w: 28, h: 28 },
  medium: { w: 46, h: 24 },
  large:  { w: 40, h: 40 },
};
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
        <View style={{ gap: 8 }}>
          {habits.map((h) => {
            const active = habitId === h.id || (!habitId && h.id === habits[0].id);
            const accentColor = theme[h.accent as AccentColor].base;
            return (
              <Pressable
                key={h.id}
                onPress={() => setHabitId(h.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: active ? accentColor + '18' : theme.card,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 1.5,
                  borderColor: active ? accentColor + '70' : 'rgba(255,255,255,0.10)',
                  opacity: pressed ? 0.85 : 1,
                  gap: 12,
                })}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor }} />
                <Text style={{ flex: 1, color: active ? theme.textPrimary : theme.textSecondary, fontSize: 14, fontWeight: active ? '700' : '500' }} numberOfLines={1}>
                  {h.title}
                </Text>
                {active && (
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center' }}>
                    <IconGlyph name="check" size={11} color="#fff" strokeWidth={2.5} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <SectionLabel theme={theme}>STYLE</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {STYLE_OPTIONS.map((opt) => {
            const active = style === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setStyle(opt.id)}
                style={({ pressed }) => ({
                  width: 80,
                  backgroundColor: active ? theme[accent].soft : theme.card,
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: active ? theme[accent].base : 'rgba(255,255,255,0.10)',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 22, marginBottom: 8 }}>
                  {STYLE_ICONS[opt.id]}
                </Text>
                <Text style={{
                  color: active ? theme[accent].base : theme.textSecondary,
                  fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14,
                }}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionLabel theme={theme}>SIZE</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {SIZE_OPTIONS.map((opt) => {
            const active = size === opt.id;
            const accentColor = theme[accent].base;
            const visual = SIZE_VISUALS[opt.id];
            return (
              <Pressable
                key={opt.id}
                onPress={() => setSize(opt.id)}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: active ? accentColor + '18' : theme.card,
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1.5,
                  borderColor: active ? accentColor + '70' : 'rgba(255,255,255,0.10)',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{
                  width: visual.w, height: visual.h,
                  borderRadius: 6,
                  backgroundColor: active ? accentColor : 'rgba(255,255,255,0.18)',
                }} />
                <Text style={{ color: active ? accentColor : theme.textSecondary, fontSize: 13, fontWeight: '700' }}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
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

        <AdBanner size={BannerAdSize.LARGE_BANNER} style={{ marginTop: 20 }} />

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
      <AdBanner />
    </SafeAreaView>
  );
}

function SectionLabel({ children, theme }: { children: React.ReactNode; theme: any }) {
  return <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '700', marginTop: 22, marginBottom: 10 }}>{children}</Text>;
}
