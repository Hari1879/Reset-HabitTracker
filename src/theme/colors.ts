import type { AccentColor } from '@/types';

export const accentColors: Record<AccentColor, { base: string; soft: string; strong: string }> = {
  teal: { base: '#2FBFAE', soft: 'rgba(47,191,174,0.16)', strong: '#22A190' },
  aqua: { base: '#3AB2DC', soft: 'rgba(58,178,220,0.16)', strong: '#2E92B8' },
  lavender: { base: '#9C89EA', soft: 'rgba(156,137,234,0.18)', strong: '#8170D1' },
  coral: { base: '#FF8266', soft: 'rgba(255,130,102,0.18)', strong: '#E86A4F' },
  gold: { base: '#E8B85B', soft: 'rgba(232,184,91,0.18)', strong: '#CC9E45' },
};

export const darkTheme = {
  mode: 'dark' as const,
  background: '#0A0E17',
  backgroundElevated: '#0F1420',
  card: '#161C2C',
  cardAlt: '#1F2738',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F4F6FA',
  textSecondary: '#A7B0C3',
  textMuted: '#6E7890',
  divider: 'rgba(255,255,255,0.06)',
  danger: '#FF6B6B',
  overlay: 'rgba(6,8,14,0.72)',
  ...accentColors,
};

export const lightTheme = {
  mode: 'light' as const,
  background: '#F6F7FB',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#EEF1F7',
  border: 'rgba(15,20,32,0.08)',
  textPrimary: '#12172A',
  textSecondary: '#4B5468',
  textMuted: '#828EA6',
  divider: 'rgba(15,20,32,0.06)',
  danger: '#D6493A',
  overlay: 'rgba(20,24,36,0.45)',
  ...accentColors,
};

export type Theme = Omit<typeof darkTheme, 'mode'> & { mode: 'dark' | 'light' };

export function getAccent(theme: Theme, accent: AccentColor) {
  return accentColors[accent];
}
