import { useCallback, useEffect, useRef, useState } from 'react';
import type { Screen } from '../shared/data/mockData';

/**
 * Stack navigator synced with the browser History API so the phone/system
 * back gesture pops an in-app screen instead of leaving the site.
 */
export function useNavigation(initial: Screen = 'onboarding') {
  const [stack, setStack] = useState<Screen[]>([initial]);
  const [navParam, setNavParam] = useState<string | undefined>(undefined);
  const stackRef = useRef(stack);
  stackRef.current = stack;
  const current = stack[stack.length - 1];

  // Seed history so the first system-back can be intercepted
  useEffect(() => {
    try {
      window.history.replaceState({ convia: true, depth: 1 }, '');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      const depth = stackRef.current.length;
      if (depth > 1) {
        setStack((prev) => prev.slice(0, -1));
        setNavParam(undefined);
        // Keep a marker entry so further backs still fire popstate
        try {
          if (depth - 1 <= 1) {
            window.history.pushState({ convia: true, depth: 1 }, '');
          }
        } catch {
          /* ignore */
        }
      } else {
        // At root — re-push so another back is needed to exit
        try {
          window.history.pushState({ convia: true, depth: 1 }, '');
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((s: Screen, param?: string) => {
    setNavParam(param);
    setStack((prev) => {
      const next = [...prev, s];
      try {
        window.history.pushState({ convia: true, depth: next.length, screen: s }, '');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    if (stackRef.current.length <= 1) return;
    try {
      // Prefer history.back so URL stack stays aligned; popstate will pop React stack
      window.history.back();
    } catch {
      setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setNavParam(undefined);
    }
  }, []);

  const switchTab = useCallback((s: Screen) => {
    setNavParam(undefined);
    setStack([s]);
    try {
      window.history.pushState({ convia: true, depth: 1, screen: s }, '');
    } catch {
      /* ignore */
    }
  }, []);

  return { current, navigate, goBack, switchTab, navParam, stackDepth: stack.length };
}
