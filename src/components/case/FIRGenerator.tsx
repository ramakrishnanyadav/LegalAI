import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SavedCase, FIRFormData } from '../../types/case';
import { saveFIRData } from '../../lib/caseStorage';
import { Printer, Save, AlertCircle, ChevronRight, Languages } from 'lucide-react';
import jsPDF from 'jspdf';

const TRANSLATIONS = {
  en: {
    title: "FIRST INFORMATION REPORT",
    subtitle: "[Under Section 173 Bharatiya Nagarik Suraksha Sanhita, 2023]",
    firNo: "FIR No.:",
    date: "Date:",
    ps: "Police Station:",
    district: "District:",
    state: "State:",
    compDetails: "1. Complainant Details",
    name: "Name:",
    age: "Age:",
    address: "Address:",
    phone: "Phone:",
    incDetails: "2. Incident Details",
    dateOfInc: "Date of Incident:",
    time: "Time:",
    place: "Place:",
    accused: "3. Accused Person(s)",
    accName: "Name:",
    accDesc: "Address/Description:",
    offences: "4. Applicable Offences (Identified via Legal AI)",
    facts: "5. Facts of the Case",
    propLost: "6. Property / Amount Lost",
    amt: "Estimated Amount:",
    witnesses: "7. Witness(es)",
    prayer: "Prayer",
    prayerText: "I, the above-named complainant, request you to register this First Information Report and take appropriate legal action against the accused person(s).",
    compSig: "Complainant's Signature",
    sho: "Station House Officer\nRank & Name:",
  },
  hi: {
    title: "प्रथम सूचना रिपोर्ट (FIR)",
    subtitle: "[धारा 173 भारतीय नागरिक सुरक्षा संहिता, 2023 के अंतर्गत]",
    firNo: "प्राथमिकी सं.:",
    date: "दिनांक:",
    ps: "पुलिस स्टेशन:",
    district: "जिला:",
    state: "राज्य:",
    compDetails: "1. शिकायतकर्ता का विवरण",
    name: "नाम:",
    age: "उम्र:",
    address: "पता:",
    phone: "फोन:",
    incDetails: "2. घटना का विवरण",
    dateOfInc: "घटना की तिथि:",
    time: "समय:",
    place: "स्थान:",
    accused: "3. आरोपी व्यक्ति",
    accName: "नाम:",
    accDesc: "पता/विवरण:",
    offences: "4. लागू अपराध (विधिक AI द्वारा पहचाने गए)",
    facts: "5. मामले के तथ्य",
    propLost: "6. संपत्ति / राशि का नुकसान",
    amt: "अनुमानित राशि:",
    witnesses: "7. गवाह",
    prayer: "प्रार्थना",
    prayerText: "मैं, उपरोक्त शिकायतकर्ता, आपसे अनुरोध करता हूँ कि इस प्रथम सूचना रिपोर्ट को दर्ज करें और आरोपी व्यक्ति(यों) के खिलाफ उचित कानूनी कार्रवाई करें।",
    compSig: "शिकायतकर्ता के हस्ताक्षर",
    sho: "थाना प्रभारी\nपद और नाम:",
  }
};

interface Props { caseData: SavedCase; onUpdate: (c: SavedCase) => void; }

const FIELD = ({
  label, id, value, onChange, type = 'text', placeholder = '', required = false,
  half = false,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; half?: boolean;
}) => (
  <div className={half ? 'col-span-1' : 'col-span-2'}>
    <label htmlFor={id} className="block text-[11.5px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
      {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
    <input
      id={id} type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-200"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.08)',
        caretColor: '#3B82F6',
      }}
      onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(59,130,246,0.4)'; }}
      onBlur={e  => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
    />
  </div>
);

