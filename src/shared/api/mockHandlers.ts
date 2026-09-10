import {
  cryptoAssets,
  portfolio,
  recentTransactions,
  notifications,
  marketData,
} from '../data/mockData';
import { MOCK_USER, MOCK_BANK_ACCOUNTS, MOCK_DIRECTORY_BANKS } from './mockMode';

function holdings() {
  return cryptoAssets
    .filter((a) => a.balance > 0)
    .map((a) => ({
      asset: a.symbol,
      quantity: String(a.balance),
      priceUsd: String(a.price),
      valueUsd: String(a.valueUSD),
    }));
}

function tokens() {
  return {
    tokens: cryptoAssets.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      chains: (a.chains || []).map((c) => ({
        chainKey: String(c).toLowerCase().replace(/\s+/g, '-'),
        chainName: c,
        name: c,
        key: String(c).toLowerCase().replace(/\s+/g, '-'),
      })),
    })),
  };
}

function authPayload(email?: string) {
  return {
    accessToken: MOCK_USER.accessToken,
    refreshToken: MOCK_USER.refreshToken,
    sessionId: MOCK_USER.sessionId,
    userId: MOCK_USER.userId,
    username: MOCK_USER.username,
    displayName: MOCK_USER.displayName,
    preferredCurrency: MOCK_USER.preferredCurrency,
    country: MOCK_USER.country,
    email: email || MOCK_USER.email,
    kycStatus: MOCK_USER.kycStatus,
  };
}

function profilePayload() {
  return {
    userId: MOCK_USER.userId,
    username: MOCK_USER.username,
    displayName: MOCK_USER.displayName,
    email: MOCK_USER.email,
    country: MOCK_USER.country,
    preferredCurrency: MOCK_USER.preferredCurrency,
    phone: MOCK_USER.phone,
    bio: MOCK_USER.bio,
    avatarUrl: MOCK_USER.avatarUrl,
    kycStatus: MOCK_USER.kycStatus,
    status: MOCK_USER.kycStatus,
    isFrozen: MOCK_USER.isFrozen,
    frozenReason: MOCK_USER.frozenReason,
    hasPin: MOCK_USER.hasPin,
  };
}

/**
 * Path-based mock catalog — full feature surface for demo user.
 */
