import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, RefreshCw,
  Plus, Minus, TrendingUp, TrendingDown, ChevronRight,
  ShieldAlert, ScanLine, X,
} from 'lucide-react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';
import { QRScanner } from '../../../shared/components/QRScanner';
import { parseQRPayload, setSendPrefill } from '../../../shared/utils/qrPayload';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  portfolio, cryptoAssets, recentTransactions,
  portfolioChartData, marketData, type Screen, type Transaction,
} from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { AssetIcon } from '../../../shared/components/AssetIcon';

interface HomeScreenProps {
  navigate: (s: Screen) => void;
  darkMode: boolean;
  toggleDark: () => void;
  notificationCount: number;
}

const txTypeInfo = (type: string) => {
  const map: Record<string, { label: string; icon: React.ElementType; color: string; sign: string }> = {
    receive: { label: 'Received', icon: ArrowDownLeft, color: 'var(--positive)', sign: '+' },
    send: { label: 'Sent', icon: ArrowUpRight, color: 'var(--foreground)', sign: '-' },
    swap: { label: 'Swapped', icon: RefreshCw, color: 'var(--muted-foreground)', sign: '~' },
    buy: { label: 'Bought', icon: Plus, color: 'var(--positive)', sign: '+' },
    sell: { label: 'Sold', icon: Minus, color: 'var(--foreground)', sign: '-' },
    offramp: { label: 'Off-Ramp', icon: TrendingDown, color: 'var(--foreground)', sign: '-' },
    onramp: { label: 'On-Ramp', icon: TrendingUp, color: 'var(--positive)', sign: '+' },
    deposit: { label: 'Deposit', icon: ArrowDownLeft, color: 'var(--positive)', sign: '+' },
    withdraw: { label: 'Withdraw', icon: ArrowUpRight, color: 'var(--foreground)', sign: '-' },
  };
  return map[type] ?? map.receive;
};

export function HomeScreen({ navigate, darkMode, toggleDark, notificationCount }: HomeScreenProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
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
            style={{ background: 'var(--primary)' }}
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
            onClick={() => setShowScanner(true)}
            aria-label="Scan QR"
            className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
          >
            <ScanLine size={18} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('notifications')}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
          >
            <Bell size={18} style={{ color: 'var(--foreground)' }} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center pulse-badge" style={{ background: 'var(--destructive)', fontSize: 10, fontWeight: 700, boxShadow: '0 0 12px var(--muted)' }}>
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
            background: 'var(--card)',
            boxShadow: '0 20px 60px var(--border)',
            border: '1px solid var(--muted)',
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute inset-0 overflow-hidden rounded-[24px]" style={{ position: 'relative' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'transparent', transform: 'translate(20%, -30%)' }} />
            <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full opacity-10" style={{ background: 'transparent', transform: 'translateY(40%)' }} />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Total Portfolio</p>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBalanceVisible(v => !v)} aria-label="Toggle balance visibility">
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

            {/* Mini chart */}
            <div style={{ height: 60, marginTop: 16, marginLeft: -8, marginRight: -8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioChartData}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
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

      {/* KYC Banner */}
      <div className="px-5 mb-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('kyc')}
          className="rounded-[16px] p-3.5 flex items-center gap-3 cursor-pointer"
          style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
            <ShieldAlert size={20} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="flex-1">
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>Verify your identity</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Required for deposits, withdrawals & trading</p>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <div className="flex justify-between">
          {[
            { id: 'send', label: 'Send', icon: ArrowUpRight },
            { id: 'receive', label: 'Receive', icon: ArrowDownLeft },
            { id: 'swap', label: 'Swap', icon: RefreshCw },
            { id: 'onramp', label: 'Buy Crypto', icon: Plus },
            { id: 'offramp', label: 'Sell Crypto', icon: Minus },
          ].map((action, i) => {
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
                  style={{ background: 'var(--muted)' }}
                >
                  <Icon size={20} strokeWidth={2} style={{ color: 'var(--foreground)' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Market Watchlist */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>Markets</h3>
          <button onClick={() => navigate('trade')} className="flex items-center gap-1" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
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
              onClick={() => navigate('token-info', asset.symbol)}
              className="flex items-center justify-between p-3 rounded-[16px] glass-card cursor-pointer"
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
                    ? <TrendingUp size={11} style={{ color: 'var(--positive)' }} />
                    : <TrendingDown size={11} style={{ color: 'var(--destructive)' }} />}
                  <p style={{ color: asset.change >= 0 ? 'var(--positive)' : 'var(--destructive)', fontSize: 12, fontWeight: 600 }}>
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
          <button onClick={() => navigate('wallet')} className="flex items-center gap-1" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
          {recentTransactions.slice(0, 4).map((tx, i) => {
            const info = txTypeInfo(tx.type);
            const Icon = info.icon;
            return (
              <motion.button
                key={tx.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setReceiptTx(tx)}
                className="w-full flex items-center justify-between p-4"
                style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <Icon size={18} style={{ color: info.color }} strokeWidth={2} />
                  </div>
                  <div className="text-left">
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
              </motion.button>
            );
          })}
        </div>
      </div>

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScan={(result) => {
              setShowScanner(false);
              const parsed = parseQRPayload(result);
              if (parsed) {
                setSendPrefill(parsed);
              } else {
                setSendPrefill({ address: result.trim() });
              }
              navigate('send');
            }}
            onClose={() => setShowScanner(false)}
            onManualEntry={() => { setShowScanner(false); navigate('send'); }}
          />
        )}
      </AnimatePresence>

      {/* Bottom spacer */}
      <div style={{ height: 100 }} />
    </div>
  );
}
