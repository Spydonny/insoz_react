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
import { RecordItem } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Child } from "@/types/child";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { generateAndDownloadRecommendationsPdf } from "@/lib/pdfReport";

interface OverviewTabProps {
  records: RecordItem[];
  child: Child;
  ragAnswer: string | null;
  ragLoading: boolean;
  ragError: string | null;
  onLoadRecommendations: () => void;
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

export const OverviewTab = ({
  records,
  child,
  ragAnswer,
  ragLoading,
  ragError,
  onLoadRecommendations,
}: OverviewTabProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "kk" ? "kk-KZ" : "ru-RU";
  const phonemeAnalyses = [...(child.phoneme_analyses ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getDiagnosisLabel = (key: string) =>
    t(`diagnosis.${key}`, { defaultValue: key });

  const handleDownloadPDF = async () => {
    if (!ragAnswer) return;
    await generateAndDownloadRecommendationsPdf(ragAnswer, child.name);
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

      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h2 className="font-semibold text-lg">
              {t("dashboard.phonemeScoresTitle", {
                defaultValue: "Phoneme analysis scores",
              })}
            </h2>
            {phonemeAnalyses.length > 0 && (
              <span className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">
                {phonemeAnalyses.length}
              </span>
            )}
          </div>

          {phonemeAnalyses.length === 0 ? (
            <p className="text-sm text-yellow-700">
              {t("dashboard.phonemeScoresEmpty", {
                defaultValue: "No saved phoneme analyses yet.",
              })}
            </p>
          ) : (
            <div className="space-y-3">
              {phonemeAnalyses.slice(0, 4).map((analysis) => (
                <div
                  key={analysis.id}
                  className="rounded-xl border border-yellow-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-yellow-900">
                        {analysis.analysis_type === "ai"
                          ? t("dashboard.phonemeScoresAi", {
                            defaultValue: "AI analysis",
                          })
                          : t("dashboard.phonemeScoresManual", {
                            defaultValue: "Manual evaluation",
                          })}
                      </p>
                      <p className="text-xs text-yellow-700">
                        {new Date(analysis.created_at).toLocaleString(locale, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                    </div>
                    <div className="rounded-full border border-yellow-300 bg-white px-3 py-1 text-sm font-medium text-yellow-900">
                      {analysis.average_score.toFixed(1)}/{analysis.max_score}
                    </div>
                  </div>

                  {analysis.summary && (
                    <p className="mt-2 text-sm text-yellow-800">
                      {analysis.summary}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.results.map((item) => (
                      <div
                        key={`${analysis.id}-${item.phoneme}`}
                        className="rounded-lg border border-yellow-200 bg-white px-3 py-2 text-sm text-yellow-900"
                      >
                        <span className="font-semibold">{item.letter}</span>
                        <span className="mx-2 font-mono text-xs text-yellow-700">
                          {item.phoneme}
                        </span>
                        <span>
                          {item.score}/{analysis.max_score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
{/* ===== RAG RECOMMENDATIONS (A4-like, left-aligned) ===== */}
<div
  className="w-full"
  style={{ maxWidth: "794px" }} // A4 width
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
          disabled={!ragAnswer}
        >
          <FiDownload className="mr-2 w-4 h-4" />
          {t("dashboard.actions.downloadPdf")}
        </Button>

        <Button
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={onLoadRecommendations}
          disabled={ragLoading}
        >
          <FiRefreshCw className={`mr-2 w-4 h-4 ${ragLoading ? "animate-spin" : ""}`} />
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
