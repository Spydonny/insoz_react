import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMedGemmaReport } from "@/hooks/useMedGemmaReport";
import type { Child } from "@/types/child";

interface ReportGeneratorProps {
  child: Child;
}

export const ReportGenerator = ({ child }: ReportGeneratorProps) => {
  const [doctorNotes, setDoctorNotes] = useState("");

  const { loading, error, report, pdfUrl, createReport } = useMedGemmaReport();

  const handleGenerate = async () => {
    if (!child?.uuid) return;
    await createReport(child.uuid, doctorNotes || undefined);
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${child.name}_ai_report.pdf`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4 space-y-3">
          <h2 className="font-semibold text-lg">
            AI отчёт по ребёнку
          </h2>
          <p className="text-sm text-yellow-800">
            На основе всех доступных записей и вероятностей нарушений будет сформирован
            структурированный логопедический отчёт (MedGemma через Ollama).
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-yellow-900">
              Заметки врача (опционально)
            </label>
            {/* Простое textarea, стилизованное через tailwind */}
            <textarea
              className="w-full min-h-[80px] rounded-md border border-yellow-300 bg-white px-3 py-2 text-sm text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Например: динамика за последние занятия, особенности поведения, сопутствующие диагнозы..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Генерация AI отчёта..." : "Создать AI отчёт"}
            </Button>

            {pdfUrl && (
              <Button
                variant="outline"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                onClick={handleDownloadPdf}
              >
                Скачать AI PDF
              </Button>
            )}

            {error && (
              <span className="text-sm text-red-600">
                {error}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {report && (
        <Card className="border-yellow-400 bg-white">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-lg">
              Структура AI‑отчёта
            </h2>

            <section className="space-y-1">
              <h3 className="font-semibold text-yellow-900">Оценка состояния</h3>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                {report.assessment}
              </p>
            </section>

            <section className="space-y-1">
              <h3 className="font-semibold text-yellow-900">Диагноз</h3>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                {report.diagnosis}
              </p>
            </section>

            <section className="space-y-1">
              <h3 className="font-semibold text-yellow-900">Рекомендации</h3>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                {report.recommendations}
              </p>
            </section>

            <section className="space-y-1">
              <h3 className="font-semibold text-yellow-900">План коррекции</h3>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                {report.correction_plan}
              </p>
            </section>

            <section className="space-y-1">
              <h3 className="font-semibold text-yellow-900">Серьёзность нарушений</h3>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                {report.severity}
              </p>
            </section>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

