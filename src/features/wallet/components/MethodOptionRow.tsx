import { motion } from 'motion/react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

export function MethodOptionRow({
  title,
  subtitle,
  Icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl text-left mb-2.5"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--muted)' }}
      >
        <Icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>{title}</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }} className="leading-snug">
          {subtitle}
        </p>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} className="flex-shrink-0" />
    </motion.button>
  );
}

export function MethodOrDivider() {
  return (
    <div className="flex items-center gap-3 my-4 px-1">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>OR</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}
