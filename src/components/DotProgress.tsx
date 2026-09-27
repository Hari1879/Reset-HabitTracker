import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
  total?: number;
  filled: number;
  color: string;
  trackColor: string;
  dotSize?: number;
  columns?: number;
  gap?: number;
}

/** Dot-grid progress visual — dots fill in as the streak advances toward the next milestone. */
export function DotProgress({ total = 20, filled, color, trackColor, dotSize = 10, columns = 10, gap = 6 }: Props) {
  const clampedFilled = Math.min(Math.max(filled, 0), total);
  const dots = Array.from({ length: total }, (_, i) => i);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: columns * (dotSize + gap) - gap }}>
      {dots.map((i) => {
        const isFilled = i < clampedFilled;
        return (
          <Animated.View
            key={i}
            entering={isFilled ? FadeIn.delay(i * 18).duration(300) : undefined}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isFilled ? color : trackColor,
              marginRight: gap,
              marginBottom: gap,
            }}
          />
        );
      })}
    </View>
  );
}
