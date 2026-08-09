import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Calendar, Globe, MapPin, ChevronDown, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { COUNTRIES, type Country } from './types';
import { StepNavButtons } from './StepNavButtons';

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
}

/** KYC Step 1: full name, date of birth, country, and address. */
export function PersonalInfoStep({
  fullName, setFullName, dob, setDob, country, setCountry,
  address1, setAddress1, address2, setAddress2, city, setCity, postalCode, setPostalCode,
  errors, clearError, onContinue,
}: PersonalInfoStepProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  return (
    <div>
      <div className="mb-5">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Personal Information</h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Tell us a bit about yourself. This must match your ID document.</p>
      </div>

      <div className="rounded-[20px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {/* Full Name */}
        <div className="mb-4">
          <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Full Name <span style={{ color: 'var(--destructive)' }}>*</span></label>
          <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${errors.fullName ? 'var(--destructive)' : 'var(--border)'}` }}>
            <User size={16} style={{ color: errors.fullName ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="e.g. Adeola Okonkwo"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); if (errors.fullName) clearError('fullName'); }}
              className="flex-1 bg-transparent outline-none py-3"
              style={{ color: 'var(--foreground)', fontSize: 14 }}
            />
          </div>
          {errors.fullName && (
            <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
              <AlertCircle size={11} /> {errors.fullName}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Date of Birth <span style={{ color: 'var(--destructive)' }}>*</span></label>
          <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${errors.dob ? 'var(--destructive)' : 'var(--border)'}` }}>
            <Calendar size={16} style={{ color: errors.dob ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
            <input
              type="date"
              value={dob}
              onChange={(e) => { setDob(e.target.value); if (errors.dob) clearError('dob'); }}
              className="flex-1 bg-transparent outline-none py-3"
              style={{ color: 'var(--foreground)', fontSize: 14 }}
            />
          </div>
          {errors.dob && (
            <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
              <AlertCircle size={11} /> {errors.dob}
            </p>
          )}
        </div>

        {/* Country Selector */}
        <div className="mb-4 relative">
          <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Country <span style={{ color: 'var(--destructive)' }}>*</span></label>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCountryOpen(!countryOpen)}
            className="w-full flex items-center gap-2 px-3.5 py-3 rounded-[12px]"
            style={{ background: 'var(--muted)', border: `1px solid ${errors.country ? 'var(--destructive)' : countryOpen ? 'var(--primary)' : 'var(--border)'}` }}
          >
            <Globe size={16} style={{ color: errors.country ? 'var(--destructive)' : 'var(--primary)' }} />
            {country ? (
              <span className="flex items-center gap-2 flex-1 text-left">
                <span style={{ fontSize: 18 }}>{country.flag}</span>
                <span style={{ color: 'var(--foreground)', fontSize: 14 }}>{country.name}</span>
              </span>
            ) : (
              <span style={{ color: 'var(--muted-foreground)', fontSize: 14, flex: 1, textAlign: 'left' }}>Select your country</span>
            )}
            <motion.div animate={{ rotate: countryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
            </motion.div>
          </motion.button>
          {errors.country && !countryOpen && (
            <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
              <AlertCircle size={11} /> {errors.country}
            </p>
          )}
          <AnimatePresence>
            {countryOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden rounded-[12px] mt-1.5 absolute left-0 right-0 z-20"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
              >
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] mb-1" style={{ background: 'var(--muted)' }}>
                    <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', transform: 'rotate(0deg)' }} />
                    <input
                      autoFocus
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: 'var(--foreground)', fontSize: 13 }}
                    />
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {filteredCountries.map((c) => (
                      <motion.button
                        key={c.code}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setCountry(c);
                          setCountryOpen(false);
                          setCountrySearch('');
                          if (errors.country) clearError('country');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]"
                        style={{ background: country?.code === c.code ? 'var(--muted)' : 'transparent' }}
                      >
                        <span style={{ fontSize: 18 }}>{c.flag}</span>
                        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                        {country?.code === c.code && <Check size={14} style={{ color: 'var(--foreground)', marginLeft: 'auto' }} />}
                      </motion.button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>No country found</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Address Line 1 */}
        <div className="mb-4">
          <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Address Line 1 <span style={{ color: 'var(--destructive)' }}>*</span></label>
          <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${errors.address1 ? 'var(--destructive)' : 'var(--border)'}` }}>
            <MapPin size={16} style={{ color: errors.address1 ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Street address"
              value={address1}
              onChange={(e) => { setAddress1(e.target.value); if (errors.address1) clearError('address1'); }}
              className="flex-1 bg-transparent outline-none py-3"
              style={{ color: 'var(--foreground)', fontSize: 14 }}
            />
          </div>
          {errors.address1 && (
            <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
              <AlertCircle size={11} /> {errors.address1}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="mb-4">
          <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Address Line 2 <span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>(optional)</span></label>
          <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <MapPin size={16} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Apartment, suite, unit (optional)"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="flex-1 bg-transparent outline-none py-3"
              style={{ color: 'var(--foreground)', fontSize: 14 }}
            />
          </div>
        </div>

        {/* City & Postal Code */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>City <span style={{ color: 'var(--destructive)' }}>*</span></label>
            <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${errors.city ? 'var(--destructive)' : 'var(--border)'}` }}>
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => { setCity(e.target.value); if (errors.city) clearError('city'); }}
                className="flex-1 bg-transparent outline-none py-3 w-full"
                style={{ color: 'var(--foreground)', fontSize: 14 }}
              />
            </div>
            {errors.city && (
              <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                <AlertCircle size={11} /> {errors.city}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Postal Code <span style={{ color: 'var(--destructive)' }}>*</span></label>
            <div className="flex items-center gap-2 px-3.5 rounded-[12px]" style={{ background: 'var(--muted)', border: `1px solid ${errors.postalCode ? 'var(--destructive)' : 'var(--border)'}` }}>
              <input
                type="text"
                placeholder="Postal code"
                value={postalCode}
                onChange={(e) => { setPostalCode(e.target.value); if (errors.postalCode) clearError('postalCode'); }}
                className="flex-1 bg-transparent outline-none py-3 w-full"
                style={{ color: 'var(--foreground)', fontSize: 14 }}
              />
            </div>
            {errors.postalCode && (
              <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
                <AlertCircle size={11} /> {errors.postalCode}
              </p>
            )}
          </div>
        </div>
      </div>

      <StepNavButtons onBack={() => {}} onContinue={onContinue} backDisabled />
    </div>
  );
}
