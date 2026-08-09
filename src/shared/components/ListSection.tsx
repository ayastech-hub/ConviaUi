import type { ReactNode } from 'react';
import { Children } from 'react';

interface ListSectionProps {
  /** Section label shown above the card, e.g. "ACCOUNT" or "PREFERENCES". */
  title?: string;
  children: ReactNode;
}

/**
 * Rounded card that groups a list of `ListRow`s, with a divider
 * automatically inserted between rows (except after the last one).
 * Used for the Account/Activity/Support groups on Profile, the
 * Preferences group on Settings, and the Protection/Actions groups on
 * Security — previously each screen re-implemented this by hand.
 */
export function ListSection({ title, children }: ListSectionProps) {
  const items = Children.toArray(children);
  return (
    <div className="mb-5">
      {title && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>
          {title}
        </p>
      )}
      <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
