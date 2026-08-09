import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Zap, TrendingUp } from 'lucide-react';
import type { PostCardProps } from './types';

export function PostCard({ post, index, handlers, liked, likeCount, commentCount }: PostCardProps) {
  const postTypeIcon = (type: string) => {
    if (type === 'trade' || type === 'market')
      return <TrendingUp size={12} style={{ color: 'var(--foreground)' }} />;
    if (type === 'achievement')
      return <Zap size={12} style={{ color: 'var(--muted-foreground)' }} />;
    return null;
  };

  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-[20px] p-4 glass-card overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={() => handlers.onUserProfile(post.user)}
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: 'var(--muted)', fontSize: 12, fontWeight: 700 }}
        >
          {post.user.initials}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlers.onUserProfile(post.user)}
              style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}
            >
              {post.user.name}
            </button>
            {post.user.verified && <Zap size={13} style={{ color: 'var(--foreground)' }} />}
            {postTypeIcon(post.type)}
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              @{post.user.username}
            </span>
            <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{post.time}</span>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: 1.55, marginBottom: 10 }}>
        {post.content}
      </p>

      {post.image && (
        <div className="rounded-[16px] overflow-hidden mb-3" style={{ border: '1px solid var(--border)' }}>
          <img
            src={post.image}
            alt="Post attachment"
            loading="lazy"
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {post.tags.map(tag => (
          <span key={tag} style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>
            {tag}
          </span>
        ))}
      </div>

      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => handlers.onLike(post.id)}
          className="flex items-center gap-1.5"
        >
          <Heart
            size={17}
            style={{ color: liked ? 'var(--destructive)' : 'var(--muted-foreground)' }}
            fill={liked ? 'var(--destructive)' : 'none'}
          />
          <span
            style={{
              color: liked ? 'var(--destructive)' : 'var(--muted-foreground)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {likeCount}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => handlers.onComment(post.id)}
          className="flex items-center gap-1.5"
        >
          <MessageCircle size={17} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>
            {commentCount}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => handlers.onShare(post.id)}
          className="flex items-center gap-1.5"
        >
          <Share2 size={17} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>
            {post.shares}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
