import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/theme';

const PHASES = [
  { label: 'Breathe in',  duration: 4, expand: true },
  { label: 'Hold',        duration: 4, expand: false },
  { label: 'Breathe out', duration: 4, expand: false },
  { label: 'Hold',        duration: 4, expand: false },
];

const SIZE_MIN = 80;
const SIZE_MAX = 160;

interface Props {
  running: boolean;
}

export function BreathingExercise({ running }: Props) {
  const theme = useTheme();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(PHASES[0].duration);
  const size = useSharedValue(SIZE_MIN);

  useEffect(() => {
    if (!running) {
      setPhaseIdx(0);
      setTick(PHASES[0].duration);
      size.value = withTiming(SIZE_MIN, { duration: 600 });
      return;
    }

    let phase = 0;
    let remaining = PHASES[0].duration;

    // kick off the first inhale
    size.value = withTiming(SIZE_MAX, { duration: PHASES[0].duration * 1000, easing: Easing.inOut(Easing.ease) });

    const interval = setInterval(() => {
      remaining -= 1;
      setTick(remaining);

      if (remaining <= 0) {
        phase = (phase + 1) % PHASES.length;
        remaining = PHASES[phase].duration;
        setPhaseIdx(phase);
        setTick(remaining);

        if (phase === 0) {
          // inhale: grow
          size.value = withTiming(SIZE_MAX, { duration: PHASES[phase].duration * 1000, easing: Easing.inOut(Easing.ease) });
        } else if (phase === 2) {
          // exhale: shrink
          size.value = withTiming(SIZE_MIN, { duration: PHASES[phase].duration * 1000, easing: Easing.inOut(Easing.ease) });
        }
        // phases 1 & 3 (hold) — no new animation, circle stays put
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: size.value,
    height: size.value,
    borderRadius: size.value / 2,
  }));

  const phase = PHASES[phaseIdx];

  return (
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <View style={{ width: SIZE_MAX + 40, height: SIZE_MAX + 40, alignItems: 'center', justifyContent: 'center' }}>
        {/* outer ring */}
        <View style={{ position: 'absolute', width: SIZE_MAX + 24, height: SIZE_MAX + 24, borderRadius: (SIZE_MAX + 24) / 2, borderWidth: 1, borderColor: theme.teal.soft, opacity: 0.4 }} />
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: theme.teal.soft,
              borderWidth: 2,
              borderColor: theme.teal.base,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Text style={{ color: theme.teal.base, fontSize: 26, fontWeight: '800' }}>{tick}</Text>
        </Animated.View>
      </View>
      <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 8 }}>{phase.label}</Text>
      <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 4 }}>Box breathing · 4 · 4 · 4 · 4</Text>
    </View>
  );
}
