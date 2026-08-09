import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { KYC_STEPS } from './types';

interface StepIndicatorProps {
  activeStep: number;
}

/** Horizontal step progress row at the top of the KYC flow (icons + connecting progress lines). */
export function StepIndicator({ activeStep }: StepIndicatorProps) {
  return (
    <div className="px-5 mb-6">
      <div className="flex items-center">
        {KYC_STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <motion.div
                  initial={false}
                  animate={{ scale: active ? 1.1 : 1 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center relative"
                  style={{
                    background: done || active ? 'var(--primary)' : 'var(--muted)',
                    boxShadow: active ? '0 0 0 4px var(--muted)' : 'none',
                    border: `1px solid ${done || active ? 'transparent' : 'var(--border)'}`,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check size={16} style={{ color: '#fff', strokeWidth: 3 }} />
                      </motion.div>
                    ) : (
                      <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Icon size={15} style={{ color: active ? '#fff' : 'var(--muted-foreground)' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span style={{ color: active ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 9, fontWeight: active ? 700 : 500, textAlign: 'center', width: 64, lineHeight: 1.2 }}>
                  {step.label}
                </span>
              </div>
              {i < KYC_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)', marginTop: -14 }}>
                  <motion.div
                    initial={false}
                    animate={{ width: i < activeStep ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--foreground)' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
