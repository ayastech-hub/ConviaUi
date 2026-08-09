import type React from 'react';
import { User, FileText, Camera, ShieldCheck, IdCard, BookUser, Car } from 'lucide-react';

export type DocType = 'passport' | 'id' | 'license';
export type KYCStepId = 'personal' | 'document' | 'selfie' | 'review';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
];

export const KYC_STEPS: { id: KYCStepId; label: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }> }[] = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'document', label: 'Document Upload', icon: FileText },
  { id: 'selfie', label: 'Selfie Verification', icon: Camera },
  { id: 'review', label: 'Review', icon: ShieldCheck },
];

export const DOC_TYPES: { id: DocType; label: string; desc: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { id: 'id', label: 'National ID Card', desc: 'Government-issued national identity card', icon: IdCard },
  { id: 'passport', label: 'International Passport', desc: 'Valid passport bio-data page', icon: BookUser },
  { id: 'license', label: "Driver's License", desc: 'Official driving license card', icon: Car },
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface PersonalInfo {
  fullName: string;
  dob: string;
  country: Country | null;
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
}

export function validatePersonalInfo(info: PersonalInfo): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!info.fullName.trim()) errors.fullName = 'Full name is required';
  else if (info.fullName.trim().length < 3) errors.fullName = 'Enter your full name';
  if (!info.dob) {
    errors.dob = 'Date of birth is required';
  } else {
    const birth = new Date(info.dob);
    const age = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) errors.dob = 'You must be at least 18 years old';
    if (age > 120) errors.dob = 'Please enter a valid date';
  }
  if (!info.country) errors.country = 'Please select your country';
  if (!info.address1.trim()) errors.address1 = 'Address is required';
  if (!info.city.trim()) errors.city = 'City is required';
  if (!info.postalCode.trim()) errors.postalCode = 'Postal code is required';
  return errors;
}
