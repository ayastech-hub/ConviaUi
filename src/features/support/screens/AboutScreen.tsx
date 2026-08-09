import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, FileText, Shield, Mail, Globe, Heart, ChevronDown } from 'lucide-react';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';

interface AboutScreenProps {
  goBack: () => void;
}

const legalContent: Record<string, { heading: string; body: string[] }> = {
  'Terms of Service': {
    heading: 'Terms of Service',
    body: [
      'By using Convia, you agree to these terms. Convia provides digital asset trading, peer-to-peer exchange, and payment services across supported African countries.',
      'You must be at least 18 years old and have completed identity verification (KYC) to use trading and withdrawal features.',
      'Convia acts as a facilitator for peer-to-peer trades and is not a counterparty to OTC transactions. Escrow services are provided to protect both parties.',
      'Fees are disclosed before each transaction. We reserve the right to suspend accounts that violate our terms or engage in fraudulent activity.',
      'For questions about these terms, contact legal@convia.app.',
    ],
  },
  'Privacy Policy': {
    heading: 'Privacy Policy',
    body: [
      'Convia collects personal information you provide during registration and KYC verification, including your name, email, phone number, and government-issued ID.',
      'We use your data to provide and improve our services, verify your identity, prevent fraud, and comply with regulatory requirements.',
      'We do not sell your personal data to third parties. We may share data with payment partners and regulators when required by law.',
      'Your transaction data is encrypted at rest and in transit. Biometric data, if enabled, is stored locally on your device and never transmitted.',
      'You can request data deletion at any time by contacting privacy@convia.app.',
    ],
  },
  'Licenses & Disclosures': {
    heading: 'Licenses & Disclosures',
    body: [
      'Convia operates as a registered Virtual Asset Service Provider (VASP) in supported jurisdictions.',
      'Convia is not a bank and digital assets held in your Convia account are not covered by deposit insurance.',
      'Crypto-asset services are provided by Convia Technologies Ltd. Fiat services are provided through licensed payment partners in each supported country.',
      'Cryptocurrency investments are subject to market risk. The value of digital assets can fluctuate significantly.',
      'For regulatory inquiries, contact compliance@convia.app.',
    ],
  },
  'Contact Us': {
    heading: 'Contact Us',
    body: [
      'Email: support@convia.app',
      'Phone: +234 1 234 5678 (available 24/7)',
      'Live chat: Available in-app via the Help Center',
      'Mailing address: Convia Technologies Ltd, Plot 12, Victoria Island, Lagos, Nigeria',
      'Response time: We aim to respond to all inquiries within 24 hours.',
    ],
  },
  'Website': {
    heading: 'Website',
    body: [
      'Visit us at www.convia.app for the latest updates, blog posts, and announcements.',
      'Follow us on social media:',
      'Twitter/X: @conviaapp',
      'Instagram: @convia.app',
      'LinkedIn: Convia Technologies',
    ],
  },
};

export function AboutScreen({ goBack }: AboutScreenProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const links = [
    { icon: FileText, label: 'Terms of Service', desc: 'Read our terms' },
    { icon: Shield, label: 'Privacy Policy', desc: 'How we handle your data' },
    { icon: FileText, label: 'Licenses & Disclosures', desc: 'Regulatory information' },
    { icon: Mail, label: 'Contact Us', desc: 'support@convia.app' },
    { icon: Globe, label: 'Website', desc: 'www.convia.app' },
  ];

  const toggle = (label: string) => {
    setExpanded(prev => prev === label ? null : label);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>About</h2>
      </div>

      <div className="px-5 flex-1">
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
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>12+</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Currencies</p>
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>50K+</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Users</p>
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>24/7</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Support</p>
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>LEGAL</p>
        <div className="rounded-[20px] overflow-hidden glass-card mb-6" style={{ border: '1px solid var(--border)' }}>
          {links.map((link, i) => {
            const Icon = link.icon;
            const isOpen = expanded === link.label;
            const content = legalContent[link.label];
            return (
              <div key={i}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggle(link.label)}
                  className="flex items-center gap-3 px-4 py-3.5 w-full"
                  style={{ borderBottom: i < links.length - 1 ? '1px solid var(--border)' : isOpen ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <Icon size={18} style={{ color: 'var(--foreground)' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{link.label}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{link.desc}</p>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {isOpen && content && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1" style={{ background: 'var(--muted)' }}>
                        {content.body.map((para, pi) => (
                          <p key={pi} style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.6, marginBottom: pi < content.body.length - 1 ? 10 : 0 }}>{para}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-8">
          <Heart size={14} style={{ color: 'var(--foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Made with love for Africa</p>
        </div>
      </div>
    </div>
  );
}
