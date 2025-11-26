import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordItem } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface OverviewTabProps {
  records: RecordItem[];
  child: { diagnosis: string[] };
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#14b8a6", "#84cc16"];


export const OverviewTab = ({ records, child }: OverviewTabProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "kk" ? "kk-KZ" : "ru-RU";
  const recommendations = t("dashboard.recommendations", {
    returnObjects: true,
  }) as string[];
  const getDiagnosisLabel = (key: string) =>
    t(`diagnosis.${key}`, { defaultValue: key });

  const chartData = records
  .map(rec => {
    const probabilities = rec.diagnosis_probabilities
      ? Object.fromEntries(
          Object.entries(rec.diagnosis_probabilities).map(([key, value]) => [
            key,
            (value ?? 0) * 100,
          ])
        )
      : {};

    const ts = new Date(rec.uploaded_at).getTime(); // ← добавляем timestamp

    return {
      ts,         // ← обязательно
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
  .sort((a, b) => a.ts - b.ts); // ← сортировка по времени (важно!)


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

  // --- NEW: состояние выбранных линий ---
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
      
      {/* Диагноз */}
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

      {/* График */}
      <Card className="border-yellow-400 bg-white">
  <CardContent className="p-4">
    <h2 className="font-semibold text-lg mb-4">
      {t("dashboard.probabilityChartTitle")}
    </h2>

    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        {/* --- X AXIS WITH REAL TIMELINE --- */}
        <XAxis
          dataKey="ts"               // timestamp в миллисекундах
          type="number"
          domain={['auto', 'auto']}
          tickFormatter={(ts) =>
            new Date(ts).toLocaleDateString(locale, {
              day: "2-digit",
              month: "2-digit",
            })
          }
        />

        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />

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


      {/* Фильтр признаков */}
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

      {/* Рекомендации */}
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-3">
            {t("dashboard.recommendationsTitle")}
          </h2>
          <ul className="list-disc list-inside space-y-1 text-yellow-800">
            {recommendations.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="flex justify-end mt-4">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
              {t("dashboard.confirmRecommendations")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

