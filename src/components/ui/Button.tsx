import React from 'react';
import { Pressable, Text, ActivityIndicator, GestureResponderEvent, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import type { AccentColor } from '@/types';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  accent?: AccentColor;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  accent = 'teal',
  loading,
  disabled,
  fullWidth,
  style,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const accentValue = theme[accent].base;

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.(e);
  };

  const backgroundColor =
    variant === 'primary' ? accentValue : variant === 'danger' ? theme.danger : variant === 'secondary' ? theme.cardAlt : 'transparent';
  const textColor = variant === 'primary' || variant === 'danger' ? '#0A0E17' : theme.textPrimary;
  const borderColor = variant === 'ghost' ? theme.border : 'transparent';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'ghost' ? 1 : 0,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }} allowFontScaling>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
