import { cryptoAssets, portfolio, recentTransactions, notifications } from '../data/mockData';
import { MOCK_USER } from './mockMode';

export function resolveMockResponse(method: string, path: string, body?: unknown): unknown | null {
  const [pathname] = path.split('?');
  const m = method.toUpperCase();
  if (m === 'POST' && pathname.includes('/auth/login')) {
    return { ...MOCK_USER, email: (body as {email?:string})?.email || MOCK_USER.email };
  }
  if (m === 'POST' && pathname.includes('/auth/register')) return { ...MOCK_USER };
  if (m !== 'GET') return m === 'POST' ? { ok: true, mock: true, id: `mock-${Date.now()}` } : null;
  if (pathname.startsWith('/portfolio/')) {
    return {
      totalValueUsd: String(portfolio.totalUSD),
      holdings: cryptoAssets.filter(a => a.balance > 0).map(a => ({
        asset: a.symbol, quantity: String(a.balance), priceUsd: String(a.price), valueUsd: String(a.valueUSD),
      })),
    };
  }
  if (pathname.includes('/transactions')) {
    return { items: recentTransactions.map(t => ({
      id: t.id, kind: 'ledger', type: t.type, status: t.status, createdAt: t.time,
      asset: t.asset, amount: String(t.amount), direction: 'debit', txHash: t.hash || null, chainKey: null,
    })), nextCursor: null };
  }
  if (pathname.includes('/tokens')) {
    return { tokens: cryptoAssets.map(a => ({ symbol: a.symbol, name: a.name, chains: (a.chains||[]).map(c => ({ chainKey: c, chainName: c })) })) };
  }
  if (pathname.includes('/notifications')) return notifications;
  if (pathname.includes('/profiles/me')) return { ...MOCK_USER, bio: '', avatarUrl: null, kycStatus: 'approved' };
  return null;
}
