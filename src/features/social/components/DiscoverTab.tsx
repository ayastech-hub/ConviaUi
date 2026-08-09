import React from 'react';
import { motion } from 'motion/react';
import { Search, Zap, Star } from 'lucide-react';
import type { DiscoverTabProps } from './types';

export function DiscoverTab({ users, onFollow, isFollowing, onUserProfile }: DiscoverTabProps) {
  return (
    <div className="px-5">
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-4 glass-card"
        style={{ border: '1px solid var(--border)' }}
      >
        <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
        <input
          placeholder="Search users, topics..."
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14 }}
        />
      </div>

      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>Top Traders</p>

      <div className="flex flex-col gap-3">
        {users.map((user, i) => {
          const following = isFollowing(user.id);
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-[16px] glass-card"
              style={{ border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => onUserProfile(user)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)', fontSize: 13, fontWeight: 700 }}
                >
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                      {user.name}
                    </span>
                    {user.verified && <Zap size={12} style={{ color: 'var(--foreground)' }} />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                      @{user.username} · {user.followers.toLocaleString()} followers
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} style={{ color: 'var(--warning)' }} fill="var(--warning)" />
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                      {user.rating} · {user.trades} trades
                    </span>
                  </div>
                </div>
              </button>

              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => onFollow(user.id)}
                className="px-4 py-2 rounded-[12px] flex-shrink-0"
                style={{
                  background: following ? 'var(--muted)' : 'var(--primary)',
                  color: following ? 'var(--foreground)' : '#FFF',
                  fontSize: 12,
                  fontWeight: 700,
                  border: following ? '1px solid var(--border)' : 'none',
                }}
              >
                {following ? 'Following' : 'Follow'}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
