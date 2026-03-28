import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedCase } from '../types/case';
import { AnalysisSection } from '../types/legal';
import {
  TrendingUp, AlertTriangle, CheckCircle, Info,
  Scale, Gavel, Shield, ChevronRight, ChevronDown
} from 'lucide-react';

interface Props { caseData: SavedCase; }

const strengthLabel = (s: number) => {
  if (s >= 75) return { text: 'Strong Case',    color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' };
  if (s >= 50) return { text: 'Moderate Case',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' };
  if (s >= 30) return { text: 'Developing Case',color: '#F97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)' };
  return        { text: 'Needs Support',        color: '#EF4444', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.2)' };
};

const sectionColor = (confidence: number) => {
  if (confidence >= 0.80) return { bar: '#10B981', text: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' };
  if (confidence >= 0.55) return { bar: '#F59E0B', text: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)' };
  return                         { bar: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)' };
};

const SectionRow: React.FC<{ section: AnalysisSection; index: number }> = ({ section, index }) => {
  const [open, setOpen] = useState(false);
  const pct = Math.round(section.confidence * 100);
  const col = sectionColor(section.confidence);
  const isNonBail = section.severity?.toLowerCase().includes('non-bail');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${col.border}`, background: col.bg }}
    >
      <div className="px-5 py-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Section codes */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {section.bns_section && (
                <span
                  className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider font-mono"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.25)' }}
                >
                  BNS {section.bns_section}
                </span>
              )}
              {section.ipc_section && (
                <span
                  className="px-2 py-0.5 rounded text-[10.5px] font-medium font-mono"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {section.ipc_section} IPC
                </span>
              )}
              <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: isNonBail ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  color:      isNonBail ? '#FCA5A5' : '#6EE7B7',
                  border:     `1px solid ${isNonBail ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}
              >
                {isNonBail ? 'Non-Bailable' : 'Bailable'}
              </span>
              {section.is_cognizable && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  Cognizable
                </span>
              )}
            </div>
            {/* Title */}
            <h4 className="text-[15px] font-semibold text-white leading-snug">{section.title}</h4>
            {/* Punishment */}
            {section.punishment && (
              <p className="text-[12px] text-white/40 mt-1 font-mono truncate">{section.punishment}</p>
            )}
          </div>

          {/* Confidence ring */}
          <div className="flex-shrink-0 flex flex-col items-center" style={{ minWidth: '56px' }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
              <circle
                cx="26" cy="26" r="22"
                fill="none" stroke={col.bar} strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - section.confidence)}`}
                strokeLinecap="round"
                transform="rotate(-90 26 26)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
              <text x="26" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill={col.text} fontFamily="JetBrains Mono, monospace">
                {pct}%
              </text>
            </svg>
            <span className="text-[9.5px] text-white/25 mt-1 uppercase tracking-wider">Match</span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="mt-3 flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-150"
          style={{ color: open ? col.text : 'rgba(255,255,255,0.3)' }}
        >
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          Legal Analysis
        </button>
      </div>

      {/* Expanded reasoning */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-5 py-4 text-[13.5px] leading-relaxed"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
            >
              {section.reasoning}
              <a
                href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(section.bns_section || section.ipc_section || '')}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1.5 text-[12px] font-medium w-fit"
                style={{ color: '#60A5FA' }}
              >
                <Gavel className="w-3 h-3" />
                Read full statute on Indian Kanoon
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Overview: React.FC<Props> = ({ caseData }) => {
  const strength = caseData.strength;
  const label = strengthLabel(strength);
  const sorted = [...(caseData.analysis.sections || [])].sort((a, b) => b.confidence - a.confidence);

  const keyFactors = [
    {
      positive: true,
      icon: CheckCircle,
      text: `${sorted.filter(s => s.confidence >= 0.8).length} high-confidence section${sorted.filter(s => s.confidence >= 0.8).length !== 1 ? 's' : ''} matched`,
    },
    {
      positive: sorted.some(s => s.is_cognizable),
      icon: sorted.some(s => s.is_cognizable) ? CheckCircle : Info,
      text: sorted.some(s => s.is_cognizable) ? 'Cognizable offence — Police must register FIR' : 'Non-cognizable — Magistrate complaint may be needed',
    },
    {
      positive: caseData.evidence.length > 0,
      icon: caseData.evidence.length > 0 ? CheckCircle : AlertTriangle,
      text: caseData.evidence.length > 0
        ? `${caseData.evidence.length} piece${caseData.evidence.length !== 1 ? 's' : ''} of evidence recorded`
        : 'No evidence added yet — strengthens case',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Strength card */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${label.border}` }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: label.color }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: label.color }}>
                Case Strength Assessment
              </span>
            </div>
            <h3 className="text-[24px] font-bold text-white tracking-tight">{label.text}</h3>
            <p className="text-[13px] text-white/40 mt-1">
              Based on {sorted.length} matched legal section{sorted.length !== 1 ? 's' : ''} and confidence scores
            </p>
          </div>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
              <motion.circle
                cx="50" cy="50" r="40"
                fill="none" stroke={label.color} strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: '251', strokeDashoffset: '251' }}
                animate={{ strokeDashoffset: `${251 * (1 - strength / 100)}` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-bold leading-none" style={{ color: label.color }}>{strength}</span>
              <span className="text-[10px] text-white/30 mt-0.5">/ 100</span>
            </div>
          </div>
        </div>

        {/* Factors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {keyFactors.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <f.icon
                className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                style={{ color: f.positive ? '#10B981' : '#F59E0B' }}
              />
              <span className="text-[12px] text-white/55 leading-snug">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-xl px-5 py-4"
        style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#60A5FA' }}>Legal Summary</span>
        </div>
        <p className="text-[14px] text-white/65 leading-relaxed">{caseData.analysis.summary}</p>
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-white">Applicable Legal Sections</h3>
          <span className="text-[12px] text-white/30">{sorted.length} section{sorted.length !== 1 ? 's' : ''} · sorted by relevance</span>
        </div>
        <div className="space-y-3">
          {sorted.map((s, i) => <SectionRow key={i} section={s} index={i} />)}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-white/20" />
        <p className="text-[12px] text-white/30 leading-relaxed">
          This analysis is AI-generated for informational purposes. It does not constitute legal advice.
          Case strength scores are indicative only. Consult a licensed advocate before taking any legal action.
        </p>
      </div>
    </div>
  );
};

export default Overview;
