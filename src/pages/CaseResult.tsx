// src/pages/CaseResult.tsx — Comprehensive Case Result & Management Hub
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCaseById, updateStatus } from '@/lib/caseStorage';
import { SavedCase } from '@/types/case';
import {
  ArrowLeft, Scale, BarChart2, FileText, Navigation, Folder,
  ChevronDown, MoreHorizontal, Share2, Trash2, Check
} from 'lucide-react';
import { toast } from 'sonner';

import Overview       from '@/components/case/Overview';
import FIRGenerator   from '@/components/case/FIRGenerator';
import ActionPlan     from '@/components/case/ActionPlan';
import EvidenceTracker from '@/components/case/EvidenceTracker';

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',       icon: BarChart2   },
  { id: 'action',    label: 'Action Plan',    icon: Navigation  },
  { id: 'fir',       label: 'FIR Template',   icon: FileText    },
  { id: 'evidence',  label: 'Evidence',       icon: Folder      },
] as const;
type TabId = typeof TABS[number]['id'];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:         { label: 'New',         color: '#60A5FA', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.22)' },
  in_progress: { label: 'In Progress', color: '#FCD34D', bg: 'rgba(252,211,77,0.1)', border: 'rgba(252,211,77,0.22)' },
  filed:       { label: 'Filed',       color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.22)' },
  resolved:    { label: 'Resolved',    color: '#A3E635', bg: 'rgba(163,230,53,0.1)', border: 'rgba(163,230,53,0.22)' },
};

const CaseResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [caseData, setCaseData]   = useState<SavedCase | null>(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<TabId>('overview');
  const [statusMenu, setStatusMenu] = useState(false);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    if (!id) { navigate('/dashboard'); return; }
    getCaseById(id).then(c => {
      if (!c) { toast.error('Case not found.'); navigate('/dashboard'); return; }
      setCaseData(c);
      setLoading(false);
    });
  }, [id, navigate]);

  const refresh = useCallback((updated: SavedCase) => setCaseData(updated), []);

  const handleStatusChange = async (s: SavedCase['status']) => {
    if (!caseData) return;
    await updateStatus(caseData.id, s);
    setCaseData(prev => prev ? { ...prev, status: s } : prev);
    setStatusMenu(false);
    toast.success(`Status updated to ${STATUS_CONFIG[s].label}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); } catch { }
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(220 27% 5%)' }}>
      <div className="flex flex-col items-center gap-4">
        <svg className="w-8 h-8 animate-spin text-white/20" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-80"/>
        </svg>
        <p className="text-[13px] text-white/30">Loading case…</p>
      </div>
    </div>
  );

  if (!caseData) return null;

  const sc = STATUS_CONFIG[caseData.status];
  const sortedSections = [...caseData.analysis.sections].sort((a, b) => b.confidence - a.confidence);
  const primarySection = sortedSections[0];
  const isUrgent = caseData.analysis.sections.some(s => s.severity?.toLowerCase().includes('non-bail'));

  return (
    <div className="min-h-screen" style={{ background: 'hsl(220 27% 5%)' }}>

      {/* ── Ambient top glow ────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none z-0"
        style={{
          height: '300px',
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* ── Top header ──────────────────────────────── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(6,10,16,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Back */}
          <Link to="/dashboard">
            <button
              className="flex items-center gap-1.5 text-[12.5px] font-medium transition-colors duration-200 group"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              All Cases
            </button>
          </Link>

          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 flex-shrink-0" style={{ color: '#3B82F6' }} strokeWidth={2} />
              <span className="text-[14px] font-semibold text-white truncate">{caseData.title}</span>
            </div>
          </div>

          {/* Status dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setStatusMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200"
              style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}
            >
              {sc.label}
              <ChevronDown className="w-3 h-3 opacity-60" style={{ transform: statusMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
              {statusMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40" onClick={() => setStatusMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-44 rounded-xl z-50 overflow-hidden py-1"
                    style={{ background: 'hsl(220 22% 10%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
                  >
                    {(Object.entries(STATUS_CONFIG) as [SavedCase['status'], typeof sc][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className="w-full flex items-center justify-between px-3.5 py-2 text-[13px] font-medium transition-colors duration-100"
                        style={{ color: cfg.color }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        {cfg.label}
                        {caseData.status === key && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ color: copied ? '#10B981' : 'rgba(255,255,255,0.35)', background: copied ? 'rgba(16,185,129,0.1)' : 'transparent' }}
            onMouseEnter={e => { if (!copied) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (!copied) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">

        {/* ── Case summary bar ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, hsl(220 22% 11%) 0%, hsl(220 22% 9%) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Ambient side glow */}
          <div
            className="absolute right-0 top-0 bottom-0 pointer-events-none"
            style={{ width: '200px', background: 'radial-gradient(circle at right center, rgba(59,130,246,0.04), transparent 70%)' }}
            aria-hidden
          />

          <div className="flex flex-wrap items-start justify-between gap-6 relative">
            <div>
              {isUrgent && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold uppercase tracking-widest mb-3"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  Non-Bailable Offence — Immediate Action Required
                </div>
              )}
              <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">{caseData.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-white/35">
                <span>{caseData.caseType}</span>
                <span>·</span>
                <span>{new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {primarySection && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-white/50">
                      {primarySection.bns_section || primarySection.ipc_section}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-5 flex-shrink-0">
              <Stat label="Strength" value={`${caseData.strength}/100`} color={caseData.strength >= 75 ? '#10B981' : caseData.strength >= 50 ? '#F59E0B' : '#EF4444'} />
              <Stat label="Sections" value={`${caseData.analysis.sections.length}`} color="#60A5FA" />
              <Stat label="Evidence" value={`${caseData.evidence.length}`} color="#A78BFA" />
            </div>
          </div>
        </motion.div>

        {/* ── Tab navigation ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex gap-1 mb-8 p-1 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200"
                style={{
                  background:  active ? 'hsl(220 22% 14%)' : 'transparent',
                  color:        active ? 'white' : 'rgba(255,255,255,0.35)',
                  boxShadow:   active ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 12px rgba(0,0,0,0.3)' : 'none',
                  border:       active ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
                }}
              >
                <t.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* ── Tab content ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'overview'  && <Overview      caseData={caseData} />}
            {tab === 'action'    && <ActionPlan    caseData={caseData} />}
            {tab === 'fir'       && <FIRGenerator  caseData={caseData} onUpdate={refresh} />}
            {tab === 'evidence'  && <EvidenceTracker caseData={caseData} onUpdate={refresh} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-[24px] font-bold tracking-tight tabular-nums" style={{ color }}>{value}</span>
    <span className="text-[10.5px] text-white/30 uppercase tracking-widest mt-0.5">{label}</span>
  </div>
);

export default CaseResult;
