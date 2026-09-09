/**
 * Single source of truth for vertical/horizontal page chrome.
 * Use these everywhere instead of ad-hoc height: 50 / 12 / 32.
 */
export const LAYOUT = {
  top: 16,
  topWithHeader: 16,
  x: 20,
  bottomNav: 94,
  bottom: 16,
  headerBottom: 20,
} as const;

export const pageTopStyle = {
  height: `max(${LAYOUT.top}px, env(safe-area-inset-top, 0px))`,
  flexShrink: 0,
} as const;

export const pageBottomNavStyle = {
  paddingBottom: LAYOUT.bottomNav,
} as const;
