import { motion } from 'motion/react';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { portfolio, portfolioChartData } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';

interface PortfolioHeroCardProps {
  balanceVisible: boolean;
  onToggleVisibility: () => void;
}

/** The big balance card at the top of Home, with the 24h change and mini trend chart. */
export function PortfolioHeroCard({ balanceVisible, onToggleVisibility }: PortfolioHeroCardProps) {
  const { format } = useCurrency();

  return (
    <div className="px-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] overflow-hidden p-5 glass-card glass-refraction"
        style={{ background: 'var(--card)', boxShadow: '0 20px 60px var(--border)', border: '1px solid var(--muted)' }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[24px]" style={{ position: 'relative' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'transparent', transform: 'translate(20%, -30%)' }} />
          <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full opacity-10" style={{ background: 'transparent', transform: 'translateY(40%)' }} />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Total Portfolio</p>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onToggleVisibility} aria-label="Toggle balance visibility">
              {balanceVisible ? <Eye size={16} style={{ color: 'var(--muted-foreground)' }} /> : <EyeOff size={16} style={{ color: 'var(--muted-foreground)' }} />}
            </motion.button>
          </div>

          {balanceVisible ? (
            <p className="text-white mb-1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
              {format(portfolio.totalUSD)}
            </p>
          ) : (
            <p className="text-white mb-1" style={{ fontSize: 36, fontWeight: 800 }}>••••••</p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>
            ≈ ₦{portfolio.totalNGN.toLocaleString()}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--muted)' }}>
              <TrendingUp size={12} style={{ color: 'var(--positive)' }} />
              <span style={{ color: 'var(--positive)', fontSize: 12, fontWeight: 600 }}>
                +{format(portfolio.change24hUSD)} ({portfolio.change24hPct}%)
              </span>
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>24h</span>
          </div>

          <div style={{ height: 60, marginTop: 16, marginLeft: -8, marginRight: -8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioChartData}>
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#heroGrad)" dot={false} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="px-2 py-1 rounded-lg text-xs text-white" style={{ background: 'rgba(0,0,0,0.8)', fontSize: 11 }}>
                        {format(payload[0].value as number)}
                      </div>
                    ) : null
                  }
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
