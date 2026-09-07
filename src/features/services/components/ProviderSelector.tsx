import { motion } from 'motion/react';
import { ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PROVIDERS } from './serviceData';

interface ProviderSelectorProps {
  serviceId: string;
  onSelect: (providerName: string) => void;
}

/** Provider list with search — enterprise density. */
export function ProviderSelector({ serviceId, onSelect }: ProviderSelectorProps) {
  const [q, setQ] = useState('');
  const list = PROVIDERS[serviceId] || [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((p) => p.name.toLowerCase().includes(needle));
  }, [list, q]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
        Select provider
      </p>

      {list.length > 4 && (
        <div
          className="flex items-center gap-2 px-3 h-11 rounded-xl mb-1"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search provider"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      )}

      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {filtered.map((p, i) => (
          <motion.button
            key={p.name}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.name)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{
              borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--muted)' }}
            >
              <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 800 }}>{p.logo}</span>
            </div>
            <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, flex: 1 }}>
              {p.name}
            </span>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
        ))}
      </div>

      {!filtered.length && (
        <p className="py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          No providers match “{q}”
        </p>
      )}
    </motion.div>
  );
}
