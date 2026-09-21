/**
 * Capacitor shell integration (ConviaMobile).
 * Safe no-ops in a normal browser.
 *
 * Android system push requires google-services.json in the native app
 * (Firebase → Android app package com.ayastech.convia). Without it,
 * PushNotifications.register() never yields an FCM token.
 */

import { registerPushToken } from '../api/notifications';

async function loadCapacitor(): Promise<typeof import('@capacitor/core') | null> {
  try {
    return await import('@capacitor/core');
  } catch {
    return null;
  }
}

export async function isNativeShell(): Promise<boolean> {
  const cap = await loadCapacitor();
  if (!cap) return false;
  try {
    return cap.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function getNativePlatform(): Promise<'ios' | 'android' | 'web'> {
  const cap = await loadCapacitor();
  if (!cap) return 'web';
  try {
    const p = cap.Capacitor.getPlatform();
    if (p === 'ios' || p === 'android') return p;
  } catch {
    /* web */
  }
  return 'web';
}

let pushSetupForUser: string | null = null;

/** Register FCM/APNs token with backend after login. Idempotent per user session. */
export async function setupNativePush(userId: string): Promise<{ ok: boolean; reason?: string }> {
  if (!userId) return { ok: false, reason: 'no_user' };
  if (!(await isNativeShell())) return { ok: false, reason: 'not_native' };
  if (pushSetupForUser === userId) return { ok: true, reason: 'already_setup' };

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const platform = await getNativePlatform();

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') {
      console.warn('[native] push permission not granted', perm);
      return { ok: false, reason: 'permission_denied' };
    }

    // Listeners must be attached before register()
    await PushNotifications.addListener('registration', (t) => {
      const token = (t?.value || '').trim();
      if (!token) {
        console.warn('[native] empty push token');
        return;
      }
      console.info('[native] FCM/APNs token received, length=', token.length);
      void registerPushToken(userId, {
        token,
        platform,
        channel: 'default',
        deviceId:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `device-${Date.now()}`,
      })
        .then(() => console.info('[native] push token saved to backend'))
        .catch((e) => console.warn('[native] push token register failed', e));
    });

    await PushNotifications.addListener('registrationError', (e) => {
      console.warn('[native] push registrationError — often missing google-services.json', e);
    });

    await PushNotifications.register();
    pushSetupForUser = userId;
    return { ok: true };
  } catch (e) {
    console.warn('[native] push setup skipped', e);
    return { ok: false, reason: 'exception' };
  }
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
