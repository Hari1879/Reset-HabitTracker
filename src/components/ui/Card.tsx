import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/theme';

interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ style, padded = true, elevated = true, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: theme.border,
          padding: padded ? 20 : 0,
          ...(elevated
            ? {
                shadowColor: '#000',
                shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.08,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
              }
            : {}),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
