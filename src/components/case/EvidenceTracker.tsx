import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SavedCase, EvidenceItem, EvidenceType } from '../../types/case';
import { addEvidence, removeEvidence } from '../../lib/caseStorage';
import { Upload, Trash2, FileText, Image, Monitor, Users, DollarSign, MessageSquare, Paperclip, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props { caseData: SavedCase; onUpdate: (c: SavedCase) => void; }

const TYPE_CONFIG: Record<EvidenceType, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  document:      { icon: FileText,      label: 'Document',      color: '#60A5FA', bg: 'rgba(59,130,246,0.1)'  },
  photo:         { icon: Image,         label: 'Photo',         color: '#34D399', bg: 'rgba(52,211,153,0.1)'  },
  screenshot:    { icon: Monitor,       label: 'Screenshot',    color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
  witness:       { icon: Users,         label: 'Witness',       color: '#FCD34D', bg: 'rgba(252,211,77,0.1)'  },
  financial:     { icon: DollarSign,    label: 'Financial',     color: '#6EE7B7', bg: 'rgba(110,231,183,0.1)' },
  communication: { icon: MessageSquare, label: 'Communication', color: '#FB923C', bg: 'rgba(251,146,60,0.1)'  },
  other:         { icon: Paperclip,     label: 'Other',         color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
};

const STRENGTH_CONFIG = {
  strong:   { color: '#10B981', label: 'Strong',   icon: CheckCircle2  },
  moderate: { color: '#F59E0B', label: 'Moderate', icon: AlertTriangle },
  weak:     { color: '#94A3B8', label: 'Weak',     icon: Paperclip     },
};

const CHECKLIST = [
  { type: 'document' as EvidenceType,      label: 'Official documents',       hint: 'ID proofs, contracts, FIR copies, court orders' },
  { type: 'financial' as EvidenceType,     label: 'Financial records',        hint: 'Bank statements, transaction receipts, invoices' },
  { type: 'communication' as EvidenceType, label: 'Communications',           hint: 'WhatsApp chats, emails, call recordings, texts' },
  { type: 'screenshot' as EvidenceType,    label: 'Digital evidence',         hint: 'Screenshots of fraud, website captures, social media' },
  { type: 'photo' as EvidenceType,         label: 'Physical evidence photos',  hint: 'Injuries, property damage, crime scene photos' },
  { type: 'witness' as EvidenceType,       label: 'Witness statements',       hint: 'Names, addresses and accounts of eyewitnesses' },
];

const EvidenceTracker: React.FC<Props> = ({ caseData, onUpdate }) => {
  const [adding, setAdding]   = useState(false);
  const [title, setTitle]     = useState('');
  const [type, setType]       = useState<EvidenceType>('document');
  const [desc, setDesc]       = useState('');
  const [strength, setStrength] = useState<EvidenceItem['strength']>('moderate');
  const [file, setFile]       = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAdd = async () => {
    if (!title.trim() || uploading) return;
    
    let uploadedUrl = '';
    
    // Cloudinary Upload
    if (file) {
      setUploading(true);
      try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          throw new Error('Cloudinary credentials missing in environment.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        // Upload to Cloudinary (auto-detects resource_type)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        uploadedUrl = data.secure_url;
      } catch (err) {
        console.error('Cloudinary Upload Error:', err);
        alert('Failed to upload evidence file. Please check Cloudinary credentials.');
        setUploading(false);
        return;
      }
    }

    const ev = await addEvidence(caseData.id, { 
      title: title.trim(), 
      type, 
      description: desc.trim(), 
      strength,
      dataUrl: uploadedUrl || undefined,
      fileName: file?.name || undefined,
    });

    if (ev) {
      onUpdate({ ...caseData, evidence: [...caseData.evidence, ev] });
      setTitle(''); setDesc(''); setFile(null); setAdding(false);
    }
    setUploading(false);
  };

  const handleRemove = async (evId: string) => {
    await removeEvidence(caseData.id, evId);
    onUpdate({ ...caseData, evidence: caseData.evidence.filter(e => e.id !== evId) });
  };

  const presentTypes = new Set(caseData.evidence.map(e => e.type));

  return (
    <div className="space-y-8">
      {/* Evidence checklist */}
      <div>
        <h3 className="text-[14px] font-semibold text-white mb-1">Evidence Checklist</h3>
        <p className="text-[12.5px] text-white/35 mb-4">Collect and record as many of these as possible to strengthen your case.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHECKLIST.map(item => {
            const cfg = TYPE_CONFIG[item.type];
            const done = presentTypes.has(item.type);
            return (
              <div
                key={item.type}
                className="flex items-start gap-3 rounded-xl px-4 py-3.5 transition-all duration-200"
                style={{
                  background: done ? `${cfg.bg}` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${done ? `${cfg.color}30` : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: done ? cfg.bg : 'rgba(255,255,255,0.04)', border: `1px solid ${done ? cfg.color + '30' : 'rgba(255,255,255,0.08)'}` }}
                >
                  <cfg.icon className="w-3.5 h-3.5" style={{ color: done ? cfg.color : 'rgba(255,255,255,0.25)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium" style={{ color: done ? 'white' : 'rgba(255,255,255,0.5)' }}>
                      {item.label}
                    </span>
                    {done && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                        Added
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-white/30 mt-0.5 leading-snug">{item.hint}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recorded evidence */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-white">
              Recorded Evidence <span className="text-white/30 font-normal text-[13px]">({caseData.evidence.length})</span>
            </h3>
          </div>
          <button
            onClick={() => { setAdding(v => !v); setFile(null); }}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all duration-200"
            style={{
              background: adding ? 'rgba(255,255,255,0.06)' : '#3B82F6',
              boxShadow: adding ? 'none' : '0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 12px rgba(59,130,246,0.3)',
              opacity: uploading ? 0.5 : 1,
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            {adding ? 'Cancel' : 'Add Evidence'}
          </button>
        </div>

        {/* Add form */}
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className="rounded-xl p-5 mb-4"
            style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Evidence Title *</label>
                <input
                  value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Bank transaction statement — March 2024"
                  className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/20 focus:outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#3B82F6' }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(59,130,246,0.4)'; }}
                  onBlur={e  => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(TYPE_CONFIG) as EvidenceType[]).map(t => {
                    const cfg = TYPE_CONFIG[t];
                    const sel = type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150"
                        style={{
                          background: sel ? cfg.bg : 'rgba(255,255,255,0.03)',
                          color:      sel ? cfg.color : 'rgba(255,255,255,0.35)',
                          border:     `1px solid ${sel ? cfg.color + '40' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strength */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Strength</label>
                <div className="flex gap-2">
                  {(Object.keys(STRENGTH_CONFIG) as Array<keyof typeof STRENGTH_CONFIG>).map(s => {
                    const cfg = STRENGTH_CONFIG[s];
                    const sel = strength === s;
                    return (
                      <button key={s} onClick={() => setStrength(s)}
                        className="flex-1 py-1.5 rounded-lg text-[11.5px] font-medium transition-all"
                        style={{
                          background: sel ? `${cfg.color}15` : 'rgba(255,255,255,0.03)',
                          color:      sel ? cfg.color : 'rgba(255,255,255,0.35)',
                          border:     `1px solid ${sel ? cfg.color + '40' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Evidence File (Optional)</label>
                <label 
                  className="flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: file ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = file ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)'; }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-5 h-5 mb-2 text-white/40" />
                    <p className="text-[12px] text-white/60 font-semibold">{file ? file.name : "Click to upload file"}</p>
                    <p className="text-[10px] text-white/30">SVG, PNG, JPG, MP4, PDF (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden"onChange={e => e.target.files && setFile(e.target.files[0])} />
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/35 mb-1.5">Description / Notes</label>
                <textarea
                  value={desc} onChange={e => setDesc(e.target.value)}
                  rows={2} placeholder="What does this evidence show? Where is it stored?"
                  className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/20 focus:outline-none resize-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#3B82F6' }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(59,130,246,0.4)'; }}
                  onBlur={e  => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!title.trim() || uploading}
              className="px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white transition-all duration-200 relative overflow-hidden"
              style={{
                background: title.trim() ? (uploading ? '#1E3A8A' : '#3B82F6') : 'rgba(255,255,255,0.06)',
                boxShadow:  title.trim() && !uploading ? '0 4px 14px rgba(59,130,246,0.35)' : 'none',
                color: title.trim() ? 'white' : 'rgba(255,255,255,0.25)',
              }}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading to Cloud...
                </span>
              ) : 'Record Evidence'}
            </button>
          </motion.div>
        )}

        {/* Evidence list */}
        {caseData.evidence.length === 0 && !adding ? (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-xl text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <Paperclip className="w-10 h-10 text-white/15 mb-3" strokeWidth={1.5} />
            <p className="text-[14px] font-medium text-white/30">No evidence recorded yet</p>
            <p className="text-[12.5px] text-white/20 mt-1 max-w-xs">
              Add documents, photos, screenshots, and witness details to build a stronger case.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {caseData.evidence.map((ev, i) => {
              const cfg = TYPE_CONFIG[ev.type];
              const scfg = STRENGTH_CONFIG[ev.strength];
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 group"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}
                  >
                    <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[13.5px] font-semibold text-white truncate">{ev.title}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${scfg.color}15`, color: scfg.color }}>
                        {scfg.label}
                      </span>
                      {ev.dataUrl && (
                        <a 
                          href={ev.dataUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 transition-colors ml-2 bg-blue-500/10 px-2 py-0.5 rounded"
                        >
                          <Monitor className="w-3 h-3" /> View Source
                        </a>
                      )}
                    </div>
                    {ev.fileName && (
                      <p className="text-[11px] text-white/40 font-mono italic truncate mt-1 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> {ev.fileName}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-[12px] text-white/35 mt-1 truncate">{ev.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-white/25 hidden sm:block">
                      {new Date(ev.addedAt).toLocaleDateString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleRemove(ev.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150"
                      style={{ color: 'rgba(239,68,68,0.6)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceTracker;
