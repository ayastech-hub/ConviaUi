import { motion } from 'motion/react';
import { Phone, Zap } from 'lucide-react';
import { DATA_BUNDLES, AIRTIME_AMOUNTS } from './serviceData';

interface ServiceAmountInputProps {
  serviceId: string;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  meterNumber: string;
  setMeterNumber: (v: string) => void;
  selectedAmount: number | null;
  setSelectedAmount: (v: number | null) => void;
  customAmount: string;
  setCustomAmount: (v: string) => void;
}

/**
 * The service-specific input fields shown after picking a provider:
 * phone number (data/airtime), meter number (electricity), a data-bundle
 * grid, an airtime-amount grid, or a free-form amount field (electricity/
 * bills/betting), depending on which service is active.
 */
export function ServiceAmountInput({
  serviceId, phoneNumber, setPhoneNumber, meterNumber, setMeterNumber,
  selectedAmount, setSelectedAmount, customAmount, setCustomAmount,
}: ServiceAmountInputProps) {
  return (
    <>
      {(serviceId === 'data' || serviceId === 'airtime') && (
        <div>
          <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>Phone Number</label>
          <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Phone size={18} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="024 123 4567"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 15 }}
            />
          </div>
        </div>
      )}

      {serviceId === 'electricity' && (
        <div>
          <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>Meter Number</label>
          <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Zap size={18} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="tel"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="Enter meter number"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 15 }}
            />
          </div>
        </div>
      )}

      {serviceId === 'data' && (
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Choose Bundle</p>
          <div className="grid grid-cols-3 gap-2.5">
            {DATA_BUNDLES.map((bundle) => (
              <motion.button
                key={bundle.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedAmount(bundle.value); setCustomAmount(''); }}
                className="relative p-3 rounded-[14px] text-center"
                style={{ background: selectedAmount === bundle.value ? 'var(--primary)' : 'var(--card)', border: `1px solid ${selectedAmount === bundle.value ? 'var(--primary)' : 'var(--border)'}` }}
              >
                {bundle.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--positive)', fontSize: 8, fontWeight: 700 }}>POPULAR</span>
                )}
                <p style={{ color: selectedAmount === bundle.value ? '#fff' : 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{bundle.label}</p>
                <p style={{ color: selectedAmount === bundle.value ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 11 }}>${bundle.value}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {serviceId === 'airtime' && (
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Select Amount</p>
          <div className="grid grid-cols-3 gap-2.5">
            {AIRTIME_AMOUNTS.map((amt) => (
              <motion.button
                key={amt}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                className="p-3 rounded-[14px] text-center"
                style={{ background: selectedAmount === amt ? 'var(--primary)' : 'var(--card)', border: `1px solid ${selectedAmount === amt ? 'var(--primary)' : 'var(--border)'}` }}
              >
                <p style={{ color: selectedAmount === amt ? '#fff' : 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>${amt}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {(serviceId === 'electricity' || serviceId === 'bills' || serviceId === 'betting') && (
        <div>
          <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>Amount</label>
          <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 18, fontWeight: 700 }}>$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              placeholder="0.00"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700 }}
            />
          </div>
          {serviceId === 'electricity' && (
            <div className="flex gap-2 mt-3">
              {[10, 20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setCustomAmount(String(amt)); setSelectedAmount(null); }}
                  className="px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}
                >
                  ${amt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
