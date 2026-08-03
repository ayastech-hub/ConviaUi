import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Search, ChevronRight, MessageCircle, Shield, CreditCard, TrendingUp, User, Zap, HelpCircle } from 'lucide-react';

interface HelpCenterScreenProps {
  goBack: () => void;
}

const categories = [
  { icon: User, title: 'Account & Profile', desc: 'Setup, verification, login issues', count: 12 },
  { icon: CreditCard, title: 'Payments & Banking', desc: 'Deposits, withdrawals, bank accounts', count: 18 },
  { icon: TrendingUp, title: 'Trading & Swaps', desc: 'Buy, sell, swap, OTC trading', count: 15 },
  { icon: Shield, title: 'Security & Privacy', desc: 'PIN, 2FA, biometrics, recovery', count: 9 },
  { icon: Zap, title: 'On-Ramp & Off-Ramp', desc: 'Cash to crypto, crypto to cash', count: 11 },
  { icon: HelpCircle, title: 'General FAQ', desc: 'Common questions and guides', count: 24 },
];

const popularArticles = [
  { title: 'How to verify your identity (KYC)', category: 'Account', time: '3 min read' },
  { title: 'Adding a bank account for withdrawals', category: 'Payments', time: '2 min read' },
  { title: 'How to enable two-factor authentication', category: 'Security', time: '1 min read' },
  { title: 'Understanding on-ramp fees and rates', category: 'On-Ramp', time: '4 min read' },
  { title: 'How to recover your account', category: 'Account', time: '3 min read' },
  { title: 'Trading on the OTC P2P marketplace', category: 'Trading', time: '5 min read' },
];

export function HelpCenterScreen({ goBack }: HelpCenterScreenProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
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
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
        </div>

        <div className="rounded-[20px] p-5 mb-6 glass-card glass-refraction" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
              <MessageCircle size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Need help? Chat with us</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Our support team is available 24/7</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3 rounded-[12px] text-white mt-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
            Start a Conversation
          </motion.button>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>BROWSE BY TOPIC</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                className="p-4 rounded-[16px] glass-card text-left"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <Icon size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{cat.title}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 6 }}>{cat.desc}</p>
                <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600 }}>{cat.count} articles</p>
              </motion.button>
            );
          })}
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>POPULAR ARTICLES</p>
        <div className="rounded-[20px] overflow-hidden glass-card mb-6" style={{ border: '1px solid var(--border)' }}>
          {popularArticles.map((article, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3.5 w-full"
              style={{ borderBottom: i < popularArticles.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="flex-1 text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{article.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', fontSize: 10, fontWeight: 600 }}>{article.category}</span>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{article.time}</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
