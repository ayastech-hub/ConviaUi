import { useEffect, useState } from 'react';
import { fetchPlatformStatus, type StatusBanner } from '../api/platform';

const DISMISS_KEY = 'convia.dismissed_banners';

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...ids]));
}

/** In-app status banners from admin (expiring announcements). Not device push. */
export function ServiceBanner() {
  const [banners, setBanners] = useState<StatusBanner[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadDismissed());

  useEffect(() => {
    let alive = true;
    const load = () => {
      void fetchPlatformStatus().then((s) => {
        if (!alive) return;
        setBanners(s.banners || []);
      });
    };
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const visible = banners.filter((b) => !dismissed.has(b.id));
  if (!visible.length) return null;

  return (
    <div className="space-y-2 px-4 pt-2" style={{ maxWidth: 560, margin: '0 auto' }}>
      {visible.map((b) => {
        const isWarn = b.severity === 'warning';
        const isCrit = b.severity === 'critical';
        const bg = isCrit
          ? 'color-mix(in oklab, #ef4444 14%, var(--card))'
          : isWarn
            ? 'color-mix(in oklab, #f59e0b 14%, var(--card))'
            : 'color-mix(in oklab, var(--primary, #3b82f6) 12%, var(--card))';
        const border = isCrit
          ? 'color-mix(in oklab, #ef4444 40%, var(--border))'
          : isWarn
            ? 'color-mix(in oklab, #f59e0b 40%, var(--border))'
            : 'color-mix(in oklab, var(--primary, #3b82f6) 35%, var(--border))';
        return (
          <div
            key={b.id}
            role="status"
            className="rounded-2xl px-3.5 py-3 relative"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <button
              type="button"
              aria-label="Dismiss"
              className="absolute top-2 right-2 text-xs opacity-60"
              style={{ color: 'var(--muted-foreground)' }}
              onClick={() => {
                const next = new Set(dismissed);
                next.add(b.id);
                setDismissed(next);
                saveDismissed(next);
              }}
            >
              ✕
            </button>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, paddingRight: 20 }}>
              {b.title}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45, marginTop: 4 }}>
              {b.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
