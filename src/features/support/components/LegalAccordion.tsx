import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { legalContent, legalLinks } from './legalContent';

interface LegalAccordionProps {
  expanded: string | null;
  onToggle: (label: string) => void;
}

/** Expandable "Terms / Privacy / Licenses / Contact / Website" accordion list. */
export function LegalAccordion({ expanded, onToggle }: LegalAccordionProps) {
  return (
    <div className="rounded-[20px] overflow-hidden glass-card mb-6" style={{ border: '1px solid var(--border)' }}>
      {legalLinks.map((link, i) => {
        const Icon = link.icon;
        const isOpen = expanded === link.label;
        const content = legalContent[link.label];
        return (
          <div key={i}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(link.label)}
              className="flex items-center gap-3 px-4 py-3.5 w-full"
              style={{ borderBottom: i < legalLinks.length - 1 ? '1px solid var(--border)' : isOpen ? '1px solid var(--border)' : 'none' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Icon size={18} style={{ color: 'var(--foreground)' }} />
              </div>
              <div className="flex-1 text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{link.label}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{link.desc}</p>
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {isOpen && content && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1" style={{ background: 'var(--muted)' }}>
                    {content.body.map((para, pi) => (
                      <p key={pi} style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.6, marginBottom: pi < content.body.length - 1 ? 10 : 0 }}>{para}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
