import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { IconGlyph, type IconName } from '@/components/IconGlyph';
import { formatFriendlyDate } from '@/lib/dates';
import type { Achievement, AchievementType } from '@/types';

const ACHIEVEMENT_ICON: Record<AchievementType, IconName> = {
  first_day: 'spark',
  full_week: 'flame',
  weekend_warrior: 'shield',
  one_month: 'ring',
  ninety_days: 'ring',
  one_year: 'ring',
  strong_comeback: 'leaf',
};

interface Props {
  achievement: Achievement;
  habitTitle?: string;
}

export function AchievementCard({ achievement, habitTitle }: Props) {
  const theme = useTheme();
  const gold = theme.gold.base;

  return (
    <View
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: 12,
      }}
    >
      <LinearGradient
        colors={[theme.gold.soft, theme.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 18, flexDirection: 'row', alignItems: 'center' }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: theme.gold.soft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            borderWidth: 1.5,
            borderColor: gold,
          }}
        >
          <IconGlyph name={ACHIEVEMENT_ICON[achievement.type]} size={24} color={gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700' }}>{achievement.title}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{achievement.description}</Text>
          <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 6 }}>
            {habitTitle ? `${habitTitle} · ` : ''}
            {formatFriendlyDate(achievement.unlockedAt)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
