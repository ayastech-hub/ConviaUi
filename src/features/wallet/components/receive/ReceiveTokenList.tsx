import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface ReceiveTokenListProps {
  assets: Asset[];
  goBack: () => void;
  onSelect: (a: Asset) => void;
}

/** Initial "Select a token to receive" full-screen list. */
export function ReceiveTokenList({ assets, goBack, onSelect }: ReceiveTokenListProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>{t('receive.title')}</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>Select a token to receive</p>
        </div>
      </div>
      <div className="px-5 pb-5">
        {assets.map((a, i) => (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(a)}
            className="flex items-center gap-3 p-4 rounded-[16px] mb-3 w-full text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <AssetIcon symbol={a.symbol} size={40} />
            <div className="flex-1">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{a.symbol}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.name}</p>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{a.chains.length} networks</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
        ))}
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}
