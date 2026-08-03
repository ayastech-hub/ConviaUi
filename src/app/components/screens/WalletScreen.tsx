import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownToLine, ArrowUpFromLine, ArrowUpRight, ArrowDownLeft,
  RefreshCw, TrendingDown, Plus, Minus, ChevronRight, Copy, Check,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cryptoAssets, recentTransactions, portfolio, portfolioChartData, type Screen } from '../../data/mockData';
import { useCurrency } from '../../context/CurrencyContext';
import { AssetIcon } from './HomeScreen';

interface WalletScreenProps {
  navigate: (s: Screen) => void;
}

const chains = ['All', 'Ethereum', 'Bitcoin', 'Solana', 'BSC', 'BASE'];

export function WalletScreen({ navigate }: WalletScreenProps) {
  const { format } = useCurrency();
  const [activeChain, setActiveChain] = useState('All');
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');
  const [copied, setCopied] = useState(false);

  const filteredAssets = activeChain === 'All'
    ? cryptoAssets
    : cryptoAssets.filter(a => a.chains.includes(activeChain));

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const txTypeIcon = (type: string) => {
    const map: Record<string, { icon: React.ElementType; color: string; sign: string }> = {
      receive: { icon: ArrowDownLeft, color: 'var(--primary)', sign: '+' },
      send: { icon: ArrowUpRight, color: '#F87171', sign: '-' },
      swap: { icon: RefreshCw, color: 'var(--primary)', sign: '~' },
      buy: { icon: Plus, color: 'var(--primary)', sign: '+' },
      sell: { icon: Minus, color: '#F87171', sign: '-' },
      offramp: { icon: TrendingDown, color: '#F59E0B', sign: '-' },
      onramp: { icon: TrendingUp, color: 'var(--primary)', sign: '+' },
      deposit: { icon: ArrowDownLeft, color: 'var(--primary)', sign: '+' },
      withdraw: { icon: ArrowUpRight, color: '#F87171', sign: '-' },
    };
    return map[type] ?? map.receive;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="px-5 mb-4">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Wallet</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Manage your digital assets</p>
      </div>

      {/* Portfolio Summary Card */}
      <div className="px-5 mb-4">
        <div
          className="rounded-[24px] p-5 relative overflow-hidden glass-card glass-refraction"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(19,24,38,0.6) 50%, rgba(11,15,25,0.7) 100%)',
            border: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 16px 48px rgba(99,102,241,0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #818CF8, transparent)', transform: 'translate(20%,-30%)' }} />
          <div className="relative">
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>Total Balance</p>
            <p className="text-white mb-3" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
              {format(portfolio.totalUSD)}
            </p>
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
                +{format(portfolio.change24hUSD)} today
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>|</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                All-time +{format(portfolio.allTimeGain)} ({portfolio.allTimeGainPct}%)
              </span>
            </div>
            <div style={{ height: 50, marginTop: 12, marginLeft: -8, marginRight: -8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioChartData}>
                  <defs>
                    <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={1.5} fill="url(#walletGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Receive', icon: ArrowDownToLine, screen: 'receive', color: 'var(--primary)' },
            { label: 'Withdraw', icon: ArrowUpFromLine, screen: 'withdraw', color: 'var(--primary)' },
            { label: 'Off-Ramp', icon: TrendingDown, screen: 'offramp', color: 'var(--primary)' },
            { label: 'Portfolio', icon: ChevronRight, screen: 'portfolio', color: 'var(--primary)' },
          ].map(({ label, icon: Icon, screen, color }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(screen as Screen)}
              className="flex flex-col items-center gap-2 p-3 rounded-[14px] glass-card"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={17} style={{ color }} strokeWidth={2} />
              </div>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chain Filter */}
      <div className="mb-4">
        <div className="flex gap-2 px-5 overflow-x-auto pb-1">
          {chains.map(chain => (
            <motion.button
              key={chain}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveChain(chain)}
              className="flex-shrink-0 px-4 py-2 rounded-full"
              style={{
                background: activeChain === chain ? 'var(--primary)' : 'var(--muted)',
                color: activeChain === chain ? '#FFF' : 'var(--muted-foreground)',
                fontSize: 12, fontWeight: 600,
              }}
            >
              {chain}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Assets/History tabs */}
      <div className="px-5 mb-3">
        <div className="flex gap-1 p-1 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
          {(['assets', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-[10px] capitalize"
              style={{
                background: activeTab === tab ? 'var(--card)' : 'transparent',
                color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: 13, fontWeight: 600,
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab === 'assets' ? 'Assets' : 'History'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'assets' ? (
        <div className="px-5">
          <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
            {filteredAssets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: i < filteredAssets.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <AssetIcon symbol={asset.symbol} size={40} />
                  <div>
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.chains[0]}</p>
                  </div>
                </div>

                {/* Sparkline */}
                <div style={{ width: 60, height: 28 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={asset.sparkline.map((v, idx) => ({ v, idx }))}>
                      <defs>
                        <linearGradient id={`spark-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={asset.change24h >= 0 ? '#10B981' : '#EF4444'} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={asset.change24h >= 0 ? '#10B981' : '#EF4444'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={asset.change24h >= 0 ? 'var(--primary)' : '#EF4444'}
                        strokeWidth={1.5}
                        fill={`url(#spark-${asset.id})`}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-right">
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                    {format(asset.valueUSD)}
                  </p>
                  <p style={{ color: asset.change24h >= 0 ? 'var(--primary)' : '#EF4444', fontSize: 12, fontWeight: 600 }}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5">
          <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
            {recentTransactions.map((tx, i) => {
              const info = txTypeInfo(tx.type);
              const Icon = info.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{ borderBottom: i < recentTransactions.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${info.color}15` }}>
                      <Icon size={18} style={{ color: info.color }} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                        {tx.type === 'swap' ? `${tx.asset} → ${tx.assetTo}` : `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} ${tx.asset}`}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p style={{ color: info.sign === '+' ? 'var(--primary)' : 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                      {info.sign}{format(tx.valueUSD)}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: tx.status === 'confirmed' ? 'var(--primary)' : '#F59E0B' }} />
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textTransform: 'capitalize' }}>{tx.status}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  );
}
