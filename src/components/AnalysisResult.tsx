import React, { useState, useEffect } from 'react';
import { AnalysisResponse } from '../types/legal';
import { SectionCard } from './SectionCard';
import jsPDF from 'jspdf';
import { Download, Copy, Clock, Cpu, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface Props {
  result: AnalysisResponse;
  caseText: string;
}

export const AnalysisResult: React.FC<Props> = ({ result }) => {
  const { toast } = useToast();
  const [sorted, setSorted] = useState(result.sections);

  useEffect(() => {
    setSorted([...result.sections].sort((a, b) => b.confidence - a.confidence));
  }, [result.sections]);

  const handleCopy = () => {
    const lines = [
      `Lumina Legal — Case Analysis Report`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `Executive Summary:`,
      result.summary,
      ``,
      `Applicable Legal Sections (${sorted.length}):`,
      ...sorted.map(s =>
        `  • ${s.bns_section}${s.ipc_section ? ` / ${s.ipc_section} IPC` : ''} — ${s.title} (${Math.round(s.confidence * 100)}%)\n    ${s.reasoning}`
      ),
      ``,
      `DISCLAIMER: AI-generated analysis only. Not legal advice. Consult a licensed advocate.`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    toast({ title: 'Analysis copied', description: 'Paste it into any document or email.' });
  };

  const handlePDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });

      // Header
      doc.setFillColor(8, 13, 20);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(240, 244, 250);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Lumina Legal', 14, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(110, 127, 160);
      doc.text('AI-Powered Legal Analysis Report', 14, 26);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 33);

      let y = 50;

      // Summary
      doc.setTextColor(240, 244, 250);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 14, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(110, 127, 160);
      const summaryLines = doc.splitTextToSize(result.summary, 180);
      doc.text(summaryLines, 14, y);
      y += summaryLines.length * 5 + 10;

      // Sections
      doc.setTextColor(240, 244, 250);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Identified Legal Sections (${sorted.length})`, 14, y);
      y += 8;

      sorted.forEach((s, idx) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text(`${idx + 1}. ${s.bns_section}${s.ipc_section ? ` / ${s.ipc_section} IPC` : ''} — ${s.title}`, 14, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(110, 127, 160);
        doc.text(`Confidence: ${Math.round(s.confidence * 100)}%  |  Severity: ${s.severity}  |  Cognizable: ${s.is_cognizable ? 'Yes' : 'No'}`, 14, y);
        y += 5;
        doc.text(`Punishment: ${s.punishment}`, 14, y);
        y += 5;

        doc.setTextColor(160, 174, 196);
        const reasoning = doc.splitTextToSize(s.reasoning, 180);
        doc.text(reasoning, 14, y);
        y += reasoning.length * 4.5 + 6;
      });

      // Footer
      doc.setFillColor(8, 13, 20);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setTextColor(80, 95, 120);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.text('DISCLAIMER: This report is AI-generated for informational purposes only and does not constitute legal advice. Consult a licensed advocate.', 14, 289);

      doc.save('Lumina-Legal-Analysis.pdf');
      toast({ title: 'PDF exported', description: 'Saved to your downloads folder.' });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  if (result.sections.length === 0) {
    return (
      <div
        className="mt-8 flex flex-col items-center justify-center py-16 rounded-xl"
        style={{
          background: 'hsl(220 22% 10%)',
          border: '1px solid hsl(220 20% 15%)',
        }}
      >
        <p className="text-[15px] text-white/50 font-medium">No matching sections identified.</p>
        <p className="text-[13px] text-white/30 mt-2 max-w-xs text-center">
          Try providing more specific facts including nature of the incident, parties involved, and financial impact.
        </p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full mt-10"
    >
      {/* ── Results header ───────────────────────────── */}
      <motion.div variants={item} className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-white tracking-tight">Analysis Results</h2>
          <p className="text-[13px] text-white/35 mt-1">
            {sorted.length} section{sorted.length !== 1 ? 's' : ''} identified · sorted by confidence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'white';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
            Copy
          </button>
          <button
            onClick={handlePDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'white';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
            PDF
          </button>
        </div>
      </motion.div>

      {/* ── Meta strip ────────────────────────────────── */}
      <motion.div
        variants={item}
        className="flex flex-wrap items-center gap-4 mb-6 px-4 py-3 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-white/25" strokeWidth={1.75} />
          <span className="text-[12px] text-white/35">
            Analysed by <span className="text-white/60 font-medium">{result.provider_used}</span>
          </span>
        </div>
        <div
          className="w-px h-4 hidden sm:block"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/25" strokeWidth={1.75} />
          <span className="text-[12px] text-white/35">
            Completed in{' '}
            <span className="text-white/60 font-medium tabular-nums">
              {(result.processing_time_ms / 1000).toFixed(1)}s
            </span>
          </span>
        </div>
        {result.cached && (
          <>
            <div
              className="w-px h-4 hidden sm:block"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-white/25" strokeWidth={1.75} />
              <span className="text-[12px] text-white/35">Served from cache</span>
            </div>
          </>
        )}
      </motion.div>

      {/* ── Executive summary ─────────────────────────── */}
      <motion.div
        variants={item}
        className="relative mb-6 rounded-xl px-5 py-4 overflow-hidden"
        style={{
          background: 'hsl(220 22% 10%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r"
          style={{ background: 'hsl(221 89% 60%)' }}
        />
        <p
          className="text-[10.5px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: 'hsl(221 89% 60%)' }}
        >
          Executive Summary
        </p>
        <p className="text-[14px] text-white/70 leading-relaxed">
          {result.summary}
        </p>
      </motion.div>

      {/* ── Section cards ─────────────────────────────── */}
      <motion.div variants={container} className="space-y-3">
        {sorted.map((sec, i) => (
          <motion.div key={i} variants={item}>
            <SectionCard section={sec} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Disclaimer footer ─────────────────────────── */}
      <motion.div
        variants={item}
        className="mt-10 pt-6 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-[11.5px] text-white/25 max-w-2xl mx-auto leading-relaxed">
          {result.disclaimer}{' '}
          <a
            href="http://www.barcouncilofindia.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(221 89% 65%)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
          >
            Find a licensed advocate via Bar Council of India.
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};
