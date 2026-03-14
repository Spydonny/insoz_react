import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordItem, ragTherapyAnswer } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Child } from "@/types/child";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, RefreshCw } from "lucide-react";
import { generateAndDownloadTherapyReport } from "@/lib/pdfReport";

interface OverviewTabProps {
  records: RecordItem[];
  child: Child;
}

const COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#84cc16",
];

export const OverviewTab = ({ records, child }: OverviewTabProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "kk" ? "kk-KZ" : "ru-RU";

  const getDiagnosisLabel = (key: string) =>
    t(`diagnosis.${key}`, { defaultValue: key });

  const [ragAnswer, setRagAnswer] = useState<string | null>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);

  const handleLoadRecommendations = async () => {
    if (!child.uuid) return;

    setRagLoading(true);
    setRagError(null);

    try {
      const question = t("dashboard.rag.therapyQuestion");

      const res = await ragTherapyAnswer({
        child_uuid: child.uuid,
        question,
        k_total: 3,
        include_context: false,
      });

      setRagAnswer(res.answer);
    } catch (err: any) {
      console.error("Failed to fetch RAG:", err);
      setRagError(
        err?.message ?? t("dashboard.rag.recommendationsError")
      );
    } finally {
      setRagLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    await generateAndDownloadTherapyReport(child, records, i18n.language, i18n.resolvedLanguage);
  };

  // ===== CHART DATA =====

  const chartData = records
    .map((rec) => {
      const probabilities = rec.diagnosis_probabilities
        ? Object.fromEntries(
          Object.entries(rec.diagnosis_probabilities).map(
            ([key, value]) => [key, (value ?? 0) * 100]
          )
        )
        : {};

      const ts = new Date(rec.uploaded_at).getTime();

      return {
        ts,
        date: new Date(ts).toLocaleString(locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        ...probabilities,
      };
    })
    .sort((a, b) => a.ts - b.ts);

  const validDiagnosisKeys = [
    "rhotacism",
    "lisp",
    "general_speech_disorder",
    "phonetic_phonemic_disorder",
    "stuttering",
    "aphasia",
    "dysarthria",
    "normal",
  ];

  const diagnosisKeys =
    records[0]?.diagnosis_probabilities
      ? Object.keys(records[0].diagnosis_probabilities).filter((key) =>
        validDiagnosisKeys.includes(key)
      )
      : [];

  const [selectedKeys, setSelectedKeys] = useState<string[]>(diagnosisKeys);

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      {/* ===== DIAGNOSIS CARD ===== */}
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-2">
            {t("dashboard.diagnosisCardTitle")}
          </h2>
          <p className="text-yellow-800">
            {child.diagnosis.length > 0
              ? child.diagnosis.join(", ")
              : t("diagnosis.normal")}
          </p>
        </CardContent>
      </Card>

      {/* ===== CHART ===== */}
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-4">
            {t("dashboard.probabilityChartTitle")}
          </h2>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="ts"
                type="number"
                domain={["auto", "auto"]}
                tickFormatter={(ts) =>
                  new Date(ts).toLocaleDateString(locale, {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }
              />

              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />

              <Tooltip
                labelFormatter={(ts) =>
                  new Date(ts).toLocaleString(locale, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                formatter={(v: number) => `${v.toFixed(1)}%`}
              />

              {selectedKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={getDiagnosisLabel(key)}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== FILTER ===== */}
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-3">
            {t("dashboard.filterTitle")}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {diagnosisKeys.map((key) => (
              <label key={key} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedKeys.includes(key)}
                  onCheckedChange={() => toggleKey(key)}
                />
                <span>{getDiagnosisLabel(key)}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== RAG RECOMMENDATIONS (A4 paper-like) ===== */}
      <div
        className="mx-auto w-full"
        style={{ maxWidth: "794px" }}
      >
        <Card className="border-yellow-400 bg-white shadow-lg min-h-[600px] flex flex-col">
          <CardContent className="p-8 flex-1 flex flex-col">
            <h2 className="font-semibold text-lg mb-3">
              {t("dashboard.recommendationsTitle")}
            </h2>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-2 w-4 h-4" />
                {t("dashboard.actions.downloadPdf")}
              </Button>

              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={handleLoadRecommendations}
                disabled={ragLoading}
              >
                <RefreshCw className={`mr-2 w-4 h-4 ${ragLoading ? "animate-spin" : ""}`} />
                {t("dashboard.actions.loadRecommendations")}
              </Button>
            </div>

            {/* Content area */}
            <div className="flex-1">
              {ragLoading && (
                <p className="italic text-yellow-700">
                  {t("common.loading")}
                </p>
              )}

              {!ragLoading && ragAnswer && (
                <div className="prose prose-sm max-w-none text-yellow-900">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {ragAnswer}
                  </ReactMarkdown>
                </div>
              )}

              {!ragLoading && !ragAnswer && !ragError && (
                <p className="text-yellow-600 italic text-sm">
                  {t("dashboard.rag.emptyHint")}
                </p>
              )}

              {ragError && (
                <p className="text-xs text-red-500 mt-2">{ragError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};