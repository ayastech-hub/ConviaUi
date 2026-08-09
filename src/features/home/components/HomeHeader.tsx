import { motion } from 'motion/react';
import { Bell, ScanLine } from 'lucide-react';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';

interface HomeHeaderProps {
  notificationCount: number;
  onScan: () => void;
  onOpenNotifications: () => void;
}

/** Greeting + scan/notification buttons at the top of Home. */
export function HomeHeader({ notificationCount, onScan, onOpenNotifications }: HomeHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center glass-refraction" style={{ background: 'var(--primary)' }}>
          <ConviaLogo size={18} color="#FFFFFF" />
        </div>
        <div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Good morning</p>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Ade Mensah</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onScan} aria-label="Scan QR" className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card">
          <ScanLine size={18} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenNotifications} aria-label="Notifications" className="relative w-10 h-10 rounded-2xl flex items-center justify-center glass-card">
          <Bell size={18} style={{ color: 'var(--foreground)' }} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center pulse-badge" style={{ background: 'var(--destructive)', fontSize: 10, fontWeight: 700, boxShadow: '0 0 12px var(--muted)' }}>
              {notificationCount}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
