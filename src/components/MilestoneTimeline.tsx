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

  const NODE_SIZE = 40;
  const CONNECTOR_WIDTH = 22;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {MILESTONES.map((m, idx) => {
          const reached = streakDays >= m.days;
          const isNext = !reached && (idx === 0 || streakDays >= MILESTONES[idx - 1].days);
          const prevReached = idx > 0 && streakDays >= MILESTONES[idx - 1].days;

          return (
            <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* connector line from previous node */}
              {idx > 0 && (
                <View style={{ width: CONNECTOR_WIDTH, height: 2, backgroundColor: prevReached ? accentValue : theme.cardAlt }} />
              )}
              <View style={{ alignItems: 'center', width: NODE_SIZE + 16 }}>
                <View
                  style={{
                    width: NODE_SIZE,
                    height: NODE_SIZE,
                    borderRadius: NODE_SIZE / 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: reached ? accentValue : isNext ? theme[accent].soft : theme.cardAlt,
                    borderWidth: isNext ? 1.5 : 0,
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
                    fontSize: 11,
                    fontWeight: reached || isNext ? '700' : '500',
                    color: reached ? theme.textPrimary : isNext ? theme.textPrimary : theme.textMuted,
                    textAlign: 'center',
                  }}
                >
                  {m.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
