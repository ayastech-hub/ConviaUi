import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface ListRowProps {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  desc?: string;
  onClick?: () => void;
  /** Custom trailing element (e.g. a `ToggleSwitch` or badge). Defaults to a chevron when omitted. */
  trailing?: ReactNode;
}

/**
 * A single tappable row inside a `ListSection`: icon badge, label +
 * optional description, and a trailing chevron/toggle/badge. This is
 * the row shape reused across Profile's Account/Activity/Support
 * lists, Settings' Preferences list, and Security's toggle/action lists.
 */
export function ListRow({ icon: Icon, label, desc, onClick, trailing }: ListRowProps) {
  const Wrapper = onClick ? motion.button : 'div';
  const wrapperProps = onClick ? { whileTap: { scale: 0.99 }, onClick } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="w-full flex items-center gap-3 px-4 py-3.5"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
        <Icon size={17} style={{ color: 'var(--foreground)' }} />
      </div>
      <div className="flex-1 text-left">
        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{label}</p>
        {desc && <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{desc}</p>}
      </div>
      {trailing ?? <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />}
    </Wrapper>
  );
}
