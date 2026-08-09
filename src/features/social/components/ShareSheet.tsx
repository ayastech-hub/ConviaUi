import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Link2, Send, Bookmark, Twitter, Facebook, CheckCircle2, ChevronRight, Search,
} from 'lucide-react';
import type { ShareSheetProps } from './types';
import { socialUsers } from '../../../shared/data/mockData';

export function ShareSheet({ open, post, onClose, onToast }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const people = socialUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  const shareOptions = [
    { id: 'copy', label: 'Copy Link', icon: Link2, action: () => {
      navigator.clipboard?.writeText(`https://convia.app/p/${post?.id ?? ''}`).catch(() => {});
      setCopied(true);
      onToast('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }},
    { id: 'dm', label: 'Send in DM', icon: Send, action: () => { onToast('Opening messages...'); onClose(); }},
    { id: 'save', label: 'Save Post', icon: Bookmark, action: () => { onToast('Post saved'); onClose(); }},
    { id: 'twitter', label: 'Share to X', icon: Twitter, action: () => { onToast('Opening X...'); onClose(); }},
    { id: 'facebook', label: 'Share to Facebook', icon: Facebook, action: () => { onToast('Opening Facebook...'); onClose(); }},
  ];

  const sendToUser = (userId: string) => {
    const user = socialUsers.find(u => u.id === userId);
    if (!user) return;
    onToast(`Post shared with ${user.name}`);
    setSelectedUser(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && post && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden flex flex-col"
            style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', maxHeight: '85%' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mt-3" style={{ background: 'var(--border)' }} />

            <div className="flex items-center justify-between px-5 mt-3 mb-4">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Share Post</h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            <div className="px-5 pb-2">
              <div className="rounded-[14px] p-3 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <p
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 13,
                    lineHeight: 1.45,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {post.content}
                </p>
              </div>
            </div>

            <div className="px-5 pb-3">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                Share to
              </p>
              <div className="grid grid-cols-5 gap-2">
                {shareOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={opt.action}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-[14px]"
                      style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--card)' }}>
                        <Icon size={18} style={{ color: 'var(--foreground)' }} />
                      </div>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 500, textAlign: 'center' }}>
                        {opt.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 pb-4 flex-1 overflow-hidden flex flex-col">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Send to people
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] mb-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 13 }}
                />
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-1">
                {people.map(user => (
                  <motion.button
                    key={user.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendToUser(user.id)}
                    className="flex items-center gap-3 p-2.5 rounded-[12px] text-left"
                    style={{ background: selectedUser === user.id ? 'var(--muted)' : 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>
                      {user.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{user.name}</span>
                        {user.verified && <span style={{ color: 'var(--primary)', fontSize: 10 }}>✓</span>}
                      </div>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>@{user.username}</span>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                  </motion.button>
                ))}
                {people.length === 0 && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                    No people found
                  </p>
                )}
              </div>
            </div>

            {copied && (
              <div className="flex items-center justify-center gap-2 pb-4">
                <CheckCircle2 size={14} style={{ color: 'var(--positive)' }} />
                <span style={{ color: 'var(--positive)', fontSize: 12, fontWeight: 600 }}>Link copied!</span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
