import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/theme';
import { MILESTONES } from '@/lib/milestones';
import { IconGlyph } from '@/components/IconGlyph';
import type { AccentColor } from '@/types';

interface Props {
  streakDays: number;
  accent: AccentColor;
}

/** Horizontal scrollable timeline of the 7 milestones, showing reached / current / upcoming state. */
export function MilestoneTimeline({ streakDays, accent }: Props) {
  const theme = useTheme();
  const accentValue = theme[accent].base;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
      {MILESTONES.map((m, idx) => {
        const reached = streakDays >= m.days;
        const isNext = !reached && (idx === 0 || streakDays >= MILESTONES[idx - 1].days);
        return (
          <View key={m.id} style={{ alignItems: 'center', marginRight: 22, width: 64 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: reached ? accentValue : isNext ? theme[accent].soft : theme.cardAlt,
                borderWidth: isNext && !reached ? 1.5 : 0,
                borderColor: accentValue,
              }}
            >
              {reached ? (
                <IconGlyph name="check" size={18} color="#0A0E17" />
              ) : (
                <Text style={{ color: isNext ? accentValue : theme.textMuted, fontWeight: '700', fontSize: 12 }}>{m.shortLabel}</Text>
              )}
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: reached || isNext ? '700' : '500',
                color: reached ? theme.textPrimary : isNext ? theme.textPrimary : theme.textMuted,
                textAlign: 'center',
              }}
            >
              {m.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
