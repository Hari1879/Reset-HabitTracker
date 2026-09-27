import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';

export function OnboardingProgress({ step, total = 4 }: { step: number; total?: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 12, paddingBottom: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === step ? 22 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i <= step ? theme.teal.base : theme.cardAlt,
          }}
        />
      ))}
    </View>
  );
}
