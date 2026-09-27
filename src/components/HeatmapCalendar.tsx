import React, { useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { addDays, getDay, startOfDay, subDays } from 'date-fns';
import { useTheme } from '@/theme';
import { toDateKey } from '@/lib/dates';
import type { AccentColor, CheckIn, Slip } from '@/types';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getColumnMonth(column: (Cell | null)[]): number | null {
  for (const cell of column) {
    if (cell) return parseInt(cell.date.slice(5, 7), 10) - 1;
  }
  return null;
}

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

  const monthLabels = useMemo(() => {
    return columns.map((col, i) => {
      const month = getColumnMonth(col);
      if (month === null) return '';
      if (i === 0) return MONTH_ABBR[month];
      const prev = getColumnMonth(columns[i - 1]);
      return month !== prev ? MONTH_ABBR[month] : '';
    });
  }, [columns]);

  const cellSize = 12;
  const gap = 4;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View>
          {/* Month labels */}
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {columns.map((_, ci) => (
              <View key={`ml-${ci}`} style={{ width: cellSize, marginRight: gap, height: 14 }}>
                <Text style={{ color: theme.textMuted, fontSize: 9, fontWeight: '600' }}>{monthLabels[ci]}</Text>
              </View>
            ))}
          </View>
          {/* Cell grid */}
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
