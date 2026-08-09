import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, TrendingUp, Shield, Gift, FileCheck, ArrowDownLeft, Check } from 'lucide-react';
import { notifications as initialNotifications, type Screen } from '../../../shared/data/mockData';

interface NotificationsScreenProps {
  goBack: () => void;
}

const notifIcon = (type: string) => {
  const m: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    receive: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
    price: { icon: TrendingUp, bg: 'var(--muted)', color: 'var(--foreground)' },
    security: { icon: Shield, bg: 'var(--muted)', color: 'var(--destructive)' },
    reward: { icon: Gift, bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    kyc: { icon: FileCheck, bg: 'var(--muted)', color: 'var(--foreground)' },
  };
  return m[type] ?? m.receive;
};

export function NotificationsScreen({ goBack }: NotificationsScreenProps) {
  const [notifs, setNotifs] = useState(initialNotifications.map(n => ({ ...n })));

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center justify-between px-5 mb-5">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--foreground)', color: 'var(--background)', fontSize: 10, fontWeight: 700 }}>{unreadCount}</span>
          )}
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          style={{ color: unreadCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 600, opacity: unreadCount > 0 ? 1 : 0.5 }}
        >
          Mark all read
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {notifs.length === 0 || unreadCount === 0 && notifs.every(n => n.read) ? (
          <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
              <Check size={28} style={{ color: 'var(--foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>All caught up</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You have no unread notifications</p>
          </div>
        ) : (
          <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
            {notifs.map((notif, i) => {
              const info = notifIcon(notif.type);
              const Icon = info.icon;
              return (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleRead(notif.id)}
                  className="flex items-start gap-3 px-4 py-4 relative w-full text-left"
                  style={{ borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none', background: !notif.read ? 'var(--muted)' : 'transparent' }}
                >
                  <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: info.bg }}>
                    <Icon size={18} style={{ color: info.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p style={{ color: 'var(--foreground)', fontWeight: notif.read ? 500 : 700, fontSize: 14 }}>{notif.title}</p>
                      {!notif.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--foreground)' }} />}
                    </div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.4 }}>{notif.body}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 4 }}>{notif.time}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
