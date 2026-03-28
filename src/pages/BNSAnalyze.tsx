// src/pages/BNSAnalyze.tsx — Premium BNS Legal Analysis
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, Shield, Zap, BookOpen, AlertCircle } from 'lucide-react';

import { DisclaimerModal } from '@/components/DisclaimerModal';
import { CaseInput } from '@/components/CaseInput';
import { StreamingIndicator } from '@/components/StreamingIndicator';
import { useAnalysis } from '@/hooks/useAnalysis';

const FEATURE_PILLS = [
  { icon: Shield,   label: 'BNS 2023 Ready' },
  { icon: BookOpen, label: 'IPC Legacy Map' },
  { icon: Zap,      label: 'Real-time Streaming' },
  { icon: Scale,    label: 'IT Act & DPDP 2023' },
];

const BNSAnalyze = () => {
  const navigate = useNavigate();
  const {
    analyze, cancelAnalysis,
    savedCaseId, streamingPhase, streamingMessage,
    isStreaming, error,
  } = useAnalysis();

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  // ── Auto-redirect to case result when complete ──────────────────────────
  useEffect(() => {
    if (streamingPhase === 'complete' && savedCaseId) {
      navigate(`/case/${savedCaseId}`, { replace: true });
    }
  }, [streamingPhase, savedCaseId, navigate]);

  const isIdle  = streamingPhase === 'idle';
  const isError = streamingPhase === 'error';

  return (
    <>
      <title>BNS Legal Analysis — Lumina Legal</title>
      <DisclaimerModal />

      <div className="min-h-screen" style={{ background: 'hsl(220 27% 5%)' }}>
        {/* ── Sticky header ──────────────────────────── */}
        <header
          className="sticky top-0 z-50"
          style={{
            background: 'rgba(8,13,20,0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              id="bns-back-btn"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-[13px] font-medium transition-colors duration-200 group"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Dashboard
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'hsl(221 89% 60%)', boxShadow: '0 2px 8px hsl(221 89% 60% / 0.35)' }}
              >
                <Scale className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[14px] font-semibold text-white">BNS Analysis</span>
                <span className="text-[11px] text-white/30 ml-2 hidden sm:inline">
                  Bharatiya Nyaya Sanhita · Legal AI
                </span>
              </div>
            </div>

            {/* Live indicator */}
            <div className="w-20 flex justify-end">
              {isStreaming ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'hsl(221 89% 60%)' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'hsl(221 89% 60%)' }} />
                  </span>
                  <span className="text-[12px] font-medium" style={{ color: 'hsl(221 89% 65%)' }}>
                    Analysing
                  </span>
                </div>
              ) : (
                <span className="text-[12px] text-white/25">Ready</span>
              )}
            </div>
          </div>
        </header>

        {/* ── Main ───────────────────────────────────── */}
        <main className="max-w-4xl mx-auto px-4 pb-24">

          {/* Hero */}
          <AnimatePresence mode="wait">
            {(isIdle || isError) && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-center pt-14 pb-2 relative"
              >
                {/* Ambient */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
                  style={{ width: '600px', height: '280px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)' }}
                  aria-hidden
                />

                {/* Pill */}
                <div
                  className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
                >
                  <Zap className="w-3.5 h-3.5" style={{ color: 'hsl(221 89% 65%)' }} strokeWidth={2} />
                  <span className="text-[12.5px] font-medium" style={{ color: 'hsl(221 89% 72%)' }}>
                    Real-time Legal Analysis
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-4"
                  style={{ letterSpacing: '-0.05em', lineHeight: 1.05 }}
                >
                  <span className="text-white block">Incident</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Ingestion Protocol
                  </span>
                </h1>

                <p className="text-[14px] font-mono tracking-widest uppercase mb-10" style={{ color: 'rgba(59,130,246,0.6)' }}>
                  Awaiting Raw Event Data // Neural Network Active
                </p>

                {/* Cyber pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                  {FEATURE_PILLS.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono"
                      style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(147,197,253,0.8)' }}
                    >
                      <Icon className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
                      {label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error banner */}
          <AnimatePresence>
            {isError && error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
                className="flex items-start gap-3 p-4 rounded-xl mt-4"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}
                role="alert"
              >
                <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" style={{ color: 'hsl(0 72% 60%)' }} />
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: 'hsl(0 72% 65%)' }}>Analysis Failed</p>
                  <p className="text-[12.5px] mt-0.5" style={{ color: 'hsl(0 72% 55%)' }}>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input panel */}
          <AnimatePresence>
            {(isIdle || isError) && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <CaseInput
                  onSubmit={(text, language) => analyze(text, language)}
                  isLoading={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streaming */}
          <AnimatePresence>
            {isStreaming && (
              <motion.div
                key="streaming"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              >
                <StreamingIndicator
                  phase={streamingPhase}
                  message={streamingMessage}
                  onCancel={cancelAnalysis}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preparing redirect notice */}
          <AnimatePresence>
            {streamingPhase === 'complete' && !savedCaseId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-16 flex flex-col items-center justify-center space-y-5"
              >
                 <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-[3px] border-blue-500/10 border-t-blue-500/80 rounded-full animate-spin [animation-duration:1s]" />
                    <div className="absolute inset-2 border-[2px] border-purple-500/10 border-b-purple-500/80 rounded-full animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                 </div>
                 
                 <div className="text-center">
                   <p className="font-mono text-[11px] text-blue-400 font-bold tracking-[0.2em] uppercase mb-1">
                     Encryption Active. Committing Ledger...
                   </p>
                   <p className="font-mono text-[9px] text-blue-500/40 tracking-widest uppercase mb-4">
                     Generating SECURE_HASH across all identified sections
                   </p>
                 </div>

                 <div className="w-64 h-[2px] bg-blue-500/20 overflow-hidden relative">
                    <motion.div 
                      className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-blue-400 to-purple-500" 
                      initial={{ width: "20%" }} 
                      animate={{ x: ["-100%", "500%"] }} 
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
                    />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer disclaimer */}
          {!isStreaming && (
            <p
              className="mt-14 text-center text-[11px] leading-relaxed mx-auto"
              style={{ color: 'rgba(255,255,255,0.18)', maxWidth: '52ch' }}
            >
              Results are informational only and do not constitute legal advice.
              Always consult a licensed advocate before taking legal action.
            </p>
          )}
        </main>
      </div>
    </>
  );
};

export default BNSAnalyze;
