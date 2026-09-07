/**
 * Enable mock API for:
 * - Vite DEV (`npm run dev`)
 * - Vercel preview / production when VITE_USE_MOCKS or VITE_USE_MSW is true
 * - Hostnames *.vercel.app (auto demo mode so hosted preview works without local npm)
 * - localStorage convia.forceMock=1
 *
 * Client-side mockHandlers always work once setApiOffline/forceMock is on —
 * MSW is optional enhancement when mockServiceWorker.js is present.
 */
function isVercelHost(): boolean {
  try {
    const h = window.location.hostname;
    return h.endsWith('.vercel.app') || h.endsWith('.vercel.sh');
  } catch {
    return false;
  }
}

export async function enableMocking(): Promise<void> {
  const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
  let force = false;
  try {
    force = localStorage.getItem('convia.forceMock') === '1';
  } catch {
    /* ignore */
  }

  const isDev = Boolean(env.DEV);
  const envMock =
    env.VITE_USE_MOCKS === 'true' ||
    env.VITE_USE_MSW === 'true' ||
    env.VITE_FORCE_MOCK === 'true';
  const onVercel = isVercelHost();

  const useMocks = force || envMock || isDev || onVercel;

  if (useMocks) {
    try {
      const { setForceMock, setApiOffline } = await import('../shared/api/mockMode');
      // Persist so refreshes stay in demo mode on hosted preview
      if (onVercel || envMock || force) {
        setForceMock(true);
      }
      setApiOffline(true);
      console.info(
        '[Convia] Demo mock API enabled — login with demo@convia.app / any password',
      );
    } catch {
      /* ignore */
    }
  }

  const useMsw = useMocks && env.VITE_USE_MSW !== 'false';
  if (!useMsw) return;

  try {
    const { worker } = await import('./browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
      serviceWorker: {
        url: `${env.BASE_URL || '/'}mockServiceWorker.js`,
      },
    });
    console.info('[MSW] Service Worker active');
  } catch (err) {
    // Client mockHandlers already active — SW is optional on Vercel
    if (isDev) {
      console.warn('[MSW] Worker not started; client mock fallback is active.', err);
    }
  }
}
