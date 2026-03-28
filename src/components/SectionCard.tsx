import React, { useState } from 'react';
import { AnalysisSection } from '../types/legal';
import { ConfidenceBar } from './ConfidenceBar';
import { ChevronDown, Copy, ExternalLink, AlertOctagon, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

interface Props { section: AnalysisSection; }

const severityInfo = (severity: string): { label: string; color: string; bg: string; border: string } => {
  const s = severity.toLowerCase();
  if (s.includes('non-bailable') || s.includes('non bailable')) {
    return {
      label: 'Non-Bailable',
      color: 'hsl(0 72% 65%)',
      bg:    'hsl(0 72% 51% / 0.1)',
      border:'hsl(0 72% 51% / 0.22)',
    };
  }
  return {
    label: 'Bailable',
    color: 'hsl(158 64% 55%)',
    bg:    'hsl(158 64% 42% / 0.1)',
    border:'hsl(158 64% 42% / 0.22)',
  };
};

const confidenceGradient = (score: number): string => {
  if (score >= 0.80) return 'linear-gradient(90deg, hsl(158 64% 42%), hsl(158 80% 52%))';
  if (score >= 0.55) return 'linear-gradient(90deg, hsl(38 92% 42%), hsl(43 96% 56%))';
  return 'linear-gradient(90deg, hsl(0 72% 42%), hsl(0 72% 58%))';
};

const leftBorderColor = (score: number): string => {
  if (score >= 0.80) return 'hsl(158 64% 42%)';
  if (score >= 0.55) return 'hsl(43 96% 56%)';
  return 'hsl(0 72% 51%)';
};

export const SectionCard: React.FC<Props> = ({ section }) => {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const sev = severityInfo(section.severity ?? '');
  const pct = Math.round(section.confidence * 100);

  const handleCopy = () => {
    const text = `${section.bns_section} / ${section.ipc_section} — ${section.title} (${pct}% confidence)\nReasoning: ${section.reasoning}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Section copied to clipboard.' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl group"
      style={{
        background: 'linear-gradient(145deg, hsl(220 22% 11%) 0%, hsl(220 22% 9%) 100%)',
        border: '1px solid hsl(220 20% 15%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'hsl(220 20% 22%)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.35)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'hsl(220 20% 15%)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ background: leftBorderColor(section.confidence) }}
      />

      {/* Top shine */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)' }}
      />

      <div className="pl-6 pr-5 py-5">
        {/* ── Header row ────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col gap-2.5">
            {/* Section codes */}
            <div className="flex items-center gap-2 flex-wrap">
              {section.bns_section && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11.5px] font-bold tracking-wide"
                  style={{
                    background:  'hsl(221 89% 60% / 0.12)',
                    color:       'hsl(221 89% 72%)',
                    border:      '1px solid hsl(221 89% 60% / 0.22)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {section.bns_section}
                </span>
              )}
              {section.ipc_section && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color:      'hsl(220 14% 52%)',
                    border:     '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {section.ipc_section} IPC
                </span>
              )}
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-150"
                title="Copy section"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>

            {/* Title */}
            <h3
              className="text-[16px] font-semibold text-white leading-snug tracking-tight group-hover:text-[hsl(221_89%_80%)] transition-colors duration-200"
            >
              {section.title}
            </h3>
          </div>

          {/* Confidence badge */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span
              className="text-[22px] font-bold tabular-nums leading-none"
              style={{
                background: confidenceGradient(section.confidence),
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {pct}
            </span>
            <span className="text-[9.5px] text-white/30 font-medium uppercase tracking-widest mt-0.5">%</span>
          </div>
        </div>

        {/* ── Meta row ──────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {/* Severity */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}
          >
            {sev.label.includes('Non') ? (
              <AlertOctagon className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            {sev.label}
          </div>

          {/* Cognizable */}
          {section.is_cognizable && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider"
              style={{
                background: 'hsl(238 72% 58% / 0.1)',
                color:      'hsl(238 72% 72%)',
                border:     '1px solid hsl(238 72% 58% / 0.22)',
              }}
            >
              Cognizable
            </span>
          )}

          {/* Punishment */}
          {section.punishment && (
            <span
              className="text-[11.5px] text-white/40 font-medium truncate max-w-[280px]"
              title={section.punishment}
            >
              {section.punishment.length > 60
                ? section.punishment.slice(0, 58) + '…'
                : section.punishment}
            </span>
          )}
        </div>

        {/* ── Confidence bar ────────────────────────── */}
        <div className="mb-4">
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: confidenceGradient(section.confidence) }}
            />
          </div>
        </div>

        {/* ── Expandable reasoning ──────────────────── */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200"
          style={{
            background: expanded ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
            border:     `1px solid ${expanded ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
            color:      expanded ? 'hsl(221 89% 72%)' : 'hsl(220 14% 55%)',
          }}
          onMouseEnter={e => {
            if (!expanded) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.color = 'hsl(220 14% 72%)';
            }
          }}
          onMouseLeave={e => {
            if (!expanded) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
              (e.currentTarget as HTMLElement).style.color = 'hsl(220 14% 55%)';
            }
          }}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
            View AI Reasoning
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 px-4 py-3.5 rounded-lg text-[13.5px] leading-relaxed"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'hsl(220 14% 65%)',
                }}
              >
                {section.reasoning}

                {/* Indian Kanoon link */}
                <a
                  href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(section.bns_section || section.ipc_section || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-1.5 text-[12px] font-medium w-fit transition-colors duration-150"
                  style={{ color: 'hsl(221 89% 60%)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(221 89% 72%)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(221 89% 60%)'; }}
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Indian Kanoon
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
