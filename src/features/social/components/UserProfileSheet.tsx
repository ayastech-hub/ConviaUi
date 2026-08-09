import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Star, TrendingUp, Heart, MessageCircle, Share2, Calendar, ShieldCheck } from 'lucide-react';
import type { UserProfileSheetProps } from './types';
import { PostCard } from './PostCard';

export function UserProfileSheet({
  open,
  user,
  posts,
  onClose,
  isFollowing,
  onFollow,
  onLike,
  onComment,
  onShare,
  onUserProfile,
}: UserProfileSheetProps) {
  const userPosts = posts.filter(p => p.user.id === user?.id);

  const handlers = {
    onLike,
    onComment,
    onShare,
    onUserProfile,
    onFollow: () => {},
    isFollowing: () => false,
  };

  return (
    <AnimatePresence>
      {open && user && (
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
            style={{ background: 'var(--background)', borderTop: '1px solid var(--border)', maxHeight: '90%' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mt-3" style={{ background: 'var(--border)' }} />

            <div className="flex items-center justify-between px-5 mt-3 mb-2">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Profile</h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)', fontSize: 24, fontWeight: 800 }}
                >
                  {user.initials}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
                      {user.name}
                    </span>
                    {user.verified && <Zap size={15} style={{ color: 'var(--foreground)' }} />}
                  </div>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    @{user.username}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {user.online ? (
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--positive)', color: '#FFF', fontSize: 10, fontWeight: 700 }}
                      >
                        Online
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}
                      >
                        <Calendar size={9} /> Joined {user.joinedDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
                {user.bio}
              </p>

              <div className="rounded-[16px] p-4 mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--positive)' }} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Verified Trader</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Identity confirmed · KYC complete</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Total Volume', value: `${(user.trades * 1240).toLocaleString()}` },
                    { label: 'Completion Rate', value: '99.2%' },
                    { label: 'Avg. Response Time', value: '~4 min' },
                    { label: 'Member Since', value: user.joinedDate ?? '2023' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{item.label}</span>
                      <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-5">
                <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>{user.followers.toLocaleString()}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Followers</p>
                </div>
                <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>{user.following.toLocaleString()}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Following</p>
                </div>
                <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>{user.trades.toLocaleString()}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Trades</p>
                </div>
                <div className="rounded-[14px] p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-center gap-0.5">
                    <Star size={12} style={{ color: 'var(--warning)' }} fill="var(--warning)" />
                    <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>{user.rating}</p>
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>Rating</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onFollow}
                className="w-full h-[48px] rounded-[16px] flex items-center justify-center gap-2 mb-5"
                style={{
                  background: isFollowing ? 'var(--muted)' : 'var(--primary)',
                  color: isFollowing ? 'var(--foreground)' : '#FFF',
                  fontWeight: 700,
                  fontSize: 15,
                  border: isFollowing ? '1px solid var(--border)' : 'none',
                }}
              >
                {isFollowing ? (
                  <><ShieldCheck size={18} /> Following</>
                ) : (
                  <><TrendingUp size={18} /> Follow</>
                )}
              </motion.button>

              <div className="mb-3">
                <h4 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                  Posts ({userPosts.length})
                </h4>
                <div className="flex flex-col gap-4">
                  {userPosts.map((post, i) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={i}
                      handlers={handlers}
                      liked={post.liked}
                      likeCount={post.likes}
                      commentCount={post.comments}
                    />
                  ))}
                  {userPosts.length === 0 && (
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                      No posts yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
