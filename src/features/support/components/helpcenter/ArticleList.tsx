import { motion } from 'motion/react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import type { HelpArticle } from './articleData';

interface ArticleListProps {
  activeCategory: string | null;
  search: string;
  articles: HelpArticle[];
  onSelectArticle: (a: HelpArticle) => void;
}

/** "Popular Articles" / "<Category> Articles" list, or a no-results state. */
export function ArticleList({ activeCategory, search, articles, onSelectArticle }: ArticleListProps) {
  return (
    <>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
        {activeCategory ? `${activeCategory.toUpperCase()} ARTICLES` : 'POPULAR ARTICLES'}
      </p>
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <HelpCircle size={32} style={{ color: 'var(--muted-foreground)', marginBottom: 8 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>No articles found for "{search}"</p>
        </div>
      ) : (
        <div className="rounded-[20px] overflow-hidden glass-card mb-6" style={{ border: '1px solid var(--border)' }}>
          {articles.map((article, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectArticle(article)}
              className="flex items-center gap-3 px-4 py-3.5 w-full"
              style={{ borderBottom: i < articles.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="flex-1 text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{article.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 10, fontWeight: 600 }}>{article.category}</span>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{article.time}</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
          ))}
        </div>
      )}
    </>
  );
}
