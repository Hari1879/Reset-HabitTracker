import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme';
import type { AccentColor } from '@/types';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accent?: AccentColor;
}

export function Chip({ label, selected, onPress, accent = 'teal' }: Props) {
  const theme = useTheme();
  const accentValue = theme[accent].base;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: selected ? accentValue : theme.card,
        borderWidth: 1.5,
        borderColor: selected ? accentValue : 'rgba(255,255,255,0.14)',
        opacity: pressed ? 0.8 : 1,
        marginRight: 8,
        marginBottom: 8,
      })}
    >
      <Text style={{ color: selected ? '#fff' : theme.textSecondary, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
