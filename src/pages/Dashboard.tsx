// src/pages/Dashboard.tsx — Premium Case Management Dashboard
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale, Plus, ArrowRight, Folder,
  Clock, Search, ChevronRight, LogOut, Trash2,
  CheckCircle2, TrendingUp, Shield, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllCases, deleteCase } from '@/lib/caseStorage';
import { SavedCase } from '@/types/case';
import { toast } from 'sonner';

const STATUS_DEFAULT = { label: 'Unknown', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' };
const STATUS_CONFIG: Record<string, typeof STATUS_DEFAULT> = {
  new:         { label: 'New',         color: '#60A5FA', bg: 'rgba(59,130,246,0.1)'  },
  in_progress: { label: 'In Progress', color: '#FCD34D', bg: 'rgba(252,211,77,0.1)' },
  filed:       { label: 'Filed',       color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  resolved:    { label: 'Resolved',    color: '#A3E635', bg: 'rgba(163,230,53,0.1)' },
  // Legacy V1 status aliases
  active:      { label: 'Active',      color: '#60A5FA', bg: 'rgba(59,130,246,0.1)'  },
  pending:     { label: 'Pending',     color: '#FCD34D', bg: 'rgba(252,211,77,0.1)' },
  open:        { label: 'Open',        color: '#60A5FA', bg: 'rgba(59,130,246,0.1)'  },
  closed:      { label: 'Closed',      color: '#A3E635', bg: 'rgba(163,230,53,0.1)' },
};

const STRENGTH_COLOR = (s: number) =>
  s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : s >= 30 ? '#F97316' : '#EF4444';

const Dashboard = () => {
  const { user, signOut, isLawyer } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases]       = useState<SavedCase[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [sortBy, setSortBy]     = useState<'date' | 'strength'>('date');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getAllCases(user.uid)
      .then(setCases)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const filtered = useMemo(() => {
    let list = [...cases];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.caseType.toLowerCase().includes(q) ||
        (c.primarySection || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'strength') list.sort((a, b) => b.strength - a.strength);
    return list;
  }, [cases, query, sortBy]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(id);
  };

  const confirmDelete = async (id: string) => {
    await deleteCase(id);
    setCases(prev => prev.filter(c => c.id !== id));
    setDeleting(null);
    toast.success('Case deleted');
  };

  const stats = useMemo(() => ({
    total:    cases.length,
    strong:   cases.filter(c => c.strength >= 75).length,
    evidence: cases.reduce((a, c) => a + (c.evidence?.length || 0), 0),
    filed:    cases.filter(c => c.status === 'filed' || c.status === 'resolved').length,
  }), [cases]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out');
  };

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen" style={{ background: 'hsl(220 27% 5%)' }}>
      {/* ── Ambient grid bg ─────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />
      {/* Top ambient */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '800px', height: '400px', background: 'radial-gradient(ellipse at center top, rgba(59,130,246,0.06) 0%, transparent 65%)' }}
        aria-hidden
      />

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col"
        style={{
          width: '220px',
          background: 'rgba(6,10,16,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)', boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}
          >
            <Scale className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[13.5px] font-semibold text-white">Lumina</span>
            <span className="text-[13.5px] font-semibold" style={{ color: '#3B82F6' }}>Legal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
          {[
            { label: 'Cases',         icon: Folder,    href: '/dashboard',    active: true  },
            { label: 'New Analysis',  icon: Plus,      href: '/bns-analysis', active: false },
            { label: 'Profile',       icon: Shield,    href: '/profile',      active: false },
          ].map(item => (
            <Link key={item.label} to={item.href}>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
                style={{
                  background: item.active ? 'rgba(59,130,246,0.1)' : 'transparent',
                  color:      item.active ? '#93C5FD' : 'rgba(255,255,255,0.4)',
                  border:     item.active ? '1px solid rgba(59,130,246,0.18)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!item.active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; } }}
                onMouseLeave={e => { if (!item.active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; } }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="px-2.5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-2"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
              style={{ background: '#3B82F6' }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[10.5px] text-white/30">Free Plan</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12.5px] text-white/35 hover:text-red-400 transition-all duration-150"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content (offset by sidebar) ─────────── */}
      <main className="ml-[220px] min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* ── Page header ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start justify-between gap-4 mb-10"
          >
            <div>
              <h1 className="text-[28px] font-bold text-white tracking-tight">Case Dashboard</h1>
              <p className="text-[13.5px] text-white/35 mt-1">
                {cases.length === 0 ? 'No cases yet — start your first analysis.' : `${cases.length} case${cases.length !== 1 ? 's' : ''} on record`}
              </p>
            </div>
            <Link to="/bns-analysis">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-200"
                style={{
                  background: '#3B82F6',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 14px rgba(59,130,246,0.35)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(255,255,255,0.2) inset, 0 8px 20px rgba(59,130,246,0.45)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 14px rgba(59,130,246,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New Analysis
              </button>
            </Link>
          </motion.div>

          {/* ── Stats row ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Cases',    value: stats.total,    icon: Folder,       color: '#60A5FA' },
              { label: 'Strong Cases',   value: stats.strong,   icon: TrendingUp,   color: '#10B981' },
              { label: 'Evidence Items', value: stats.evidence, icon: Shield,       color: '#A78BFA' },
              { label: 'Filed / Resolved', value: stats.filed, icon: CheckCircle2, color: '#34D399' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.3 }}
                className="rounded-xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} strokeWidth={1.75} />
                  <span className="text-[10.5px] font-medium text-white/30 uppercase tracking-widest">{s.label}</span>
                </div>
                <span className="text-[28px] font-bold tabular-nums tracking-tight" style={{ color: s.color }}>{s.value}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Search & sort ────────────────────────── */}
          {cases.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-3 mb-5"
            >
              <div
                className="flex-1 flex items-center gap-2.5 rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Search className="w-4 h-4 text-white/25 flex-shrink-0" />
                <input
                  value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search by case title, type or section…"
                  className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-white/20 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-white/25 hover:text-white/60 transition-colors duration-150">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div
                className="flex gap-0.5 p-1 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {(['date', 'strength'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all duration-150"
                    style={{
                      background: sortBy === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color:      sortBy === s ? 'white' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Case list ────────────────────────────── */}
          {cases.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-[14px] text-white/30">No cases match "{query}"</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
              className="grid grid-cols-1 gap-3"
            >
              {filtered.map(c => (
                <CaseCard
                  key={c.id}
                  caseData={c}
                  onDelete={(id, e) => handleDelete(id, e)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {deleting && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setDeleting(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6"
                style={{ background: 'hsl(220 22% 10%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}
              >
                <h3 className="text-[16px] font-semibold text-white mb-2">Delete Case?</h3>
                <p className="text-[13px] text-white/45 mb-6">This will permanently remove the case, all evidence, and FIR data. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleting(null)}
                    className="flex-1 py-2.5 rounded-xl text-[13.5px] font-medium text-white/60 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >Cancel</button>
                  <button
                    onClick={() => confirmDelete(deleting)}
                    className="flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all"
                    style={{ background: 'rgba(239,68,68,0.8)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
                  >Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const CaseCard = ({
  caseData, onDelete,
}: { caseData: SavedCase; onDelete: (id: string, e: React.MouseEvent) => void }) => {
  const sc = STATUS_CONFIG[caseData.status] ?? STATUS_DEFAULT;
  const strengthColor = STRENGTH_COLOR(caseData.strength ?? 0);
  const nonBailable = caseData.analysis?.sections?.some(s => s.severity?.toLowerCase().includes('non-bail')) || false;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      <Link to={`/case/${caseData.id}`}>
        <div
          className="group flex items-center justify-between gap-5 rounded-xl px-5 py-4 transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.038)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          {/* Strength bar (left) */}
          <div
            className="w-1 rounded-full flex-shrink-0 self-stretch"
            style={{ background: strengthColor, minHeight: '36px', opacity: 0.7 }}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h3 className="text-[14.5px] font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors duration-200 truncate">
                {caseData.title}
              </h3>
              {nonBailable && (
                <span
                  className="flex-shrink-0 text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  Non-Bailable
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-[12px] text-white/30">
              <span className="font-mono text-white/45 text-[11px]">
                {caseData.primarySection || caseData.caseType}
              </span>
              <span>·</span>
              <span>{caseData.analysis?.sections?.length || 0} section{(caseData.analysis?.sections?.length || 0) !== 1 ? 's' : ''}</span>
              {(caseData.evidence?.length || 0) > 0 && (
                <>
                  <span>·</span>
                  <span>{caseData.evidence?.length || 0} evidence item{(caseData.evidence?.length || 0) !== 1 ? 's' : ''}</span>
                </>
              )}
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Strength */}
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-[20px] font-bold tabular-nums" style={{ color: strengthColor }}>
                {caseData.strength}
              </span>
              <span className="text-[9.5px] text-white/25 uppercase tracking-widest">strength</span>
            </div>

            {/* Status */}
            <span
              className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: sc.bg, color: sc.color }}
            >
              {sc.label}
            </span>

            {/* Delete (hover reveal) */}
            <button
              onClick={e => onDelete(caseData.id, e)}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ color: 'rgba(239,68,68,0.5)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#EF4444'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.5)'; }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors duration-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
      style={{
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <Scale className="w-9 h-9" style={{ color: 'rgba(59,130,246,0.5)' }} strokeWidth={1.5} />
    </div>
    <h2 className="text-[20px] font-bold text-white mb-2">No cases yet</h2>
    <p className="text-[13.5px] text-white/35 mb-8 max-w-sm leading-relaxed">
      Start your first legal analysis. Every case is saved here with FIR templates, action plan, and evidence tracking.
    </p>
    <Link to="/bns-analysis">
      <button
        className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all duration-200"
        style={{
          background: '#3B82F6',
          boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 6px 20px rgba(59,130,246,0.4)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
      >
        Begin First Analysis
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </Link>
  </motion.div>
);

export default Dashboard;