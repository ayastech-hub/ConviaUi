import { motion } from 'motion/react';
import { ChevronLeft, FileText, Shield, Mail, Globe, Heart } from 'lucide-react';
import { ConviaLogo } from '../ConviaLogo';

interface AboutScreenProps {
  goBack: () => void;
}

export function AboutScreen({ goBack }: AboutScreenProps) {
  const links = [
    { icon: FileText, label: 'Terms of Service', desc: 'Read our terms' },
    { icon: Shield, label: 'Privacy Policy', desc: 'How we handle your data' },
    { icon: FileText, label: 'Licenses & Disclosures', desc: 'Regulatory information' },
    { icon: Mail, label: 'Contact Us', desc: 'support@convia.app' },
    { icon: Globe, label: 'Website', desc: 'www.convia.app' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>About</h2>
      </div>

      <div className="px-5 flex-1">
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.95))', boxShadow: '0 12px 40px rgba(99,102,241,0.3)' }}>
            <ConviaLogo size={40} color="#FFFFFF" />
          </div>
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>Convia</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Version 2.4.1</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
            Africa's financial universe. Trade crypto, send money, and access global markets — all from one app built for Africa.
          </p>
        </div>

        <div className="rounded-[20px] p-5 mb-6 glass-card glass-refraction" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 20 }}>12+</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Currencies</p>
            </div>
            <div>
              <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 20 }}>50K+</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Users</p>
            </div>
            <div>
              <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 20 }}>24/7</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Support</p>
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>LEGAL</p>
        <div className="rounded-[20px] overflow-hidden glass-card mb-6" style={{ border: '1px solid var(--border)' }}>
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3.5 w-full"
                style={{ borderBottom: i < links.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <Icon size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{link.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{link.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-8">
          <Heart size={14} style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Made with love for Africa</p>
        </div>
      </div>
    </div>
  );
}
