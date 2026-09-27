import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { IconButton } from './IconButton';

interface Props {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: Props) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
      <IconButton name="chevronLeft" accessibilityLabel="Go back" onPress={onBack ?? (() => router.back())} variant="filled" />
      {title ? (
        <Text style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '700' }} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View />
      )}
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
