import { useState } from 'react';
import { SecurityMenu } from '../components/SecurityMenu';
import { ChangePinFlow } from '../components/ChangePinFlow';
import { ActiveSessionsView } from '../components/ActiveSessionsView';
import { AddressWhitelistView } from '../components/AddressWhitelistView';
import type { SecurityStep } from '../components/types';

interface SecurityScreenProps {
  goBack: () => void;
}

/**
 * Security Center. Seed / recovery-phrase reveal is intentionally not offered:
 * this is custodial app-controlled balances; exporting keys lets users drain
 * on-chain funds while the ledger still shows spendable balance.
 */
export function SecurityScreen({ goBack }: SecurityScreenProps) {
  const [step, setStep] = useState<SecurityStep>('menu');
  const [biometric, setBiometric] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [txAlerts, setTxAlerts] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [whitelist, setWhitelist] = useState(false);

  if (step === 'pin') {
    return <ChangePinFlow onBack={() => setStep('menu')} onComplete={() => setStep('menu')} />;
  }
  if (step === 'devices') {
    return <ActiveSessionsView onBack={() => setStep('menu')} />;
  }
  if (step === 'whitelist') {
    return (
      <AddressWhitelistView
        onBack={() => setStep('menu')}
        enabled={whitelist}
        onToggle={() => setWhitelist(!whitelist)}
      />
    );
  }

  return (
    <SecurityMenu
      goBack={goBack}
      onNavigate={setStep}
      biometric={biometric}
      setBiometric={setBiometric}
      twoFA={twoFA}
      setTwoFA={setTwoFA}
      loginAlerts={loginAlerts}
      setLoginAlerts={setLoginAlerts}
      txAlerts={txAlerts}
      setTxAlerts={setTxAlerts}
      hideBalance={hideBalance}
      setHideBalance={setHideBalance}
    />
  );
}
