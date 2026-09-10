import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { GiftCard, CARD_THEME_OPTIONS, THEMES } from './GiftCard';
import type { CardTheme, Gift } from '../types';

interface Props {
  selected: CardTheme;
  preview: Pick<Gift, 'note' | 'creatorMask' | 'code' | 'asset' | 'totalAmount' | 'slots' | 'claimedCount' | 'splitMode' | 'status' | 'expiresAt' | 'kind'>;
  onSelect: (t: CardTheme) => void;
  onBack: () => void;
}

/** Full-screen live card carousel — pick a style. */
export function CardThemePicker({ selected, preview, onSelect, onBack }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(selected);
  const options = CARD_THEME_OPTIONS;

  useEffect(() => {
    const i = options.findIndex((o) => o.id === selected);
    if (i >= 0 && scroller.current) {
      const el = scroller.current.children[i] as HTMLElement | undefined;
      el?.scrollIntoView({ inline: 'center', behavior: 'instant' as ScrollBehavior, block: 'nearest' });
    }
  }, []);

  const onScroll = () => {
    const root = scroller.current;
    if (!root) return;
    const center = root.scrollLeft + root.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(root.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const c = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(options[best]?.id || active);
  };

  const confirm = () => onSelect(active);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-2">
        <BackButton onClick={onBack} />
        <div className="flex-1 min-w-0">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>Card style</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Swipe to preview · tap Use this style</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-[12%] pb-4"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {options.map((opt) => {
            const mock: Gift = {
              id: 'preview',
              kind: preview.kind || 'giveaway',
              code: preview.code || 'ABCD1234',
              asset: preview.asset || 'USDT',
              totalAmount: preview.totalAmount || 100,
              perClaimAmount: (preview.totalAmount || 100) / Math.max(1, preview.slots || 5),
              slots: preview.slots || 5,
              claimedCount: preview.claimedCount || 0,
              splitMode: preview.splitMode || 'equal',
              note: preview.note || 'All the Best — Claim Your Gift!',
              expiresAt: preview.expiresAt || new Date(Date.now() + 864e5).toISOString(),
              status: preview.status || 'open',
              createdAt: new Date().toISOString(),
              creatorId: 'preview',
              creatorMask: preview.creatorMask || 'ya....hub',
              cardTheme: opt.id,
              claims: [],
            };
            const on = active === opt.id;
            return (
              <div
                key={opt.id}
                className="snap-center flex-shrink-0"
                style={{ width: 'min(78vw, 300px)' }}
                onClick={() => {
                  setActive(opt.id);
                  const i = options.findIndex((o) => o.id === opt.id);
                  const el = scroller.current?.children[i] as HTMLElement | undefined;
                  el?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
                }}
              >
                <div
                  style={{
                    transform: on ? 'scale(1)' : 'scale(0.92)',
                    opacity: on ? 1 : 0.55,
                    transition: 'transform 0.2s ease, opacity 0.2s ease',
                  }}
                >
                  <GiftCard gift={mock} mode="public" compact />
                </div>
                <p
                  className="text-center mt-3"
                  style={{
                    color: on ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontWeight: on ? 700 : 500,
                    fontSize: 13,
                  }}
                >
                  {opt.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* dots */}
        <div className="flex justify-center gap-1.5 mt-2 mb-4">
          {options.map((o) => (
            <span
              key={o.id}
              className="rounded-full"
              style={{
                width: active === o.id ? 16 : 6,
                height: 6,
                background: active === o.id ? THEMES[o.id].accent : 'var(--border)',
                transition: 'width 0.2s ease, background 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={confirm}
          className="w-full h-13 py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <Check size={18} />
          Use {CARD_THEME_OPTIONS.find((o) => o.id === active)?.label || 'this'} style
        </motion.button>
      </div>
    </div>
  );
}
