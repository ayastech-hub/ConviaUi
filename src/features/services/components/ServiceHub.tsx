import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Shield, Zap, Clock, ChevronRight } from 'lucide-react';
import { SERVICE_GROUPS, type ServiceItem } from './serviceData';

const QUICK_IDS = ['airtime', 'data', 'electricity', 'bills'] as const;

const ACCENT: Record<string, string> = {
  airtime: 'var(--primary)',
  data: 'var(--primary)',
  electricity: '#F59E0B',
  bills: '#8B5CF6',
  betting: '#EC4899',
  giftcards: '#22C55E',
  internet: 'var(--primary)',
  water: '#3B82F6',
};

/**
 * Enterprise Services hub — search, quick actions, grouped catalog, trust strip.
 */
export function ServiceHub({ onSelectService }: { onSelectService: (item: ServiceItem) => void }) {
  const [q, setQ] = useState('');

  const allItems = useMemo(
    () => SERVICE_GROUPS.flatMap((g) => g.items),
    [],
  );

  const quick = useMemo(
    () =>
      QUICK_IDS.map((id) => allItems.find((i) => i.id === id)).filter(Boolean) as ServiceItem[],
    [allItems],
  );

  const filteredGroups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return SERVICE_GROUPS;
    return SERVICE_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          i.label.toLowerCase().includes(needle) ||
          i.description.toLowerCase().includes(needle) ||
          i.id.includes(needle),
      ),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  return (
    <div className="px-5 pb-8">
      {/* Hero */}
      <div className="mb-5">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45 }}>
          Pay bills and top up from your Convia balance — airtime, data, power, TV, and more.
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl mb-5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <Search size={18} style={{ color: 'var(--muted-foreground)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--foreground)' }}
        />
      </div>

      {/* Quick actions */}
      {!q && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>Quick pay</p>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {quick.map((item) => {
              const Icon = item.icon;
              const accent = ACCENT[item.id] || 'var(--primary)';
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectService(item)}
                  className="flex flex-col items-center gap-2 min-w-[76px] py-3 px-2 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--muted)' }}
                  >
                    <Icon size={20} style={{ color: accent }} strokeWidth={2} />
                  </div>
                  <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>
                    {item.label.split(' ')[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Groups */}
      {filteredGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.05 }}
          className="mb-6"
        >
          <div className="mb-3">
            <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{group.title}</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{group.subtitle}</p>
          </div>

          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {group.items.map((item, ii) => {
              const Icon = item.icon;
              const accent = ACCENT[item.id] || 'var(--primary)';
              const last = ii === group.items.length - 1;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectService(item)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
                  style={{
                    borderBottom: last ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--muted)' }}
                  >
                    <Icon size={20} style={{ color: accent }} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                      {item.label}
                    </p>
                    <p
                      style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}
                      className="truncate"
                    >
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} className="flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {!filteredGroups.length && (
        <p className="py-12 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          No services match “{q}”
        </p>
      )}

      {/* Trust */}
      <div
        className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <Shield size={16} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 12 }}>Paid from your Convia balance</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>
            Settled on-ledger. Keep enough crypto or stablecoin balance for the local amount plus fees.
          </p>
        </div>
      </div>

      {!q && (
        <div className="flex items-center gap-2 mt-4 justify-center">
          <Clock size={12} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Most payments complete in under a minute</span>
        </div>
      )}
    </div>
  );
}
