import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Search, MessageCircle, X } from 'lucide-react';
import { allArticles, type HelpArticle } from '../components/helpcenter/articleData';
import { initialMessages, getBotResponse, type ChatMessage } from '../components/helpcenter/chatData';
import { CategoryGrid } from '../components/helpcenter/CategoryGrid';
import { ArticleList } from '../components/helpcenter/ArticleList';
import { ArticleDetailSheet } from '../components/helpcenter/ArticleDetailSheet';
import { SupportChatView } from '../components/helpcenter/SupportChatView';

interface HelpCenterScreenProps {
  goBack: () => void;
}

export function HelpCenterScreen({ goBack }: HelpCenterScreenProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: 'u_' + Date.now(), text: text.trim(), sender: 'user', time: 'Just now', status: 'sent' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = { id: 's_' + Date.now(), text: getBotResponse(text), sender: 'support', time: 'Just now', status: 'read' };
      setMessages((prev) => [...prev.map((m) => (m.sender === 'user' ? { ...m, status: 'read' as const } : m)), botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  if (chatOpen) {
    return (
      <SupportChatView
        messages={messages} isTyping={isTyping} scrollRef={scrollRef}
        input={input} setInput={setInput} onSend={sendMessage}
        onBack={() => { setChatOpen(false); setMessages(initialMessages); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Help Center</h2>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-6 glass-card" style={{ border: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            placeholder="Search for help..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={16} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          )}
        </div>

        <div className="rounded-[20px] p-5 mb-6 glass-card glass-refraction" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--border)' }}>
              <MessageCircle size={20} style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Need help? Chat with us</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Our support team is available 24/7</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setChatOpen(true)} className="w-full py-3 rounded-[12px] text-white mt-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
            Start a Conversation
          </motion.button>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>BROWSE BY TOPIC</p>
        <CategoryGrid activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

        <ArticleList activeCategory={activeCategory} search={search} articles={popularArticles} onSelectArticle={setSelectedArticle} />
      </div>

      <ArticleDetailSheet article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
}
