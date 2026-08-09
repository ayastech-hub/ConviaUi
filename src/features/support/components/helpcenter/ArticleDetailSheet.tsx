import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { HelpArticle } from './articleData';

interface ArticleDetailSheetProps {
  article: HelpArticle | null;
  onClose: () => void;
}

/** Bottom sheet showing a help article's numbered steps. */
export function ArticleDetailSheet({ article, onClose }: ArticleDetailSheetProps) {
  return (
    <AnimatePresence>
      {article && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden" style={{ background: 'var(--card)', maxHeight: '80%', overflowY: 'auto' }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
              <div className="w-12 h-1 rounded-full mx-auto" style={{ background: 'var(--muted)' }} />
              <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <X size={18} style={{ color: 'var(--foreground)' }} />
              </button>
            </div>
            <div className="px-5 pb-8 pt-2">
              <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 10, fontWeight: 600 }}>{article.category}</span>
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginTop: 12, marginBottom: 4, lineHeight: 1.3 }}>{article.title}</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 20 }}>{article.time}</p>
              <div className="flex flex-col gap-3">
                {article.steps.map((step, si) => (
                  <div key={si} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                      <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{si + 1}</span>
                    </div>
                    <p style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: 1.5, paddingTop: 4 }}>{step}</p>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={onClose} className="w-full py-3.5 rounded-[14px] text-white mt-8" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                Got it
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
