import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, TrendingUp, Shield, Gift, Users, FileCheck, ArrowDownLeft } from 'lucide-react';
import { notifications, type Screen } from '../../data/mockData';

interface NotificationsScreenProps {
  goBack: () => void;
}

const notifIcon = (type: string) => {
  const m: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    receive: { icon: ArrowDownLeft, bg: 'rgba(99,102,241,0.15)', color: 'var(--primary)' },
    price: { icon: TrendingUp, bg: 'rgba(99,102,241,0.15)', color: 'var(--primary)' },
    security: { icon: Shield, bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
    social: { icon: Users, bg: 'rgba(99,102,241,0.15)', color: 'var(--primary)' },
    reward: { icon: Gift, bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
    kyc: { icon: FileCheck, bg: 'rgba(99,102,241,0.15)', color: 'var(--primary)' },
  };
  return m[type] ?? m.receive;
};

export function NotificationsScreen({ goBack }: NotificationsScreenProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center justify-between px-5 mb-5">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Notifications</h2>
        </div>
        <button style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>Mark all read</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
          {notifications.map((notif, i) => {
            const info = notifIcon(notif.type);
            const Icon = info.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 px-4 py-4 relative"
                style={{ borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', background: !notif.read ? 'rgba(99,102,241,0.04)' : 'transparent' }}
              >
                <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: info.bg }}>
                  <Icon size={18} style={{ color: info.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{notif.title}</p>
                    {!notif.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />}
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.4 }}>{notif.body}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 4 }}>{notif.time}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
