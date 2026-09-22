/**
 * Single source of truth for vertical/horizontal page chrome.
 * WebView on Android often reports safe-area-inset-top as 0 — use a light floor only.
 */
export const LAYOUT = {
  /** Minimal floor when env(safe-area-inset-top) is 0 (Capacitor WebView) */
  statusBarFloor: 10,
  top: 6,
  topWithHeader: 8,
  x: 20,
  bottomNav: 94,
  bottom: 16,
  headerBottom: 16,
} as const;

export const pageTopStyle = {
  height: `max(${LAYOUT.statusBarFloor}px, calc(env(safe-area-inset-top, 0px) + ${LAYOUT.top}px))`,
  flexShrink: 0,
} as const;

export const pageBottomNavStyle = {
  paddingBottom: LAYOUT.bottomNav,
} as const;
