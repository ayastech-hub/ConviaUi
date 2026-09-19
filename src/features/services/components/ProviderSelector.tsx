import { motion } from 'motion/react';
import { ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PROVIDERS } from './serviceData';
import { ProviderIcon } from '../../../shared/icons/ProviderIcon';
import type { Biller } from '../../../shared/api/bills';
import { getCachedLogo } from '../../../shared/utils/logoCache';

interface ProviderSelectorProps {
  serviceId: string;
  /** Live billers from API — preferred over static PROVIDERS */
  billers?: Biller[];
  onSelect: (
    providerName: string,
    billerCode: string,
    meta?: { minAmount?: string; image?: string },
  ) => void;
}

/** Provider list with search — prefers live API billers. */
export function ProviderSelector({ serviceId, billers, onSelect }: ProviderSelectorProps) {
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    if (billers && billers.length) {
      return billers.map((b) => ({
        name: String(b.name || b.code || b.billerCode || 'Provider'),
        code: String(b.code || b.billerCode || b.id || ''),
        logo: (b as { image?: string }).image || getCachedLogo(String(b.code || b.billerCode || '')),
        minAmount: (b as { minAmount?: string }).minAmount,
      }));
    }
    return (PROVIDERS[serviceId] || []).map((p) => ({
      name: p.name,
      code: p.name,
      logo: p.logo,
    }));
  }, [billers, serviceId]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((p) => p.name.toLowerCase().includes(needle) || p.code.toLowerCase().includes(needle));
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
            key={p.code + p.name}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.name, p.code, { minAmount: (p as { minAmount?: string }).minAmount, image: p.logo })}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{
              borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border)',
            }}
          >
            <ProviderIcon name={p.name} logo={p.logo} size={40} rounded="xl" />
            <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, flex: 1 }}>
              {p.name}
            </span>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
        ))}
      </div>

      {!filtered.length && (
        <p className="py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          {list.length ? `No providers match “${q}”` : 'No providers available for this country'}
        </p>
      )}
    </motion.div>
  );
}
