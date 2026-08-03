import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, RefreshCw,
  Plus, Minus, TrendingUp, TrendingDown, Gift, Flame, ChevronRight,
  Zap, Star, Heart, MessageCircle,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { ConviaLogo } from '../ConviaLogo';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  portfolio, cryptoAssets, recentTransactions, socialPosts,
  portfolioChartData, marketData, type Screen,
} from '../../data/mockData';
import { ReferralModal } from '../ReferralModal';

interface HomeScreenProps {
  navigate: (s: Screen) => void;
  darkMode: boolean;
  toggleDark: () => void;
  notificationCount: number;
}

const quickActions = [
  { id: 'send', label: 'Send', icon: ArrowUpRight, color: 'var(--primary)', bg: 'rgba(99,102,241,0.12)' },
  { id: 'receive', label: 'Receive', icon: ArrowDownLeft, color: 'var(--primary)', bg: 'rgba(99,102,241,0.12)' },
  { id: 'swap', label: 'Swap', icon: RefreshCw, color: 'var(--primary)', bg: 'rgba(99,102,241,0.12)' },
  { id: 'onramp', label: 'Buy', icon: Plus, color: 'var(--primary)', bg: 'rgba(99,102,241,0.12)' },
  { id: 'offramp', label: 'Sell', icon: Minus, color: 'var(--primary)', bg: 'rgba(99,102,241,0.12)' },
];

const txTypeInfo = (type: string) => {
  const map: Record<string, { label: string; icon: React.ElementType; color: string; sign: string }> = {
    receive: { label: 'Received', icon: ArrowDownLeft, color: 'var(--primary)', sign: '+' },
    send: { label: 'Sent', icon: ArrowUpRight, color: 'var(--primary)', sign: '-' },
    swap: { label: 'Swapped', icon: RefreshCw, color: 'var(--primary)', sign: '~' },
    buy: { label: 'Bought', icon: Plus, color: 'var(--primary)', sign: '+' },
    sell: { label: 'Sold', icon: Minus, color: 'var(--primary)', sign: '-' },
    offramp: { label: 'Off-Ramp', icon: TrendingDown, color: 'var(--primary)', sign: '-' },
    onramp: { label: 'On-Ramp', icon: TrendingUp, color: 'var(--primary)', sign: '+' },
    deposit: { label: 'Deposit', icon: ArrowDownLeft, color: 'var(--primary)', sign: '+' },
    withdraw: { label: 'Withdraw', icon: ArrowUpRight, color: 'var(--primary)', sign: '-' },
  };
  return map[type] ?? map.receive;
};

