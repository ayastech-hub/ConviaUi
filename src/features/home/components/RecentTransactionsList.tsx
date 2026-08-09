import type React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { recentTransactions, type Transaction } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';

const TX_TYPE_INFO: Record<string, { label: string; icon: React.ElementType; color: string; sign: string }> = {
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

function txTypeInfo(type: string) {
  return TX_TYPE_INFO[type] ?? TX_TYPE_INFO.receive;
}

interface RecentTransactionsListProps {
  onSeeAll: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

/** "Recent" transactions preview list (top 4) on Home. */
export function RecentTransactionsList({ onSeeAll, onSelectTransaction }: RecentTransactionsListProps) {
  const { format } = useCurrency();

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>Recent</h3>
        <button onClick={onSeeAll} className="flex items-center gap-1" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
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
              onClick={() => onSelectTransaction(tx)}
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
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{info.sign}{format(tx.valueUSD)}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tx.time}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
