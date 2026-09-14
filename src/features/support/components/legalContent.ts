import type { LucideIcon } from 'lucide-react';
import { FileText, Shield, Scale, Mail, Globe } from 'lucide-react';

export type LegalSection = { title: string; body: string[] };

export type LegalDoc = {
  id: 'terms' | 'privacy';
  title: string;
  subtitle: string;
  effective: string;
  sections: LegalSection[];
};

export const TERMS_DOC: LegalDoc = {
  id: 'terms',
  title: 'Terms of Service',
  subtitle: 'Rules for using Convia',
  effective: 'Effective 14 September 2026',
  sections: [
    {
      title: '1. Acceptance',
      body: [
        'By creating a Convia account or using the Convia app or website, you agree to these Terms of Service and our Privacy Policy.',
        'If you do not agree, do not use Convia.',
      ],
    },
    {
      title: '2. Who we are',
      body: [
        'Convia is a digital wallet and payments platform that lets you hold supported crypto assets, convert between assets, and move value via supported on-ramp, off-ramp, and bill services where available in your country.',
        'Features depend on your country, verification level, and product availability.',
      ],
    },
    {
      title: '3. Eligibility',
      body: [
        'You must be at least 18 years old (or the age of majority where you live) and able to enter a binding contract.',
        'You must not use Convia if you are prohibited under local law or our restricted-country list.',
      ],
    },
    {
      title: '4. Your account',
      body: [
        'You are responsible for your login credentials, device security, and transaction PIN.',
        'Notify us promptly of unauthorized access. We may freeze or limit accounts to protect you or the platform.',
        'One person should maintain one primary account unless we approve otherwise.',
      ],
    },
    {
      title: '5. Identity verification (KYC)',
      body: [
        'Certain features (withdrawals, higher limits, local banking) require identity checks. You agree to provide accurate information and documents.',
        'We may refuse, limit, or reverse access if verification fails or risk checks require it.',
      ],
    },
    {
      title: '6. Balances, swaps, and transfers',
      body: [
        'Balances are recorded on Convia’s internal ledger. Crypto network transfers are subject to blockchain confirmation times and fees.',
        'Swaps are internal conversions at displayed rates and fees. Quotes may expire; confirm before executing.',
        'You are responsible for sending to the correct address, network, and amount. Wrong-network or irreversible blockchain sends may not be recoverable.',
      ],
    },
    {
      title: '7. Fiat on-ramp and off-ramp',
      body: [
        'Local currency deposits and withdrawals use regulated partners (for example bank rails in supported countries). Their rules, cut-off times, and fees may apply.',
        'You must only use bank accounts in your verified name where required.',
      ],
    },
    {
      title: '8. Prohibited use',
      body: [
        'You may not use Convia for fraud, money laundering, sanctions evasion, illegal gambling, scams, or any unlawful purpose.',
        'We may suspend accounts, report activity, and cooperate with lawful requests.',
      ],
    },
    {
      title: '9. Fees',
      body: [
        'Fees are shown in-app before you confirm a transaction where applicable. Network (gas) costs are separate from Convia platform fees.',
      ],
    },
    {
      title: '10. Risk disclosure',
      body: [
        'Crypto assets are volatile and can lose value. Convia is not an exchange listing venue for speculation advice.',
        'Nothing in the app is investment, legal, or tax advice.',
      ],
    },
    {
      title: '11. Limitation of liability',
      body: [
        'To the fullest extent allowed by law, Convia is not liable for indirect, incidental, or consequential losses, or for losses from blockchain congestion, third-party rails, or events outside our reasonable control.',
        'Our total liability for a claim related to the service is limited to fees you paid us in the three months before the claim, except where law requires otherwise.',
      ],
    },
    {
      title: '12. Changes and contact',
      body: [
        'We may update these terms. Material changes will be notified in-app or by email where required. Continued use after the effective date means you accept the updated terms.',
        'Support: use in-app Help Center or support channels listed under Contact.',
      ],
    },
  ],
};

