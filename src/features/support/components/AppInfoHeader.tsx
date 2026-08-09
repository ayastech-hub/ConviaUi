import { ConviaLogo } from '../../../shared/components/ConviaLogo';

/** Product summary for About — describes real Convia capabilities, not vanity metrics. */
export function AppInfoHeader() {
  const pillars = [
    { value: 'Wallet', label: 'Multi-chain custody' },
    { value: 'Cash', label: 'On / off-ramp' },
    { value: 'Bills', label: 'Local services' },
  ];

  return (
    <>
      <div className="flex flex-col items-center mb-8 mt-4">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
          style={{ background: 'var(--primary)' }}
        >
          <ConviaLogo size={40} color="#FFFFFF" />
        </div>
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>
          Convia
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Africa’s financial universe</p>
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 13,
            marginTop: 12,
            textAlign: 'center',
            lineHeight: 1.55,
            maxWidth: 320,
          }}
        >
          Hold and move crypto, swap assets, buy or sell through local rails, pay bills, and manage
          verification — with live balances from your ledger and markets defined by the platform, not
          mock data.
        </p>
      </div>

      <div
        className="rounded-[20px] p-5 mb-6 glass-card"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="grid grid-cols-3 gap-3 text-center">
          {pillars.map((s) => (
            <div key={s.label}>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 15 }}>{s.value}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-[16px] p-4 mb-6"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
          What you can do
        </p>
        <ul style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.55, paddingLeft: 18 }}>
          <li>Deposit & receive on supported networks</li>
          <li>Send to addresses or Convia usernames</li>
          <li>Swap tokens and cash out to verified banks</li>
          <li>Pay airtime, data, and bills in supported countries</li>
          <li>Complete KYC once — status drives feature access</li>
        </ul>
      </div>
    </>
  );
}
