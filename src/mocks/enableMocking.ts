/**
 * Start MSW when:
 * - Vite dev mode (default), unless VITE_USE_MSW=false
 * - or VITE_USE_MSW=true (preview/prod demo)
 * - or localStorage convia.forceMock=1
 *
 * Service Worker intercepts fetch → mockHandlers; app code unchanged.
 */
export async function enableMocking(): Promise<void> {
  const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
  let force = false;
  try {
    force = localStorage.getItem('convia.forceMock') === '1';
  } catch {
    /* ignore */
  }
  const useMsw =
    force ||
    env.VITE_USE_MSW === 'true' ||
    (env.DEV && env.VITE_USE_MSW !== 'false');

  if (!useMsw) return;

  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: false,
    serviceWorker: {
      url: `${env.BASE_URL || '/'}mockServiceWorker.js`,
    },
  });
  // Mark offline helper so OfflineBanner can show demo strip
  try {
    const { setApiOffline } = await import('../shared/api/mockMode');
    if (force || env.VITE_USE_MSW === 'true') setApiOffline(true);
  } catch {
    /* ignore */
  }
  console.info('[MSW] Mock Service Worker active — API calls served from local mockData');
}
