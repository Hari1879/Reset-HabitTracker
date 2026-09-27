import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'reset:';

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(PREFIX + key);
}

export async function exportAllData(keys: string[]): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    keys.map(async (key) => [key, await loadJSON(key, null)] as const),
  );
  return Object.fromEntries(entries);
}
