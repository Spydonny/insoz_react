export interface SpeechTherapyReport {
  assessment: string;
  diagnosis: string;
  recommendations: string;
  correction_plan: string;
  severity: string;
}

export interface TherapyReportResponse {
  report: SpeechTherapyReport;
  pdf_base64: string;
}

