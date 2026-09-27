import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { IconGlyph } from '@/components/IconGlyph';

export default function Welcome() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', marginTop: 48 }}>
          <LinearGradient
            colors={[theme.teal.soft, theme.lavender.soft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 36 }}
          >
            <IconGlyph name="spark" size={40} color={theme.teal.base} />
          </LinearGradient>

          <Text
            style={{ color: theme.textPrimary, fontSize: 34, fontWeight: '800', textAlign: 'center', letterSpacing: -0.6, lineHeight: 40 }}
            accessibilityRole="header"
          >
            Small choices.{'\n'}Real change.
          </Text>

          <Text style={{ color: theme.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 20, lineHeight: 24, maxWidth: 320 }}>
            Reset tracks your progress privately and without judgment. No streaks are erased by a
            hard day — every choice you make still counts.
          </Text>

          <View style={{ marginTop: 32, width: '100%', gap: 14 }}>
            <FeatureRow icon="lock" text="Your data stays on this device, always." theme={theme} />
            <FeatureRow icon="ring" text="Progress you can actually see and feel good about." theme={theme} />
            <FeatureRow icon="leaf" text="Slips don't erase history — they're just part of it." theme={theme} />
          </View>
        </View>

        <Button label="Get started" onPress={() => router.push('/onboarding/habits')} fullWidth accessibilityHint="Begin choosing your habits" />
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, text, theme }: { icon: any; text: string; theme: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: theme.border }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: theme.cardAlt, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <IconGlyph name={icon} size={17} color={theme.textPrimary} />
      </View>
      <Text style={{ color: theme.textSecondary, fontSize: 14, flex: 1 }}>{text}</Text>
    </View>
  );
}
