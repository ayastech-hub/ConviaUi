import {
  cryptoAssets,
  portfolio,
  recentTransactions,
  notifications,
  marketData,
} from '../data/mockData';
import { MOCK_USER } from './mockMode';

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

/**
 * Path-based mock catalog used by:
 * - API client offline fallback
 * - MSW service worker handlers
 */
export function resolveMockResponse(method: string, path: string, body?: unknown): unknown | null {
  const [pathname] = path.split('?');
  const m = method.toUpperCase();

  if (m === 'POST' && pathname.includes('/auth/login')) {
    const email =
      body && typeof body === 'object' && 'email' in body
        ? String((body as { email?: string }).email || MOCK_USER.email)
        : MOCK_USER.email;
    return {
      accessToken: MOCK_USER.accessToken,
      refreshToken: MOCK_USER.refreshToken,
      sessionId: MOCK_USER.sessionId,
      userId: MOCK_USER.userId,
      username: MOCK_USER.username,
      displayName: MOCK_USER.displayName,
      preferredCurrency: MOCK_USER.preferredCurrency,
      country: MOCK_USER.country,
      email,
    };
  }
  if (m === 'POST' && pathname.includes('/auth/register')) {
    return {
      accessToken: MOCK_USER.accessToken,
      refreshToken: MOCK_USER.refreshToken,
      sessionId: MOCK_USER.sessionId,
      userId: MOCK_USER.userId,
      username: MOCK_USER.username,
      displayName: MOCK_USER.displayName,
      preferredCurrency: MOCK_USER.preferredCurrency,
      country: MOCK_USER.country,
    };
  }
  if (m === 'POST' && pathname.includes('/auth/refresh')) {
    return { accessToken: MOCK_USER.accessToken, refreshToken: MOCK_USER.refreshToken };
  }
  if (m === 'POST' && pathname.includes('/auth/logout')) return { ok: true };

  // Mutations → soft success so UI flows complete offline
  if (m !== 'GET' && m !== 'HEAD') {
    if (
      pathname.includes('/swap') ||
      pathname.includes('/withdraw') ||
      pathname.includes('/deposit') ||
      pathname.includes('/fiat') ||
      pathname.includes('/on-ramp') ||
      pathname.includes('/off-ramp') ||
      pathname.includes('/money-request') ||
      pathname.includes('/bills') ||
      pathname.includes('/payments') ||
      pathname.includes('/kyc') ||
      pathname.includes('/profile') ||
      pathname.includes('/security') ||
      pathname.includes('/pin')
    ) {
      return { ok: true, status: 'pending', id: `mock-${Date.now()}`, mock: true };
    }
  }

  if (m === 'GET' || m === 'HEAD') {
    if (pathname.includes('/health') || pathname === '/' || pathname === '') {
      return { status: 'ok', mock: true };
    }
    if (pathname.startsWith('/portfolio/')) {
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
          direction: t.type === 'receive' || t.type === 'deposit' ? 'credit' : 'debit',
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
            address: '0xmock',
            asset: a.symbol,
            ledgerBalance: String(a.balance),
            onChainBalance: String(a.balance),
            inSync: true,
          })),
      };
    }
    if (pathname.includes('/addresses')) {
      return [
        { chainFamily: 'evm', address: '0xDemoEvmAddress000000000000000000000001' },
        { chainFamily: 'solana', address: 'DemoSolAddress1111111111111111111111111' },
      ];
    }
    if (pathname.includes('/deposit-info') || pathname.includes('/deposit')) {
      return {
        address: '0xDemoDepositAddress000000000000000001',
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
        readAt: n.read ? new Date().toISOString() : null,
        createdAt: n.time,
      }));
    }
    if (pathname.includes('/profiles/me') || pathname.includes('/profile')) {
      return {
        userId: MOCK_USER.userId,
        username: MOCK_USER.username,
        displayName: MOCK_USER.displayName,
        email: MOCK_USER.email,
        country: MOCK_USER.country,
        preferredCurrency: MOCK_USER.preferredCurrency,
        bio: 'Exploring Convia in demo mode',
        avatarUrl: null,
        kycStatus: 'approved',
      };
    }
    if (pathname.includes('/kyc') || pathname.includes('/compliance')) {
      return { status: 'approved', kycStatus: 'approved' };
    }
    if (pathname.includes('transaction-pin') || pathname.includes('/pin')) {
      return { hasPin: true, set: true };
    }
    if (pathname.includes('/sessions')) {
      return [
        {
          id: 's1',
          userAgent: 'Demo Browser',
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString(),
        },
      ];
    }
    if (pathname.includes('/rewards')) {
      return {
        points: 1250,
        balance: 1250,
        tasks: [
          { id: 't1', title: 'Complete KYC', points: 100, done: true },
          { id: 't2', title: 'First deposit', points: 50, done: false },
        ],
        badges: [{ id: 'b1', name: 'Early Adopter' }],
      };
    }
    if (pathname.includes('/countries') || pathname.includes('/markets')) {
      return {
        countries: [
          { code: 'NG', name: 'Nigeria' },
          { code: 'GH', name: 'Ghana' },
          { code: 'KE', name: 'Kenya' },
        ],
      };
    }
    if (pathname.includes('/prices') || pathname.includes('/market')) {
      return { items: marketData };
    }
    if (pathname.includes('/banks') || pathname.includes('/payment-methods')) {
      return { banks: [], methods: [] };
    }
    if (pathname.includes('/platform') || pathname.includes('/status')) {
      return { maintenance: false, message: null };
    }
  }

  return null;
}
