import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { monthsBetween } from './ageHelpers';

export function useAgeMonths(birthDateISO?: string): number {
  const [now, setNow] = useState(() => new Date().toISOString());
  useEffect(() => {
    const refresh = () => setNow(new Date().toISOString());
    // Covers birthdays while the screen stays mounted and resuming after days away.
    const timer = setInterval(refresh, 60000);
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, []);
  return birthDateISO ? monthsBetween(birthDateISO, now) : 0;
}
