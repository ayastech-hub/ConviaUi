import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Send, MessageCircle } from 'lucide-react';
import type { CommentSheetProps } from './types';

export function CommentSheet({
  open,
  post,
  comments,
  onClose,
  onAddComment,
  onLikeComment,
}: CommentSheetProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    onAddComment(input.trim());
    setInput('');
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

            <div className="flex items-center justify-between px-5 mt-3 mb-3">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
                Comments ({comments.length})
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <MessageCircle size={32} style={{ color: 'var(--muted-foreground)' }} />
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
                    No comments yet. Be the first!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {comments.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: 'var(--muted)', fontSize: 11, fontWeight: 700 }}
                      >
                        {c.user.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                            {c.user.name}
                          </span>
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                            @{c.user.username}
                          </span>
                          <span style={{ color: 'var(--border)', fontSize: 11 }}>·</span>
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                            {c.time}
                          </span>
                        </div>
                        <p style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: 1.45 }}>
                          {c.text}
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onLikeComment(c.id)}
                          className="flex items-center gap-1 mt-1.5"
                        >
                          <Heart
                            size={13}
                            style={{
                              color: c.liked ? 'var(--destructive)' : 'var(--muted-foreground)',
                            }}
                            fill={c.liked ? 'var(--destructive)' : 'none'}
                          />
                          <span
                            style={{
                              color: c.liked ? 'var(--destructive)' : 'var(--muted-foreground)',
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            {c.likes}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2 px-5 py-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="flex-1 px-4 py-3 rounded-[14px] bg-transparent outline-none"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: 14,
                }}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: input.trim() ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                <Send size={18} style={{ color: input.trim() ? '#FFF' : 'var(--muted-foreground)' }} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
