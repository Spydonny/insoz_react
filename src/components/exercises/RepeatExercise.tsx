import { useState } from "react";
import { useSpeechEngine } from "./SpeechEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, CheckCircle, XCircle } from "lucide-react";

type Props = {
  prompt: string;
};

export function RepeatExercise({ prompt }: Props) {
  const { transcript, listening, start, stop, supported } =
    useSpeechEngine();

  const [result, setResult] = useState<"ok" | "fail" | null>(null);

  if (!supported) {
    return (
      <Card className="border-yellow-400 bg-white">
        <CardContent className="p-4 text-yellow-700">
          Браузер не поддерживает распознавание речи
        </CardContent>
      </Card>
    );
  }

  const finish = () => {
    stop();
    const normalized = transcript.toLowerCase().trim();
    setResult(
      normalized.includes(prompt.split(" ")[0]) ? "ok" : "fail"
    );
  };

  const handleStart = () => {
    setResult(null);
    start();
    setTimeout(finish, 4000);
  };

  return (
    <Card className="border-yellow-400 bg-white">
      <CardContent className="p-4 space-y-4">
        <p className="text-lg">
          Произнеси:{" "}
          <span className="font-semibold text-yellow-900">
            {prompt}
          </span>
        </p>

        <div className="flex items-center gap-3">
          <Button
            onClick={listening ? stop : handleStart}
            className={`${
              listening ? "bg-red-500" : "bg-yellow-500"
            } text-white flex items-center gap-2`}
          >
            {listening ? (
              <>
                <Square className="w-4 h-4" />
                Остановить
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Начать
              </>
            )}
          </Button>

          <span className="text-sm text-yellow-700">
            {listening ? "Идёт запись..." : "Ожидание"}
          </span>
        </div>

        {transcript && (
          <p className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded">
            Ты сказал: {transcript}
          </p>
        )}

        {result === "ok" && (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Отлично!
          </div>
        )}

        {result === "fail" && (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Попробуй ещё раз медленно
          </div>
        )}
      </CardContent>
    </Card>
  );
}