const TEXTAREA = ({
  label, id, value, onChange, rows = 3, placeholder = '',
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string;
}) => (
  <div className="col-span-2">
    <label htmlFor={id} className="block text-[11.5px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <textarea
      id={id} rows={rows} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/20 focus:outline-none transition-all duration-200 resize-y"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#3B82F6' }}
      onFocus={e => { (e.target as HTMLElement).style.borderColor = 'rgba(59,130,246,0.4)'; }}
      onBlur={e  => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
    />
  </div>
);

const FIRGenerator: React.FC<Props> = ({ caseData, onUpdate }) => {
  const empty: FIRFormData = {
    complainantName: '', complainantAge: '', complainantAddress: '',
    complainantPhone: '', incidentDate: '', incidentTime: '',
    incidentPlace: '', accusedName: '', accusedAddress: '',
    accusedDescription: '', witnessName: '', witnessAddress: '',
    propertyLost: '', amountLost: '',
    additionalFacts: caseData.caseText.slice(0, 800),
    policeStation: '', district: '', state: '',
  };

  const [form, setForm] = useState<FIRFormData>({ ...empty, ...(caseData.firData || {}) } as FIRFormData);
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const printRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof FIRFormData) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const handleSave = async () => {
    await saveFIRData(caseData.id, form);
    onUpdate({ ...caseData, firData: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getFIRHtml = () => {
    const t = TRANSLATIONS[lang];
    const sections = caseData.analysis.sections
      .sort((a, b) => b.confidence - a.confidence)
      .map(s => `${s.bns_section || ''}${s.ipc_section ? ` / ${s.ipc_section} IPC` : ''} — ${s.title}`)
      .join('<br/><br/>');

    return `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #000; background: #fff; line-height: 1.6;">
        <h1 style="text-align: center; font-size: 24px; text-decoration: underline; margin-bottom: 8px;">${t.title}</h1>
        <h2 style="text-align: center; font-size: 16px; font-weight: normal; margin-top: 0;">${t.subtitle}</h2>
        
        <div style="text-align: right; margin-top: 20px; margin-bottom: 30px; font-size: 14px;">
          <strong>${t.firNo}</strong> ________________<br/>
          <strong>${t.date}</strong> ${new Date().toLocaleDateString('en-IN')}<br/>
          <strong>${t.ps}</strong> ${form.policeStation || '____________________'}<br/>
          <strong>${t.district}</strong> ${form.district || '____________________'} | <strong>${t.state}</strong> ${form.state || '____________________'}
        </div>

        <h3 style="font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t.compDetails}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="width: 15%; padding: 5px 0;"><strong>${t.name}</strong></td>
            <td style="width: 35%;">${form.complainantName || ''}</td>
            <td style="width: 15%; padding: 5px 0;"><strong>${t.age}</strong></td>
            <td style="width: 35%;">${form.complainantAge || ''}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${t.address}</strong></td>
            <td colspan="3">${form.complainantAddress || ''}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${t.phone}</strong></td>
            <td colspan="3">${form.complainantPhone || ''}</td>
          </tr>
        </table>

        <h3 style="font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t.incDetails}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="width: 25%; padding: 5px 0;"><strong>${t.dateOfInc}</strong></td>
            <td style="width: 25%;">${form.incidentDate ? new Date(form.incidentDate).toLocaleDateString('en-IN') : ''}</td>
            <td style="width: 15%; padding: 5px 0;"><strong>${t.time}</strong></td>
            <td style="width: 35%;">${form.incidentTime || ''}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>${t.place}</strong></td>
            <td colspan="3">${form.incidentPlace || ''}</td>
          </tr>
        </table>

        <h3 style="font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px;">${t.accused}</h3>
        <p style="font-size: 14px; margin-top: 5px;"><strong>${t.accName}</strong> ${form.accusedName || 'Unknown'}</p>
        <p style="font-size: 14px;"><strong>${t.accDesc}</strong> ${form.accusedDescription}</p>

        <h3 style="font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 30px;">${t.offences}</h3>
        <p style="font-size: 14px; font-family: 'Courier New', monospace;">${sections}</p>

        <h3 style="font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 30px;">${t.facts}</h3>
        <div style="font-size: 14px; margin-top: 10px; border: 1px solid #ccc; padding: 15px; min-height: 100px; white-space: pre-wrap;">${form.additionalFacts || caseData.caseText}</div>

        ${form.propertyLost || form.amountLost ? `
        <h3 style="font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 30px;">${t.propLost}</h3>
        <p style="font-size: 14px; margin-top: 5px;">${form.propertyLost}</p>
        ${form.amountLost ? `<p style="font-size: 14px;"><strong>${t.amt}</strong> Rs. ${form.amountLost}</p>` : ''}
        ` : ''}

        ${form.witnessName ? `
        <h3 style="font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 30px;">${t.witnesses}</h3>
        <p style="font-size: 14px; margin-top: 5px;"><strong>${t.name}</strong> ${form.witnessName}</p>
        <p style="font-size: 14px;"><strong>${t.address}</strong> ${form.witnessAddress}</p>
        ` : ''}

        <h3 style="font-size: 16px; border-bottom: 1px solid #000; margin-top: 40px;">${t.prayer}</h3>
        <p style="font-size: 14px;">${t.prayerText}</p>

        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
          <div style="text-align: center; font-size: 14px; width: 40%; border-top: 1px solid #000; padding-top: 10px;">
            ${t.compSig}<br/><br/>${form.complainantName || ''}
          </div>
          <div style="text-align: center; font-size: 14px; width: 40%; border-top: 1px solid #000; padding-top: 10px;">
            ${t.sho}
          </div>
        </div>
      </div>
    `;
  };

  const handleDownloadPDF = async () => {
    try {
      if (!printRef.current) return;
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Lumina_FIR_${caseData.id.slice(-6)}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Make sure all content is resolved.');
    }
  };

  const handleDownloadWord = async () => {
    try {
      const { saveAs } = await import('file-saver');
      const html = getFIRHtml();
      const docHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>FIR Document</title></head><body>${html}</body></html>`;
      const blob = new Blob(['\ufeff', docHTML], { type: 'application/msword' });
      saveAs(blob, `Lumina_FIR_${caseData.id.slice(-6)}.doc`);
    } catch (err) {
      console.error('Word Generation Error:', err);
    }
  };

  const isReady = form.complainantName && form.incidentDate && form.incidentPlace;

  return (
    <div>
      {/* Alert */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-start gap-3 p-4 rounded-xl mb-6"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
      >
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
        <div>
          <p className="text-[13px] font-semibold" style={{ color: '#FCD34D' }}>Complete All Fields Before Printing</p>
          <p className="text-[12px] text-white/45 mt-0.5">
            Fill in your details below. The identified legal sections are pre-filled from the analysis.
            Submit the printed FIR at your nearest police station.
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <div className="space-y-8">
        {/* Section 1: Police station */}
        <Section title="Police Station Details">
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Station Name" id="ps" value={form.policeStation} onChange={set('policeStation')} placeholder="e.g. Koramangala PS" required half />
            <FIELD label="District" id="dist" value={form.district} onChange={set('district')} placeholder="e.g. Bengaluru Urban" half />
            <FIELD label="State" id="state" value={form.state} onChange={set('state')} placeholder="e.g. Karnataka" half />
          </div>
        </Section>

        {/* Section 2: Complainant */}
        <Section title="Complainant Information">
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Full Name" id="cname" value={form.complainantName} onChange={set('complainantName')} required half />
            <FIELD label="Age" id="cage" value={form.complainantAge} onChange={set('complainantAge')} type="number" half />
            <TEXTAREA label="Residential Address" id="caddr" value={form.complainantAddress} onChange={set('complainantAddress')} rows={2} />
            <FIELD label="Phone Number" id="cphone" value={form.complainantPhone} onChange={set('complainantPhone')} type="tel" placeholder="+91 98765 43210" half />
          </div>
        </Section>

        {/* Section 3: Incident */}
        <Section title="Incident Details">
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Date of Incident" id="idate" value={form.incidentDate} onChange={set('incidentDate')} type="date" required half />
            <FIELD label="Approximate Time" id="itime" value={form.incidentTime} onChange={set('incidentTime')} type="time" half />
            <TEXTAREA label="Place / Location" id="iplace" value={form.incidentPlace} onChange={set('incidentPlace')} rows={2} placeholder="Specific address where incident occurred" />
          </div>
        </Section>

        {/* Section 4: Accused */}
        <Section title="Accused Person(s)">
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Name (if known)" id="aname" value={form.accusedName} onChange={set('accusedName')} placeholder="Unknown if not identified" half />
            <TEXTAREA label="Address / Description" id="adesc" value={form.accusedDescription} onChange={set('accusedDescription')} rows={2} placeholder="Physical description, known whereabouts..." />
          </div>
        </Section>

        {/* Section 5: Facts */}
        <Section title="Statement of Facts">
          <div className="grid grid-cols-2 gap-4">
            <TEXTAREA label="Detailed Incident Description" id="facts" value={form.additionalFacts} onChange={set('additionalFacts')} rows={5} placeholder="Describe the sequence of events in chronological order..." />
          </div>
        </Section>

        {/* Section 6: Loss */}
        <Section title="Property / Financial Loss">
          <div className="grid grid-cols-2 gap-4">
            <TEXTAREA label="Property Lost or Damaged" id="prop" value={form.propertyLost} onChange={set('propertyLost')} rows={2} placeholder="Description of stolen/damaged items..." />
            <FIELD label="Estimated Amount (₹)" id="amt" value={form.amountLost} onChange={set('amountLost')} type="number" placeholder="0.00" half />
          </div>
        </Section>

        {/* Section 7: Witnesses */}
        <Section title="Witnesses (Optional)">
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Witness Name(s)" id="wname" value={form.witnessName} onChange={set('witnessName')} placeholder="Name of witness" half />
            <FIELD label="Witness Address" id="waddr" value={form.witnessAddress} onChange={set('witnessAddress')} placeholder="Contact or residential address" half />
          </div>
        </Section>
      </div>

      {/* AI-identified sections (read-only display) */}
      <div
        className="mt-8 rounded-xl p-5"
        style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#60A5FA' }}>
          Applicable Sections (auto-filled from analysis)
        </p>
        <div className="space-y-1.5">
          {caseData.analysis.sections.sort((a, b) => b.confidence - a.confidence).map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/50 font-mono">
              <ChevronRight className="w-3 h-3 flex-shrink-0 text-white/25" />
              <span className="text-white/70">{s.bns_section || s.ipc_section}</span>
              <span className="text-white/30">—</span>
              <span>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200"
          style={{
            background: saved ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${saved ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: saved ? '#6EE7B7' : 'rgba(255,255,255,0.55)',
          }}
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? 'Saved' : 'Save Draft'}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadWord}
            disabled={!isReady}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all duration-200"
            style={{
              background: isReady ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isReady ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.05)'}`,
              color: isReady ? '#60A5FA' : 'rgba(255,255,255,0.2)',
              cursor: isReady ? 'pointer' : 'not-allowed',
            }}
          >
            Download Word
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={!isReady}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold text-white transition-all duration-200"
            style={{
              background: isReady ? '#3B82F6' : 'rgba(255,255,255,0.06)',
              boxShadow: isReady ? '0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 14px rgba(59,130,246,0.35)' : 'none',
              color: isReady ? 'white' : 'rgba(255,255,255,0.2)',
              cursor: isReady ? 'pointer' : 'not-allowed',
            }}
          >
            <Printer className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Hidden Print Container for PDF Generation */}
      <div style={{ overflow: 'hidden', height: 0, width: 0, pointerEvents: 'none', position: 'absolute', top: -9999 }}>
         <div ref={printRef} style={{ width: '800px', background: 'white' }} dangerouslySetInnerHTML={{ __html: getFIRHtml() }} />
      </div>

      {/* Live Preview Screen */}
      <div className="mt-12 rounded-xl overflow-hidden border border-white/10" style={{ background: '#0F172A' }}>
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 className="text-[12px] font-bold text-white/50 tracking-widest uppercase">Live Document Preview</h4>
          <button
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 text-[12px] font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === 'en' ? 'SWITCH TO HINDI (हिन्दी)' : 'SWITCH TO ENGLISH'}
          </button>
        </div>
        <div className="p-8 max-h-[600px] overflow-y-auto">
           {/* Scaled down preview wrapper */}
           <div 
             className="mx-auto origin-top" 
             style={{ width: '800px', transform: 'scale(0.85)', transformOrigin: 'top center', background: 'white', border: '1px solid #ccc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
             dangerouslySetInnerHTML={{ __html: getFIRHtml() }} 
            />
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <div style={{ height: '1px', width: '20px', background: 'rgba(59,130,246,0.5)' }} />
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/35">{title}</h4>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
    </div>
    {children}
  </div>
);

export default FIRGenerator;
