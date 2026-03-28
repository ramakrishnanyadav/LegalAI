import React, { useState } from 'react';
import { X, Scale } from 'lucide-react';
import { useDisclaimer } from '../hooks/useDisclaimer';
import { motion, AnimatePresence } from 'framer-motion';

export const DisclaimerModal: React.FC = () => {
  const { hasAccepted, showModal, acceptDisclaimer } = useDisclaimer();
  const [understood, setUnderstood] = useState(false);
  const [isAdult, setIsAdult]       = useState(false);

  const isOpen = !hasAccepted && showModal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[900]"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[901] flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
          >
            <div
              className="relative w-full max-w-md rounded-xl overflow-hidden"
              style={{
                background: 'hsl(220 22% 10%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Top accent line */}
              <div
                className="h-[3px] w-full"
                style={{ background: 'linear-gradient(90deg, hsl(221 89% 60%), hsl(238 72% 58%))' }}
              />

              <div className="px-6 py-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'hsl(221 89% 60% / 0.12)', border: '1px solid hsl(221 89% 60% / 0.2)' }}
                  >
                    <Scale className="w-4.5 h-4.5" style={{ color: 'hsl(221 89% 65%)' }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h2
                      id="disclaimer-title"
                      className="text-[16px] font-semibold text-white tracking-tight"
                    >
                      Legal Information Disclaimer
                    </h2>
                    <p className="text-[12.5px] text-white/40 mt-1">
                      Please read and acknowledge before proceeding
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div
                  className="text-[13px] text-white/55 leading-relaxed mb-6 px-4 py-4 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Lumina Legal uses AI to identify potentially applicable sections of Indian law
                  based on your description. This is{' '}
                  <strong className="text-white/80 font-semibold">not legal advice</strong>.
                  Results are automatically generated and may not reflect recent judgments,
                  procedural requirements, or individual case nuances.
                  <br /><br />
                  Always consult a licensed advocate before taking any legal action.
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 mb-6">
                  {[
                    {
                      id: 'understood',
                      checked: understood,
                      onChange: setUnderstood,
                      label: 'I understand this tool provides information only, not legal advice.',
                    },
                    {
                      id: 'adult',
                      checked: isAdult,
                      onChange: setIsAdult,
                      label: 'I am 18 years of age or older.',
                    },
                  ].map(item => (
                    <label
                      key={item.id}
                      htmlFor={item.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          id={item.id}
                          type="checkbox"
                          checked={item.checked}
                          onChange={e => item.onChange(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className="w-4.5 h-4.5 rounded-[4px] border transition-all duration-200 flex items-center justify-center"
                          style={{
                            width: '18px', height: '18px',
                            background:   item.checked ? 'hsl(221 89% 60%)' : 'rgba(0,0,0,0.3)',
                            borderColor:  item.checked ? 'hsl(221 89% 60%)' : 'rgba(255,255,255,0.15)',
                            boxShadow:    item.checked ? '0 0 0 1px hsl(221 89% 60% / 0.3)' : 'none',
                          }}
                        >
                          {item.checked && (
                            <motion.svg
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-2.5 h-2.5 text-white"
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </motion.svg>
                          )}
                        </div>
                      </div>
                      <span className="text-[13px] text-white/55 group-hover:text-white/75 leading-snug transition-colors duration-150">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => understood && isAdult && acceptDisclaimer()}
                  disabled={!understood || !isAdult}
                  className="w-full py-3 rounded-lg text-[14px] font-semibold text-white transition-all duration-200"
                  style={{
                    background:  understood && isAdult ? 'hsl(221 89% 60%)' : 'rgba(255,255,255,0.06)',
                    boxShadow:   understood && isAdult ? '0 1px 0 rgba(255,255,255,0.15) inset, 0 6px 18px hsl(221 89% 60% / 0.35)' : 'none',
                    cursor:      understood && isAdult ? 'pointer' : 'not-allowed',
                    color:       understood && isAdult ? 'white' : 'rgba(255,255,255,0.25)',
                  }}
                >
                  I Understand — Proceed to Analysis
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
