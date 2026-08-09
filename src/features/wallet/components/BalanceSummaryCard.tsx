import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { portfolio, portfolioChartData } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';

/** Total balance card with 24h/all-time gain and a mini trend chart, at the top of Wallet. */
export function BalanceSummaryCard() {
  const { format } = useCurrency();

  return (
    <div className="px-5 mb-4">
      <div
        className="rounded-[24px] p-5 relative overflow-hidden glass-card glass-refraction"
        style={{ background: 'var(--card)', border: '1px solid var(--muted)', boxShadow: '0 16px 48px var(--border)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'transparent', transform: 'translate(20%,-30%)' }} />
        <div className="relative">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 4 }}>Total Balance</p>
          <p className="text-white mb-3" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            {format(portfolio.totalUSD)}
          </p>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
              +{format(portfolio.change24hUSD)} today
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>|</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
              All-time +{format(portfolio.allTimeGain)} ({portfolio.allTimeGainPct}%)
            </span>
          </div>
          <div style={{ height: 50, marginTop: 12, marginLeft: -8, marginRight: -8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioChartData}>
                <defs>
                  <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={1.5} fill="url(#walletGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
