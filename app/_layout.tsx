import '../global.css';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHabitStore } from '@/store/useHabitStore';
import { requestNotificationPermission } from '@/lib/notifications';
import mobileAds from 'react-native-google-mobile-ads';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E17', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#2FBFAE" />
    </View>
  );
}

function RootNavigator() {
  const theme = useTheme();
  const settingsHydrated = useSettingsStore((s) => s.hasHydrated);
  const habitsHydrated = useHabitStore((s) => s.hasHydrated);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestNotificationPermission().catch(() => {});
    }
  }, []);

  if (!settingsHydrated || !habitsHydrated) {
    return <LoadingScreen />;
  }

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