export function resolveMockResponse(method: string, path: string, body?: unknown): unknown | null {
  const [pathname] = path.split('?');
  const m = method.toUpperCase();

  // Auth
  if (m === 'POST' && pathname.includes('/auth/login')) {
    const email =
      body && typeof body === 'object' && 'email' in body
        ? String((body as { email?: string }).email || MOCK_USER.email)
        : MOCK_USER.email;
    return authPayload(email);
  }
  if (m === 'POST' && pathname.includes('/auth/register')) return authPayload();
  if (m === 'POST' && pathname.includes('/auth/refresh')) {
    return { accessToken: MOCK_USER.accessToken, refreshToken: MOCK_USER.refreshToken };
  }
  if (m === 'POST' && pathname.includes('/auth/logout')) return { ok: true };
  if (m === 'POST' && pathname.includes('/auth/change-password')) return { ok: true };

  // Soft-success mutations so flows complete offline
  if (m !== 'GET' && m !== 'HEAD') {
    
    if (pathname.includes('/vault/quote') || pathname.includes('/vault/execute')) {
      const b = (body || {}) as Record<string, string>;
      const amount = Number(b.amountNgn || b.amountUsd || b.amountStable || 100);
      const rate = 1500;
      const feeBps = 100; // 1%
      const gross = b.amountNgn ? amount / rate : amount;
      const fee = gross * (feeBps / 10000);
      const net = gross - fee;
      if (pathname.includes('/execute')) {
        return {
          ok: true,
          ledgerTransactionId: `vault-tx-${Date.now()}`,
          quoteId: b.quoteId || 'q-mock',
          amountIn: String(amount),
          amountOut: net.toFixed(2),
          status: 'completed',
        };
      }
      return {
        quoteId: `q-${Date.now()}`,
        side: 'ngn_to_vault',
        amountIn: String(amount),
        assetIn: b.amountNgn ? 'NGN' : 'USDT',
        amountOut: net.toFixed(2),
        assetOut: 'USDT',
        rate: String(rate),
        feeAmount: fee.toFixed(2),
        feeAsset: 'USDT',
        feeBps,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      };
    }

    if (pathname.includes('/swap')) {
      const b = (body || {}) as Record<string, string>;
      return {
        ok: true,
        status: 'completed',
        ledgerTransactionId: `mock-swap-${Date.now()}`,
        fromAsset: b.fromAsset || 'USDT',
        toAsset: b.toAsset || 'ETH',
        amountIn: b.amount || '10',
        amountOut: String(Number(b.amount || 10) * 0.0003),
        rate: '0.0003',
        fee: '0.1',
        mock: true,
      };
    }
    if (
      pathname.includes('/withdraw') ||
      pathname.includes('/deposit') ||
      pathname.includes('/fiat') ||
      pathname.includes('/on-ramp') ||
      pathname.includes('/onramp') ||
      pathname.includes('/off-ramp') ||
      pathname.includes('/offramp') ||
      pathname.includes('/money-request') ||
      pathname.includes('/bills') ||
      pathname.includes('/payments') ||
      pathname.includes('/kyc') ||
      pathname.includes('/profile') ||
      pathname.includes('/security') ||
      pathname.includes('/pin') ||
      pathname.includes('/send') ||
      pathname.includes('/transfer') ||
      pathname.includes('/vault')
    ) {
      return {
        ok: true,
        status: 'pending',
        id: `mock-${Date.now()}`,
        ledgerTransactionId: `mock-tx-${Date.now()}`,
        mock: true,
      };
    }
  }

  if (m === 'GET' || m === 'HEAD') {
    if (pathname.includes('/health') || pathname === '/' || pathname === '') {
      return { status: 'ok', mock: true };
    }
    if (pathname.startsWith('/portfolio/') || pathname.includes('/portfolio')) {
      return { totalValueUsd: String(portfolio.totalUSD ?? 9539.4), holdings: holdings() };
    }
    if (pathname.includes('/transactions')) {
      return {
        items: recentTransactions.map((t) => ({
          id: t.id,
          kind: 'ledger',
          type: t.type,
          status: t.status,
          createdAt: t.time,
          asset: t.asset,
          amount: String(t.amount),
          assetTo: t.assetTo || null,
          amountTo: t.amountTo != null ? String(t.amountTo) : null,
          direction: t.type === 'receive' || t.type === 'deposit' || t.type === 'buy' ? 'credit' : 'debit',
          txHash: t.hash || null,
          chainKey: null,
        })),
        nextCursor: null,
        count: recentTransactions.length,
      };
    }
    if (pathname.includes('/tokens')) return tokens();
    if (pathname.includes('/chains')) {
      const keys = new Set<string>();
      cryptoAssets.forEach((a) => (a.chains || []).forEach((c) => keys.add(String(c))));
      return {
        chains: Array.from(keys).map((c) => ({
          chainKey: c.toLowerCase().replace(/\s+/g, '-'),
          name: c,
          family: 'evm',
        })),
      };
    }
    if (pathname.includes('/balances')) {
      return {
        userId: MOCK_USER.userId,
        balances: cryptoAssets
          .filter((a) => a.balance > 0)
          .map((a) => ({
            chainKey: (a.chains?.[0] || 'ethereum').toLowerCase(),
            chainFamily: 'evm',
            address: '0xDemoEvmAddress000000000000000000000001',
            asset: a.symbol,
            ledgerBalance: String(a.balance),
            onChainBalance: String(a.balance),
            inSync: true,
          })),
      };
    }
    if (pathname.includes('/addresses') || pathname.includes('/deposit-info') || pathname.includes('/deposit')) {
      return {
        address: '0xDemoDepositAddressAda00000000000000001',
        addresses: [
          { chainFamily: 'evm', address: '0xDemoEvmAddress000000000000000000000001' },
          { chainFamily: 'solana', address: 'DemoSolAddressAda1111111111111111111' },
        ],
        chainName: 'Ethereum',
        requiredConfirmations: 12,
        contractAddress: null,
      };
    }
    if (pathname.includes('/notifications')) {
      return notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        readAt: n.read ? n.time : null,
        createdAt: n.time,
        payload: null,
      }));
    }
    
    if (pathname.includes('/vault/') && pathname.includes('/activity')) {
      return {
        items: [
          {
            id: 'v1',
            type: 'vault_in',
            amountUsd: '66.00',
            amountNgn: '99000',
            status: 'completed',
            createdAt: new Date(Date.now() - 3600e3).toISOString(),
          },
          {
            id: 'v2',
            type: 'vault_out',
            amountUsd: '20.00',
            amountNgn: '30000',
            status: 'completed',
            createdAt: new Date(Date.now() - 86400e3).toISOString(),
          },
        ],
      };
    }
    if (pathname.includes('/vault')) {
      return {
        totalUsd: '1240.00',
        usdt: '800.00',
        usdc: '440.00',
        ngnEquivalent: '1860000',
        rateNgnPerUsd: '1500',
      };
    }

    if (pathname.includes('/profiles/me') || pathname.includes('/profile')) {
      return profilePayload();
    }
    if (pathname.includes('/kyc') || pathname.includes('/compliance')) {
      return {
        status: 'approved',
        kycStatus: 'approved',
        level: 2,
        submittedAt: '2025-11-01T10:00:00Z',
        approvedAt: '2025-11-02T14:30:00Z',
      };
    }
    if (pathname.includes('transaction-pin') || pathname.includes('/pin')) {
      return { hasPin: true, set: true };
    }
    if (pathname.includes('/sessions')) {
      return [
        {
          id: MOCK_USER.sessionId,
          userAgent: 'Demo Browser · Lagos',
          ipAddress: '102.89.x.x',
          createdAt: new Date().toISOString(),
          current: true,
        },
        {
          id: 'sess_old_1',
          userAgent: 'iPhone · Safari',
          ipAddress: '105.112.x.x',
          createdAt: '2026-08-01T08:00:00Z',
          current: false,
        },
      ];
    }
    if (pathname.includes('/rewards')) {
      return {
        points: 1250,
        balance: 1250,
        tasks: [
          { id: 't1', title: 'Complete KYC', points: 100, done: true },
          { id: 't2', title: 'First deposit', points: 50, done: true },
          { id: 't3', title: 'First swap', points: 25, done: false },
        ],
        badges: [{ id: 'b1', name: 'Verified' }, { id: 'b2', name: 'Early Adopter' }],
      };
    }
    if (pathname.includes('/countries') || pathname.includes('/markets')) {
      return {
        countries: [
          { code: 'NG', name: 'Nigeria', currency: 'NGN' },
          { code: 'GH', name: 'Ghana', currency: 'GHS' },
          { code: 'KE', name: 'Kenya', currency: 'KES' },
          { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
        ],
      };
    }
    if (pathname.includes('/prices') || pathname.includes('/market')) {
      return { items: marketData };
    }
    if (pathname.includes('/bank-accounts') || pathname.includes('/payment-methods') || pathname.includes('/payment_methods')) {
      return { banks: MOCK_BANK_ACCOUNTS, methods: MOCK_BANK_ACCOUNTS, accounts: MOCK_BANK_ACCOUNTS };
    }
    if (pathname.includes('/banks')) {
      // Directory for add-bank: ?country=XX
      const qIdx = path.indexOf('?');
      let country = 'NG';
      if (qIdx >= 0) {
        try {
          const params = new URLSearchParams(path.slice(qIdx));
          country = (params.get('country') || 'NG').toUpperCase();
        } catch { /* */ }
      }
      const list = MOCK_DIRECTORY_BANKS[country] || MOCK_DIRECTORY_BANKS.NG || [];
      return { country, currency: country === 'NG' ? 'NGN' : country === 'GH' ? 'GHS' : country === 'KE' ? 'KES' : 'ZAR', banks: list };
    }
    if (pathname.includes('/eligibility') || pathname.includes('/offramp') || pathname.includes('/onramp')) {
      return {
        action: 'ok',
        canProceed: true,
        kycStatus: 'approved',
        hasPaymentDetails: true,
        banks: MOCK_BANK_ACCOUNTS,
      };
    }
    if (pathname.includes('/quote') || pathname.includes('/rates')) {
      return {
        rate: '1650',
        fiatCurrency: 'NGN',
        amountIn: '100',
        amountOut: '0.06',
        fee: '1.5',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      };
    }
    if (pathname.includes('/platform') || pathname.includes('/status')) {
      return { maintenance: false, message: null };
    }
    if (pathname.includes('/whitelist')) {
      return {
        addresses: [
          {
            id: 'wl1',
            address: '0xWhitelistedAda0000000000000000000001',
            chainKey: 'ethereum',
            label: 'Cold wallet',
            status: 'active',
          },
        ],
      };
    }
  }

  return null;
}
