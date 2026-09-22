import { flagSrc2x, flagUrl, countryCodeForCurrency } from '../utils/countryFlags';

type Props = {
  /** ISO country (ng) or currency (NGN) */
  code: string;
  size?: number;
  className?: string;
  title?: string;
};

/** Flag image from flagcdn — shared for Pay / Explore / Rates. */
export function CountryFlag({ code, size = 20, className, title }: Props) {
  const iso = code.length === 3 ? countryCodeForCurrency(code) : code.toLowerCase();
  const src = flagUrl(iso, size <= 20 ? 20 : size <= 40 ? 40 : 80);
  const srcSet = `${flagSrc2x(iso, size <= 20 ? 20 : 40)} 2x`;

  return (
    <img
      src={src}
      srcSet={srcSet}
      alt={title || iso.toUpperCase()}
      width={size}
      height={Math.round(size * 0.75)}
      className={className}
      style={{
        width: size,
        height: Math.round(size * 0.75),
        objectFit: 'cover',
        borderRadius: 3,
        display: 'block',
        flexShrink: 0,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
