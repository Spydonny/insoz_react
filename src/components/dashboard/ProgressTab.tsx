import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { RecordItem } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface ProgressTabProps {
  records: RecordItem[];
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#14b8a6", "#84cc16"];

export const ProgressTab = ({ records }: ProgressTabProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "kk" ? "kk-KZ" : "ru-RU";
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

      const ts = new Date(rec.uploaded_at).getTime();

      return {
        ts, // ← ключевой момент: timestamp
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
    .sort((a, b) => a.ts - b.ts); // ← обязательно сортируем

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

  return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {diagnosisKeys.map((key, i) => (
      <Card key={key} className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-4">
            {t("dashboard.progressCardTitle", {
              diagnosis: getDiagnosisLabel(key),
            })}
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="ts"
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

              <Line
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    ))}
  </div>
);
};

