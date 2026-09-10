import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { SERVICE_GROUPS, type ServiceItem } from './serviceData';

/** Grid catalog — dense tiles so most features show without long scroll. */
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
        className="flex items-center gap-2.5 px-3.5 h-11 rounded-2xl mb-5"
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
        <div key={group.title} className="mb-5">
          <p
            className="px-0.5 mb-2.5"
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
          <div className="grid grid-cols-4 gap-2.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onSelectService(item)}
                  className="flex flex-col items-center gap-2 pt-3.5 pb-2.5 px-1 rounded-[18px]"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Icon size={20} style={{ color: 'var(--foreground)' }} strokeWidth={1.8} />
                  </div>
                  <span
                    className="text-center leading-tight px-0.5"
                    style={{
                      color: 'var(--foreground)',
                      fontSize: 11,
                      fontWeight: 600,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                  >
                    {item.label}
                  </span>
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
