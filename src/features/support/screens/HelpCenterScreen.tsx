import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MessageCircle, X } from 'lucide-react';
import { allArticles, type HelpArticle } from '../components/helpcenter/articleData';
import { CategoryGrid } from '../components/helpcenter/CategoryGrid';
import { ArticleList } from '../components/helpcenter/ArticleList';
import { ArticleDetailSheet } from '../components/helpcenter/ArticleDetailSheet';
import { SupportAgentChat } from '../components/SupportAgentChat';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';

interface HelpCenterScreenProps {
  goBack: () => void;
}

export function HelpCenterScreen({ goBack }: HelpCenterScreenProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const filteredArticles = allArticles.filter((article) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      article.title.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q) ||
      (article.summary && article.summary.toLowerCase().includes(q)) ||
      article.steps.some((s) => s.toLowerCase().includes(q));
    const matchesCategory = !activeCategory || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  const popularArticles = activeCategory || search.trim() ? filteredArticles : filteredArticles.slice(0, 8);


    if (chatOpen) {
    return <SupportAgentChat onBack={() => setChatOpen(false)} />;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={goBack} />
        <h1 className="flex-1 text-center pr-10" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
          Help Center
        </h1>
      </div>

      <div className="px-5 pb-10">
        <div
          className="rounded-[22px] px-4 py-4 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>How can we help?</p>
          <p className="mt-1 mb-3" style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45 }}>
            Guides for wallet, deposits, swaps, and security — aligned with how Convia works.
          </p>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-[14px]"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input
              placeholder="Search articles…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 14 }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}>
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            )}
          </div>
        </div>

        <div
          className="rounded-[20px] p-4 mb-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'color-mix(in oklab, var(--primary) 16%, transparent)' }}
            >
              <MessageCircle size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Chat with support</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Account, payments, and security help</p>
            </div>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setChatOpen(true)}
            className="w-full py-3 rounded-full"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 700, fontSize: 14 }}
          >
            Start conversation
          </motion.button>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 10, fontWeight: 700, letterSpacing: 0.6 }}>
          BROWSE BY TOPIC
        </p>
        <CategoryGrid activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

        <ArticleList activeCategory={activeCategory} search={search} articles={popularArticles} onSelectArticle={setSelectedArticle} />
      </div>

      <ArticleDetailSheet article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}
