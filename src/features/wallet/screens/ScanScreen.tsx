import type { Screen } from '../../../shared/data/mockData';
import { QRScanner } from '../../../shared/components/QRScanner';
import { parseQRPayload, setSendPrefill } from '../../../shared/utils/qrPayload';

interface Props {
  goBack: () => void;
  navigate: (s: Screen) => void;
}

/**
 * Full-page QR scan — not an overlay on Home/Wallet.
 * Success → send prefill + navigate send.
 */
export function ScanScreen({ goBack, navigate }: Props) {
  return (
    <div className="absolute inset-0" style={{ background: '#000' }}>
      <QRScanner
        onScan={(result) => {
          const parsed = parseQRPayload(result);
          if (parsed) setSendPrefill(parsed);
          else setSendPrefill({ address: result.trim() });
          navigate('send');
        }}
        onClose={goBack}
        onManualEntry={() => navigate('send')}
      />
    </div>
  );
}
