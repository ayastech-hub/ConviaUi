import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Search } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { useCurrency } from '../../../../shared/context/CurrencyContext';
import { PageTop } from '../../../../shared/components/PageTop';

interface WithdrawTokenListProps {
  assets: Asset[];
  goBack: () => void;
  onSelect: (a: Asset) => void;
}

/**
 * Withdraw token list: balances first by default; toggle to show zero-balance tokens.
 */
export function WithdrawTokenList({ assets, goBack, onSelect }: WithdrawTokenListProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [q, setQ] = useState('');
  const [showZero, setShowZero] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = assets;
    if (!showZero) {
      list = list.filter((a) => Number(a.balance) > 0);
    }
    if (needle) {
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(needle) ||
          a.name.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [assets, q, showZero]);

  const zeroCount = assets.filter((a) => Number(a.balance) <= 0).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
        <BackButton onClick={goBack} />
        <div className="flex-1 min-w-0">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>
            {t('nav.withdraw') || 'Withdraw'}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
            Select a token to withdraw
          </p>
        </div>
      </div>

      <div className="px-5 mb-3">
        <div
          className="flex items-center gap-2 px-3 h-11 rounded-xl"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search token"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      </div>

      <div className="px-5 mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowZero((v) => !v)}
          style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}
        >
          {showZero ? 'Hide zero balances' : `Show zero balances${zeroCount ? ` (${zeroCount})` : ''}`}
        </button>
      </div>

      <div className="px-5 pb-5">
        {filtered.map((asset, i) => (
          <motion.button
            key={asset.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(asset)}
            className="flex items-center gap-3 p-4 rounded-[16px] mb-3 w-full text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <AssetIcon symbol={asset.symbol} size={40} />
            <div className="flex-1">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
                {asset.symbol}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.name}</p>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                {Number(asset.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                {format(Number(asset.valueUSD) || 0)}
              </p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
        ))}
        {!filtered.length && (
          <p className="py-10 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            {showZero
              ? q
                ? `No tokens match “${q}”`
                : 'No tokens available'
              : 'No tokens with balance. Tap “Show zero balances” to see the full list.'}
          </p>
        )}
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}
