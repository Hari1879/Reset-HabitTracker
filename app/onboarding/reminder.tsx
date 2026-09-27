import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { OnboardingProgress } from '@/components/ui/OnboardingProgress';
import { IconGlyph } from '@/components/IconGlyph';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const TIME_OPTIONS = [
  { label: '8:00 AM', value: '08:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '9:00 PM', value: '21:00' },
];

export default function ReminderStep() {
  const theme = useTheme();
  const { reminderTime, setReminderTime } = useOnboardingStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <IconButton name="chevronLeft" accessibilityLabel="Go back" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <OnboardingProgress step={2} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.aqua.soft, alignItems: 'center', justifyContent: 'center' }}>
            <IconGlyph name="bell" size={30} color={theme.aqua.base} />
          </View>
        </View>

        <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
          A gentle daily nudge?
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, marginTop: 8, lineHeight: 21, textAlign: 'center' }}>
          Optional. A quiet reminder to check in — never guilt-tripping, just a moment to reflect.
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 }}>
          {TIME_OPTIONS.map((opt) => (
            <Chip key={opt.value} label={opt.label} selected={reminderTime === opt.value} onPress={() => setReminderTime(opt.value)} accent="aqua" />
          ))}
        </View>

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Chip label="No reminder" selected={reminderTime === null} onPress={() => setReminderTime(null)} accent="aqua" />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <Button label="Continue" onPress={() => router.push('/onboarding/widget-style')} fullWidth />
      </View>
    </SafeAreaView>
  );
}
