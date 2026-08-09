import { FileText, Shield, Scale, Mail, Globe, type LucideIcon } from 'lucide-react';

export const legalContent: Record<
  string,
  { heading: string; body: string[] }
> = {
  'Terms of Service': {
    heading: 'Terms of Service',
    body: [
      'Convia provides a digital wallet and financial services interface for supported markets in Africa, including crypto custody features, swaps, on-ramp/off-ramp partners, and bill payments where enabled.',
      'By creating an account you agree to use the service lawfully, keep your credentials secure, and not attempt to circumvent KYC, sanctions, or country controls enforced by the platform.',
      'Crypto transfers are irreversible once broadcast. Always verify asset, network, and address. Convia is not responsible for funds sent on the wrong network or to an incorrect address.',
      'Limits, fees, and available products may vary by country, KYC level, and partner availability. Features can be suspended per market for compliance reasons.',
      'We may update these terms; continued use after notice constitutes acceptance of material updates where required by law.',
    ],
  },
  'Privacy Policy': {
    heading: 'Privacy Policy',
    body: [
      'We process account data (email, profile), identity data for KYC, transaction metadata, device/session information, and support communications to operate the service and meet regulatory duties.',
      'Ledger balances and wallet addresses are processed to provide custody, deposits, withdrawals, and portfolio views.',
      'We do not sell your personal data. We share data with infrastructure providers, KYC vendors, and payment partners only as needed to deliver features you use.',
      'You may request access or deletion subject to legal retention requirements (for example anti-fraud and accounting records).',
      'Session tokens are stored on your device; sign out clears local session data on that browser.',
    ],
  },
  'Licenses & Disclosures': {
    heading: 'Licenses & Disclosures',
    body: [
      'Convia Technologies operates product surfaces that may rely on licensed partners for local payments and identity verification depending on jurisdiction.',
      'Digital assets are volatile and can lose value. Past performance is not indicative of future results.',
      'On-ramp and off-ramp are provided through integrated providers (such as regional ramp partners). Their terms may apply to those legs of a transaction.',
      'Nothing in the app is investment, legal, or tax advice. Consult qualified professionals for your situation.',
      'Country-level feature suspension may occur without prior notice when required for compliance or operational safety.',
    ],
  },
  'Contact Us': {
    heading: 'Contact Us',
    body: [
      'Product guidance: use Profile → Help Center (articles and in-app guide chat).',
      'Account issues: support@convia.app',
      'Do not send passwords, full seed phrases, or complete payment card numbers by email.',
      'We aim to respond to support email within one business day where staffing allows.',
    ],
  },
  Website: {
    heading: 'Website & community',
    body: [
      'Product site: www.convia.app',
      'Updates and announcements may also be posted on official Convia social channels when published.',
      'Only trust links that match official Convia domains.',
    ],
  },
};

export const legalLinks: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: FileText, label: 'Terms of Service', desc: 'Account & product rules' },
  { icon: Shield, label: 'Privacy Policy', desc: 'How we handle your data' },
  { icon: Scale, label: 'Licenses & Disclosures', desc: 'Risk & partner disclosures' },
  { icon: Mail, label: 'Contact Us', desc: 'support@convia.app' },
  { icon: Globe, label: 'Website', desc: 'www.convia.app' },
];
