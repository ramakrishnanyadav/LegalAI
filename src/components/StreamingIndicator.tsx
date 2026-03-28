import React from 'react';
import { StreamingPhase } from '../types/legal';
import { motion } from 'framer-motion';
import { X, Cpu, Network, Binary } from 'lucide-react';

interface Props {
  phase: StreamingPhase;
  message: string;
  onCancel: () => void;
}

const PHASES = [
  { key: 'thinking',  label: 'READ_DESCRIPTION',     sub: 'Extracting material facts and semantic nodes' },
  { key: 'matching',  label: 'SECTION_CROSSREF',     sub: 'Matrix scanning against BNS/IPC legal corpus' },
  { key: 'complete',  label: 'GENERATE_HASH',        sub: 'Compiling confidence metrics and reasoning' },
];

const SkeletonBlock = () => (
  <div className="w-full h-4 bg-blue-500/10 mb-2 relative overflow-hidden">
    <div className="absolute inset-0 bg-blue-400/20 -translate-x-full animate-[shimmer_1.5s_infinite]" />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#0A0F1C]/80 border border-blue-500/20 p-5 mt-4 relative overflow-hidden backdrop-blur-md">
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500" />
    
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex-1 space-y-2">
        <SkeletonBlock />
        <div className="w-3/4"><SkeletonBlock /></div>
      </div>
      <div className="w-12 h-12 border border-blue-500/30 flex items-center justify-center bg-blue-500/5">
        <Binary className="w-5 h-5 text-blue-500/40" />
      </div>
    </div>
    <div className="w-1/2"><SkeletonBlock /></div>
  </div>
);

export const StreamingIndicator: React.FC<Props> = ({ phase, message, onCancel }) => {
  const activeIdx = phase === 'thinking' ? 0 : phase === 'matching' ? 1 : 2;

  return (
    <div className="w-full mt-10">
      {/* HUD Scanner UI */}
      <div className="relative bg-[#03060D]/90 border border-purple-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        
        {/* Animated Scanline */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-[1px] bg-purple-500/60 shadow-[0_0_8px_rgba(139,92,246,0.8)] z-20 pointer-events-none"
          animate={{ y: [0, 100, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Phase steps */}
        <div className="flex-1 z-10">
          <div className="flex items-center gap-4 mb-5">
            {/* Spinning Core */}
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center border border-purple-500/50 bg-[#1E1B4B]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-purple-400 rounded-full"
              />
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            
            <div>
              <p className="text-[13px] font-mono font-bold tracking-widest text-purple-400 uppercase">
                {PHASES[activeIdx]?.label ?? 'ANALYSIS_ROUTINE'}
              </p>
              <p className="text-[11px] font-mono text-purple-200/50 tracking-wide mt-1 h-4 overflow-hidden">
                <span className="mr-2 text-purple-500 blink">&gt;</span>
                {message || PHASES[activeIdx]?.sub}
              </p>
            </div>
          </div>

          {/* Tracer Process Bar */}
          <div className="flex items-center gap-1 w-full max-w-md">
            {PHASES.map((p, i) => (
              <React.Fragment key={p.key}>
                <div className="flex flex-col flex-1">
                  <div 
                    className="h-1.5 w-full transition-all duration-300"
                    style={{
                      backgroundColor: i <= activeIdx ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.05)',
                      boxShadow: i === activeIdx ? '0 0 10px rgba(139,92,246,0.5)' : 'none'
                    }}
                  />
                  <span 
                    className="text-[9px] font-mono mt-1 uppercase"
                    style={{ color: i <= activeIdx ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.2)' }}
                  >
                    PHASE_{i + 1}
                  </span>
                </div>
                {i < PHASES.length - 1 && <div className="w-2 h-1.5 bg-transparent" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Cancel System Override */}
        <button
          onClick={onCancel}
          className="group relative flex items-center gap-2 px-4 py-2 border border-red-500/30 bg-red-500/5 text-[11px] font-mono text-red-400 uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500 transition-all z-10"
        >
          <X className="w-4 h-4" />
          Abort Sequence
          <div className="absolute inset-0 bg-red-400/10 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
        </button>
      </div>

      {/* Ghosting Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        className="mt-6 opacity-60"
      >
        <div className="text-[10px] font-mono text-blue-500/40 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Network className="w-3 h-3" /> Allocating Memory Blocks...
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </motion.div>
    </div>
  );
};
