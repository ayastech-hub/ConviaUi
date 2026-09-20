import * as securityApi from '../api/security';

export type PinGuardResult =
  | { ok: true; hasPin: true }
  | { ok: false; hasPin: false; message: string }
  | { ok: false; hasPin: null; message: string };

let cache: { userId: string; hasPin: boolean; at: number } | null = null;
const TTL_MS = 60_000;

export function invalidatePinStatusCache() {
  cache = null;
}

/** Returns whether the user has a transaction PIN set (cached briefly). */
export async function ensureTransactionPin(userId: string | null | undefined): Promise<PinGuardResult> {
  if (!userId) {
    return { ok: false, hasPin: null, message: 'Sign in to continue' };
  }
  if (cache && cache.userId === userId && Date.now() - cache.at < TTL_MS) {
    if (cache.hasPin) return { ok: true, hasPin: true };
    return {
      ok: false,
      hasPin: false,
      message: 'Set a transaction PIN before you send, withdraw, swap, or claim funds.',
    };
  }
  try {
    const s = await securityApi.getTransactionPinStatus(userId);
    const hasPin = Boolean(
      (s as { hasPin?: boolean }).hasPin
      ?? (s as { isSet?: boolean }).isSet
      ?? (s as { set?: boolean }).set
    );
    cache = { userId, hasPin, at: Date.now() };
    if (hasPin) return { ok: true, hasPin: true };
    return {
      ok: false,
      hasPin: false,
      message: 'Set a transaction PIN before you send, withdraw, swap, or claim funds.',
    };
  } catch {
    return {
      ok: false,
      hasPin: null,
      message: 'Could not verify PIN status. Open Security to set your transaction PIN.',
    };
  }
}

/** Call after user successfully sets PIN so guards see it immediately. */
export function markPinConfigured(userId: string) {
  cache = { userId, hasPin: true, at: Date.now() };
}
