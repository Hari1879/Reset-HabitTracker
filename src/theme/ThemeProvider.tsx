import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from './colors';
import { useSettingsStore } from '@/store/useSettingsStore';

const ThemeContext = createContext<Theme>(darkTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((s) => s.settings.theme);

  const theme = useMemo(() => {
    const resolved = preference === 'system' ? (systemScheme ?? 'dark') : preference;
    return resolved === 'light' ? lightTheme : darkTheme;
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
