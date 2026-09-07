import { useEffect, useState } from 'react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { AccountStatusBanners } from '../../../shared/components/AccountStatusBanners';
import { CenteredBalance } from '../components/CenteredBalance';
import { HubActions } from '../components/HubActions';
import { PromoBanner } from '../components/PromoBanner';
import { HubAssetsList } from '../components/HubAssetsList';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import * as notifApi from '../../../shared/api/notifications';
import { Bell, ScanLine } from 'lucide-react';
import { motion } from 'motion/react';
import { PageTop } from '../../../shared/components/PageTop';

interface HomeScreenProps {
  navigate: (s: Screen, param?: string) => void;
  darkMode: boolean;
  toggleDark: () => void;
  notificationCount: number;
}

/**
 * Unified Home + Wallet hub.
 * Structure: centered balance → circular actions → promo banner → assets list.
 * Replaces the old split Home/Wallet tabs (same content, one surface).
 */
export function HomeScreen({ navigate, notificationCount: notificationCountProp }: HomeScreenProps) {
  const { userId, status } = useAuth();
  const [unread, setUnread] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [hideSmall, setHideSmall] = useState(false);
    const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const { assets, loading } = useWalletAssets();

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      setUnread(0);
      return;
    }
    notifApi
      .listNotifications(userId, 30)
      .then((list) => {
        setUnread((Array.isArray(list) ? list : []).filter((n: { readAt?: string }) => !n.readAt).length);
      })
      .catch(() => setUnread(0));
  }, [userId, status]);

  const notificationCount = unread || notificationCountProp || 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      {/* Top chrome */}
      <PageTop />
      <div className="flex items-center justify-between px-5 mb-2">
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
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>Wallet</p>
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

      <CenteredBalance
        balanceVisible={balanceVisible}
        onToggle={() => setBalanceVisible((v) => !v)}
      />

      <HubActions onNavigate={navigate} />

      <AccountStatusBanners onKyc={() => navigate('kyc')} />

      <PromoBanner onNavigate={navigate} />

      <HubAssetsList
        assets={assets || []}
        loading={loading}
        hideSmall={hideSmall}
        onToggleHide={() => setHideSmall((v) => !v)}
        onSeeAll={undefined}
      />

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />

    </div>
  );
}
