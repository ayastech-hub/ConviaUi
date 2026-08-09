import type React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import type { Transaction } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useTransactions } from '../../../shared/hooks/useTransactions';
import { apiTxToUi } from '../../../shared/utils/mapApiToUi';

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

interface WalletHistoryListProps {
  onSelectTransaction: (tx: Transaction) => void;
}

/** Wallet History tab — live GET /users/:userId/transactions. */
export function WalletHistoryList({ onSelectTransaction }: WalletHistoryListProps) {
  const { format } = useCurrency();
  const { data, loading, source } = useTransactions(50);
  const txs = data.map(apiTxToUi);

  return (
    <div className="px-5">
      {source === 'live' && (
        <p className="mb-2" style={{ color: 'var(--positive)', fontSize: 10, fontWeight: 600 }}>
          LIVE · ledger + fiat + withdrawals
        </p>
      )}
      <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
        {loading && (
          <p className="px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            Loading history…
          </p>
        )}
        {!loading && txs.length === 0 && (
          <p className="px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No transaction history
          </p>
        )}
        {!loading &&
          txs.map((tx, i) => {
            const info = txTypeInfo(tx.type);
            const Icon = info.icon;
            return (
              <motion.button
                key={tx.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectTransaction(tx)}
                className="w-full flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: i < txs.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <Icon size={18} style={{ color: info.color }} strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                      {tx.type === 'swap' ? `${tx.asset} → ${tx.assetTo}` : `${info.label} ${tx.asset}`}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ color: info.sign === '+' ? 'var(--positive)' : 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                    {info.sign}
                    {tx.amount} {tx.asset}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: tx.status === 'confirmed' ? 'var(--positive)' : 'var(--muted-foreground)' }}
                    />
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
