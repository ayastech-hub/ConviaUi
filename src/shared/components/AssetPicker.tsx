import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
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

const POPULAR = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'SOL', 'TON'];

/**
 * Enterprise token picker — search, popular chips, balances first, clean rows.
 */
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
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  const filtered = useMemo(() => {
    const list = Array.isArray(assets) ? assets : [];
    const query = q.trim().toLowerCase();
    let rows = list.filter((a) => (excludeId ? a.id !== excludeId && a.symbol !== excludeId : true));
    if (query) {
      rows = rows.filter(
        (a) =>
          a.symbol.toLowerCase().includes(query) ||
          (a.name || '').toLowerCase().includes(query),
      );
    }
    return [...rows].sort((a, b) => {
      const ab = Number(a.balance) || 0;
      const bb = Number(b.balance) || 0;
      if (ab > 0 && bb <= 0) return -1;
      if (bb > 0 && ab <= 0) return 1;
      return (Number(b.valueUSD) || 0) - (Number(a.valueUSD) || 0) || bb - ab;
    });
  }, [assets, q, excludeId]);

  const withBal = filtered.filter((a) => Number(a.balance) > 0);
  const zeroBal = filtered.filter((a) => Number(a.balance) <= 0);

  const popular = useMemo(() => {
    const list = Array.isArray(assets) ? assets : [];
    return POPULAR.map((sym) => list.find((a) => a.symbol.toUpperCase() === sym)).filter(
      (a): a is Asset => !!a && (!excludeId || (a.id !== excludeId && a.symbol !== excludeId)),
    );
  }, [assets, excludeId]);

  const pick = (a: Asset) => {
    onSelect(a);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="fixed left-0 right-0 bottom-0 z-[71] flex flex-col"
            style={{
              maxHeight: '88vh',
              borderRadius: '22px 22px 0 0',
              background: 'var(--background)',
              border: '1px solid var(--border)',
              boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--muted-foreground)', opacity: 0.35 }}
              />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>{title}</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                aria-label="Close"
                className="flex items-center justify-center p-1"
                style={{ background: 'transparent', border: 'none' }}
              >
                <X size={22} strokeWidth={2.35} style={{ color: 'var(--foreground)' }} />
              </motion.button>
            </div>

            {/* Search */}
            <div className="px-4 mb-3">
              <div
                className="flex items-center gap-2.5 h-12 rounded-2xl px-3.5"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <Search size={18} strokeWidth={2.1} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name or symbol"
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 15 }}
                />
                {q ? (
                  <button type="button" onClick={() => setQ('')} aria-label="Clear">
                    <X size={16} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Popular chips */}
            {!q && popular.length > 0 && (
              <div
                className="flex gap-2 px-4 mb-3 overflow-x-auto"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {popular.map((a) => {
                  const isSel = selected?.symbol === a.symbol;
                  return (
                    <motion.button
                      key={a.symbol}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => pick(a)}
                      className="flex items-center gap-2 shrink-0 rounded-full pl-1.5 pr-3 py-1.5"
                      style={{
                        background: isSel
                          ? 'color-mix(in oklab, var(--primary) 18%, var(--muted))'
                          : 'var(--card)',
                        border: isSel
                          ? '1px solid color-mix(in oklab, var(--primary) 45%, var(--border))'
                          : '1px solid var(--border)',
                      }}
                    >
                      <AssetIcon symbol={a.symbol} size={22} />
                      <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 650 }}>
                        {a.symbol}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {loading && filtered.length === 0 && (
                <p className="text-center py-10" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  Loading tokens…
                </p>
              )}

              {!loading && filtered.length === 0 && (
                <p className="text-center py-10" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  No tokens match “{q}”
                </p>
              )}

              {withBal.length > 0 && (
                <Section label="Your balances">
                  {withBal.map((a, i) => (
                    <TokenRow
                      key={a.id || a.symbol}
                      asset={a}
                      selected={selected?.symbol === a.symbol}
                      showBalances={showBalances}
                      format={format}
                      last={i === withBal.length - 1}
                      onSelect={() => pick(a)}
                    />
                  ))}
                </Section>
              )}

              {zeroBal.length > 0 && (
                <Section label={withBal.length ? 'All tokens' : undefined}>
                  {zeroBal.map((a, i) => (
                    <TokenRow
                      key={a.id || a.symbol}
                      asset={a}
                      selected={selected?.symbol === a.symbol}
                      showBalances={showBalances}
                      format={format}
                      dim
                      last={i === zeroBal.length - 1}
                      onSelect={() => pick(a)}
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
    <div className="mb-4">
      {label && (
        <p
          className="px-1 pt-1 pb-2"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 650,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </p>
      )}
      <div
        className="rounded-2xl overflow-hidden"
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
  last,
  onSelect,
}: {
  asset: Asset;
  selected: boolean;
  showBalances: boolean;
  format: (n: number) => string;
  dim?: boolean;
  last?: boolean;
  onSelect: () => void;
}) {
  const bal = Number(asset.balance) || 0;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3.5 py-3.5 text-left"
      style={{
        borderBottom: last ? undefined : '1px solid color-mix(in oklab, var(--border) 85%, transparent)',
        opacity: dim ? 0.78 : 1,
        background: selected ? 'color-mix(in oklab, var(--primary) 12%, transparent)' : 'transparent',
      }}
    >
      <AssetIcon symbol={asset.symbol} size={42} />
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15.5, letterSpacing: -0.2 }}>
          {asset.symbol}
        </p>
        <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 2 }}>
          {asset.name || asset.symbol}
        </p>
      </div>
      {showBalances && (
        <div className="text-right shrink-0">
          <p
            className="tabular-nums"
            style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14.5 }}
          >
            {bal > 0
              ? bal.toLocaleString(undefined, {
                  maximumFractionDigits: bal < 1 ? 6 : 4,
                })
              : '—'}
          </p>
          {bal > 0 && (
            <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 11.5, marginTop: 2 }}>
              {format(Number(asset.valueUSD) || 0)}
            </p>
          )}
        </div>
      )}
      {selected && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: 'var(--primary)' }}
          aria-hidden
        />
      )}
    </motion.button>
  );
}
