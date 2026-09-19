import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Check, Package } from 'lucide-react';

export type PlanOption = {
  code: string;
  name: string;
  amount?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  plans: PlanOption[];
  selectedCode: string | null;
  onSelect: (plan: PlanOption) => void;
  currency: string;
  loading?: boolean;
};

function formatMoney(amount: string | undefined, currency: string) {
  const n = Number(amount);
  const c = (currency || 'NGN').toUpperCase();
  if (!Number.isFinite(n)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: c,
      maximumFractionDigits: c === 'NGN' || c === 'GHS' || c === 'KES' ? 0 : 2,
    }).format(n);
  } catch {
    return `${c} ${n.toLocaleString()}`;
  }
}

/** Enterprise plan/package grid for provider variations (data + TV). */
export function PlanPicker({
  title,
  subtitle,
  plans,
  selectedCode,
  onSelect,
  currency,
  loading,
}: Props) {
  const [q, setQ] = useState('');
  const [band, setBand] = useState<'all' | 'low' | 'mid' | 'high'>('all');

  const sorted = useMemo(() => {
    return [...plans].sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
  }, [plans]);

  const filtered = useMemo(() => {
    let list = sorted;
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.code.toLowerCase().includes(needle) ||
          (p.amount || '').includes(needle),
      );
    }
    if (band !== 'all') {
      list = list.filter((p) => {
        const n = Number(p.amount) || 0;
        if (band === 'low') return n > 0 && n < 1000;
        if (band === 'mid') return n >= 1000 && n < 5000;
        return n >= 5000;
      });
    }
    return list;
  }, [sorted, q, band]);

  const selected = plans.find((p) => p.code === selectedCode);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
        ))}
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <Package size={28} style={{ color: 'var(--muted-foreground)', margin: '0 auto 10px' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No packages available right now</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{title}</p>
        {subtitle ? (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>{subtitle}</p>
        ) : null}
      </div>

      <div
        className="flex items-center gap-2 px-3.5 h-11 rounded-2xl"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search plans…"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--foreground)' }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {(
          [
            ['all', 'All'],
            ['low', 'Under 1k'],
            ['mid', '1k – 5k'],
            ['high', '5k+'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setBand(id)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: band === id ? 'var(--primary)' : 'var(--card)',
              color: band === id ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
              border: band === id ? 'none' : '1px solid var(--border)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{
              background: 'color-mix(in oklab, var(--primary) 12%, var(--card))',
              border: '1px solid color-mix(in oklab, var(--primary) 40%, var(--border))',
            }}
          >
            <div className="min-w-0">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Selected</p>
              <p
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 700,
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selected.name}
              </p>
            </div>
            <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap' }}>
              {formatMoney(selected.amount, currency)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: 340, overflowY: 'auto' }}
      >
        {filtered.map((p, i) => {
          const active = selectedCode === p.code;
          return (
            <motion.button
              key={p.code}
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.015, 0.2) }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{
                borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border)',
                background: active ? 'color-mix(in oklab, var(--primary) 8%, transparent)' : 'transparent',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: active ? 'var(--primary)' : 'var(--muted)',
                  border: active ? 'none' : '1px solid var(--border)',
                }}
              >
                {active ? (
                  <Check size={16} style={{ color: 'var(--primary-foreground, #fff)' }} strokeWidth={2.5} />
                ) : (
                  <Package size={15} style={{ color: 'var(--muted-foreground)' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    color: 'var(--foreground)',
                    fontWeight: active ? 700 : 600,
                    fontSize: 13,
                    lineHeight: 1.35,
                  }}
                >
                  {p.name}
                </p>
              </div>
              <span
                className="tabular-nums shrink-0"
                style={{
                  color: active ? 'var(--primary)' : 'var(--foreground)',
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {formatMoney(p.amount, currency)}
              </span>
            </motion.button>
          );
        })}
        {!filtered.length && (
          <p className="py-10 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No plans match “{q}”
          </p>
        )}
      </div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textAlign: 'center' }}>
        {filtered.length} of {plans.length} packages
      </p>
    </div>
  );
}
