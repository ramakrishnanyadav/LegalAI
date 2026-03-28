import React from 'react';
import { motion } from 'framer-motion';
import { SavedCase } from '../../types/case';
import {
  FileText, MapPin, UserCheck, Scale, Clipboard,
  Clock, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';

interface Props { caseData: SavedCase; }

const hasCognizable = (c: SavedCase) =>
  c.analysis.sections.some(s => s.is_cognizable);
const hasNonBailable = (c: SavedCase) =>
  c.analysis.sections.some(s => s.severity?.toLowerCase().includes('non-bail'));

interface Step {
  number: number;
  title: string;
  urgency: 'immediate' | 'soon' | 'when_ready';
  timeframe: string;
  description: string;
  actions: string[];
  tip?: string;
}

function buildSteps(caseData: SavedCase): Step[] {
  const cognizable   = hasCognizable(caseData);
  const nonBailable  = hasNonBailable(caseData);
  const hasEvidence  = caseData.evidence.length > 0;

  const steps: Step[] = [
    {
      number: 1,
      title: 'Secure & Preserve All Evidence',
      urgency: 'immediate',
      timeframe: 'Do this today',
      description: 'Evidence can be lost, deleted, or degraded quickly. Act immediately to preserve everything.',
      actions: [
        'Take screenshots of all digital evidence (chats, emails, websites) with timestamps visible',
        'Download and backup transaction records and bank statements',
        hasEvidence ? `You've recorded ${caseData.evidence.length} item(s) — continue adding more` : 'Start recording evidence in the Evidence tab',
        'Note names and contact details of any witnesses while memory is fresh',
        'Do NOT share or post about this incident on social media',
      ],
      tip: 'Never delete or modify any original evidence — courts rely on authentic records.',
    },
    {
      number: 2,
      title: cognizable ? 'File FIR at Police Station' : 'File a Written Complaint',
      urgency: 'immediate',
      timeframe: 'Within 24–48 hours',
      description: cognizable
        ? 'This is a cognizable offence. Police are legally bound to register your FIR immediately without requiring a magistrate order.'
        : 'This offence requires a written complaint to a magistrate. Police may refuse to register an FIR directly.',
      actions: cognizable
        ? [
            'Visit the nearest police station (preferably where the crime occurred)',
            'Use the FIR Template tab to print a pre-filled complaint',
            'Demand a Free Copy of the FIR immediately after registration — it is your legal right',
            'Note down the FIR number and SHO name',
            nonBailable ? 'Police can arrest without warrant — you can request immediate action' : 'Request written acknowledgment if police delay',
          ]
        : [
            'Draft a detailed written complaint with all facts',
            'File the complaint with the area Magistrate under Section 200 BNSS',
            'The Magistrate will direct police to investigate',
            'Retain a stamped copy of your complaint',
          ],
      tip: cognizable ? 'If police refuse to register FIR, file a complaint with SP/DSP or send it by registered post to SP.' : undefined,
    },
    {
      number: 3,
      title: 'Consult a Licensed Advocate',
      urgency: 'soon',
      timeframe: 'Within 3–5 days',
      description: 'A qualified criminal lawyer will assess your specific facts, advise on legal strategy, and ensure proper procedure is followed.',
      actions: [
        'Share the FIR copy and this analysis report with the advocate',
        'Discuss bail implications — ' + (nonBailable ? 'this is a non-bailable offence; bail requires court order' : 'accused may be granted bail by police'),
        'Understand the investigation timeline — chargesheet must be filed within 60 or 90 days',
        'Discuss compensation / damages under applicable law',
        'Explore civil remedies if financial loss is significant',
      ],
      tip: 'Legal aid is available at district legal services authorities (DLSA) if you cannot afford a private advocate.',
    },
    {
      number: 4,
      title: 'Track Investigation Progress',
      urgency: 'soon',
      timeframe: 'Ongoing — weekly',
      description: 'Police investigations can stall without follow-up. Actively monitor progress.',
      actions: [
        'Request the Case Diary (CD) number and investigating officer\'s name',
        'Follow up weekly with the IO — document every interaction in writing',
        'If progress is unsatisfactory, file a complaint with the Deputy SP or SP',
        'Your advocate can file a protest petition if police close the case',
        'Check case status on your state police portal',
      ],
    },
    {
      number: 5,
      title: 'Understanding Court Proceedings',
      urgency: 'when_ready',
      timeframe: 'After chargesheet is filed',
      description: 'If police file a chargesheet, the case moves to court. Here\'s what to expect.',
      actions: [
        'Charges are framed under the BNS section(s) identified — attend all hearings',
        'Your advocate will file arguments and examine witnesses',
        'Prosecution must prove guilt beyond reasonable doubt',
        'Trial courts: ACJM or Sessions Court depending on offence severity',
        nonBailable ? 'Accused must apply for bail in Sessions Court or High Court' : 'Bail proceedings are conducted early in the process',
      ],
    },
  ];

  return steps;
}

const URGENCY_STYLE = {
  immediate: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',  label: 'Immediate' },
  soon:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Soon' },
  when_ready:{ color: '#60A5FA', bg: 'rgba(59,130,246,0.08)',border: 'rgba(59,130,246,0.15)',label: 'Later' },
};

const STEP_ICONS = [FileText, MapPin, UserCheck, Scale, Clipboard];

const ActionPlan: React.FC<Props> = ({ caseData }) => {
  const steps = buildSteps(caseData);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-white mb-1">Your Legal Action Plan</h3>
        <p className="text-[13px] text-white/35">
          Follow these steps in order. Steps 1–2 are time-critical; delaying can weaken your case.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute top-6 bottom-6 left-[27px] w-px hidden sm:block"
          style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0.05) 100%)' }}
        />

        <div className="space-y-4">
          {steps.map((step, i) => {
            const urg  = URGENCY_STYLE[step.urgency];
            const Icon = STEP_ICONS[i] || FileText;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-5 sm:gap-6"
              >
                {/* Step indicator */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div
                    className="relative w-14 h-14 rounded-xl flex items-center justify-center z-10"
                    style={{
                      background: step.urgency === 'immediate' ? 'rgba(239,68,68,0.12)' : step.urgency === 'soon' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.08)',
                      border: `1px solid ${urg.border}`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: urg.color }} strokeWidth={1.75} />
                    <div
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: urg.color, color: step.urgency === 'soon' ? '#000' : '#fff' }}
                    >
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-xl p-5 mb-1"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <h4 className="text-[15px] font-semibold text-white leading-snug">{step.title}</h4>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ background: urg.bg, color: urg.color, border: `1px solid ${urg.border}` }}
                      >
                        {urg.label}
                      </span>
                      <div className="flex items-center gap-1 text-[11.5px] text-white/30">
                        <Clock className="w-3 h-3" />
                        {step.timeframe}
                      </div>
                    </div>
                  </div>

                  <p className="text-[13px] text-white/50 leading-relaxed mb-4">{step.description}</p>

                  <div className="space-y-2">
                    {step.actions.map((action, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: urg.color }} strokeWidth={1.75} />
                        <span className="text-[13px] text-white/65 leading-snug">{action}</span>
                      </div>
                    ))}
                  </div>

                  {step.tip && (
                    <div
                      className="mt-4 flex items-start gap-2 px-3.5 py-3 rounded-lg"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
                    >
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#60A5FA' }} />
                      <p className="text-[12px] text-white/50 leading-relaxed">{step.tip}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Resources */}
      <div
        className="mt-8 rounded-xl p-5"
        style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-white/30">Useful Resources</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'National Legal Services Authority (NLSA)', url: 'https://nalsa.gov.in' },
            { label: 'Bar Council of India — Find an Advocate', url: 'http://www.barcouncilofindia.org' },
            { label: 'Cyber Crime Reporting Portal', url: 'https://cybercrime.gov.in' },
            { label: 'Indian Kanoon — Case Law Search', url: 'https://indiankanoon.org' },
          ].map(r => (
            <a
              key={r.label}
              href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-[12.5px] font-medium rounded-lg px-3 py-2 transition-all duration-150 group"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#60A5FA'; (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              {r.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionPlan;
