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
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: selected ? accentValue : theme.cardAlt,
        borderWidth: 1,
        borderColor: selected ? accentValue : theme.border,
        opacity: pressed ? 0.8 : 1,
        marginRight: 8,
        marginBottom: 8,
      })}
    >
      <Text style={{ color: selected ? '#0A0E17' : theme.textPrimary, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
