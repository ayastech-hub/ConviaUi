import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Heart } from 'lucide-react';
import { AppInfoHeader } from '../components/AppInfoHeader';
import { LegalAccordion } from '../components/LegalAccordion';

interface AboutScreenProps {
  goBack: () => void;
}

export function AboutScreen({ goBack }: AboutScreenProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (label: string) => setExpanded((prev) => (prev === label ? null : label));

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>About</h2>
      </div>

      <div className="px-5 flex-1">
        <AppInfoHeader />

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>LEGAL</p>
        <LegalAccordion expanded={expanded} onToggle={toggle} />

        <div className="flex items-center justify-center gap-1.5 mb-8">
          <Heart size={14} style={{ color: 'var(--foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Made with love for Africa</p>
        </div>
      </div>
    </div>
  );
}
