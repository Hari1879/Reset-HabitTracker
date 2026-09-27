import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/theme';
import { IconGlyph, type IconName } from '@/components/IconGlyph';

interface Props {
  name: IconName;
  onPress?: () => void;
  size?: number;
  accessibilityLabel: string;
  variant?: 'plain' | 'filled';
}

export function IconButton({ name, onPress, size = 22, accessibilityLabel, variant = 'plain' }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'filled' ? theme.cardAlt : 'transparent',
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <IconGlyph name={name} size={size} color={theme.textPrimary} />
    </Pressable>
  );
}
