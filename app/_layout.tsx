import '../global.css';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useTodoStore } from '@/store/useTodoStore';
import { syncTaskWidget } from '@/lib/taskWidgetSync';
import { requestNotificationPermission } from '@/lib/notifications';
import mobileAds from 'react-native-google-mobile-ads';
import * as LocalAuthentication from 'expo-local-authentication';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E17', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#2FBFAE" />
    </View>
  );
}

function LockedScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E17', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 24 }}>🔒</Text>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>Reset is locked</Text>
      <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
        Authenticate to access your habits.
      </Text>
      <Pressable
        onPress={onUnlock}
        style={{ backgroundColor: '#2FBFAE', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 }}>
        <Text style={{ color: '#0A0E17', fontWeight: '800', fontSize: 15 }}>Unlock with FaceID / TouchID</Text>
      </Pressable>
    </View>
  );
}

function RootNavigator() {
  const theme = useTheme();
  const settingsHydrated = useSettingsStore((s) => s.hasHydrated);
  const habitsHydrated = useHabitStore((s) => s.hasHydrated);
  const biometricLockEnabled = useSettingsStore((s) => s.biometricLockEnabled);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestNotificationPermission().catch(() => {});
    }
  }, []);

  // Keep task widgets in sync whenever todo items change
  useEffect(() => {
    syncTaskWidget(useTodoStore.getState().items);
    return useTodoStore.subscribe((state) => syncTaskWidget(state.items));
  }, []);

  useEffect(() => {
    if (settingsHydrated && biometricLockEnabled) {
      setLocked(true);
      authenticate();
    }
  }, [settingsHydrated, biometricLockEnabled]);

  const authenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Reset',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) setLocked(false);
    } catch {}
  };

  if (!settingsHydrated || !habitsHydrated) return <LoadingScreen />;
  if (locked) return <LockedScreen onUnlock={authenticate} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="habit/[id]/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="habit/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="planner" options={{ presentation: 'modal' }} />
        <Stack.Screen name="support" options={{ presentation: 'modal' }} />
        <Stack.Screen name="todo/[listId]" options={{ presentation: 'card' }} />
      </Stack>
    </View>
  );
}

mobileAds().initialize().catch(() => {});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
