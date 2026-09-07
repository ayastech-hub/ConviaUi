import { pageTopStyle } from '../layout/spacing';

/** Consistent top inset on every screen — replaces ad-hoc height: 50 / 12 spacers. */
export function PageTop() {
  return <div aria-hidden style={pageTopStyle} />;
}
