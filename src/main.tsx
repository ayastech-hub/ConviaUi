import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { AppProviders } from './app/providers/AppProviders';
import './styles/index.css';

/**
 * Capture referral deep links:
 * - https://convia.app/ref/CODE
 * - https://convia.app/?ref=CODE
 * so registration can attach the code (no more blank 404 on /ref/* when the SPA hosts the domain).
 */
function captureReferralFromUrl() {
  try {
    const path = window.location.pathname || '';
    const pathMatch = path.match(/^\/ref\/([A-Za-z0-9_-]+)/i);
    const q = new URLSearchParams(window.location.search).get('ref');
    const code = (pathMatch?.[1] || q || '').trim();
    if (code) {
      localStorage.setItem('convia_ref', code);
      // Normalize to home with query so refresh keeps the code without requiring a server route
      if (pathMatch && pathMatch[1]) {
        const url = new URL(window.location.href);
        url.pathname = '/';
        url.searchParams.set('ref', pathMatch[1]);
        window.history.replaceState({}, '', url.toString());
      }
    }
  } catch {
    /* ignore */
  }
}

captureReferralFromUrl();

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>,
);
