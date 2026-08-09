import { useState } from 'react';
import type { Screen } from '../shared/data/mockData';

/**
 * Lightweight stack-based navigator that drives the whole app.
 * `navigate` pushes a new screen (used for sub-screens / flows),
 * `switchTab` resets the stack (used for the 5 main bottom-nav tabs),
 * and `goBack` pops the stack.
 *
 * This intentionally mirrors the mental model of a native navigation
 * stack. If/when the app needs deep-linking, browser back/forward, or
 * shareable URLs, this is the seam to swap in `react-router` (already
 * a project dependency) without touching individual screens — every
 * screen only depends on the `navigate` / `goBack` / `switchTab`
 * function signatures, not on this implementation.
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
  const switchTab = (s: Screen) => setStack([s]);

  return { current, navigate, goBack, switchTab, navParam };
}
