import { useEffect, useState } from "react";

import { generateTherapyReport } from "@/lib/api";
import type { SpeechTherapyReport } from "@/types/report";

interface UseMedGemmaReportResult {
  loading: boolean;
  error: string | null;
  report: SpeechTherapyReport | null;
  pdfUrl: string | null;
  createReport: (childUuid: string, doctorNotes?: string) => Promise<void>;
  reset: () => void;
}

export function useMedGemmaReport(): UseMedGemmaReportResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SpeechTherapyReport | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const createReport = async (childUuid: string, doctorNotes?: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await generateTherapyReport(childUuid, doctorNotes);
      setReport(res.report);

      if (res.pdf_base64) {
        const byteCharacters = atob(res.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
    } catch (e: any) {
      setError(e?.message ?? "Ошибка генерации AI‑отчёта");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setReport(null);
    setError(null);
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  return {
    loading,
    error,
    report,
    pdfUrl,
    createReport,
    reset,
  };
}

