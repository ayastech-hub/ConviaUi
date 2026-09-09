import type { ReactNode } from 'react';
import { LAYOUT } from '../layout/spacing';
import { BackButton } from './BackButton';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
  marginBottom?: number;
  /** When false, parent already rendered <PageTop /> */
  includeTopInset?: boolean;
}

/**
 * Standard sub-screen header: top inset + liquid-glass back + title.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  marginBottom = LAYOUT.headerBottom,
  includeTopInset = true,
}: ScreenHeaderProps) {
  return (
    <div>
      {includeTopInset && (
        <div
          aria-hidden
          style={{
            height: `max(${LAYOUT.top}px, env(safe-area-inset-top, 0px))`,
            flexShrink: 0,
          }}
        />
      )}
      <div className="flex items-center gap-3 px-5" style={{ marginBottom }}>
        <BackButton onClick={onBack} />
        <div className="flex-1 min-w-0">
          <h2
            style={{
              color: 'var(--foreground)',
              fontWeight: 800,
              fontSize: subtitle ? 22 : 18,
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}
