import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export type ToastInput = {
  title?: string;
  message: string;
  tone?: ToastTone;
  /** ms — default 3800 */
  duration?: number;
};

type ToastItem = ToastInput & { id: string; tone: ToastTone };

type ToastApi = {
  toast: (input: ToastInput | string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const TONE: Record<
  ToastTone,
  {
    icon: typeof Info;
    accent: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    accent: 'var(--positive)',
    bg: 'color-mix(in oklab, var(--positive) 12%, var(--card))',
    border: 'color-mix(in oklab, var(--positive) 35%, var(--border))',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    accent: 'var(--destructive)',
    bg: 'color-mix(in oklab, var(--destructive) 12%, var(--card))',
    border: 'color-mix(in oklab, var(--destructive) 35%, var(--border))',
    label: 'Error',
  },
  info: {
    icon: Info,
    accent: 'var(--primary)',
    bg: 'color-mix(in oklab, var(--primary) 12%, var(--card))',
    border: 'color-mix(in oklab, var(--primary) 32%, var(--border))',
    label: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'var(--warning)',
    bg: 'color-mix(in oklab, var(--warning) 14%, var(--card))',
    border: 'color-mix(in oklab, var(--warning) 38%, var(--border))',
    label: 'Notice',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput | string) => {
      const payload: ToastInput = typeof input === 'string' ? { message: input } : input;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const tone = payload.tone || 'info';
      const duration = payload.duration ?? 3800;
      setItems((prev) => [...prev.slice(-2), { ...payload, id, tone }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (message, title) => toast({ message, title: title || 'Success', tone: 'success' }),
      error: (message, title) => toast({ message, title: title || 'Something went wrong', tone: 'error' }),
      info: (message, title) => toast({ message, title, tone: 'info' }),
      warning: (message, title) => toast({ message, title: title || 'Notice', tone: 'warning' }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Fixed host — does not shift page layout */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4"
        style={{ top: 'max(12px, env(safe-area-inset-top))' }}
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const meta = TONE[item.tone];
            const Icon = meta.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className="pointer-events-auto w-full max-w-[420px]"
                role="status"
              >
                <div
                  className="relative overflow-hidden rounded-[20px] px-3.5 py-3 flex gap-3 items-start"
                  style={{
                    background: meta.bg,
                    border: `1px solid ${meta.border}`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
                  }}
                >
                  {/* accent rail */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ background: meta.accent }}
                  />
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'color-mix(in oklab, var(--background) 55%, transparent)' }}
                  >
                    <Icon size={18} style={{ color: meta.accent }} strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      style={{
                        color: 'var(--foreground)',
                        fontWeight: 750,
                        fontSize: 13.5,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title || meta.label}
                    </p>
                    <p
                      style={{
                        color: 'var(--muted-foreground)',
                        fontSize: 12.5,
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op when provider missing (tests)
    const noop = () => {};
    return {
      toast: noop,
      success: noop,
      error: noop,
      info: noop,
      warning: noop,
    };
  }
  return ctx;
}
