import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { QRScanner } from '../../../shared/components/QRScanner';
import { parseQRPayload, setSendPrefill } from '../../../shared/utils/qrPayload';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { HomeHeader } from '../components/HomeHeader';
import { PortfolioHeroCard } from '../components/PortfolioHeroCard';
import { AccountStatusBanners } from '../../../shared/components/AccountStatusBanners';
import { QuickActionsRow } from '../components/QuickActionsRow';
import { MarketWatchlist } from '../components/MarketWatchlist';
import { HomeHoldingsPreview } from '../components/HomeHoldingsPreview';
import { RecentTransactionsList } from '../components/RecentTransactionsList';
import { useAuth } from '../../../shared/context/AuthContext';
import * as notifApi from '../../../shared/api/notifications';

interface HomeScreenProps {
  navigate: (s: Screen, param?: string) => void;
  darkMode: boolean;
  toggleDark: () => void;
  notificationCount: number;
}

export function HomeScreen({ navigate, notificationCount: notificationCountProp }: HomeScreenProps) {
  const { userId, status } = useAuth();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      setUnread(0);
      return;
    }
    notifApi.listNotifications(userId, 30).then((list) => {
      setUnread((Array.isArray(list) ? list : []).filter((n) => !n.readAt).length);
    }).catch(() => setUnread(0));
  }, [userId, status]);
  const notificationCount = unread || notificationCountProp || 0;
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <HomeHeader
        notificationCount={notificationCount}
        onScan={() => setShowScanner(true)}
        onOpenNotifications={() => navigate('notifications')}
      />

      <PortfolioHeroCard balanceVisible={balanceVisible} onToggleVisibility={() => setBalanceVisible((v) => !v)} />

      <AccountStatusBanners onKyc={() => navigate('kyc')} />

      <QuickActionsRow onNavigate={navigate} />

      <HomeHoldingsPreview onSeeAll={() => navigate('wallet')} />

      <MarketWatchlist onSeeAll={() => navigate('swap')} onSelectAsset={() => navigate('swap')} />

      <RecentTransactionsList onSeeAll={() => navigate('wallet')} onSelectTransaction={setReceiptTx} />

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />

      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScan={(result) => {
              setShowScanner(false);
              const parsed = parseQRPayload(result);
              if (parsed) {
                setSendPrefill(parsed);
              } else {
                setSendPrefill({ address: result.trim() });
              }
              navigate('send');
            }}
            onClose={() => setShowScanner(false)}
            onManualEntry={() => { setShowScanner(false); navigate('send'); }}
          />
        )}
      </AnimatePresence>

      <div style={{ height: 100 }} />
    </div>
  );
}
