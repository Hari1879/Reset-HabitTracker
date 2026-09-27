import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  trigger: boolean;
  onComplete: () => void;
}

const SAMPLE_POINTS = 28;

/** Builds a smooth sine-based wave silhouette, densely sampled so straight segments
 * read as a curve. Runs on the UI thread — recomputed every frame while animating. */
function buildWavePath(width: number, bodyHeight: number, amplitude: number, phase: number, frequency: number): string {
  'worklet';
  let d = '';
  for (let i = 0; i <= SAMPLE_POINTS; i++) {
    const t = i / SAMPLE_POINTS;
    const x = t * width;
    const y = amplitude + Math.sin(t * Math.PI * frequency + phase) * amplitude;
    d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L${width.toFixed(1)} ${bodyHeight} L0 ${bodyHeight} Z`;
  return d;
}

/**
 * A full-screen liquid-wave flourish for the moment a streak restarts — two layered,
 * continuously rippling wave surfaces (an original abstract color wash, gold → coral →
 * lavender → teal) rise from the bottom, fill the screen, hold a beat, then drain back
 * away. Evokes a fresh start, not anything literal. Plays once when `trigger` flips
 * true, then calls onComplete.
 */
export function RestartDawnEffect({ trigger, onComplete }: Props) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  const amplitude = 20;
  const bodyHeight = height + amplitude * 2;
  const translateY = useSharedValue(height + amplitude);
  const phaseBack = useSharedValue(0);
  const phaseFront = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;

    translateY.value = height + amplitude;
    phaseBack.value = 0;
    phaseFront.value = 0;

    // Continuous ripple motion for the duration of the effect — two layers drifting
    // at different speeds/directions is what sells the "liquid" read over a static wave.
    phaseBack.value = withRepeat(withTiming(Math.PI * 2, { duration: 1400, easing: Easing.linear }), -1);
    phaseFront.value = withRepeat(withTiming(-Math.PI * 2, { duration: 1000, easing: Easing.linear }), -1);

    translateY.value = withSequence(
      withTiming(-amplitude, { duration: 480, easing: Easing.out(Easing.cubic) }),
      withDelay(
        180,
        withTiming(height + amplitude, { duration: 420, easing: Easing.in(Easing.cubic) }, (finished) => {
          // Cancel the infinite ripple loops once the effect is done, rather than
          // letting them spin invisibly in the background forever.
          phaseBack.value = 0;
          phaseFront.value = 0;
          if (finished) runOnJS(onComplete)();
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const groupProps = useAnimatedProps(() => ({
    transform: `translate(0, ${translateY.value})`,
  }));

  const backProps = useAnimatedProps(() => ({
    d: buildWavePath(width, bodyHeight, amplitude * 1.15, phaseBack.value, 2.5),
  }));

  const frontProps = useAnimatedProps(() => ({
    d: buildWavePath(width, bodyHeight, amplitude * 0.85, phaseFront.value, 3.5),
  }));

  if (!trigger) return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="liquidBack" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.lavender.base} />
            <Stop offset="100%" stopColor={theme.teal.base} />
          </LinearGradient>
          <LinearGradient id="liquidFront" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.gold.base} />
            <Stop offset="45%" stopColor={theme.coral.base} />
            <Stop offset="100%" stopColor={theme.lavender.base} />
          </LinearGradient>
        </Defs>
        <AnimatedG animatedProps={groupProps}>
          <AnimatedPath animatedProps={backProps} fill="url(#liquidBack)" opacity={0.55} />
          <AnimatedPath animatedProps={frontProps} fill="url(#liquidFront)" opacity={0.95} />
        </AnimatedG>
      </Svg>
    </View>
  );
}
