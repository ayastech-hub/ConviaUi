import { motion } from 'motion/react';
import { Smartphone } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';

const SESSIONS = [
  { device: 'iPhone 15 Pro', location: 'Lagos, Nigeria', current: true, time: 'Active now' },
  { device: 'MacBook Pro', location: 'Lagos, Nigeria', current: false, time: '2 hours ago' },
  { device: 'iPad Air', location: 'Abuja, Nigeria', current: false, time: '3 days ago' },
];

interface ActiveSessionsViewProps {
  onBack: () => void;
}

/** "Active Sessions" view: lists logged-in devices with the option to revoke access. */
export function ActiveSessionsView({ onBack }: ActiveSessionsViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Active Sessions" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5">
        {SESSIONS.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-[16px] mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <Smartphone size={18} style={{ color: s.current ? 'var(--primary)' : 'var(--muted-foreground)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{s.device}</p>
                {s.current && <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 10, fontWeight: 700 }}>CURRENT</span>}
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{s.location}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{s.time}</p>
            </div>
            {!s.current && (
              <motion.button whileTap={{ scale: 0.9 }} className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--destructive)', fontSize: 12, fontWeight: 600 }}>
                Revoke
              </motion.button>
            )}
          </div>
        ))}
        <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-[16px] mt-2" style={{ background: 'var(--muted)', color: 'var(--destructive)', fontWeight: 700, fontSize: 15, border: '1px solid var(--muted)' }}>
          Revoke All Other Sessions
        </motion.button>
      </div>
    </div>
  );
}
