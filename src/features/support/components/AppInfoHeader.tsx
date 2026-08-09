import { ConviaLogo } from '../../../shared/components/ConviaLogo';

/** Logo, version, tagline, and the 12+/50K+/24-7 stats row on the About screen. */
export function AppInfoHeader() {
  const stats = [
    { value: '12+', label: 'Currencies' },
    { value: '50K+', label: 'Users' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <>
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--primary)' }}>
          <ConviaLogo size={40} color="#FFFFFF" />
        </div>
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>Convia</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Version 2.4.1</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
          Africa's financial universe. Trade crypto, send money, and access global markets — all from one app built for Africa.
        </p>
      </div>

      <div className="rounded-[20px] p-5 mb-6 glass-card glass-refraction" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>{s.value}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
