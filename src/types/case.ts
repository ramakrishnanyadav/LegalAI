import { AnalysisResponse } from './legal';

export type CaseStatus = 'new' | 'in_progress' | 'filed' | 'resolved';
export type EvidenceType = 'document' | 'photo' | 'screenshot' | 'witness' | 'financial' | 'communication' | 'other';

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  description: string;
  addedAt: string; // ISO
  dataUrl?: string; // base64 for small files
  fileName?: string;
  fileSize?: number;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface FIRFormData {
  complainantName: string;
  complainantAge: string;
  complainantAddress: string;
  complainantPhone: string;
  incidentDate: string;
  incidentTime: string;
  incidentPlace: string;
  accusedName: string;
  accusedAddress: string;
  accusedDescription: string;
  witnessName: string;
  witnessAddress: string;
  propertyLost: string;
  amountLost: string;
  additionalFacts: string;
  policeStation: string;
  district: string;
  state: string;
}

export interface SavedCase {
  id: string;
  userId: string;
  userName?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  title: string;           // auto-generated from primary section
  caseType: string;        // auto-detected category
  caseText: string;        // original input
  analysis: AnalysisResponse;
  strength: number;        // 0–100 case strength score
  status: CaseStatus;
  evidence: EvidenceItem[];
  firData?: Partial<FIRFormData>;
  primarySection?: string; // BNS section of highest confidence
  tags: string[];
}
