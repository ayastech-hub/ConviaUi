import { type ReactNode, type CSSProperties } from 'react';
import { User, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { COUNTRIES, type Country } from './types';
import { StepNavButtons } from './StepNavButtons';
import { CountrySelect } from '../CountrySelect';

interface PersonalInfoStepProps {
  fullName: string;
  setFullName: (v: string) => void;
  dob: string;
  setDob: (v: string) => void;
  country: Country | null;
  setCountry: (c: Country) => void;
  address1: string;
  setAddress1: (v: string) => void;
  address2: string;
  setAddress2: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
  onContinue: () => void;
  countryOptions?: Country[];
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>
        {label} {required && <span style={{ color: 'var(--destructive)' }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function InputRow({
  error,
  icon: Icon,
  children,
}: {
  error?: boolean;
  icon?: React.ComponentType<{ size?: number; style?: CSSProperties }>;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3.5 rounded-[12px]"
      style={{ background: 'var(--muted)', border: `1px solid ${error ? 'var(--destructive)' : 'var(--border)'}` }}
    >
      {Icon && <Icon size={16} style={{ color: error ? 'var(--destructive)' : 'var(--muted-foreground)' }} />}
      {children}
    </div>
  );
}

const inputStyle: CSSProperties = { color: 'var(--foreground)', fontSize: 14 };

/** KYC Step 1: legal name, DOB, country, address. */
export function PersonalInfoStep({
  fullName,
  setFullName,
  dob,
  setDob,
  country,
  setCountry,
  address1,
  setAddress1,
  address2,
  setAddress2,
  city,
  setCity,
  postalCode,
  setPostalCode,
  errors,
  clearError,
  onContinue,
  countryOptions,
}: PersonalInfoStepProps) {
  const options = countryOptions?.length ? countryOptions : COUNTRIES;

  return (
    <div>
      <div className="mb-5">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Personal information
        </h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45 }}>
          Must match the name and country on your ID.
        </p>
      </div>

      <div className="rounded-[20px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <Field label="Legal name" required error={errors.fullName}>
          <InputRow error={!!errors.fullName} icon={User}>
            <input
              type="text"
              placeholder="As printed on your ID"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) clearError('fullName');
              }}
              className="flex-1 bg-transparent outline-none py-3"
              style={inputStyle}
            />
          </InputRow>
        </Field>

        <Field label="Date of birth" required error={errors.dob}>
          <InputRow error={!!errors.dob} icon={Calendar}>
            <input
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                if (errors.dob) clearError('dob');
              }}
              className="flex-1 bg-transparent outline-none py-3"
              style={inputStyle}
            />
          </InputRow>
        </Field>

        <div className="mb-4">
          <CountrySelect
            value={country}
            options={options}
            error={errors.country}
            onChange={(c) => {
              setCountry(c);
              if (errors.country) clearError('country');
            }}
            label="Country of residence"
          />
        </div>

        <Field label="Address line 1" required error={errors.address1}>
          <InputRow error={!!errors.address1} icon={MapPin}>
            <input
              type="text"
              placeholder="Street address"
              value={address1}
              onChange={(e) => {
                setAddress1(e.target.value);
                if (errors.address1) clearError('address1');
              }}
              className="flex-1 bg-transparent outline-none py-3"
              style={inputStyle}
            />
          </InputRow>
        </Field>

        <Field label="Address line 2">
          <InputRow>
            <MapPin size={16} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Apartment, suite (optional)"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="flex-1 bg-transparent outline-none py-3"
              style={inputStyle}
            />
          </InputRow>
        </Field>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="City" required error={errors.city}>
              <InputRow error={!!errors.city}>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) clearError('city');
                  }}
                  className="flex-1 bg-transparent outline-none py-3 w-full"
                  style={inputStyle}
                />
              </InputRow>
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Postal code" required error={errors.postalCode}>
              <InputRow error={!!errors.postalCode}>
                <input
                  type="text"
                  placeholder="Code"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (errors.postalCode) clearError('postalCode');
                  }}
                  className="flex-1 bg-transparent outline-none py-3 w-full"
                  style={inputStyle}
                />
              </InputRow>
            </Field>
          </div>
        </div>
      </div>

      <StepNavButtons onBack={() => {}} onContinue={onContinue} backDisabled />
    </div>
  );
}
