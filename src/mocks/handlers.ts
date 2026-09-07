import { http, HttpResponse, bypass } from 'msw';
import { resolveMockResponse } from '../shared/api/mockHandlers';

function isApiUrl(url: URL): boolean {
  const host = url.host;
  if (
    host.includes('localhost:4000') ||
    host.includes('127.0.0.1:4000') ||
    host.includes('coviabackend-production.up.railway.app')
  ) {
    return true;
  }
  const p = url.pathname;
  return (
    p.startsWith('/auth/') ||
    p.startsWith('/portfolio/') ||
    p.startsWith('/users/') ||
    p.startsWith('/tokens') ||
    p.startsWith('/chains') ||
    p.startsWith('/wallets/') ||
    p.startsWith('/notifications') ||
    p.startsWith('/profiles') ||
    p.startsWith('/rewards') ||
    p.startsWith('/swap') ||
    p.startsWith('/fiat') ||
    p.startsWith('/compliance') ||
    p.startsWith('/kyc') ||
    p.startsWith('/security') ||
    p.startsWith('/banks') ||
    p.startsWith('/bills') ||
    p.startsWith('/payments') ||
    p.startsWith('/platform') ||
    p === '/health'
  );
}

async function mock(method: string, request: Request) {
  const url = new URL(request.url);
  const path = url.pathname + url.search;
  let body: unknown;
  try {
    if (method !== 'GET' && method !== 'HEAD') body = await request.clone().json();
  } catch {
    body = undefined;
  }
  const data = resolveMockResponse(method, path, body);
  if (data === null) {
    return HttpResponse.json(method === 'GET' ? {} : { ok: true, mock: true });
  }
  return HttpResponse.json(data);
}

/**
 * MSW handlers scoped to Convia backend hosts/paths.
 * Vite assets & HMR are never intercepted.
 */
export const handlers = [
  http.all('*', async ({ request }) => {
    const url = new URL(request.url);
    if (!isApiUrl(url)) {
      return; // passthrough
    }
    return mock(request.method, request);
  }),
];
