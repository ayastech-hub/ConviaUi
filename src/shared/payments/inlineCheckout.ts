/**
 * In-app card checkout overlays (no full-page redirect when possible).
 * FlutterwaveCheckout + MonnifySDK — card/OTP on top of Convia UI.
 */

const CONVIA_PRIMARY = '#4A9B92';
const CONVIA_LOGO =
  typeof window !== 'undefined'
    ? `${window.location.origin}/favicon.ico`
    : 'https://convia-ui.vercel.app/favicon.ico';

export type HostedFieldsAction = {
  type: 'HOSTED_FIELDS';
  publicKey: string;
  provider: string;
  clientReference: string;
  contractCode?: string;
  amount?: string;
  currency?: string;
};

export type InlineCheckoutInput = {
  action: HostedFieldsAction;
  amount: string;
  currency: string;
  email: string;
  customerName?: string;
  description?: string;
};

export type InlineCheckoutResult =
  | { status: 'completed'; providerRef?: string; raw?: unknown }
  | { status: 'closed' }
  | { status: 'error'; message: string };

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('no_document'));
      return;
    }
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed_to_load:${id}`));
    document.body.appendChild(s);
  });
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (opts: Record<string, unknown>) => void;
    MonnifySDK?: {
      initialize: (opts: Record<string, unknown>) => void;
    };
  }
}

async function openFlutterwave(input: InlineCheckoutInput): Promise<InlineCheckoutResult> {
  await loadScript('https://checkout.flutterwave.com/v3.js', 'flutterwave-checkout-v3');
  if (!window.FlutterwaveCheckout) {
    return { status: 'error', message: 'Flutterwave checkout failed to load' };
  }
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: 'error', message: 'Invalid amount' };
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = (r: InlineCheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    window.FlutterwaveCheckout!({
      public_key: input.action.publicKey,
      tx_ref: input.action.clientReference,
      amount,
      currency: (input.currency || input.action.currency || 'NGN').toUpperCase(),
      payment_options: 'card',
      customer: {
        email: input.email,
        name: input.customerName || 'Convia user',
      },
      customizations: {
        title: 'Convia',
        description: input.description || 'Wallet top-up',
        logo: CONVIA_LOGO,
        // Some checkout builds honor theme / button color
        theme: CONVIA_PRIMARY,
      },
      meta: {
        source: 'convia_inline',
      },
      callback: (response: { transaction_id?: string | number; flw_ref?: string; status?: string }) => {
        const st = String(response?.status || '').toLowerCase();
        if (st === 'successful' || st === 'success' || st === 'completed') {
          done({
            status: 'completed',
            providerRef: String(response.transaction_id || response.flw_ref || ''),
            raw: response,
          });
        } else {
          done({ status: 'closed' });
        }
      },
      onclose: () => done({ status: 'closed' }),
    });
  });
}

async function openMonnify(input: InlineCheckoutInput): Promise<InlineCheckoutResult> {
  await loadScript('https://sdk.monnify.com/plugin/monnify.js', 'monnify-sdk');
  if (!window.MonnifySDK?.initialize) {
    return { status: 'error', message: 'Monnify checkout failed to load' };
  }
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: 'error', message: 'Invalid amount' };
  }
  const contractCode = input.action.contractCode;
  if (!contractCode) {
    return { status: 'error', message: 'Monnify contract code missing' };
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = (r: InlineCheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    window.MonnifySDK!.initialize({
      amount,
      currency: 'NGN',
      reference: input.action.clientReference,
      customerFullName: input.customerName || 'Convia User',
      customerEmail: input.email,
      apiKey: input.action.publicKey,
      contractCode,
      paymentDescription: input.description || 'Convia wallet top-up',
      metadata: { source: 'convia_inline' },
      // Brand alignment (SDK supports limited styling)
      incomeSplitConfig: undefined,
      onComplete: (response: {
        paymentStatus?: string;
        status?: string;
        transactionReference?: string;
        paymentReference?: string;
      }) => {
        const st = String(response?.paymentStatus || response?.status || '').toUpperCase();
        if (st === 'PAID' || st === 'SUCCESS' || st === 'COMPLETED' || st === 'SUCCESSFUL') {
          done({
            status: 'completed',
            providerRef: String(response.transactionReference || response.paymentReference || ''),
            raw: response,
          });
        } else {
          done({ status: 'closed' });
        }
      },
      onClose: () => done({ status: 'closed' }),
    });
  });
}

/** Open provider overlay on the current page (card + OTP). */
export async function openInlineCardCheckout(input: InlineCheckoutInput): Promise<InlineCheckoutResult> {
  const provider = (input.action.provider || '').toLowerCase();
  if (provider === 'flutterwave') return openFlutterwave(input);
  if (provider === 'monnify') return openMonnify(input);
  return { status: 'error', message: `Unsupported inline provider: ${provider}` };
}
