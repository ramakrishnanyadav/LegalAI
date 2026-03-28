export interface AnalysisSection {
  ipc_section: string;
  bns_section: string;
  title: string;
  confidence: number;
  reasoning: string;
  severity: "bailable" | "non-bailable";
  is_cognizable: boolean;
  punishment: string;
}

export interface AnalysisResponse {
  sections: AnalysisSection[];
  summary: string;
  provider_used: string;
  analysis_id: string;
  cached: boolean;
  processing_time_ms: number;
  disclaimer: string;
}

export interface SSEEvent {
  type: "thinking" | "complete" | "error";
  message?: string;
  data?: AnalysisResponse;
}

export type StreamingPhase = "idle" | "thinking" | "matching" | "complete" | "error";

export interface CaseRequest {
  case_text: string;
  language: "en" | "hi";
}

export interface HealthResponse {
  status: string;
  providers_available: string[];
  version: string;
}

export interface LegalSection {
  ipc_section?: string;
  bns_section?: string;
  title: string;
  description: string;
  punishment: string;
  act: "IPC" | "BNS" | "IT_ACT" | "DPDP_ACT";
  status: "active" | "replaced" | "amended";
  effective_date: string;
  keywords: string[];
  severity: "bailable" | "non-bailable" | "cognizable";
}
