import { useState } from 'react';
import type { Screen } from '../shared/data/mockData';

/**
 * Lightweight stack-based navigator that drives the whole app.
 * `navigate` pushes a new screen, `switchTab` resets the stack,
 * and `goBack` pops the stack.
 */
export function useNavigation(initial: Screen = 'onboarding') {
  const [stack, setStack] = useState<Screen[]>([initial]);
  const [navParam, setNavParam] = useState<string | undefined>(undefined);
  const current = stack[stack.length - 1];

  const navigate = (s: Screen, param?: string) => {
    setNavParam(param);
    setStack((prev) => [...prev, s]);
  };
  const goBack = () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const switchTab = (s: Screen) => {
    setNavParam(undefined);
    setStack([s]);
  };

  return { current, navigate, goBack, switchTab, navParam };
}
