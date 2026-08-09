import { FileCheck, Wallet, Users, Award } from 'lucide-react';
import { portfolio } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AvatarUploader } from './AvatarUploader';

interface ProfileCardProps {
  avatar: string | null;
  onAvatarChange: (dataUrl: string) => void;
}

/** The main card at the top of the Profile screen: avatar, name, username, KYC badge, and quick stats. */
export function ProfileCard({ avatar, onAvatarChange }: ProfileCardProps) {
  const { format } = useCurrency();

  const stats = [
    { label: 'Portfolio', value: format(portfolio.totalUSD), icon: Wallet, color: 'var(--foreground)' },
    { label: 'Followers', value: '1,247', icon: Users, color: 'var(--muted-foreground)' },
    { label: 'Trades', value: '342', icon: Award, color: 'var(--muted-foreground)' },
  ];

  return (
    <div className="px-5 mb-5">
      <div
        className="rounded-[24px] p-5 relative overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-4 mb-4">
          <AvatarUploader avatar={avatar} onChange={onAvatarChange} initials="AM" size={72} />

          <div className="flex-1">
            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, marginBottom: 2 }}>Ade Mensah</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 6 }}>@ade_mensah</p>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--muted)', width: 'fit-content' }}>
              <FileCheck size={11} style={{ color: 'var(--foreground)' }} />
              <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>KYC Verified</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-3 rounded-[14px] text-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <Icon size={16} style={{ color: stat.color, margin: '0 auto 4px' }} />
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{stat.value}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