export function HomeScreen({ navigate, darkMode, toggleDark, notificationCount }: HomeScreenProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showReferral, setShowReferral] = useState(false);
  const { format } = useCurrency();

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      {/* Status bar spacer */}
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center glass-refraction"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
          >
            <ConviaLogo size={18} color="#FFFFFF" />
          </div>
          <div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Good morning</p>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Ade Mensah</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('notifications')}
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
          >
            <Bell size={18} style={{ color: 'var(--foreground)' }} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center pulse-badge" style={{ background: '#EF4444', fontSize: 10, fontWeight: 700, boxShadow: '0 0 12px rgba(239,68,68,0.4)' }}>
                {notificationCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Portfolio Hero Card */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] overflow-hidden p-5 glass-card glass-refraction"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(19,24,38,0.6) 40%, rgba(11,15,25,0.7) 100%)',
            boxShadow: '0 20px 60px rgba(99,102,241,0.2)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute inset-0 overflow-hidden rounded-[24px]" style={{ position: 'relative' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #818CF8, transparent)', transform: 'translate(20%, -30%)' }} />
            <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818CF8, transparent)', transform: 'translateY(40%)' }} />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Total Portfolio</p>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBalanceVisible(v => !v)}>
                {balanceVisible ? <Eye size={16} style={{ color: 'rgba(255,255,255,0.6)' }} /> : <EyeOff size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />}
              </motion.button>
            </div>

            {balanceVisible ? (
              <p className="text-white mb-1" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
                {format(portfolio.totalUSD)}
              </p>
            ) : (
              <p className="text-white mb-1" style={{ fontSize: 36, fontWeight: 800 }}>••••••</p>
            )}

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 }}>
              ≈ ₦{portfolio.totalNGN.toLocaleString()}
            </p>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.2)' }}>
                <TrendingUp size={12} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
                  +{format(portfolio.change24hUSD)} ({portfolio.change24hPct}%)
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>24h</span>
            </div>

            {/* Mini chart */}
            <div style={{ height: 60, marginTop: 16, marginLeft: -8, marginRight: -8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioChartData}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#818CF8"
                    strokeWidth={2}
                    fill="url(#heroGrad)"
                    dot={false}
                  />
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

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <div className="flex justify-between">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(action.id as Screen)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card glass-refraction"
                  style={{ background: action.bg }}
                >
                  <Icon size={20} strokeWidth={2} style={{ color: action.color }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Daily Streak + Referral */}
      <div className="px-5 mb-5 flex gap-3">
        <motion.div
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('rewards')}
          className="flex-1 rounded-[16px] p-3 flex items-center gap-3 cursor-pointer glass-card"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))', border: '1px solid rgba(245,158,11,0.15)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
            <Flame size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ color: '#F59E0B', fontSize: 16, fontWeight: 800 }}>7 Days</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Daily Streak</p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('rewards')}
          className="flex-1 rounded-[16px] p-3 flex items-center gap-3 cursor-pointer glass-card"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06))', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Gift size={20} style={{ color: '#818CF8' }} />
          </div>
          <div>
            <p style={{ color: '#818CF8', fontSize: 16, fontWeight: 800 }}>2,450 pts</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Convia Points</p>
          </div>
        </motion.div>
      </div>

      {/* Market Watchlist */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>Markets</h3>
          <button onClick={() => navigate('trade')} className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 500 }}>
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {marketData.slice(0, 4).map((asset, i) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-3 rounded-[16px] glass-card"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <AssetIcon symbol={asset.symbol} />
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Vol ${asset.vol}</p>
                </div>
              </div>
              <div className="text-right">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                  {asset.price > 100 ? format(asset.price) : format(asset.price)}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {asset.change >= 0
                    ? <TrendingUp size={11} style={{ color: 'var(--primary)' }} />
                    : <TrendingDown size={11} style={{ color: '#EF4444' }} />}
                  <p style={{ color: asset.change >= 0 ? 'var(--primary)' : '#EF4444', fontSize: 12, fontWeight: 600 }}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>Recent</h3>
          <button onClick={() => navigate('wallet')} className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 500 }}>
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
          {recentTransactions.slice(0, 4).map((tx, i) => {
            const info = txTypeInfo(tx.type);
            const Icon = info.icon;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4"
                style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${info.color}15` }}>
                    <Icon size={18} style={{ color: info.color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                      {info.label} {tx.asset}{tx.assetTo ? ` → ${tx.assetTo}` : ''}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                      {tx.username ? `@${tx.username}` : tx.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                    {info.sign}{format(tx.valueUSD)}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tx.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Activity */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>Community</h3>
          <button onClick={() => navigate('social')} className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 500 }}>
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {socialPosts.slice(0, 2).map(post => (
            <motion.div
              key={post.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('social')}
              className="p-4 rounded-[16px] glass-card"
              style={{ border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: post.user.color, fontSize: 11, fontWeight: 700 }}>
                  {post.user.initials}
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{post.user.name}</span>
                  {post.user.verified && <Zap size={12} style={{ color: 'var(--primary)' }} />}
                </div>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11, marginLeft: 'auto' }}>{post.time}</span>
              </div>
              <p style={{ color: 'var(--foreground)', fontSize: 13, lineHeight: 1.5 }}>{post.content}</p>
              <div className="flex gap-2 mt-2">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }} className="flex items-center gap-1">
                  <Heart size={12} style={{ color: '#F87171' }} /> {post.likes}
                </span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }} className="flex items-center gap-1">
                  <MessageCircle size={12} /> {post.comments}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Referral Card */}
      <div className="px-5 mb-5">
        <motion.div
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowReferral(true)}
          className="rounded-[20px] p-4 flex items-center gap-4 glass-card glass-refraction"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Star size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="flex-1">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Refer & Earn</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Earn $10 USDT per referral</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl" style={{ background: 'var(--primary)' }}>
            <span className="text-white" style={{ fontSize: 12, fontWeight: 700 }}>Invite</span>
          </div>
        </motion.div>
      </div>

      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} code="ADE2026" reward="$10 USDT" />

      {/* Bottom spacer */}
      <div style={{ height: 100 }} />
    </div>
  );
}

export function AssetIcon({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const colors: Record<string, { bg: string; color: string }> = {
    BTC: { bg: '#F7931A', color: '#FFF' },
    ETH: { bg: '#627EEA', color: '#FFF' },
    SOL: { bg: '#9945FF', color: '#FFF' },
    BNB: { bg: '#F3BA2F', color: '#000' },
    USDT: { bg: '#26A17B', color: '#FFF' },
    USDC: { bg: '#2775CA', color: '#FFF' },
    XRP: { bg: '#00AAE4', color: '#FFF' },
    ADA: { bg: '#0D1E2D', color: '#0038A8' },
  };
  const c = colors[symbol] ?? { bg: '#64748B', color: '#FFF' };
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: c.bg, flexShrink: 0 }}
    >
      <span style={{ color: c.color, fontSize: size * 0.3, fontWeight: 800 }}>
        {symbol.charAt(0)}
      </span>
    </div>
  );
}
