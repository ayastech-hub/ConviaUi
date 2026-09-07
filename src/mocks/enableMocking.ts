/**
 * Start MSW in development (and when force-mock is on).
 * Always enables API offline/mock mode in DEV so features work even if SW fails to register.
 */
export async function enableMocking(): Promise<void> {
  const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
  let force = false;
  try {
    force = localStorage.getItem('convia.forceMock') === '1';
  } catch {
    /* ignore */
  }

  const isDev = Boolean(env.DEV);
  const useMsw =
    force || env.VITE_USE_MSW === 'true' || (isDev && env.VITE_USE_MSW !== 'false');

  // Always unlock mock catalog in local dev so login/portfolio/KYC work offline
  if (isDev || force || env.VITE_USE_MSW === 'true') {
    try {
      const { setForceMock, setApiOffline } = await import('../shared/api/mockMode');
      if (isDev && !force) {
        // soft-enable offline fallback without forcing localStorage unless user opted in
        setApiOffline(true);
      } else if (force || env.VITE_USE_MSW === 'true') {
        setForceMock(true);
        setApiOffline(true);
      }
    } catch {
      /* ignore */
    }
  }

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
    console.info('[MSW] Mock Service Worker active — demo user data served locally');
  } catch (err) {
    console.warn(
      '[MSW] Worker failed to start (run: npx msw init public/). Client mock fallback is still on.',
      err,
    );
  }
}
