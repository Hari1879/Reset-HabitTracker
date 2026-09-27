import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { useHabitStore } from '@/store/useHabitStore';
import type { CopingAction, SlipTrigger } from '@/types';

const ACTIONS: { id: CopingAction; label: string }[] = [
  { id: 'breathe', label: 'Breathe slowly' },
  { id: 'walk', label: 'Take a short walk' },
  { id: 'water', label: 'Drink some water' },
  { id: 'delay', label: 'Wait ten minutes' },
  { id: 'journal', label: 'Write it down' },
];
const TRIGGERS: { id: SlipTrigger; label: string }[] = [
  { id: 'stress', label: 'Stress' },
  { id: 'boredom', label: 'Boredom' },
  { id: 'social', label: 'Social' },
  { id: 'late_night', label: 'Late night' },
  { id: 'other', label: 'Other' },
];

export default function CravingSupport() {
  const theme = useTheme();
  const habits = useHabitStore((state) => state.habits.filter((habit) => !habit.archived));
  const logCraving = useHabitStore((state) => state.logCraving);
  const [habitId, setHabitId] = useState(habits[0]?.id ?? '');
  const [intensity, setIntensity] = useState(3);
  const [trigger, setTrigger] = useState<SlipTrigger>();
  const [action, setAction] = useState<CopingAction>('breathe');
  const [seconds, setSeconds] = useState(300);
  const [started, setStarted] = useState(false);
  const habit = useMemo(() => habits.find((item) => item.id === habitId), [habits, habitId]);

  useEffect(() => {
    if (!started || seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [started, seconds]);

  const finish = (resolved: boolean) => {
    if (habitId) logCraving(habitId, intensity, trigger, action, resolved);
    setStarted(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScreenHeader title="Craving support" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }}>Pause the urge</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 8 }}>Cravings rise and fall. Give yourself five calm minutes before deciding what comes next.</Text>

        <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginTop: 24 }}>HABIT</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {habits.map((item) => <Chip key={item.id} label={item.title} selected={item.id === habitId} onPress={() => setHabitId(item.id)} accent={item.accent} />)}
        </View>

        <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginTop: 24 }}>INTENSITY: {intensity}/5</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setIntensity(value)} style={{ flex: 1, height: 42, borderRadius: 12, backgroundColor: value <= intensity ? theme.coral.base : theme.cardAlt, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: value <= intensity ? theme.background : theme.textSecondary, fontWeight: '800' }}>{value}</Text></Pressable>)}
        </View>

        <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginTop: 24 }}>WHAT SET IT OFF?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>{TRIGGERS.map((item) => <Chip key={item.id} label={item.label} selected={item.id === trigger} onPress={() => setTrigger(item.id)} accent="coral" />)}</View>

        <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginTop: 24 }}>CHOOSE A COPING ACTION</Text>
        <Card style={{ marginTop: 10 }}>{ACTIONS.map((item) => <Pressable key={item.id} onPress={() => setAction(item.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}><View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: item.id === action ? theme.teal.base : theme.border, backgroundColor: item.id === action ? theme.teal.base : 'transparent' }} /><Text style={{ color: theme.textPrimary, marginLeft: 10 }}>{item.label}</Text></Pressable>)}</Card>

        <View style={{ alignItems: 'center', marginTop: 28 }}>
          <Text style={{ color: theme.teal.base, fontSize: 48, fontWeight: '800' }}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text>
          <Text style={{ color: theme.textMuted, marginTop: 4 }}>{started ? 'You are making space for a choice.' : 'Start the five-minute reset.'}</Text>
        </View>
        {!started && seconds > 0 && <Button label="Start timer" onPress={() => setStarted(true)} fullWidth style={{ marginTop: 20 }} />}
        {started && <Button label="I made it through" onPress={() => finish(true)} fullWidth style={{ marginTop: 20 }} />}
        <Button label="Record this craving" variant="ghost" onPress={() => finish(false)} fullWidth style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
