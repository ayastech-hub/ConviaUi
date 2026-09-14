type Listener = (offline: boolean) => void;
let offline = false;
const listeners = new Set<Listener>();

/** Mocks permanently off for production user UI. */
export function isForceMock(): boolean {
  return false;
}
export function setForceMock(_on: boolean) {
  try {
    localStorage.removeItem('convia.forceMock');
  } catch {
    /* */
  }
}
export function isApiOffline(): boolean {
  return offline;
}
export function setApiOffline(value: boolean) {
  if (value === offline) return;
  offline = value;
  listeners.forEach((l) => l(offline));
}
export function subscribeApiOffline(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
