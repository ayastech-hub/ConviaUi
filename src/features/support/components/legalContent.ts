import { FileText, Shield, Mail, Globe, type LucideIcon } from 'lucide-react';

export interface LegalSection {
  heading: string;
  body: string[];
}

export const legalContent: Record<string, LegalSection> = {
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
  Website: {
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

export const legalLinks: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: FileText, label: 'Terms of Service', desc: 'Read our terms' },
  { icon: Shield, label: 'Privacy Policy', desc: 'How we handle your data' },
  { icon: FileText, label: 'Licenses & Disclosures', desc: 'Regulatory information' },
  { icon: Mail, label: 'Contact Us', desc: 'support@convia.app' },
  { icon: Globe, label: 'Website', desc: 'www.convia.app' },
];
