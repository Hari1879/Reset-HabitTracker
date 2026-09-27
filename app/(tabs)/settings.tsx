import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { IconGlyph } from '@/components/IconGlyph';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHabitStore } from '@/store/useHabitStore';
import { exportDataAsJSON } from '@/lib/exportData';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import type { ThemePreference } from '@/types';
import type { EmergencyContact } from '@/types';
import AdBanner from '@/components/AdBanner';
import { BannerAdSize } from 'react-native-google-mobile-ads';

const THEME_OPTIONS: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
];

const REMINDER_TIME_CHOICES = ['08:00', '12:00', '18:00', '21:00'];

export default function Settings() {
  const theme = useTheme();
  const settings = useSettingsStore((s) => s.settings);
  const reminders = useSettingsStore((s) => s.reminders);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setStrictPrivacyMode = useSettingsStore((s) => s.setStrictPrivacyMode);
  const addReminder = useSettingsStore((s) => s.addReminder);
  const toggleReminder = useSettingsStore((s) => s.toggleReminder);
  const removeReminder = useSettingsStore((s) => s.removeReminder);
  const emergencyContact = useSettingsStore((s) => s.emergencyContact);
  const setEmergencyContact = useSettingsStore((s) => s.setEmergencyContact);
  const healthKitEnabled = useSettingsStore((s) => s.healthKitEnabled);
  const enableHealthKit = useSettingsStore((s) => s.enableHealthKit);

  const habitState = useHabitStore();
  const [exporting, setExporting] = useState(false);
  const [pickingTime, setPickingTime] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [contactName, setContactName] = useState(emergencyContact?.name ?? '');
  const [contactPhone, setContactPhone] = useState(emergencyContact?.phone ?? '');

  const handleAddReminder = async (time: string) => {
    setPickingTime(false);
    await addReminder(time, [0, 1, 2, 3, 4, 5, 6], undefined, 'Reset');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDataAsJSON({
        exportedAt: new Date().toISOString(),
        habits: habitState.habits,
        checkIns: habitState.checkIns,
        slips: habitState.slips,
        cravings: habitState.cravings,
        achievements: habitState.achievements,
        reminders,
        widgetConfigs: habitState.widgetConfigs,
      });
    } catch {
      Alert.alert('Export failed', 'Something went wrong while preparing your data.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (result.canceled) return;
    try {
      const payload = JSON.parse(await new File(result.assets[0].uri).text());
      habitState.restoreData(payload);
      Alert.alert('Backup restored', 'Your local habit history has been restored.');
    } catch {
      Alert.alert('Restore failed', 'Choose a valid Reset JSON backup.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }} accessibilityRole="header">Settings</Text>

        <SectionLabel theme={theme}>REMINDERS</SectionLabel>
        <Card>
          {reminders.length === 0 && (
            <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 12 }}>No reminders set yet.</Text>
          )}
          {reminders.map((r) => (
            <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconGlyph name="bell" size={18} color={theme.aqua.base} />
                <Text style={{ color: theme.textPrimary, fontSize: 15, marginLeft: 10, fontWeight: '600' }}>{r.time} daily</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Switch
                  value={r.enabled}
                  onValueChange={(v) => toggleReminder(r.id, v, 'your habits')}
                  trackColor={{ true: theme.aqua.base, false: theme.cardAlt }}
                  accessibilityLabel={`Toggle reminder at ${r.time}`}
                />
                <IconButton name="trash" accessibilityLabel={`Remove reminder at ${r.time}`} onPress={() => removeReminder(r.id)} />
              </View>
            </View>
          ))}

          {pickingTime ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {REMINDER_TIME_CHOICES.map((t) => (
                <Chip key={t} label={t} onPress={() => handleAddReminder(t)} accent="aqua" />
              ))}
            </View>
          ) : (
            <Button label="Add reminder" variant="secondary" onPress={() => setPickingTime(true)} style={{ marginTop: 8 }} />
          )}
        </Card>

        <SectionLabel theme={theme}>APPEARANCE</SectionLabel>
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {THEME_OPTIONS.map((opt) => (
              <Chip key={opt.id} label={opt.label} selected={settings.theme === opt.id} onPress={() => setTheme(opt.id)} accent="lavender" />
            ))}
          </View>
        </Card>

        <AdBanner size={BannerAdSize.LARGE_BANNER} style={{ marginVertical: 8 }} />

        <SectionLabel theme={theme}>YOUR DATA</SectionLabel>
        <Card>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20 }}>
            Export everything Reset has stored about you as a JSON file you can keep or move elsewhere.
          </Text>
          <Button label="Export data to JSON" onPress={handleExport} loading={exporting} variant="secondary" style={{ marginTop: 14 }} />
          <Button label="Restore from JSON" onPress={handleImport} variant="ghost" style={{ marginTop: 8 }} />
        </Card>

        <SectionLabel theme={theme}>EMERGENCY CONTACT</SectionLabel>
        <Card>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20 }}>
            Add a trusted person. One-tap call or text appears on the craving screen when you need support.
          </Text>
          {emergencyContact && !editingContact ? (
            <View style={{ marginTop: 14 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }}>{emergencyContact.name}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{emergencyContact.phone}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button label="Edit" variant="secondary" onPress={() => { setContactName(emergencyContact.name); setContactPhone(emergencyContact.phone); setEditingContact(true); }} style={{ flex: 1 }} />
                <Button label="Remove" variant="ghost" onPress={() => setEmergencyContact(null)} style={{ flex: 1 }} />
              </View>
            </View>
          ) : editingContact || !emergencyContact ? (
            <View style={{ marginTop: 14, gap: 10 }}>
              <TextInput
                value={contactName}
                onChangeText={setContactName}
                placeholder="Name"
                placeholderTextColor={theme.textMuted}
                style={{ backgroundColor: theme.cardAlt, borderRadius: 14, padding: 12, color: theme.textPrimary, fontSize: 15 }}
              />
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Phone number"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                style={{ backgroundColor: theme.cardAlt, borderRadius: 14, padding: 12, color: theme.textPrimary, fontSize: 15 }}
              />
              <Button
                label="Save contact"
                onPress={() => {
                  if (contactName.trim() && contactPhone.trim()) {
                    setEmergencyContact({ name: contactName.trim(), phone: contactPhone.trim() });
                    setEditingContact(false);
                  }
                }}
                disabled={!contactName.trim() || !contactPhone.trim()}
                fullWidth
              />
              {editingContact && (
                <Button label="Cancel" variant="ghost" onPress={() => setEditingContact(false)} fullWidth />
              )}
            </View>
          ) : null}
        </Card>

        <AdBanner size={BannerAdSize.LARGE_BANNER} style={{ marginVertical: 8 }} />

        <SectionLabel theme={theme}>SUPPORT THE APP</SectionLabel>
        <Card>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20 }}>
            Reset is free forever. View a few ads on our dedicated support page to help keep it that way.
          </Text>
          <Pressable
            onPress={() => router.push('/support')}
            style={({ pressed }) => ({
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.cardAlt,
              borderRadius: 14,
              padding: 14,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconGlyph name="heart" size={18} color={theme.coral.base} />
              <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700', marginLeft: 10 }}>View support page</Text>
            </View>
            <IconGlyph name="chevronRight" size={16} color={theme.textMuted} />
          </Pressable>
        </Card>

        <SectionLabel theme={theme}>APPLE HEALTH</SectionLabel>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <IconGlyph name="heart" size={18} color={theme.coral.base} />
            <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginLeft: 10, flex: 1 }}>
              Write a mindfulness session to the Health app each time you check in on a habit. Your streak progress appears in Apple Health's Mindfulness section.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }}>Sync with Apple Health</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                {healthKitEnabled ? 'Writing check-ins to Health' : 'Off — tap to enable and grant access'}
              </Text>
            </View>
            <Switch
              value={healthKitEnabled}
              onValueChange={(v) => {
                if (v) enableHealthKit();
                else useSettingsStore.setState({ healthKitEnabled: false });
              }}
              trackColor={{ true: theme.coral.base, false: theme.cardAlt }}
              accessibilityLabel="Toggle Apple Health sync"
            />
          </View>
        </Card>

        <SectionLabel theme={theme}>PRIVACY</SectionLabel>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <IconGlyph name="lock" size={18} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginLeft: 10, flex: 1 }}>
              Your habit data stays on this device by default. Reset has no account, no server, and no login —
              nothing is uploaded unless you choose to export and share it yourself.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }}>Strict privacy mode</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>Disables all optional analytics.</Text>
            </View>
            <Switch
              value={settings.strictPrivacyMode}
              onValueChange={setStrictPrivacyMode}
              trackColor={{ true: theme.teal.base, false: theme.cardAlt }}
              accessibilityLabel="Toggle strict privacy mode"
            />
          </View>
        </Card>

        <Text style={{ color: theme.textMuted, fontSize: 12, textAlign: 'center', marginTop: 28 }}>Reset · v1.0.0</Text>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

function SectionLabel({ children, theme }: { children: React.ReactNode; theme: any }) {
  return <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '700', marginTop: 24, marginBottom: 10 }}>{children}</Text>;
}
