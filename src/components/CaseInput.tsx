import React, { useState, ClipboardEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ScanLine, BrainCircuit, Type, FileCode2, Scale } from 'lucide-react';

interface CaseInputProps {
  onSubmit: (text: string, language: 'en' | 'hi') => void;
  isLoading: boolean;
}

const MAGNETIC_CHIPS = [
  { key: 'cyber', label: 'Cyber Intrusion', icon: FileCode2, color: '#3B82F6' },
  { key: 'property', label: 'Asset Dispute', icon: Scale, color: '#10B981' },
  { key: 'corporate', label: 'Corporate Fraud', icon: BrainCircuit, color: '#8B5CF6' },
] as const;

export const CaseInput: React.FC<CaseInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isValid   = charCount >= 50 && charCount <= 5000;

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text/plain');
    const cleaned = raw.replace(/\s+/g, ' ').trim();
    setText(prev => (prev + ' ' + cleaned).trim().slice(0, 5000));
  };

  return (
    <div className="relative w-full rounded-2xl p-1 overflow-hidden group">
      {/* ── Outer glowing breathing border ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        animate={{
          background: isFocused 
            ? 'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(139,92,246,0.5) 50%, rgba(59,130,246,0.5) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          opacity: isFocused ? [0.6, 1, 0.6] : 1,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ borderRadius: 'inherit' }}
      />
      
      {/* ── Heavy Glassmorphic Container ── */}
      <div 
        className="relative z-10 w-full rounded-[14px] bg-[#0A0F1C]/80 backdrop-blur-3xl px-8 py-8 flex flex-col isolation-auto"
        style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
      >
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-widest font-mono uppercase">Neural Input Core</h3>
              <p className="text-[11px] text-blue-400/50 font-mono">AWAITING_INCIDENT_DATA // BNS_MAPPER_READY</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-lg">
            {(['en', 'hi'] as const).map(l => (
              <button
                key={l} onClick={() => setLang(l)}
                className="px-4 py-1.5 rounded-md text-[12px] font-bold font-mono uppercase transition-all"
                style={{
                  background: lang === l ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: lang === l ? '#60A5FA' : 'rgba(255,255,255,0.3)',
                  border: lang === l ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                  textShadow: lang === l ? '0 0 10px rgba(59,130,246,0.5)' : 'none',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Magnetic Chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          {MAGNETIC_CHIPS.map(chip => (
            <motion.button
              key={chip.key}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setText(`[${chip.label.toUpperCase()}] `)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-xl transition-colors hover:border-blue-500/50"
            >
              <chip.icon className="w-4 h-4" style={{ color: chip.color }} />
              <span className="text-[12px] font-semibold text-white/70">{chip.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Intelligent Textarea */}
        <div className="relative group/textarea">
          {/* Subtle bg glow tracking focus */}
          <div 
            className={`absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl transition-opacity duration-700 pointer-events-none ${isFocused ? 'opacity-100' : 'opacity-0'}`} 
          />
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            placeholder="Initialize raw event description... (min 50 chars)"
            rows={8}
            className="w-full relative z-10 resize-y rounded-2xl bg-[#03060D]/80 text-[#E2E8F0] text-[15px] leading-relaxed p-6 placeholder:text-blue-300/20 font-mono focus:outline-none transition-all duration-300"
            style={{
              border: isFocused ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isFocused ? 'inset 0 0 20px rgba(59,130,246,0.05)' : 'none',
              caretColor: '#60A5FA',
            }}
          />
          
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-4">
            <div className="flex flex-col text-right font-mono text-[10px] tracking-widest uppercase">
              <span style={{ color: charCount > 5000 ? '#EF4444' : charCount >= 50 ? '#10B981' : '#64748B' }}>
                CHR: {charCount.toString().padStart(4, '0')} / 5000
              </span>
              <span className="text-white/20">WRD: {wordCount.toString().padStart(4, '0')}</span>
            </div>
            
            <motion.button
              whileHover={isValid && !isLoading ? { scale: 1.05 } : {}}
              whileTap={isValid && !isLoading ? { scale: 0.95 } : {}}
              onClick={() => isValid && !isLoading && onSubmit(text, lang)}
              disabled={!isValid || isLoading}
              className="relative overflow-hidden group/btn px-6 py-3 rounded-xl font-bold text-[13px] tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isValid && !isLoading ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' : 'rgba(255,255,255,0.05)',
                color: isValid ? '#FFF' : 'rgba(255,255,255,0.3)',
                boxShadow: isValid && !isLoading ? '0 10px 30px -10px rgba(124,58,237,0.7)' : 'none',
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 animate-pulse text-white" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Initialize Link
                </div>
              )}
              {/* Button shimmer */}
              {isValid && !isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
