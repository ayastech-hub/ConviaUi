import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import {
import { useLanguage } from '../../../shared/context/LanguageContext';
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { holdingToAsset } from '../../../shared/utils/mapApiToUi';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AssetIcon } from '../../../shared/components/AssetIcon';

interface PortfolioScreenProps {
  goBack: () => void;
}

const COLORS = ['#3B82F6', '#627EEA', '#9945FF', '#F3BA2F', '#26A17B', '#2775CA'];
const periods = ['1D', '1W', '1M', '3M', 'YTD', 'All'];

export function PortfolioScreen({ goBack }: PortfolioScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [period, setPeriod] = useState('1M');
  const { data, source } = usePortfolio();
  const totalUSD = data ? Number(data.totalValueUsd) || 0 : 0;
  const assets = (data?.holdings || []).map(holdingToAsset);
  const list = assets;

  const chartData: { time: string; value: number }[] = []; // live history snapshots not exposed yet

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>{t('portfolio.title')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Summary */}
        <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 4 }}>Total Value</p>
          <p style={{ color: 'var(--foreground)', fontSize: 36, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1 }}>
            {format(totalUSD)}
          </p>
          <div className="flex items-center gap-3 mt-2 mb-4">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--muted)' }}>
              <TrendingUp size={12} style={{ color: 'var(--positive)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{source === 'live' ? 'Live ledger total' : 'Connect API for live total'}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--muted)' }}>

            </div>
          </div>

          {/* Period picker */}
          <div className="flex gap-1 p-1 rounded-[12px] mb-3" style={{ background: 'var(--muted)' }}>
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)} className="flex-1 py-1.5 rounded-[8px]" style={{ background: period === p ? 'var(--primary)' : 'transparent', color: period === p ? '#FFF' : 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
                {p}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.85)', fontSize: 13, color: '#FFF', fontWeight: 700 }}>
                        {format(payload[0].value as number)}
                      </div>
                    ) : null
                  }
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fill="url(#portGrad)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation chart */}
        <div className="rounded-[20px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Allocation</p>
          <div className="flex items-center gap-6">
            <div style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={list.map(a => ({ name: a.symbol, value: a.valueUSD }))} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" strokeWidth={0}>
                    {list.map((_, i) => <Cell key={i} fill={COLORS[i] ?? '#64748B'} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {list.map((a, i) => (
                <div key={a.symbol} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span style={{ color: 'var(--foreground)', fontSize: 12, flex: 1 }}>{a.symbol}</span>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                    {((a.valueUSD / (totalUSD || 1)) * 100).toFixed(1)}%
                  </span>
                  <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600, width: 70, textAlign: 'right' }}>
                    {format(a.valueUSD)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset performance */}
        <div className="mb-4">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Performance</p>
          <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {list.map((asset, i) => {
              const pnl = asset.valueUSD * (asset.change24h / 100);
              return (
                <div key={asset.id} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <AssetIcon symbol={asset.symbol} size={36} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</span>
                      <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{format(asset.valueUSD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.balance.toFixed(4)} {asset.symbol}</span>
                      <div className="flex items-center gap-1">
                        {asset.change24h >= 0
                          ? <TrendingUp size={11} style={{ color: 'var(--positive)' }} />
                          : <TrendingDown size={11} style={{ color: 'var(--destructive)' }} />}
                        <span style={{ color: asset.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)', fontSize: 12, fontWeight: 600 }}>
                          {asset.change24h >= 0 ? '+' : ''}{format(pnl)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(asset.valueUSD / (totalUSD || 1)) * 100}%`,
                          background: COLORS[i],
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Best Day', value: '+$621.40', sub: 'Jan 12, 2026', color: 'var(--positive)' },
            { label: 'Worst Day', value: '-$234.20', sub: 'Mar 3, 2026', color: 'var(--destructive)' },
            { label: 'Avg Daily Return', value: '+$31.20', sub: '0.35% per day', color: 'var(--muted-foreground)' },
            { label: 'Sharpe Ratio', value: '1.84', sub: 'Good risk-adjusted', color: 'var(--muted-foreground)' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p style={{ color: stat.color, fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>{stat.value}</p>
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 12, marginTop: 2 }}>{stat.label}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
