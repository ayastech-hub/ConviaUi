import React from 'react';
import { Hash } from 'lucide-react';
import type { TrendingTagsProps } from './types';

export function TrendingTags({ tags, onTagClick }: TrendingTagsProps) {
  return (
    <div className="px-5 mb-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          >
            <Hash size={10} style={{ color: 'var(--foreground)' }} />
            <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
              {tag.slice(1)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
