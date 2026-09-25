import { useEffect, useState } from 'react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { AccountStatusBanners } from '../../../shared/components/AccountStatusBanners';
import { CenteredBalance } from '../components/CenteredBalance';
import { HubActions } from '../components/HubActions';
import { AppsPanel } from '../components/AppsPanel';
import { FundOptionsSheet } from '../components/FundOptionsSheet';
import { PromoBanner } from '../components/PromoBanner';
import { HubAssetsList } from '../components/HubAssetsList';
import { prefetchMarketPrices } from '../../../shared/query/prefetchAppData';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNotifications } from '../../../shared/hooks/useNotifications';
import { Bell, ScanLine, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeScreenProps {
  navigate: (s: Screen, param?: string) => void;
  darkMode: boolean;
  toggleDark: () => void;
  notificationCount: number;
}

/**
 * Unified Home + Wallet hub.
 * Compact top chrome (no title): Account | QR + Notifications
 * Add funds / cash out open option sheets, not full pages first.
 */
export function HomeScreen({ navigate, notificationCount: notificationCountProp }: HomeScreenProps) {
  const { status, username, displayName, email } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(() => {
    try {
      return localStorage.getItem('convia.hideBalance') !== '1';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    const sync = () => {
      try {
        setBalanceVisible(localStorage.getItem('convia.hideBalance') !== '1');
      } catch {
        /* */
      }
    };
    window.addEventListener('convia-hide-balance', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('convia-hide-balance', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const [hideSmall, setHideSmall] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [appsOpen, setAppsOpen] = useState(false);
  const [fundSheet, setFundSheet] = useState<'deposit' | 'send' | null>(null);
  const { assets: assetsRaw, loading, totalValueUsd } = useWalletAssets();
  const assets = Array.isArray(assetsRaw) ? assetsRaw : [];
  /** Only after portfolio settles — avoid flashing Add funds for funded users. */
  const hasFunds =
    !loading &&
    ((Number(totalValueUsd) || 0) > 0.005 ||
      assets.some((a) => (Number(a.balance) || 0) > 0));
  const showAddFunds = !loading && !hasFunds;
  useEffect(() => {
    const syms = assets.map((a) => a.symbol).filter(Boolean);
    if (syms.length) prefetchMarketPrices(syms);
  }, [assets]);

  const { unread } = useNotifications(30);
  const notificationCount = unread || notificationCountProp || 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      {/* Tight status-bar only spacer — no extra PageTop gap */}
      <div
        aria-hidden
        style={{
          height: 'max(8px, env(safe-area-inset-top, 0px))',
          flexShrink: 0,
        }}
      />

      {/* Header: Account chip (clearly tappable) · QR + Bell */}
      <div className="flex items-center justify-between px-4 pt-1 pb-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('profile')}
          aria-label="Open account"
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full max-w-[52%]"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 tabular-nums"
            style={{
              background: 'color-mix(in oklab, var(--primary) 22%, var(--card))',
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: 13,
              border: '1.5px solid color-mix(in oklab, var(--primary) 40%, var(--border))',
            }}
          >
            {(
              (displayName || username || email || 'C').trim().charAt(0) || 'C'
            ).toUpperCase()}
          </span>
          <span
            className="truncate"
            style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, maxWidth: 110 }}
          >
            {username
              ? `@${username}`
              : displayName
                ? displayName.split(' ')[0]
                : email
                  ? email.split('@')[0]
                  : 'Account'}
          </span>
          <ChevronDown size={14} strokeWidth={2.4} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        </motion.button>

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('scan')}
            aria-label="Scan QR"
            className="flex items-center justify-center p-1"
            style={{ background: 'transparent', border: 'none' }}
          >
            <ScanLine size={24} strokeWidth={2.35} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('notifications')}
            aria-label="Notifications"
            className="relative flex items-center justify-center p-1"
            style={{ background: 'transparent', border: 'none' }}
          >
            <Bell size={24} strokeWidth={2.35} style={{ color: 'var(--foreground)' }} />
            {notificationCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: 'var(--destructive)' }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      <CenteredBalance
        balanceVisible={balanceVisible}
        onToggle={() => {
          setBalanceVisible((v) => {
            const next = !v;
            try {
              localStorage.setItem('convia.hideBalance', next ? '0' : '1');
              window.dispatchEvent(new Event('convia-hide-balance'));
            } catch {
              /* */
            }
            return next;
          });
        }}
      />

      <HubActions
        onNavigate={navigate}
        onOpenMore={() => setAppsOpen(true)}
        onReceive={() => setFundSheet('deposit')}
        onSend={() => setFundSheet('send')}
      />

      {/* Add funds — only when balances loaded and wallet is empty */}
      {showAddFunds ? (
        <div className="px-5 mb-5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setFundSheet('deposit')}
            className="w-full rounded-full flex items-center justify-center"
            style={{
              height: 48,
              background: 'var(--primary)',
              color: 'var(--primary-foreground, #0a0a0a)',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Add funds
          </motion.button>
        </div>
      ) : null}

      <AccountStatusBanners onKyc={() => navigate('kyc')} />

      <div className="mt-3 mb-1" />
      <PromoBanner onNavigate={navigate} />

      <HubAssetsList
        assets={assets || []}
        loading={loading}
        hideSmall={hideSmall}
        onToggleHide={() => setHideSmall((v) => !v)}
        onSeeAll={undefined}
        onSelect={(asset) => navigate('token', asset.symbol)}
      />

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />

      <AppsPanel
        open={appsOpen}
        onClose={() => setAppsOpen(false)}
        onNavigate={navigate}
        onOpenSend={() => setFundSheet('send')}
        onOpenDeposit={() => setFundSheet('deposit')}
      />

      <FundOptionsSheet
        open={fundSheet !== null}
        mode={fundSheet || 'deposit'}
        onClose={() => setFundSheet(null)}
        onNavigate={navigate}
      />
    </div>
  );
}
