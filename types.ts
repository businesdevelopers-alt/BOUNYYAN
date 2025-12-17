export enum ComplianceStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  WARNING = 'WARNING',
  NEEDS_CLARIFICATION = 'NEEDS_CLARIFICATION'
}

export interface ComplianceFinding {
  id: string;
  category: string; // e.g., "Fire Safety", "Dimensions", "Accessibility"
  description: string;
  reference: string; // e.g., "SBC 201 - 10.4.1"
  status: ComplianceStatus;
  recommendation: string;
  location?: string; // e.g., "Sheet A-101, Grid 4-F"
  boundingBox?: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1
}

export interface AnalysisReport {
  overallScore: number;
  scanDate: string;
  fileName: string;
  findings: ComplianceFinding[];
  summary: string;
  imageBase64?: string; // Data URL or Base64 string for visualization
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ViewState = 'dashboard' | 'upload' | 'report' | 'chat';