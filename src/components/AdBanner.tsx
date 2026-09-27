import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-8008114373723541/2473216051';

export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  if (Platform.OS !== 'ios') return null;

  return (
    <View
      pointerEvents={loaded ? 'box-none' : 'none'}
      style={{ alignItems: 'center', height: loaded ? undefined : 0, overflow: 'hidden' }}
    >
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}
