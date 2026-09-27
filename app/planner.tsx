import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconGlyph } from '@/components/IconGlyph';
import { usePlannerStore } from '@/store/usePlannerStore';

const EMOJI_PRESETS = ['✅', '💧', '🧘', '📖', '🚶', '💊', '🍎', '🌅', '🧹', '💤'];

export default function PlannerScreen() {
  const theme = useTheme();
  const routines = usePlannerStore((s) => [...s.routines].sort((a, b) => a.order - b.order));
  const addRoutine = usePlannerStore((s) => s.addRoutine);
  const removeRoutine = usePlannerStore((s) => s.removeRoutine);
  const reorderRoutine = usePlannerStore((s) => s.reorderRoutine);
  const toggleComplete = usePlannerStore((s) => s.toggleComplete);
  const isCompleted = usePlannerStore((s) => s.isCompleted);
  const todayCount = usePlannerStore((s) => s.todayCount);

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('✅');

  const done = todayCount();
  const total = routines.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addRoutine(newLabel.trim(), newEmoji);
    setNewLabel('');
    setNewEmoji('✅');
    setAdding(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScreenHeader title="ADHD Planner" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Progress bar */}
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: theme.border, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800' }}>Today's routine</Text>
            <Text style={{ color: theme.teal.base, fontSize: 16, fontWeight: '800' }}>{done}/{total}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: theme.cardAlt, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ height: 8, width: `${pct}%`, backgroundColor: pct === 100 ? theme.teal.base : theme.lavender.base, borderRadius: 4 }} />
          </View>
          {pct === 100 && (
            <Text style={{ color: theme.teal.base, fontSize: 13, fontWeight: '700', marginTop: 10, textAlign: 'center' }}>
              All done for today!
            </Text>
          )}
        </View>

        {/* Routine items */}
        {routines.map((item, idx) => {
          const done = isCompleted(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleComplete(item.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: done ? theme.teal.soft : theme.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: done ? theme.teal.base : theme.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              {/* Checkbox */}
              <View style={{
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: done ? theme.teal.base : 'transparent',
                borderWidth: done ? 0 : 2, borderColor: theme.border,
                alignItems: 'center', justifyContent: 'center', marginRight: 14,
              }}>
                {done && <IconGlyph name="check" size={13} color="#0A0E17" />}
              </View>

              <Text style={{ fontSize: 20, marginRight: 12 }}>{item.emoji}</Text>
              <Text style={{ flex: 1, color: done ? theme.teal.base : theme.textPrimary, fontSize: 15, fontWeight: '600', textDecorationLine: done ? 'line-through' : 'none' }}>
                {item.label}
              </Text>

              {/* Reorder buttons */}
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {idx > 0 && (
                  <Pressable onPress={() => reorderRoutine(item.id, 'up')} hitSlop={8}
                    style={{ padding: 4 }}>
                    <IconGlyph name="chevronLeft" size={14} color={theme.textMuted} />
                  </Pressable>
                )}
                {idx < routines.length - 1 && (
                  <Pressable onPress={() => reorderRoutine(item.id, 'down')} hitSlop={8}
                    style={{ padding: 4 }}>
                    <IconGlyph name="chevronRight" size={14} color={theme.textMuted} />
                  </Pressable>
                )}
                <Pressable onPress={() => removeRoutine(item.id)} hitSlop={8} style={{ padding: 4 }}>
                  <IconGlyph name="trash" size={14} color={theme.textMuted} />
                </Pressable>
              </View>
            </Pressable>
          );
        })}

        {/* Add new routine */}
        {adding ? (
          <Card style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {EMOJI_PRESETS.map((e) => (
                <Pressable key={e} onPress={() => setNewEmoji(e)}
                  style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: newEmoji === e ? theme.lavender.soft : theme.cardAlt,
                    borderWidth: newEmoji === e ? 1.5 : 0, borderColor: theme.lavender.base }}>
                  <Text style={{ fontSize: 18 }}>{e}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="Routine step…"
              placeholderTextColor={theme.textMuted}
              style={{ backgroundColor: theme.cardAlt, borderRadius: 12, padding: 12, color: theme.textPrimary, fontSize: 15, marginBottom: 12 }}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Add" onPress={handleAdd} disabled={!newLabel.trim()} style={{ flex: 1 }} />
              <Button label="Cancel" variant="ghost" onPress={() => { setAdding(false); setNewLabel(''); }} style={{ flex: 1 }} />
            </View>
          </Card>
        ) : (
          <Button label="+ Add routine step" variant="secondary" onPress={() => setAdding(true)} fullWidth style={{ marginTop: 8 }} />
        )}

        {/* Tip card */}
        <View style={{ backgroundColor: theme.cardAlt, borderRadius: 16, padding: 16, marginTop: 24 }}>
          <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>ADHD TIP</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20 }}>
            Tap any step to mark it done. Small wins add up — you don't have to do everything perfectly, just keep moving forward.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
