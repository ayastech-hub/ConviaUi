import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { SERVICE_GROUPS, type ServiceItem } from './serviceData';

/** The main "Service Hub" grid: groups of tappable service tiles plus a security note. */
export function ServiceHub({ onSelectService }: { onSelectService: (item: ServiceItem) => void }) {
  return (
    <div className="px-5 pb-5">
      {SERVICE_GROUPS.map((group, gi) => (
        <motion.div key={group.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.08 }} className="mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h2 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>{group.title}</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{group.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {group.items.map((item, ii) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: gi * 0.08 + ii * 0.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectService(item)}
                  className="flex flex-col gap-3 p-4 rounded-[20px] text-left"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card glass-refraction" style={{ background: 'var(--muted)' }}>
                    <Icon size={20} style={{ color: 'var(--foreground)' }} strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{item.label}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 2 }}>{item.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}

      <div className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] mt-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <Shield size={16} style={{ color: 'var(--muted-foreground)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>All payments are secured with bank-grade encryption</p>
      </div>
    </div>
  );
}
