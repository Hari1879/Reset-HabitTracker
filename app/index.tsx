import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function Index() {
  const onboardingComplete = useSettingsStore((s) => s.settings.onboardingComplete);
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding/welcome'} />;
}
