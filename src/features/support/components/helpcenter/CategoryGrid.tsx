import { motion } from 'motion/react';
import { categories, allArticles } from './articleData';

interface CategoryGridProps {
  activeCategory: string | null;
  onSelectCategory: (key: string | null) => void;
}

/** Browse-by-topic grid — selection uses category key for accurate filtering. */
export function CategoryGrid({ activeCategory, onSelectCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.key;
        const count = allArticles.filter((a) => a.category === cat.key).length;
        return (
          <motion.button
            key={cat.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectCategory(isActive ? null : cat.key)}
            className="p-4 rounded-[16px] glass-card text-left"
            style={{
              border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
              background: isActive ? 'var(--muted)' : undefined,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'var(--muted)' }}
            >
              <Icon size={18} style={{ color: 'var(--foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{cat.title}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 6 }}>{cat.desc}</p>
            <p style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>
              {count} article{count === 1 ? '' : 's'}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
