import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight } from 'lucide-react';
import { SERVICE_GROUPS, type ServiceItem } from './serviceData';

/** Clean enterprise catalog — monochrome icons, tight groups, no fluff. */
export function ServiceHub({ onSelectService }: { onSelectService: (item: ServiceItem) => void }) {
  const [q, setQ] = useState('');

  const filteredGroups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return SERVICE_GROUPS;
    return SERVICE_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          i.label.toLowerCase().includes(needle) ||
          i.id.includes(needle) ||
          (i.description || '').toLowerCase().includes(needle),
      ),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  return (
    <div className="px-5 pb-10">
      <div
        className="flex items-center gap-2.5 px-3.5 h-11 rounded-2xl mb-6"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14 }}
        />
      </div>

      {filteredGroups.map((group) => (
        <div key={group.title} className="mb-6">
          <p
            className="px-0.5 mb-2"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {group.title}
          </p>
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {group.items.map((item, i) => {
              const Icon = item.icon;
              const last = i === group.items.length - 1;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectService(item)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
                  style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--muted)' }}
                  >
                    <Icon size={18} style={{ color: 'var(--foreground)' }} strokeWidth={2} />
                  </div>
                  <span className="flex-1" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
                    {item.label}
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {!filteredGroups.length && (
        <p className="py-16 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          No results
        </p>
      )}
    </div>
  );
}
