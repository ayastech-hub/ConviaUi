import { motion } from 'motion/react';
import { Eye, EyeOff, TrendingUp, Loader } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { useAuth } from '../../../shared/context/AuthContext';

interface PortfolioHeroCardProps {
  balanceVisible: boolean;
  onToggleVisibility: () => void;
}

/**
 * Home hero balance from GET /portfolio/:userId only — no mock balances or mock charts.
 */
export function PortfolioHeroCard({ balanceVisible, onToggleVisibility }: PortfolioHeroCardProps) {
  const { format, currency } = useCurrency();
  const { status } = useAuth();
  const { data, loading, source } = usePortfolio();

  const totalUSD = data ? Number(data.totalValueUsd) || 0 : 0;
  const rate = currency?.rate && currency.rate > 0 ? currency.rate : 1;
  const localApprox = totalUSD * rate;

  // Flat sparkline from live total only (no fabricated history)
  const chartData = useMemo(
    () =>
      totalUSD > 0
        ? Array.from({ length: 12 }, (_, i) => ({ i, value: totalUSD }))
        : [],
    [totalUSD],
  );

  return (
    <div className="px-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] overflow-hidden p-5 glass-card glass-refraction"
        style={{
          background: 'var(--card)',
          boxShadow: '0 20px 60px var(--border)',
          border: '1px solid var(--muted)',
        }}
      >
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              Total Portfolio
              {source === 'live' && (
                <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--positive)' }}>LIVE</span>
              )}
            </p>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onToggleVisibility} aria-label="Toggle balance visibility">
              {balanceVisible ? (
                <Eye size={16} style={{ color: 'var(--muted-foreground)' }} />
              ) : (
                <EyeOff size={16} style={{ color: 'var(--muted-foreground)' }} />
              )}
            </motion.button>
          </div>

          {loading || status === 'loading' ? (
            <div className="flex items-center gap-2 mb-1" style={{ height: 40 }}>
              <Loader size={18} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ) : balanceVisible ? (
            <p className="text-white mb-1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
              {format(totalUSD)}
            </p>
          ) : (
            <p className="text-white mb-1" style={{ fontSize: 36, fontWeight: 800 }}>
              ••••••
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>
            {balanceVisible
              ? currency?.code && currency.code !== 'USD'
                ? `≈ ${currency.symbol || ''}${(localApprox || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency.code}`
                : source === 'live' || status === 'authenticated'
                  ? (totalUSD === 0 ? 'Ledger total · $0.00' : 'Ledger total')
                  : 'Sign in for live balance'
              : '••••'}
          </p>

          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={14} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {status === 'anonymous'
                ? 'Sign in to see your live balance'
                : source === 'live'
                  ? `${data?.holdings?.length ?? 0} funded assets · others show 0`
                  : status === 'authenticated'
                    ? '0 funded assets'
                    : 'Connect API to load portfolio'}
            </span>
          </div>

          {chartData.length > 0 && (
            <div style={{ height: 56, marginLeft: -8, marginRight: -8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#pfGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
