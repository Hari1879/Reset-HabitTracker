import React, { useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { addDays, getDay, startOfDay, subDays } from 'date-fns';
import { useTheme } from '@/theme';
import { toDateKey } from '@/lib/dates';
import type { AccentColor, CheckIn, Slip } from '@/types';

interface Cell {
  date: string;
  status: 'checkin' | 'slip' | 'none';
}

interface Props {
  habitId: string;
  checkIns: CheckIn[];
  slips: Slip[];
  accent: AccentColor;
  weeks?: number;
}

function buildColumns(totalDays: number, checkInSet: Set<string>, slipSet: Set<string>): (Cell | null)[][] {
  const today = startOfDay(new Date());
  const start = subDays(today, totalDays - 1);
  const startDow = getDay(start);
  const columns: (Cell | null)[][] = [];
  let column: (Cell | null)[] = new Array(startDow).fill(null);

  for (let i = 0; i < totalDays; i++) {
    const d = addDays(start, i);
    const key = toDateKey(d);
    const status: Cell['status'] = slipSet.has(key) ? 'slip' : checkInSet.has(key) ? 'checkin' : 'none';
    column.push({ date: key, status });
    if (column.length === 7) {
      columns.push(column);
      column = [];
    }
  }
  if (column.length > 0) {
    while (column.length < 7) column.push(null);
    columns.push(column);
  }
  return columns;
}

/** GitHub-style calendar heatmap: teal/accent for check-ins, coral for slips, muted for no data. */
export function HeatmapCalendar({ habitId, checkIns, slips, accent, weeks = 14 }: Props) {
  const theme = useTheme();
  const accentValue = theme[accent].base;

  const columns = useMemo(() => {
    const checkInSet = new Set(checkIns.filter((c) => c.habitId === habitId).map((c) => c.date));
    const slipSet = new Set(slips.filter((s) => s.habitId === habitId).map((s) => toDateKey(s.dateTime)));
    return buildColumns(weeks * 7, checkInSet, slipSet);
  }, [checkIns, slips, habitId, weeks]);

  const cellSize = 12;
  const gap = 4;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row' }}>
          {columns.map((column, ci) => (
            <View key={ci} style={{ marginRight: gap }}>
              {column.map((cell, ri) => (
                <View
                  key={ri}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 3.5,
                    marginBottom: gap,
                    backgroundColor: !cell
                      ? 'transparent'
                      : cell.status === 'slip'
                        ? theme.coral.base
                        : cell.status === 'checkin'
                          ? accentValue
                          : theme.cardAlt,
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 }}>
        <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: accentValue, marginRight: 6 }} />
        <Text style={{ color: theme.textMuted, fontSize: 12, marginRight: 14 }}>Check-in</Text>
        <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: theme.coral.base, marginRight: 6 }} />
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>Slip</Text>
      </View>
    </View>
  );
}
