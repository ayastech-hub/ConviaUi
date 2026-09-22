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
import { Bell, ScanLine, User } from 'lucide-react';
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
  const { status } = useAuth();
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
  const { assets: assetsRaw, loading } = useWalletAssets();
  const assets = Array.isArray(assetsRaw) ? assetsRaw : [];
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

      {/* Header: Account (left) · QR + Bell (right) — no title */}
      <div className="flex items-center justify-between px-4 pt-1 pb-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('profile')}
          aria-label="Account"
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: 'color-mix(in oklab, var(--primary) 22%, var(--muted))',
            border: '1px solid color-mix(in oklab, var(--primary) 35%, var(--border))',
          }}
        >
          <User size={18} style={{ color: 'var(--primary)' }} strokeWidth={2.2} />
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('scan')}
            aria-label="Scan QR"
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <ScanLine size={18} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('notifications')}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Bell size={18} style={{ color: 'var(--foreground)' }} />
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

      {/* Add funds → deposit options sheet */}
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

      <AccountStatusBanners onKyc={() => navigate('kyc')} />

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
