/**
 * Deep-link when the user taps a system push notification (Capacitor).
 * Backend sends data: { type, route, param?, notificationId?, ... }
 */

import type { Screen } from '../data/mockData';

const VALID_SCREENS = new Set<string>([
  'home',
  'wallet',
  'profile',
  'deposit',
  'withdraw',
  'swap',
  'offramp',
  'onramp',
  'vault',
  'send',
  'request',
  'receive',
  'scan',
  'history',
  'notifications',
  'rewards',
  'settings',
  'security',
  'kyc',
  'chat',
  'help-center',
  'support-center',
  'giveaway',
  'request-link',
  'pay',
  'services',
  'token',
]);

export type PushNavTarget = { screen: Screen; param?: string };

/** Map FCM/Expo data payload → in-app screen. */
export function resolvePushNavigation(data: Record<string, unknown> | undefined | null): PushNavTarget {
  if (!data || typeof data !== 'object') {
    return { screen: 'notifications' };
  }
  const raw = data as Record<string, string>;
  const route = String(raw.route || raw.screen || '').toLowerCase().trim();
  const type = String(raw.type || '').toLowerCase();
  const param =
    raw.param ||
    raw.transactionId ||
    raw.depositId ||
    raw.withdrawalId ||
    raw.orderId ||
    raw.ledgerTransactionId ||
    raw.swapId ||
    raw.notificationId ||
    raw.giveawayId ||
    raw.requestId ||
    undefined;

  if (route && VALID_SCREENS.has(route)) {
    return { screen: route as Screen, param };
  }

  // Fallback by event type
  if (type.startsWith('kyc')) return { screen: 'kyc', param };
  if (type.includes('security') || type.startsWith('login')) return { screen: 'security', param };
  if (type.includes('giveaway')) return { screen: 'giveaway', param };
  if (type.includes('money_request') || type === 'payment_request') return { screen: 'request', param };
  if (type.includes('request_link')) return { screen: 'request-link', param };
  if (
    type.includes('deposit') ||
    type.includes('withdraw') ||
    type.includes('swap') ||
    type.includes('payment') ||
    type.includes('bill') ||
    type.includes('onramp') ||
    type.includes('offramp')
  ) {
    return { screen: 'history', param };
  }
  if (type.includes('reward') || type.includes('referral') || type.includes('task')) {
    return { screen: 'rewards', param };
  }
  return { screen: 'notifications', param };
}

type NavigateFn = (screen: Screen, param?: string) => void;

let listenerAttached = false;

/**
 * Register Capacitor tap listener once. Call when authenticated with navigate from useNavigation.
 */
export async function setupNotificationNavigation(navigate: NavigateFn): Promise<void> {
  try {
    const native =
      typeof window !== 'undefined' &&
      (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
    if (!native) {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;
      } catch {
        return;
      }
    }

    const { PushNotifications } = await import('@capacitor/push-notifications');

    const go = (data: Record<string, unknown> | undefined) => {
      const target = resolvePushNavigation(data);
      console.info('[native] push tap →', target.screen, target.param || '');
      try {
        // Store pending so Auth can finish first if needed
        sessionStorage.setItem(
          'convia.pendingPushNav',
          JSON.stringify({ screen: target.screen, param: target.param || null }),
        );
      } catch {
        /* ignore */
      }
      navigate(target.screen, target.param);
    };

    if (!listenerAttached) {
      await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const data = (action?.notification?.data || {}) as Record<string, unknown>;
        go(data);
      });

      // Optional: when notification arrives in foreground, still allow later tap; no auto-nav.
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.info('[native] push received (foreground)', notification?.title);
      });

      listenerAttached = true;
    }

    // Cold start: pending nav from previous sessionStorage write
    try {
      const raw = sessionStorage.getItem('convia.pendingPushNav');
      if (raw) {
        sessionStorage.removeItem('convia.pendingPushNav');
        const parsed = JSON.parse(raw) as { screen?: string; param?: string | null };
        if (parsed.screen && VALID_SCREENS.has(parsed.screen)) {
          navigate(parsed.screen as Screen, parsed.param || undefined);
        }
      }
    } catch {
      /* ignore */
    }
  } catch (e) {
    console.warn('[native] notification navigation setup skipped', e);
  }
}
