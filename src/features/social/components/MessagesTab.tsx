import React from 'react';
import { motion } from 'motion/react';
import { Search, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { chatContacts } from '../../../shared/data/mockData';
import type { MessagesTabProps } from './types';

export function MessagesTab({ navigate, onOpenPayment, onOpenProfile, sentPayments }: MessagesTabProps) {
  return (
    <div className="px-5">
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-4 glass-card"
        style={{ border: '1px solid var(--border)' }}
      >
        <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
        <input
          placeholder="Search messages..."
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14 }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {chatContacts.map((contact, i) => {
          const payment = sentPayments.find(p => p.contactId === contact.id);
          return (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-[16px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('chat')}
                className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
              >
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--muted)', fontSize: 13, fontWeight: 700 }}
                  >
                    {contact.initials}
                  </div>
                  {contact.online && (
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                      style={{ background: 'var(--foreground)', border: '2px solid var(--background)' }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenProfile(contact); }}
                      style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}
                    >
                      {contact.name}
                    </button>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                      {payment ? payment.time : contact.time}
                    </span>
                  </div>
                  <p
                    style={{
                      color: payment ? 'var(--primary)' : 'var(--muted-foreground)',
                      fontSize: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {payment ? `Sent ${payment.amount} ${payment.asset}` : contact.lastMessage}
                  </p>
                </div>
              </motion.div>

              {contact.unread > 0 && !payment && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: 'var(--secondary)', fontSize: 10, fontWeight: 700 }}
                >
                  {contact.unread}
                </div>
              )}
              {payment && <CheckCircle2 size={16} style={{ color: 'var(--foreground)', flexShrink: 0 }} />}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onOpenPayment(contact)}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--muted)' }}
              >
                <ArrowUpRight size={16} style={{ color: 'var(--foreground)' }} />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
