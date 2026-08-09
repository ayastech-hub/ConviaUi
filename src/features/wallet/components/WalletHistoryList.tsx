import type React from 'react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { recentTransactions, type Transaction } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';

// Note: this uses a different color scheme (more red/destructive for
// outgoing) than Home's "Recent" list, which is a deliberate difference
// from the original design rather than an oversight — kept as-is.
const TX_TYPE_INFO: Record<string, { icon: React.ElementType; color: string; sign: string }> = {
  receive: { icon: ArrowDownLeft, color: 'var(--foreground)', sign: '+' },
  send: { icon: ArrowUpRight, color: 'var(--destructive)', sign: '-' },
  swap: { icon: RefreshCw, color: 'var(--foreground)', sign: '~' },
  buy: { icon: Plus, color: 'var(--foreground)', sign: '+' },
  sell: { icon: Minus, color: 'var(--destructive)', sign: '-' },
  offramp: { icon: TrendingDown, color: 'var(--muted-foreground)', sign: '-' },
  onramp: { icon: TrendingUp, color: 'var(--foreground)', sign: '+' },
  deposit: { icon: ArrowDownLeft, color: 'var(--foreground)', sign: '+' },
  withdraw: { icon: ArrowUpRight, color: 'var(--destructive)', sign: '-' },
};

function txTypeInfo(type: string) {
  return TX_TYPE_INFO[type] ?? TX_TYPE_INFO.receive;
}

interface WalletHistoryListProps {
  onSelectTransaction: (tx: Transaction) => void;
}

/** The "History" tab content on Wallet: the full transaction list. */
export function WalletHistoryList({ onSelectTransaction }: WalletHistoryListProps) {
  const { format } = useCurrency();

  return (
    <div className="px-5">
      <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
        {recentTransactions.map((tx, i) => {
          const info = txTypeInfo(tx.type);
          const Icon = info.icon;
          return (
            <motion.button
              key={tx.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTransaction(tx)}
              className="w-full flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: i < recentTransactions.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Icon size={18} style={{ color: info.color }} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                    {tx.type === 'swap' ? `${tx.asset} → ${tx.assetTo}` : `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} ${tx.asset}`}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tx.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p style={{ color: info.sign === '+' ? 'var(--positive)' : 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                  {info.sign}{format(tx.valueUSD)}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: tx.status === 'confirmed' ? 'var(--positive)' : 'var(--muted-foreground)' }} />
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textTransform: 'capitalize' }}>{tx.status}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
