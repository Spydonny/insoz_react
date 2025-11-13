import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Upload, Mic, Square, Loader2, StopCircle } from "lucide-react";
import { RecordItem } from "@/lib/api";
import React, { useEffect } from "react";

interface RecordsTabProps {
  records: RecordItem[];
  loading: boolean;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onPlay: (filePath: string) => Promise<void>;
}

export const diagnosisLabels: Record<string, string> = {
  rhotacism: "Картавость",
  lisp: "Шипилявость",
  general_speech_disorder: "ОНР (общее недоразвитие речи)",
  phonetic_phonemic_disorder: "ФНР (фонетико-фонематическое недоразвитие)",
  stuttering: "Заикание",
  aphasia: "Афазия",
  dysarthria: "Дизартрия",
  normal: "Норма",
};

const RecordsTab: React.FC<RecordsTabProps> = ({
  records,
  loading,
  uploading,
  onUpload,
  onPlay,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null); // <-- ID активного аудио

  useEffect(() => {
    // создаём один элемент audio и добавляем в документ (он hidden)
    const audioEl = document.createElement("audio");
    audioEl.preload = "auto";
    audioEl.style.display = "none";
    document.body.appendChild(audioEl);
    audioRef.current = audioEl;

    const onEnded = () => {
      setPlayingId(null);
      // очистка src чтобы браузер не держал ресурс
      if (audioRef.current) {
        audioRef.current.src = "";
      }
    };

    const onError = (ev: any) => {
      console.error("Audio element error event:", ev);
      setPlayingId(null);
    };

    audioEl.addEventListener("ended", onEnded);
    audioEl.addEventListener("error", onError);

    return () => {
      // cleanup при размонтировании
      audioEl.pause();
      audioEl.removeEventListener("ended", onEnded);
      audioEl.removeEventListener("error", onError);
      if (audioEl.parentNode) audioEl.parentNode.removeChild(audioEl);
      audioRef.current = null;
    };
  }, []);

  // выбор файла вручную
  const handleAddRecord = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onUpload(file);
  };

  // старт записи с микрофона
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `record_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        await onUpload(file);
        stream.getTracks().forEach((t) => t.stop());
        setAudioChunks([]);
      };

      setAudioChunks(chunks);
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Ошибка доступа к микрофону:", err);
      alert("Не удалось получить доступ к микрофону.");
    }
  };

  // остановка записи
  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setIsRecording(false);
    }
  };

  // воспроизведение аудио
  const handlePlayAudio = async (rec: RecordItem) => {
    const audio = audioRef.current;
    if (!audio) {
      console.error("Audio element not initialized");
      return;
    }

    try {
      // Если уже играет другой трек — остановим
      if (playingId && playingId !== rec.id) {
        handleStopAudio();
        // небольшая пауза, чтобы браузер успел сбросить ресурс
        await new Promise((res) => setTimeout(res, 50));
      }

      setPlayingId(rec.id);

      // Позволим внешней onPlay подготовить (например, логика авторизации/замены пути)
      // onPlay может возвращать Promise — ждём его
      await onPlay(rec.file_path);

      // Устанавливаем src и пытаемся воспроизвести
      // если rec.file_path — не прямой URL, onPlay должен вернуть/установить правильный доступный URL.
      audio.src = rec.file_path;
      audio.load();

      // play() возвращает Promise — обработаем отказы (autoplay policy, CORS, etc)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((err) => {
          console.error("Не удалось начать воспроизведение:", err);
          // в случае ошибки сразу сбрасываем состояние
          setPlayingId(null);
          // очистим src чтобы не держать ресурс
          audio.src = "";
        });
      }
    } catch (err) {
      console.error("Ошибка в handlePlayAudio:", err);
      setPlayingId(null);
      if (audio) {
        try {
          audio.pause();
          audio.src = "";
        } catch {}
      }
    }
  };


  // остановка воспроизведения
  const handleStopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    } catch (err) {
      console.warn("Ошибка при остановке audio:", err);
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <Card className="border-yellow-400 bg-white">
      <CardContent className="p-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-6 text-yellow-600">
            <Loader2 className="animate-spin mr-2" /> Загрузка записей...
          </div>
        ) : records.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            Записей пока нет
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-yellow-200 text-yellow-700">
                <th className="text-left py-2">Дата</th>
                <th className="text-left py-2">Тип</th>
                <th className="text-left py-2">Предсказание ИИ</th>
                <th className="text-left py-2">Комментарий</th>
                <th className="text-center py-2">Прослушать</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b border-yellow-100 hover:bg-yellow-50"
                >
                  <td className="py-2">
                    {new Date(rec.uploaded_at).toLocaleString("ru-RU", {
                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>Аудио</td>
                  <td>
                    {rec.diagnosis_probabilities
                      ? diagnosisLabels[
                          Object.entries(rec.diagnosis_probabilities)
                            .filter(([_, v]) => typeof v === "number")
                            .sort((a, b) => b[1] - a[1])[0]?.[0] || ""
                        ] || "—"
                      : "—"}
                  </td>
                  <td>—</td>
                  <td className="text-center">
                    {playingId === rec.id ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={handleStopAudio}
                      >
                        <StopCircle className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-yellow-600"
                        onClick={() => handlePlayAudio(rec)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Кнопки загрузки и записи */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={uploading}
            className={`${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white flex items-center gap-2`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" /> Остановить
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> Записать с микрофона
              </>
            )}
          </Button>

          <Button
            onClick={handleAddRecord}
            disabled={uploading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Добавить файл
              </>
            )}
          </Button>

          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordsTab;
