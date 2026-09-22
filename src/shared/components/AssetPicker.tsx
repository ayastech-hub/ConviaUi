import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Check } from 'lucide-react';
import type { Asset } from '../data/mockData';
import { AssetIcon } from './AssetIcon';
import { useTokenRegistry } from '../hooks/useTokenRegistry';
import { useCurrency } from '../context/CurrencyContext';

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (a: Asset) => void;
  selected?: Asset | null;
  assets?: Asset[];
  excludeId?: string;
  title?: string;
  showBalances?: boolean;
}

export function AssetPicker({
  open,
  onClose,
  onSelect,
  selected,
  assets: assetsProp,
  excludeId,
  title = 'Select token',
  showBalances = true,
}: AssetPickerProps) {
  const { assets: registryAssets, loading } = useTokenRegistry();
  const { format } = useCurrency();
  const assets =
    Array.isArray(assetsProp) && assetsProp.length
      ? assetsProp
      : Array.isArray(registryAssets)
        ? registryAssets
        : [];
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQ('');
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(t);
  }, [open]);

  const filtered = useMemo(() => {
    const list = Array.isArray(assets) ? assets : [];
    const query = q.trim().toLowerCase();
    let rows = list.filter((a) => (excludeId ? a.id !== excludeId : true));
    if (query) {
      rows = rows.filter(
        (a) =>
          a.symbol.toLowerCase().includes(query) ||
          (a.name || '').toLowerCase().includes(query),
      );
    }
    return [...rows].sort(
      (a, b) => (b.valueUSD || 0) - (a.valueUSD || 0) || (b.balance || 0) - (a.balance || 0),
    );
  }, [assets, q, excludeId]);

  const withBal = filtered.filter((a) => Number(a.balance) > 0);
  const zeroBal = filtered.filter((a) => Number(a.balance) <= 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(0,0,0,0.58)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 z-[71] mx-auto max-w-md flex flex-col rounded-t-[28px]"
            style={{
              background: 'var(--background)',
              borderTop: '1px solid var(--border)',
              maxHeight: '82vh',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.28)',
            }}
          >
            <div className="px-5 pt-3 pb-3 shrink-0">
              <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 11,
                      fontWeight: 650,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Token
                  </p>
                  <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{title}</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                  aria-label="Close"
                >
                  <X size={16} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>

              <div
                className="flex items-center gap-2.5 px-3.5 h-11 rounded-2xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <Search size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name or symbol"
                  className="flex-1 bg-transparent outline-none text-[14px] min-w-0"
                  style={{ color: 'var(--foreground)' }}
                />
                {q && (
                  <button type="button" onClick={() => setQ('')} className="p-1" aria-label="Clear">
                    <X size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-8">
              {loading && assets.length === 0 && (
                <p className="py-12 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  Loading tokens…
                </p>
              )}
              {!loading && filtered.length === 0 && (
                <p className="py-12 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  No tokens match “{q}”
                </p>
              )}

              {withBal.length > 0 && (
                <Section label="Your balances">
                  {withBal.map((a) => (
                    <TokenRow
                      key={a.id || a.symbol}
                      asset={a}
                      selected={selected?.symbol === a.symbol || selected?.id === a.id}
                      showBalances={showBalances}
                      format={format}
                      onSelect={() => {
                        onSelect(a);
                        onClose();
                      }}
                    />
                  ))}
                </Section>
              )}

              {zeroBal.length > 0 && (
                <Section label={withBal.length ? 'All tokens' : undefined}>
                  {zeroBal.map((a) => (
                    <TokenRow
                      key={a.id || a.symbol}
                      asset={a}
                      selected={selected?.symbol === a.symbol || selected?.id === a.id}
                      showBalances={showBalances}
                      format={format}
                      dim
                      onSelect={() => {
                        onSelect(a);
                        onClose();
                      }}
                    />
                  ))}
                </Section>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      {label && (
        <p
          className="px-2 pt-2 pb-1.5"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 650,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </p>
      )}
      <div
        className="rounded-[18px] overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {children}
      </div>
    </div>
  );
}

function TokenRow({
  asset,
  selected,
  showBalances,
  format,
  dim,
  onSelect,
}: {
  asset: Asset;
  selected: boolean;
  showBalances: boolean;
  format: (n: number) => string;
  dim?: boolean;
  onSelect: () => void;
}) {
  const bal = Number(asset.balance) || 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3.5 py-3 text-left"
      style={{
        borderBottom: '1px solid var(--border)',
        opacity: dim ? 0.72 : 1,
        background: selected ? 'color-mix(in oklab, var(--primary) 10%, transparent)' : 'transparent',
      }}
    >
      <AssetIcon symbol={asset.symbol} size={40} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 15 }}>{asset.symbol}</p>
          {selected && <Check size={14} style={{ color: 'var(--primary)' }} />}
        </div>
        <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 12.5 }}>
          {asset.name}
        </p>
      </div>
      {showBalances && (
        <div className="text-right shrink-0">
          <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
            {bal > 0
              ? bal.toLocaleString(undefined, { maximumFractionDigits: bal < 1 ? 6 : 4 })
              : '0'}
          </p>
          <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 11.5 }}>
            {format(Number(asset.valueUSD) || 0)}
          </p>
        </div>
      )}
    </button>
  );
}
