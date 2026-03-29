import {
  collection, addDoc, getDocs, getDoc, doc,
  deleteDoc, query, where, orderBy, updateDoc,
  Timestamp, setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { AnalysisResponse, AnalysisSection } from '../types/legal';
import { SavedCase, EvidenceItem, FIRFormData } from '../types/case';

const COL = 'cases';

// ── Strength scoring ─────────────────────────────────────────────────────────
export function computeStrength(analysis: AnalysisResponse): number {
  const { sections } = analysis;
  if (!sections.length) return 0;
  const weighted = sections.reduce((acc, s) => {
    const w = s.is_cognizable ? 1.2 : 1.0;
    return acc + s.confidence * w;
  }, 0) / sections.length;
  const nonBailable = sections.filter(s =>
    s.severity?.toLowerCase().includes('non-bail')
  ).length;
  return Math.min(Math.round(weighted * 100 + Math.min(nonBailable * 5, 15)), 95);
}

// ── Auto-detect case type ────────────────────────────────────────────────────
function detectCaseType(sections: AnalysisSection[]): string {
  const titles = sections.map(s => s.title.toLowerCase()).join(' ');
  if (titles.match(/cyber|fraud|cheat|identity|hack|phish|online/)) return 'Cyber Fraud';
  if (titles.match(/assault|hurt|violence|rape|molestation|dowry/))  return 'Violence';
  if (titles.match(/theft|robbery|dacoity|extort|ransom/))            return 'Property Crime';
  if (titles.match(/murder|culpable|homicide/))                        return 'Violent Crime';
  if (titles.match(/defamat|slander|libel/))                           return 'Defamation';
  if (titles.match(/document|forgery|falsif|impersonation/))           return 'Forgery';
  if (titles.match(/brib|corrup|official/))                            return 'Corruption';
  if (titles.match(/contract|breach|trust|criminal misapp/))           return 'Criminal Breach';
  return 'Legal Matter';
}

function generateTitle(sections: AnalysisSection[], caseType: string, id: string): string {
  const primary = sections.find(s => s.confidence >= 0.8);
  if (primary) return `${caseType} — ${primary.bns_section || primary.ipc_section}`;
  return `${caseType} Case #${id.slice(-6).toUpperCase()}`;
}

// ── CREATE ───────────────────────────────────────────────────────────────────
export async function createCase(
  userId: string,
  userName: string,
  caseText: string,
  analysis: AnalysisResponse
): Promise<SavedCase> {
  const now       = new Date().toISOString();
  const strength  = computeStrength(analysis);
  const sorted    = [...analysis.sections].sort((a, b) => b.confidence - a.confidence);
  const caseType  = detectCaseType(sorted);
  const primarySection = sorted[0]?.bns_section || sorted[0]?.ipc_section;

  // Build the document (Firestore will assign ID via addDoc)
  const payload = {
    userId,
    userName,
    createdAt:  now,
    updatedAt:  now,
    title:      '', // filled after we get the ID
    caseType,
    caseText,
    analysis,
    strength,
    status:     'new' as const,
    evidence:   [] as EvidenceItem[],
    primarySection,
    tags:       [] as string[],
    firData:    null,
  };

  const docRef = await addDoc(collection(db, COL), payload);
  const title  = generateTitle(sorted, caseType, docRef.id);

  // Patch the title now that we have the real ID
  await updateDoc(docRef, { title });

  const saved: SavedCase = {
    id:     docRef.id,
    title,
    ...payload,
    firData: undefined,
  };
  return saved;
}

// ── Schema Normalizer ────────────────────────────────────────────────────────
// Handles mixed Firestore documents written by both caseStorage.ts (analysis/evidence)
// and storage.ts (analysisResults/evidenceFiles) — maps everything to SavedCase shape.
function normalizeCase(id: string, data: Record<string, any>): SavedCase {
  // Map analysisResults → analysis (new Analyze.tsx schema)
  if (!data.analysis && data.analysisResults) {
    const ar = data.analysisResults;
    data.analysis = {
      sections: (ar.sections || []).map((s: any) => ({
        ipc_section: s.code || s.ipc_section || 'N/A',
        bns_section: s.code || s.bns_section || 'N/A',
        title:       s.name || s.title || 'Unknown',
        confidence:  (s.confidence || 70) > 1 ? (s.confidence || 70) / 100 : (s.confidence || 70),
        reasoning:   s.reasoning || s.description || '',
        severity:    s.bailable === false ? 'non-bailable' : 'bailable',
        is_cognizable: s.cognizable ?? false,
        punishment:  s.punishment || '',
      })),
      summary:             ar.summary || ar.explanation || '',
      provider_used:       ar.provider_used || 'gemini',
      analysis_id:         ar.analysis_id || id,
      cached:              ar.cached ?? false,
      processing_time_ms:  ar.processing_time_ms || 0,
      disclaimer:          ar.disclaimer || 'AI-generated analysis. Consult a qualified lawyer.',
    };
  }

  // Map evidenceFiles → evidence (new schema)
  if (!data.evidence && data.evidenceFiles) {
    data.evidence = (data.evidenceFiles || []).map((f: any) => ({
      id:          f.id || `ev_${Date.now()}`,
      title:       f.fileName || 'Evidence File',
      type:        'document' as const,
      description: f.fileName || '',
      addedAt:     f.uploadedAt || new Date().toISOString(),
      strength:    'moderate' as const,
    }));
  }

  // Guarantee safe defaults so UI never receives undefined
  if (!data.analysis) {
    data.analysis = { sections: [], summary: '', provider_used: '', analysis_id: id, cached: false, processing_time_ms: 0, disclaimer: '' };
  }
  data.analysis.sections = data.analysis.sections || [];
  data.evidence  = data.evidence  || [];
  data.tags      = data.tags      || [];
  data.strength  = data.strength  ?? 0;
  data.status    = data.status    || 'new';
  data.title     = data.title     || data.caseType || 'Untitled Case';
  data.caseText  = data.caseText  || data.description || '';
  data.createdAt = data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? new Date().toISOString();
  data.updatedAt = data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? data.createdAt;

  return { id, ...data } as SavedCase;
}

// ── READ ALL (for current user) ───────────────────────────────────────────────
export async function getAllCases(userId: string): Promise<SavedCase[]> {
  try {
    const q = query(
      collection(db, COL),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeCase(d.id, d.data() as Record<string, any>));
  } catch {
    return [];
  }
}

// ── READ ONE ─────────────────────────────────────────────────────────────────
export async function getCaseById(id: string): Promise<SavedCase | null> {
  try {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return normalizeCase(snap.id, snap.data() as Record<string, any>);
  } catch {
    return null;
  }
}

// ── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateCase(id: string, updates: Partial<SavedCase>): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteCase(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

// ── EVIDENCE ─────────────────────────────────────────────────────────────────
export async function addEvidence(
  caseId: string,
  ev: Omit<EvidenceItem, 'id' | 'addedAt'>
): Promise<EvidenceItem> {
  const item: EvidenceItem = {
    ...ev,
    id:      `ev_${Date.now()}`,
    addedAt: new Date().toISOString(),
  };
  const snap = await getDoc(doc(db, COL, caseId));
  const current: EvidenceItem[] = snap.data()?.evidence ?? [];
  await updateDoc(doc(db, COL, caseId), {
    evidence:  [...current, item],
    updatedAt: new Date().toISOString(),
  });
  return item;
}

export async function removeEvidence(caseId: string, evidenceId: string): Promise<void> {
  const snap = await getDoc(doc(db, COL, caseId));
  const current: EvidenceItem[] = snap.data()?.evidence ?? [];
  await updateDoc(doc(db, COL, caseId), {
    evidence:  current.filter(e => e.id !== evidenceId),
    updatedAt: new Date().toISOString(),
  });
}

// ── FIR DATA ─────────────────────────────────────────────────────────────────
export async function saveFIRData(caseId: string, firData: Partial<FIRFormData>): Promise<void> {
  await updateDoc(doc(db, COL, caseId), {
    firData,
    updatedAt: new Date().toISOString(),
  });
}

// ── STATUS ───────────────────────────────────────────────────────────────────
export async function updateStatus(caseId: string, status: SavedCase['status']): Promise<void> {
  await updateDoc(doc(db, COL, caseId), {
    status,
    updatedAt: new Date().toISOString(),
  });
}
