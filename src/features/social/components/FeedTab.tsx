import React from 'react';
import type { FeedTabProps } from './types';
import { Stories } from './Stories';
import { TrendingTags } from './TrendingTags';
import { PostCard } from './PostCard';

const trending = ['#DeFiAfrica', '#BTC2026', '#Web3Lagos', '#SOLana', '#USDTNGNRate'];

export function FeedTab({ posts, handlers, likedPosts, commentCounts, onStoryClick }: FeedTabProps) {
  return (
    <>
      <Stories onStoryClick={onStoryClick} />
      <TrendingTags tags={trending} onTagClick={() => {}} />
      <div className="px-5 flex flex-col gap-4">
        {posts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            index={i}
            handlers={handlers}
            liked={likedPosts.has(post.id)}
            likeCount={post.likes + (likedPosts.has(post.id) && !post.liked ? 1 : 0)}
            commentCount={commentCounts[post.id] ?? post.comments}
          />
        ))}
      </div>
    </>
  );
}
