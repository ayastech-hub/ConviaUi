/**
 * Capacitor / native FCM registration for ConviaMobile.
 * Primary path: window.__CONVIA_FCM_TOKEN__ injected by MainActivity.
 * Fallback: Capacitor PushNotifications plugin.
 */

import { registerPushToken } from '../api/notifications';

declare global {
  interface Window {
    __CONVIA_FCM_TOKEN__?: string;
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  }
}

function injectedToken(): string {
  try {
    return String(window.__CONVIA_FCM_TOKEN__ || '').trim();
  } catch {
    return '';
  }
}

export async function isNativeShell(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) return true;
  } catch {
    /* */
  }
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function getNativePlatform(): Promise<'ios' | 'android' | 'web'> {
  try {
    const p = window.Capacitor?.getPlatform?.();
    if (p === 'ios' || p === 'android') return p;
  } catch {
    /* */
  }
  try {
    const { Capacitor } = await import('@capacitor/core');
    const p = Capacitor.getPlatform();
    if (p === 'ios' || p === 'android') return p;
  } catch {
    /* */
  }
  return 'web';
}

let savedToken: string | null = null;
let setupStarted = false;

async function persistToken(userId: string, token: string, platform: string): Promise<boolean> {
  const t = token.trim();
  if (!t || t.length < 20) return false;
  if (savedToken === t) return true;
  try {
    await registerPushToken(userId, {
      token: t,
      platform,
      channel: 'default',
      deviceId:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `android-${Date.now()}`,
    });
    savedToken = t;
    console.info('[native] push token saved, len=', t.length);
    return true;
  } catch (e) {
    console.warn('[native] push token POST failed', e);
    return false;
  }
}

async function tryCapacitorRegister(userId: string, platform: string): Promise<void> {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') {
      console.warn('[native] notification permission', perm);
      return;
    }
    await PushNotifications.addListener('registration', (ev) => {
      void persistToken(userId, ev?.value || '', platform);
    });
    await PushNotifications.addListener('registrationError', (e) => {
      console.warn('[native] registrationError', e);
    });
    await PushNotifications.register();
  } catch (e) {
    console.warn('[native] capacitor push register failed', e);
  }
}

/**
 * Call after login. Retries: injected FCM token + Capacitor plugin.
 */
export async function setupNativePush(userId: string): Promise<{ ok: boolean; reason?: string }> {
  if (!userId) return { ok: false, reason: 'no_user' };

  const platform = await getNativePlatform();
  const native = platform === 'android' || platform === 'ios' || (await isNativeShell());

  // Always try injected token (works even if Capacitor JS detection fails)
  const inj = injectedToken();
  if (inj) {
    const ok = await persistToken(userId, inj, platform === 'web' ? 'android' : platform);
    if (ok) return { ok: true, reason: 'injected' };
  }

  if (!native && !inj) {
    // Still listen — token may arrive later from native inject
  }

  if (setupStarted && savedToken) return { ok: true, reason: 'already' };
  setupStarted = true;

  const onFcm = (ev: Event) => {
    const detail = (ev as CustomEvent).detail as { token?: string } | undefined;
    const tok = detail?.token || injectedToken();
    if (tok) void persistToken(userId, tok, platform === 'web' ? 'android' : platform);
  };
  window.addEventListener('convia-fcm', onFcm);

  if (native || platform === 'android') {
    void tryCapacitorRegister(userId, platform === 'web' ? 'android' : platform);
  }

  // Retry injected token — MainActivity may fetch FCM after first paint
  const delays = [500, 1500, 3000, 6000, 10000];
  for (const ms of delays) {
    window.setTimeout(() => {
      if (savedToken) return;
      const t = injectedToken();
      if (t) void persistToken(userId, t, platform === 'web' ? 'android' : platform);
    }, ms);
  }

  return { ok: true, reason: 'pending' };
}

export type DeviceContact = { name: string; phone: string };

export async function loadDeviceContacts(limit = 200): Promise<DeviceContact[]> {
  if (!(await isNativeShell())) return [];
  try {
    const mod = await import('@capacitor-community/contacts').catch(() => null);
    if (!mod) return [];
    const Contacts = (mod as {
      Contacts: {
        requestPermissions: () => Promise<{ contacts: string }>;
        getContacts: (opts: {
          projection: { name?: boolean; phones?: boolean };
        }) => Promise<{
          contacts: Array<{ name?: { display?: string }; phones?: Array<{ number?: string }> }>;
        }>;
      };
    }).Contacts;
    const perm = await Contacts.requestPermissions();
    if (perm.contacts !== 'granted' && perm.contacts !== 'limited') return [];
    const result = await Contacts.getContacts({ projection: { name: true, phones: true } });
    const out: DeviceContact[] = [];
    for (const c of result.contacts || []) {
      const name = c.name?.display || 'Contact';
      for (const p of c.phones || []) {
        const phone = String(p.number || '').replace(/\D/g, '');
        if (phone.length >= 7) out.push({ name, phone: phone.slice(-15) });
      }
      if (out.length >= limit) break;
    }
    return out;
  } catch (e) {
    console.warn('[native] contacts unavailable', e);
    return [];
  }
}
