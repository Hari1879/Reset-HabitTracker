import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { IconGlyph } from '@/components/IconGlyph';
import { useHabitStore } from '@/store/useHabitStore';

/** Subtle celebratory banner shown when a new achievement unlocks; self-dismisses. */
export function AchievementUnlockToast() {
  const theme = useTheme();
  const achievement = useHabitStore((s) => s.lastUnlockedAchievement);
  const clear = useHabitStore((s) => s.clearLastUnlocked);

  useEffect(() => {
    if (!achievement) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const timeout = setTimeout(clear, 4000);
    return () => clearTimeout(timeout);
  }, [achievement]);

  if (!achievement) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      exiting={FadeOutUp}
      style={{ position: 'absolute', top: 56, left: 16, right: 16, zIndex: 50 }}
      pointerEvents="box-none"
    >
      <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel={`Achievement unlocked: ${achievement.title}. Dismiss.`}>
        <LinearGradient
          colors={[theme.gold.base, theme.gold.strong]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(10,14,23,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <IconGlyph name="spark" size={20} color="#0A0E17" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0A0E17', fontWeight: '700', fontSize: 15 }}>Achievement unlocked</Text>
            <Text style={{ color: '#0A0E17', fontSize: 13, opacity: 0.8 }}>{achievement.title}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
