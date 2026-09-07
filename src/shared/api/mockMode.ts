type Listener = (offline: boolean) => void;
let offline = false;
const listeners = new Set<Listener>();
const FORCE_KEY = 'convia.forceMock';

export function isForceMock(): boolean {
  try { return localStorage.getItem(FORCE_KEY) === '1'; } catch { return false; }
}
export function setForceMock(on: boolean) {
  try { if (on) localStorage.setItem(FORCE_KEY, '1'); else localStorage.removeItem(FORCE_KEY); } catch { /* */ }
  setApiOffline(on || offline);
}
export function isApiOffline(): boolean { return offline || isForceMock(); }
export function setApiOffline(value: boolean) {
  const next = value || isForceMock();
  if (next === offline) return;
  offline = next;
  listeners.forEach((l) => l(offline));
}
export function subscribeApiOffline(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const MOCK_USER = {
  userId: 'mock-user-001', username: 'demo_user', displayName: 'Demo User',
  email: 'demo@convia.app', preferredCurrency: 'NGN', country: 'NG',
  accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', sessionId: 'mock-session-001',
} as const;
