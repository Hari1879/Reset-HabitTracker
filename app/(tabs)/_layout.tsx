import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/theme';
import { IconGlyph, type IconName } from '@/components/IconGlyph';

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <IconGlyph name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.teal.base,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.backgroundElevated,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon name="ring" color={color as string} />, tabBarAccessibilityLabel: 'Home dashboard' }}
      />
      <Tabs.Screen
        name="widgets"
        options={{ title: 'Widgets', tabBarIcon: ({ color }) => <TabIcon name="grid" color={color as string} />, tabBarAccessibilityLabel: 'Widgets' }}
      />
      <Tabs.Screen
        name="achievements"
        options={{ title: 'Achievements', tabBarIcon: ({ color }) => <TabIcon name="flame" color={color as string} />, tabBarAccessibilityLabel: 'Achievements' }}
      />
      <Tabs.Screen
        name="review"
        options={{ title: 'Review', tabBarIcon: ({ color }) => <TabIcon name="spark" color={color as string} />, tabBarAccessibilityLabel: 'Weekly review' }}
      />
      <Tabs.Screen
        name="todo"
        options={{ title: 'Tasks', tabBarIcon: ({ color }) => <TabIcon name="list" color={color as string} />, tabBarAccessibilityLabel: 'Tasks' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color }) => <TabIcon name="lock" color={color as string} />, tabBarAccessibilityLabel: 'Settings' }}
      />
    </Tabs>
  );
}
