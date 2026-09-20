import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { GiftCard, CARD_THEME_OPTIONS, THEMES } from './GiftCard';
import type { CardTheme, Gift } from '../types';

interface Props {
  selected: CardTheme;
  preview: Pick<
    Gift,
    | 'note'
    | 'creatorMask'
    | 'code'
    | 'asset'
    | 'totalAmount'
    | 'slots'
    | 'claimedCount'
    | 'splitMode'
    | 'status'
    | 'expiresAt'
    | 'kind'
  >;
  onSelect: (t: CardTheme) => void;
  onBack: () => void;
}

export function CardThemePicker({ selected, preview, onSelect, onBack }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<CardTheme>(selected);
  const options = useMemo(() => CARD_THEME_OPTIONS, []);
  const activeIndex = Math.max(0, options.findIndex((o) => o.id === active));
  const activeOption = options[activeIndex];
  const activeTheme = THEMES[active];

  const createPreview = (theme: CardTheme): Gift => ({
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
    cardTheme: theme,
    claims: [],
  });

  const scrollTo = (index: number) => {
    const root = scroller.current;
    if (!root) return;
    const child = root.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({
      inline: 'center',
      behavior: 'smooth',
      block: 'nearest',
    });
  };

  const selectTheme = (theme: CardTheme, scroll = true) => {
    const index = options.findIndex((o) => o.id === theme);
    if (index < 0) return;

    setActive(theme);

    if (scroll) {
      requestAnimationFrame(() => scrollTo(index));
    }
  };

  const handleScroll = () => {
    const root = scroller.current;
    if (!root) return;

    const center = root.scrollLeft + root.clientWidth / 2;
    let closest = 0;
    let distance = Infinity;

    Array.from(root.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const childCenter = element.offsetLeft + element.offsetWidth / 2;
      const currentDistance = Math.abs(childCenter - center);

      if (currentDistance < distance) {
        distance = currentDistance;
        closest = index;
      }
    });

    const theme = options[closest]?.id;

    if (theme && theme !== active) {
      setActive(theme);
    }
  };

  useEffect(() => {
    const index = options.findIndex((o) => o.id === selected);

    if (index < 0) return;

    setActive(selected);

    requestAnimationFrame(() => {
      const root = scroller.current;
      const child = root?.children[index] as HTMLElement | undefined;

      child?.scrollIntoView({
        inline: 'center',
        behavior: 'instant' as ScrollBehavior,
        block: 'nearest',
      });
    });
  }, [selected, options]);

  const previous = () => {
    if (activeIndex <= 0) return;
    selectTheme(options[activeIndex - 1].id);
  };

  const next = () => {
    if (activeIndex >= options.length - 1) return;
    selectTheme(options[activeIndex + 1].id);
  };

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{ background: 'var(--background)' }}
    >
      <PageTop />

      <div className="flex items-center gap-3 px-5 pb-3">
        <BackButton onClick={onBack} />

        <div className="flex-1 min-w-0">
          <h1
            style={{
              color: 'var(--foreground)',
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: -0.25,
            }}
          >
            Card style
          </h1>

          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 12,
              marginTop: 2,
            }}
          >
            Choose how your card is presented
          </p>
        </div>

        <div
          className="px-2.5 py-1.5 rounded-full"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--muted-foreground)',
            fontSize: 10,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {activeIndex + 1}/{options.length}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <section className="px-5 pt-2">
          <div
            className="relative overflow-hidden rounded-[28px]"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-28 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% -20%, ${activeTheme.accent}16, transparent 68%)`,
              }}
            />

            <div className="relative px-4 pt-5 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Live preview
                  </p>

                  <p
                    style={{
                      color: 'var(--foreground)',
                      fontSize: 15,
                      fontWeight: 800,
                      marginTop: 3,
                    }}
                  >
                    {activeOption?.label || 'Classic'}
                  </p>
                </div>

                <div
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: activeTheme.accent }}
                  />

                  <span
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Selected
                  </span>
                </div>
              </div>

              <div
                ref={scroller}
                onScroll={handleScroll}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  marginInline: -4,
                  paddingInline: '9%',
                }}
              >
                {options.map((option) => {
                  const isActive = active === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectTheme(option.id)}
                      className="snap-center flex-shrink-0 text-left"
                      style={{
                        width: 'min(78vw, 310px)',
                        scrollSnapAlign: 'center',
                      }}
                      aria-label={`Preview ${option.label}`}
                    >
                      <motion.div
                        animate={{
                          scale: isActive ? 1 : 0.93,
                          opacity: isActive ? 1 : 0.45,
                        }}
                        transition={{
                          duration: 0.2,
                          ease: 'easeOut',
                        }}
                      >
                        <GiftCard
                          gift={createPreview(option.id)}
                          mode="public"
                          compact
                        />
                      </motion.div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={previous}
                  disabled={activeIndex === 0}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    opacity: activeIndex === 0 ? 0.3 : 1,
                  }}
                  aria-label="Previous style"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1.5">
                  {options.map((option) => {
                    const isActive = option.id === active;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectTheme(option.id)}
                        aria-label={`Select ${option.label}`}
                        className="rounded-full"
                        style={{
                          width: isActive ? 20 : 6,
                          height: 5,
                          background: isActive
                            ? 'var(--foreground)'
                            : 'var(--border)',
                          transition:
                            'width 180ms ease, background 180ms ease',
                        }}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={next}
                  disabled={activeIndex === options.length - 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    opacity:
                      activeIndex === options.length - 1 ? 0.3 : 1,
                  }}
                  aria-label="Next style"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pt-5 pb-8">
          <div className="mb-3">
            <p
              style={{
                color: 'var(--foreground)',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Styles
            </p>

            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Distinct treatments built on the same Convia system
            </p>
          </div>

          <div
            className="overflow-hidden rounded-[22px]"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {options.map((option, index) => {
              const theme = THEMES[option.id];
              const isActive = active === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectTheme(option.id)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
                  style={{
                    borderTop:
                      index > 0 ? '1px solid var(--border)' : undefined,
                    background: isActive
                      ? `color-mix(in srgb, ${theme.accent} 5%, var(--card))`
                      : 'transparent',
                  }}
                >
                  <span
                    className="relative w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden"
                    style={{
                      background: theme.surface,
                      border: `1px solid ${theme.line}`,
                    }}
                  >
                    <span
                      className="absolute left-2 right-2 top-2 h-px"
                      style={{
                        background: theme.accent,
                        opacity: 0.7,
                      }}
                    />

                    <span
                      className="absolute left-2 right-2 bottom-2 h-5 rounded-md"
                      style={{
                        background: theme.panel,
                        border: `1px solid ${theme.softLine}`,
                      }}
                    />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span
                      className="block"
                      style={{
                        color: 'var(--foreground)',
                        fontSize: 13,
                        fontWeight: isActive ? 750 : 600,
                      }}
                    >
                      {option.label}
                    </span>

                    <span
                      className="block mt-0.5"
                      style={{
                        color: 'var(--muted-foreground)',
                        fontSize: 11,
                      }}
                    >
                      {theme.tag}
                    </span>
                  </span>

                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive
                        ? 'var(--foreground)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid var(--foreground)'
                        : '1px solid var(--border)',
                      color: 'var(--background)',
                    }}
                  >
                    {isActive && (
                      <Check size={13} strokeWidth={2.5} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div
        className="px-5 pt-3 pb-6"
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Selected style
            </p>

            <p
              style={{
                color: 'var(--foreground)',
                fontSize: 14,
                fontWeight: 800,
                marginTop: 2,
              }}
            >
              {activeOption?.label || 'Classic'}
            </p>
          </div>

          <div
            className="w-9 h-9 rounded-xl"
            style={{
              background: activeTheme.surface,
              border: `1px solid ${activeTheme.line}`,
              boxShadow: `inset 0 2px 0 ${activeTheme.accent}55`,
            }}
          />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => onSelect(active)}
          className="w-full h-13 rounded-full font-bold text-[15px] flex items-center justify-center gap-2"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          <Check size={18} strokeWidth={2.5} />
          Use {activeOption?.label || 'this'} style
        </motion.button>
      </div>
    </div>
  );
}