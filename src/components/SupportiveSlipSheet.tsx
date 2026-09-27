import React, { useRef, useState } from 'react';
import { Modal, View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { RestartDawnEffect } from '@/components/RestartDawnEffect';
import { formatFriendlyDateTime } from '@/lib/dates';
import type { SlipTrigger } from '@/types';

interface Props {
  visible: boolean;
  habitTitle: string;
  onKeepGoing: () => void;
  onRecord: (trigger: SlipTrigger | undefined, note: string | undefined) => void;
}

const TRIGGERS: { id: SlipTrigger; label: string }[] = [
  { id: 'stress', label: 'Stress' },
  { id: 'boredom', label: 'Boredom' },
  { id: 'social', label: 'Social setting' },
  { id: 'late_night', label: 'Late night' },
  { id: 'other', label: 'Other' },
];

/**
 * Bottom sheet shown when a user taps "I had a slip." Deliberately warm, never punishing —
 * this is a support flow, not a confession. Preserves history; never wipes prior achievements.
 */
export function SupportiveSlipSheet({ visible, habitTitle, onKeepGoing, onRecord }: Props) {
  const theme = useTheme();
  const [trigger, setTrigger] = useState<SlipTrigger | undefined>(undefined);
  const [note, setNote] = useState('');
  const [showDawn, setShowDawn] = useState(false);
  const pendingSubmission = useRef<{ trigger: SlipTrigger | undefined; note: string | undefined }>({ trigger: undefined, note: undefined });

  const reset = () => {
    setTrigger(undefined);
    setNote('');
  };

  // A small moment of fun before committing: a full-screen dawn-light flourish plays
  // first, then the slip is actually recorded and the sheet closes. Purely decorative —
  // never a delay that reads as punishment, just a flourish on "starting fresh."
  const handleRecordPress = () => {
    pendingSubmission.current = { trigger, note: note.trim() ? note.trim() : undefined };
    setShowDawn(true);
  };

  const handleDawnComplete = () => {
    setShowDawn(false);
    onRecord(pendingSubmission.current.trigger, pendingSubmission.current.note);
    reset();
  };

  const handleKeepGoing = () => {
    reset();
    onKeepGoing();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleKeepGoing}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' }}
        >
          <Pressable style={{ flex: 1 }} onPress={handleKeepGoing} accessibilityLabel="Dismiss" />
          <RestartDawnEffect trigger={showDawn} onComplete={handleDawnComplete} />
          <Animated.View
            entering={SlideInDown.springify().damping(18)}
            exiting={SlideOutDown}
            style={{
              backgroundColor: theme.backgroundElevated,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: 34,
            }}
          >
            <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: theme.border, marginBottom: 18 }} />

            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>
              One moment does not erase your progress.
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
              {habitTitle} · {formatFriendlyDateTime(new Date())}
            </Text>

            <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 22, marginBottom: 4 }}>
              What was happening? (optional)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
              {TRIGGERS.map((t) => (
                <Chip key={t.id} label={t.label} selected={trigger === t.id} onPress={() => setTrigger(trigger === t.id ? undefined : t.id)} accent="lavender" />
              ))}
            </View>

            <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 8 }}>
              A note to yourself (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Anything you want to remember..."
              placeholderTextColor={theme.textMuted}
              multiline
              accessibilityLabel="Optional note about this moment"
              style={{
                backgroundColor: theme.cardAlt,
                borderRadius: 16,
                padding: 14,
                minHeight: 64,
                color: theme.textPrimary,
                fontSize: 15,
                textAlignVertical: 'top',
              }}
            />

            <View style={{ marginTop: 22 }}>
              <Button
                label="Record and restart"
                onPress={handleRecordPress}
                disabled={showDawn}
                accent="lavender"
                fullWidth
                accessibilityHint="Saves this moment and starts a fresh streak from now"
              />
              <View style={{ height: 10 }} />
              <Button label="Keep going" variant="ghost" onPress={handleKeepGoing} disabled={showDawn} fullWidth accessibilityHint="Closes this without recording a slip" />
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