export const PRIVACY_DOC: LegalDoc = {
  id: 'privacy',
  title: 'Privacy Policy',
  subtitle: 'How we protect your data',
  effective: 'Effective 14 September 2026',
  sections: [
    {
      title: '1. Our commitment',
      body: [
        'Convia protects your personal data. We collect only what we need to run the wallet, meet legal duties, prevent fraud, and improve the product.',
        'We do not sell your personal information.',
      ],
    },
    {
      title: '2. Data we collect',
      body: [
        'Account data: email, username, phone (if provided), password hashes via our auth provider, and profile fields you choose.',
        'Identity data: when you complete KYC — name, date of birth, address, government ID details, and related verification results.',
        'Financial activity: ledger balances, deposits, withdrawals, swaps, bill payments, device and session metadata needed for security.',
        'Technical data: app version, device type, IP address, approximate location (e.g. country from IP), and diagnostics.',
      ],
    },
    {
      title: '3. How we use data',
      body: [
        'To provide the service (login, balances, payments, support).',
        'To verify identity, set limits, and fight fraud, abuse, and financial crime.',
        'To send transactional messages (receipts, security alerts, OTP via our auth provider). Marketing only with consent where required.',
        'To comply with law, regulation, and lawful requests.',
      ],
    },
    {
      title: '4. Who we share with',
      body: [
        'Infrastructure and auth providers (for example cloud hosting and Supabase Auth) under contract.',
        'Payment and KYC partners required to process on-ramp, off-ramp, or identity checks in your country.',
        'Authorities when legally required.',
        'We do not share your data with advertisers for their independent marketing.',
      ],
    },
    {
      title: '5. Security',
      body: [
        'We use encryption in transit, access controls, session management, and transaction PIN for sensitive money actions.',
        'No system is perfect — protect your password, PIN, and devices. Enable available security features.',
      ],
    },
    {
      title: '6. Retention',
      body: [
        'We keep account and transaction records as long as your account is active and for a period afterward required for disputes, audits, and legal retention (including anti-fraud and accounting).',
        'You may request deletion; some records may be retained where the law requires.',
      ],
    },
    {
      title: '7. Your rights',
      body: [
        'Depending on your country, you may request access, correction, deletion, or a copy of certain personal data, or object to some processing.',
        'Use in-app support or the contact channels in Help Center. We may need to verify it is you before acting.',
      ],
    },
    {
      title: '8. International transfers',
      body: [
        'Data may be processed in countries where our providers operate. We use appropriate safeguards consistent with our providers’ terms and applicable law.',
      ],
    },
    {
      title: '9. Children',
      body: [
        'Convia is not directed at children under 18. We do not knowingly collect data from minors.',
      ],
    },
    {
      title: '10. Changes',
      body: [
        'We may update this policy. The effective date above will change; significant updates may be notified in-app.',
      ],
    },
  ],
};

/** Short accordion blurbs (About / settings). */
export const legalContent: Record<string, { heading: string; paragraphs: string[] }> = {
  'Terms of Service': {
    heading: 'Terms of Service',
    paragraphs: TERMS_DOC.sections.slice(0, 3).flatMap((s) => s.body).slice(0, 4),
  },
  'Privacy Policy': {
    heading: 'Privacy Policy',
    paragraphs: PRIVACY_DOC.sections.slice(0, 3).flatMap((s) => s.body).slice(0, 4),
  },
  Licenses: {
    heading: 'Licenses',
    paragraphs: [
      'Convia uses open-source components under their respective licenses. Full notices available on request.',
    ],
  },
  Contact: {
    heading: 'Contact',
    paragraphs: [
      'Use in-app Help Center and Support chat for the fastest response.',
      'Security issues: report via support with subject “Security”.',
    ],
  },
};

export const legalLinks: { icon: LucideIcon; label: string; desc: string; screen?: 'terms' | 'privacy' | 'help-center' }[] = [
  { icon: FileText, label: 'Terms of Service', desc: 'Account & product rules', screen: 'terms' },
  { icon: Shield, label: 'Privacy Policy', desc: 'How we protect your data', screen: 'privacy' },
  { icon: Scale, label: 'Licenses', desc: 'Open-source notices' },
  { icon: Mail, label: 'Contact', desc: 'Support channels' },
  { icon: Globe, label: 'Help Center', desc: 'Guides and FAQs', screen: 'help-center' },
];
