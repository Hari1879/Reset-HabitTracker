import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      ios: 'ca-app-pub-8008114373723541/REPLACE_WITH_IOS_UNIT_ID',
      android: 'ca-app-pub-8008114373723541/REPLACE_WITH_ANDROID_UNIT_ID',
    })!;

export default function AdBanner() {
  if (Platform.OS === 'web') return null;

  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
