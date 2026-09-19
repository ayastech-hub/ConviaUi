import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

export type PlanItem = { code: string; name: string; amount?: string };

type Props = {
  plans: PlanItem[];
  selectedCode: string | null;
  onSelect: (p: PlanItem) => void;
  currency: string;
  loading?: boolean;
};

type Band = 'all' | 'daily' | 'weekly' | 'monthly';

function parseDays(name: string): number | null {
  const n = name.toLowerCase();
  if (/\b1\s*day\b|\bdaily\b|\b24\s*hrs?\b|\bnight\b/.test(n)) return 1;
  if (/\b2\s*days?\b/.test(n)) return 2;
  if (/\b3\s*days?\b/.test(n)) return 3;
  if (/\b7\s*days?\b|\bweekly\b|\b1\s*week\b/.test(n)) return 7;
  if (/\b14\s*days?\b|\b2\s*weeks?\b/.test(n)) return 14;
  if (/\b30\s*days?\b|\bmonthly\b|\b1\s*month\b/.test(n)) return 30;
  if (/\b60\s*days?\b|\b2\s*months?\b/.test(n)) return 60;
  if (/\b90\s*days?\b|\b3\s*months?\b/.test(n)) return 90;
  return null;
}

function parseSize(name: string): { n: string; u: string } | null {
  const m = name.match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)\b/i);
  if (!m) return null;
  return { n: m[1], u: m[2].toUpperCase() };
}

function money(amount: string | undefined, currency: string) {
  const v = Number(amount);
  const c = (currency || 'NGN').toUpperCase();
  if (!Number.isFinite(v)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: c,
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${c} ${v.toLocaleString()}`;
  }
}

function bandOf(p: PlanItem): Band {
  const d = parseDays(p.name);
  if (d == null) return 'all';
  if (d <= 3) return 'daily';
  if (d <= 14) return 'weekly';
  return 'monthly';
}

/** Dense enterprise plan cards — grid inspired by top fintech bill UIs. */
export function EnterprisePlanGrid({ plans, selectedCode, onSelect, currency, loading }: Props) {
  const [tab, setTab] = useState<Band>('all');

  const tabs = useMemo(() => {
    const counts = { all: plans.length, daily: 0, weekly: 0, monthly: 0 };
    for (const p of plans) {
      const b = bandOf(p);
      if (b !== 'all') counts[b]++;
    }
    const out: { id: Band; label: string }[] = [{ id: 'all', label: 'All' }];
    if (counts.daily) out.push({ id: 'daily', label: 'Daily' });
    if (counts.weekly) out.push({ id: 'weekly', label: 'Weekly' });
    if (counts.monthly) out.push({ id: 'monthly', label: 'Monthly' });
    return out;
  }, [plans]);

  const shown = useMemo(() => {
    let list = plans;
    if (tab !== 'all') list = plans.filter((p) => bandOf(p) === tab);
    return [...list].sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
  }, [plans, tab]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-[18px] animate-pulse" style={{ background: 'var(--muted)' }} />
        ))}
      </div>
    );
  }

  if (!plans.length) {
    return (
      <p className="py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
        No packages from provider
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex gap-4 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative shrink-0 pb-2 text-[15px] font-semibold"
              style={{
                color: tab === t.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                background: 'none',
                border: 'none',
              }}
            >
              {t.label}
              {tab === t.id && (
                <span
                  className="absolute left-0 bottom-0 h-[3px] w-6 rounded-full"
                  style={{ background: 'var(--primary)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {shown.map((p) => {
          const active = selectedCode === p.code;
          const size = parseSize(p.name);
          const d = parseDays(p.name);
          return (
            <motion.button
              key={p.code}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(p)}
              className="flex flex-col items-center min-h-[118px] pt-3.5 px-1.5 pb-3 rounded-[18px] text-center"
              style={{
                background: 'var(--card)',
                border: active ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                boxShadow: active ? '0 0 0 1px color-mix(in oklab, var(--primary) 30%, transparent)' : undefined,
              }}
            >
              {d != null && (
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
                  {d === 1 ? '1 day' : `${d} days`}
                </span>
              )}
              {size ? (
                <span className="mt-1.5 mb-1 flex items-baseline gap-0.5 leading-none">
                  <b style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--foreground)' }}>
                    {size.n}
                  </b>
                  <i style={{ fontStyle: 'normal', fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)' }}>
                    {size.u}
                  </i>
                </span>
              ) : (
                <span
                  className="mt-1.5 mb-1 px-1"
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.name.replace(/\s*N[\d,]+\s*/gi, ' ').trim().slice(0, 42)}
                </span>
              )}
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>
                {money(p.amount, currency)}
              </span>
            </motion.button>
          );
        })}
      </div>
      {shown.length === 0 && (
        <p className="py-6 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          No plans in this category
        </p>
      )}
    </div>
  );
}
