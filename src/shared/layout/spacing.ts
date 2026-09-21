/**
 * Single source of truth for vertical/horizontal page chrome.
 * WebView on Android often reports safe-area-inset-top as 0 — use a status-bar floor.
 */
export const LAYOUT = {
  /** Floor under status bar when env() is 0 (common in Capacitor WebView) */
  statusBarFloor: 28,
  top: 16,
  topWithHeader: 16,
  x: 20,
  bottomNav: 94,
  bottom: 16,
  headerBottom: 20,
} as const;

export const pageTopStyle = {
  height: `max(${LAYOUT.top + LAYOUT.statusBarFloor}px, calc(env(safe-area-inset-top, 0px) + ${LAYOUT.top}px))`,
  flexShrink: 0,
} as const;

export const pageBottomNavStyle = {
  paddingBottom: LAYOUT.bottomNav,
} as const;
