import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import { useTheme } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { IconGlyph } from '@/components/IconGlyph';
import AdBanner from '@/components/AdBanner';

export default function SupportScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScreenHeader title="Support Reset" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Intro card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.border, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <IconGlyph name="heart" size={20} color={theme.coral.base} />
            <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginLeft: 10 }}>Keep Reset free</Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 22 }}>
            Reset is free — no subscription, no paywall. Viewing the ads below takes a few seconds and directly supports development so we can keep building features for you.
          </Text>
        </View>

        {/* Ad slot 1 — Medium Rectangle (300×250) */}
        <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>SPONSORED</Text>
        <View style={{ backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginBottom: 28, minHeight: 60 }}>
          <AdBanner size={BannerAdSize.MEDIUM_RECTANGLE} style={{ margin: 10 }} />
        </View>

        {/* Divider message */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
          <Text style={{ color: theme.textMuted, fontSize: 12, marginHorizontal: 14 }}>More from our sponsors</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
        </View>

        {/* Ad slot 2 — Large adaptive banner */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginBottom: 28, minHeight: 60 }}>
          <AdBanner size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER} />
        </View>

        {/* Ad slot 3 — Inline adaptive banner */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginBottom: 28, minHeight: 60 }}>
          <AdBanner size={BannerAdSize.INLINE_ADAPTIVE_BANNER} />
        </View>

        {/* Thank you note */}
        <View style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 18, alignItems: 'center' }}>
          <IconGlyph name="check" size={22} color={theme.teal.base} />
          <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 10, textAlign: 'center' }}>Thank you</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 6, textAlign: 'center' }}>
            Every ad view helps keep Reset free and ad-supported. We appreciate your support.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
