import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import type { StoriesProps } from './types';

const stories = [
  { name: 'You', initials: 'U', color: 'var(--foreground)', isYou: true },
  { name: 'Kwame', initials: 'KA', color: 'var(--foreground)', active: true },
  { name: 'Amara', initials: 'AD', color: 'var(--muted-foreground)', active: true },
  { name: 'Chidera', initials: 'CO', color: 'var(--foreground)', active: false },
  { name: 'Fatima', initials: 'FH', color: 'var(--muted-foreground)', active: false },
  { name: 'Emeka', initials: 'EN', color: 'var(--muted-foreground)', active: false },
];

export function Stories({ onStoryClick }: StoriesProps) {
  return (
    <div className="mb-4">
      <div className="flex gap-3 px-5 overflow-x-auto pb-1">
        {stories.map((story, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.93 }}
            onClick={() => onStoryClick(i)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--muted)',
                  fontSize: story.isYou ? 22 : 16,
                  fontWeight: 700,
                  boxShadow:
                    story.active && !story.isYou
                      ? '0 0 0 2px var(--background), 0 0 0 4px var(--primary)'
                      : 'none',
                }}
              >
                {story.initials}
              </div>
              {story.isYou && (
                <div
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--foreground)', border: '2px solid var(--background)' }}
                >
                  <Plus size={10} className="text-white" />
                </div>
              )}
              {story.active && !story.isYou && (
                <div
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full"
                  style={{ background: 'var(--foreground)', border: '2px solid var(--background)' }}
                />
              )}
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}>
              {story.isYou ? 'Your Story' : story.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
