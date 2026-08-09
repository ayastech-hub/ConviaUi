import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { PROVIDERS } from './serviceData';

interface ProviderSelectorProps {
  serviceId: string;
  onSelect: (providerName: string) => void;
}

/** "Select Provider" list shown for the active bill service (MTN, DSTV, ECG, etc). */
export function ProviderSelector({ serviceId, onSelect }: ProviderSelectorProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Select Provider</p>
      {PROVIDERS[serviceId]?.map((p, i) => (
        <motion.button
          key={p.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(p.name)}
          className="flex items-center gap-3 p-3.5 rounded-[14px] text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <span style={{ color: 'var(--foreground)', fontSize: 10, fontWeight: 800 }}>{p.logo}</span>
          </div>
          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, flex: 1 }}>{p.name}</span>
          <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      ))}
    </motion.div>
  );
}
