import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle2, Camera, Upload, User, FileText, Loader, Globe, BookUser, IdCard, Car } from 'lucide-react';

interface KYCScreenProps {
  goBack: () => void;
}

const steps = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'document', label: 'ID Document', icon: FileText },
  { id: 'selfie', label: 'Selfie Check', icon: Camera },
];

export function KYCScreen({ goBack }: KYCScreenProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [firstName, setFirstName] = useState('Ade');
  const [lastName, setLastName] = useState('Mensah');
  const [dob, setDob] = useState('1995-06-15');
  const [docType, setDocType] = useState<'passport' | 'id' | 'license'>('passport');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploaded(true); }, 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 3000);
  };

  if (verified) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle2 size={60} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>KYC Verified</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 6 }}>Your identity has been successfully verified</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 40 }}>You now have full access to all Convia features including unlimited transactions and OTC trading.</p>
          <div className="flex gap-2 mb-4">
            {['Higher limits', 'OTC Trading', 'Off-Ramp', 'All features'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
                <CheckCircle2 size={12} /> {f}
              </span>
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={goBack} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
            Back to Profile
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>KYC Verification</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Secure & encrypted</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center px-5 mb-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: done ? 'var(--primary)' : active ? 'var(--primary)' : 'var(--muted)', boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none' }}>
                  {done ? <CheckCircle2 size={16} className="text-white" /> : <Icon size={15} className="text-white" />}
                </div>
                <span style={{ color: active ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, textAlign: 'center', width: 60 }}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-2 mt-[-12px]" style={{ background: i < activeStep ? 'var(--primary)' : 'var(--border)' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div key="personal" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="rounded-[20px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Personal Information</p>
                {[
                  { label: 'First Name', value: firstName, set: setFirstName, type: 'text' },
                  { label: 'Last Name', value: lastName, set: setLastName, type: 'text' },
                  { label: 'Date of Birth', value: dob, set: setDob, type: 'date' },
                ].map(field => (
                  <div key={field.label} className="mb-4">
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>{field.label}</p>
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={e => field.set(e.target.value)}
                      className="w-full px-4 py-3 rounded-[12px] outline-none"
                      style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 14, border: '1px solid var(--border)' }}
                    />
                  </div>
                ))}
                <div className="mb-4">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Country</p>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-[12px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <Globe size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--foreground)', fontSize: 14 }}>Nigeria</span>
                  </div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActiveStep(1)} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
                Continue
              </motion.button>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div key="document" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 12 }}>Select your document type</p>
              <div className="flex flex-col gap-2 mb-4">
                {[
                  { id: 'passport', label: 'International Passport', icon: BookUser },
                  { id: 'id', label: 'National ID Card', icon: IdCard },
                  { id: 'license', label: "Driver's License", icon: Car },
                ].map(doc => {
                  const DocIcon = doc.icon;
                  return (
                  <motion.button key={doc.id} whileTap={{ scale: 0.98 }} onClick={() => setDocType(doc.id as any)} className="flex items-center gap-3 p-4 rounded-[16px]" style={{ background: 'var(--card)', border: `1.5px solid ${docType === doc.id ? 'var(--primary)' : 'var(--border)'}` }}>
                    <DocIcon size={22} style={{ color: docType === doc.id ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                    <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{doc.label}</span>
                    <div className="ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: docType === doc.id ? 'var(--primary)' : 'var(--border)', background: docType === doc.id ? 'var(--primary)' : 'transparent' }}>
                      {docType === doc.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </motion.button>
                  );
                })}
              </div>

              <div className="mb-4">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Upload front of document</p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleUpload} className="w-full py-8 rounded-[20px] flex flex-col items-center gap-3" style={{ background: 'var(--card)', border: `2px dashed ${uploaded ? 'var(--primary)' : 'var(--border)'}` }}>
                  {uploading ? <Loader size={28} style={{ color: 'var(--primary)' }} className="animate-spin" />
                    : uploaded ? <CheckCircle2 size={28} style={{ color: 'var(--primary)' }} />
                    : <Upload size={28} style={{ color: 'var(--muted-foreground)' }} />}
                  <span style={{ color: uploaded ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>
                    {uploading ? 'Uploading...' : uploaded ? 'Document uploaded!' : 'Tap to upload'}
                  </span>
                </motion.button>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if (uploaded) setActiveStep(2); }} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: uploaded ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}>
                Continue
              </motion.button>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div key="selfie" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-32 h-40 rounded-[20px] mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)', border: '2px dashed var(--border)' }}>
                  <Camera size={40} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, textAlign: 'center', marginBottom: 8 }}>Take a Selfie</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center', lineHeight: 1.5, marginBottom: 16 }}>
                  Position your face in the oval. Make sure you're in good lighting.
                </p>
                <ul className="space-y-2">
                  {['Look directly at camera', 'Remove glasses or hats', 'Ensure face is well lit', 'No filters or masks'].map(tip => (
                    <li key={tip} className="flex items-center gap-2">
                      <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerify} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                {verifying ? <><Loader size={18} className="animate-spin" /> Verifying...</> : <><Camera size={18} /> Take Selfie & Verify</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
