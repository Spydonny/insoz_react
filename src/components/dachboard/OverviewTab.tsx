import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordItem } from "@/lib/api";

interface OverviewTabProps {
  records: RecordItem[];
  child: { diagnosis: string[] };
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#14b8a6", "#84cc16"];
const diagnosisLabels: Record<string, string> = {
  rhotacism: "Ротацизм",
  lisp: "Шепелявость",
  general_speech_disorder: "Общее недоразвитие речи",
  phonetic_phonemic_disorder: "Фонетико-фонематическое нарушение",
  stuttering: "Заикание",
  aphasia: "Афазия",
  dysarthria: "Дизартрия",
  normal: "Норма",
};

export const OverviewTab = ({ records, child }: OverviewTabProps) => {
  const chartData = records.map(rec => {
    const probabilities = rec.diagnosis_probabilities
      ? Object.fromEntries(
          Object.entries(rec.diagnosis_probabilities).map(([key, value]) => [
            key,
            (value ?? 0) * 100, // ← перевод вероятности в проценты
          ])
        )
      : {};

    return {
      date: new Date(rec.uploaded_at).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      ...probabilities,
    };
  });

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
    <div className="space-y-6">
      {/* Последний диагноз */}
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-2">Диагноз ПНПК</h2>
          <p className="text-yellow-800">{child.diagnosis.join(", ") || "normal"}</p>
        </CardContent>
      </Card>

      {/* График прогресса */}
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-4">
            Прогресс вероятностей диагнозов (%)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              {diagnosisKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={diagnosisLabels[key] || key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Рекомендации */}
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-3">Рекомендации по лечению</h2>
          <ul className="list-disc list-inside space-y-1 text-yellow-800">
            <li>Тренировки дыхания 10 мин/день</li>
            <li>Чтение коротких текстов с замедленным темпом</li>
            <li>Ритм речи: упражнение “Ма-ме-ми”</li>
          </ul>
          <div className="flex justify-end mt-4">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
              Подтвердить рекомендации
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
