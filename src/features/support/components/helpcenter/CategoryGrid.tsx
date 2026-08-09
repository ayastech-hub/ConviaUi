import { motion } from 'motion/react';
import { categories, allArticles } from './articleData';

interface CategoryGridProps {
  activeCategory: string | null;
  onSelectCategory: (title: string | null) => void;
}

/** "Browse by Topic" 2-column category grid on the main Help Center view. */
export function CategoryGrid({ activeCategory, onSelectCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {categories.map((cat, i) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.title;
        return (
          <motion.button
            key={i}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectCategory(isActive ? null : cat.title)}
            className="p-4 rounded-[16px] glass-card text-left"
            style={{ border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`, background: isActive ? 'var(--muted)' : undefined }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--muted)' }}>
              <Icon size={18} style={{ color: 'var(--foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{cat.title}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 6 }}>{cat.desc}</p>
            <p style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>{allArticles.filter((a) => a.category === cat.key).length} articles</p>
          </motion.button>
        );
      })}
    </div>
  );
}
