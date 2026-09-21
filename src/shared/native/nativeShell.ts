/**
 * Capacitor shell integration (ConviaMobile).
 * Safe no-ops when running in a normal browser.
 */

import { registerPushToken } from '../api/notifications';

export async function isNativeShell(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function getNativePlatform(): Promise<'ios' | 'android' | 'web'> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    const p = Capacitor.getPlatform();
    if (p === 'ios' || p === 'android') return p;
  } catch {
    /* web */
  }
  return 'web';
}

/** Register FCM/APNs token with backend after login. */
export async function setupNativePush(userId: string): Promise<void> {
  if (!(await isNativeShell())) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const platform = await getNativePlatform();

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') return;

    await PushNotifications.register();

    await PushNotifications.addListener('registration', (t) => {
      const token = t.value;
      if (!token) return;
      void registerPushToken(userId, {
        token,
        platform,
        channel: 'default',
        deviceId: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : undefined,
      }).catch((e) => console.warn('[native] push token register failed', e));
    });

    await PushNotifications.addListener('registrationError', (e) => {
      console.warn('[native] push registration error', e);
    });
  } catch (e) {
    console.warn('[native] push setup skipped', e);
  }
}

export type DeviceContact = { name: string; phone: string };

/** Read device contacts when running in ConviaMobile. */
export async function loadDeviceContacts(limit = 200): Promise<DeviceContact[]> {
  if (!(await isNativeShell())) return [];
  try {
    const mod = await import('@capacitor-community/contacts').catch(() => null);
    if (!mod) return [];
    const Contacts = (mod as { Contacts: {
      requestPermissions: () => Promise<{ contacts: string }>;
      getContacts: (opts: { projection: { name?: boolean; phones?: boolean } }) => Promise<{
        contacts: Array<{ name?: { display?: string }; phones?: Array<{ number?: string }> }>;
      }>;
    } }).Contacts;
    const perm = await Contacts.requestPermissions();
    if (perm.contacts !== 'granted' && perm.contacts !== 'limited') return [];
    const result = await Contacts.getContacts({
      projection: { name: true, phones: true },
    });
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
