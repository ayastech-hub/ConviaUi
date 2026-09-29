/** Persist payment deep-link code across login/signup without losing it on auth race. */

const KEY = 'convia.pendingPay';

export function getPendingPay(): string {
  try {
    const a = sessionStorage.getItem(KEY) || '';
    if (a.trim()) return a.trim();
  } catch {
    /* ignore */
  }
  try {
    const b = localStorage.getItem(KEY) || '';
    if (b.trim()) return b.trim();
  } catch {
    /* ignore */
  }
  return '';
}

export function setPendingPay(code: string) {
  const c = (code || '').trim();
  if (!c) return;
  try {
    sessionStorage.setItem(KEY, c);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(KEY, c);
  } catch {
    /* ignore */
  }
}

/** Clear only after Pay screen has the code mounted / payment done. */
export function clearPendingPay() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
