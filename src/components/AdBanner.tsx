import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-8008114373723541/2473216051';

const MEDIUM_RECT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-8008114373723541/2473216051';

interface Props {
  size?: BannerAdSize;
  style?: object;
}

export default function AdBanner({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER, style }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (Platform.OS !== 'ios') return null;

  const unitId = size === BannerAdSize.MEDIUM_RECTANGLE ? MEDIUM_RECT_ID : BANNER_ID;

  return (
    <View
      pointerEvents={loaded ? 'box-none' : 'none'}
      style={[{ alignItems: 'center', height: loaded ? undefined : 0, overflow: 'hidden' }, style]}
    >
      <BannerAd
        unitId={unitId}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}
