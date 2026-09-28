import type { AccentColor } from '@/types';

export const accentColors: Record<AccentColor, { base: string; soft: string; strong: string }> = {
  teal: { base: '#9C89EA', soft: 'rgba(156,137,234,0.18)', strong: '#8170D1' },
  aqua: { base: '#B8A4F5', soft: 'rgba(184,164,245,0.18)', strong: '#9B87E0' },
  lavender: { base: '#9C89EA', soft: 'rgba(156,137,234,0.18)', strong: '#8170D1' },
  coral: { base: '#FF8266', soft: 'rgba(255,130,102,0.18)', strong: '#E86A4F' },
  gold: { base: '#E8B85B', soft: 'rgba(232,184,91,0.18)', strong: '#CC9E45' },
};

export const darkTheme = {
  mode: 'dark' as const,
  background: '#0C0A18',
  backgroundElevated: '#12102A',
  card: '#1A1730',
  cardAlt: '#22203A',
  border: 'rgba(156,137,234,0.12)',
  textPrimary: '#F2F0FF',
  textSecondary: '#B4ACCE',
  textMuted: '#7B739A',
  divider: 'rgba(156,137,234,0.08)',
  danger: '#FF6B6B',
  overlay: 'rgba(8,6,20,0.75)',
  ...accentColors,
};

export const lightTheme = {
  mode: 'light' as const,
  background: '#F5F3FF',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#EDE9FF',
  border: 'rgba(100,80,190,0.10)',
  textPrimary: '#1A1535',
  textSecondary: '#5B5175',
  textMuted: '#9B90B5',
  divider: 'rgba(100,80,190,0.07)',
  danger: '#D6493A',
  overlay: 'rgba(20,16,45,0.45)',
  ...accentColors,
};

export type Theme = Omit<typeof darkTheme, 'mode'> & { mode: 'dark' | 'light' };

export function getAccent(theme: Theme, accent: AccentColor) {
  return accentColors[accent];
}
