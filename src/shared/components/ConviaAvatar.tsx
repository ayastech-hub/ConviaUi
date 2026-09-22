/**
 * Convia brand avatar — used when the user has no photo.
 */
import { useId } from 'react';

export function ConviaAvatar({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const gradId = `conviaAvGrad-${uid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden
      style={{ display: 'block', borderRadius: '50%', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.72" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill={`url(#${gradId})`} />
      <circle
        cx="20"
        cy="20"
        r="17.5"
        fill="none"
        stroke="var(--background)"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />
      <path
        d="M26.2 13.2a8.6 8.6 0 1 0 0 13.6"
        fill="none"
        stroke="var(--primary-foreground, #0a0a0a)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="27.4" cy="20" r="2.1" fill="var(--primary-foreground, #0a0a0a)" opacity="0.9" />
    </svg>
  );
}
