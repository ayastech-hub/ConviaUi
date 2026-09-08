import type React from 'react';
import { User, FileText, Camera, ShieldCheck, IdCard, BookUser, Car } from 'lucide-react';

export type DocType = 'passport' | 'id' | 'license';
export type KYCStepId = 'personal' | 'document' | 'selfie' | 'review';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

export interface Country {
  code: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'CM', name: 'Cameroon' },
  { code: 'AO', name: 'Angola' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'BW', name: 'Botswana' },
  { code: 'NA', name: 'Namibia' },
];

export const KYC_STEPS: {
  id: KYCStepId;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
}[] = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'document', label: 'ID', icon: FileText },
  { id: 'selfie', label: 'Selfie', icon: Camera },
  { id: 'review', label: 'Review', icon: ShieldCheck },
];

export const DOC_TYPES: {
  id: DocType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}[] = [
  { id: 'id', label: 'National ID', desc: 'Government-issued identity card', icon: IdCard },
  { id: 'passport', label: 'Passport', desc: 'Bio-data page of a valid passport', icon: BookUser },
  { id: 'license', label: "Driver's license", desc: 'Official driving license', icon: Car },
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
  if (!info.fullName.trim()) errors.fullName = 'Full legal name is required';
  else if (info.fullName.trim().length < 3) errors.fullName = 'Enter your full legal name';
  if (!info.dob) {
    errors.dob = 'Date of birth is required';
  } else {
    const birth = new Date(info.dob);
    const age = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) errors.dob = 'You must be at least 18';
    if (age > 120) errors.dob = 'Enter a valid date';
  }
  if (!info.country) errors.country = 'Select your country of residence';
  if (!info.address1.trim()) errors.address1 = 'Address is required';
  if (!info.city.trim()) errors.city = 'City is required';
  if (!info.postalCode.trim()) errors.postalCode = 'Postal code is required';
  return errors;
}
