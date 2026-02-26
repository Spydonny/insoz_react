import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Play,
  Upload,
  Mic,
  Square,
  Loader2,
  StopCircle,
} from "lucide-react";

import { RecordItem } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface RecordsTabProps {
  records: RecordItem[];
  loading: boolean;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onPlay: (filePath: string) => Promise<void>;
}

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
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "kk" ? "kk-KZ" : "ru-RU";

  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // ---------- INIT AUDIO ----------
  useEffect(() => {
    const audioEl = document.createElement("audio");
    audioEl.preload = "auto";
    audioEl.style.display = "none";
    document.body.appendChild(audioEl);
    audioRef.current = audioEl;

    const handleEnded = () => {
      setPlayingId(null);
      audioEl.src = "";
    };

    const handleError = (err: any) => {
      console.error("Audio error:", err);
      setPlayingId(null);
    };

    audioEl.addEventListener("ended", handleEnded);
    audioEl.addEventListener("error", handleError);

    return () => {
      audioEl.pause();
      audioEl.removeEventListener("ended", handleEnded);
      audioEl.removeEventListener("error", handleError);
      audioEl.remove();
    };
  }, []);

  // ---------- SELECT FILE ----------
  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onUpload(file);
  };

  // ---------- RECORD AUDIO ----------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `record_${Date.now()}.webm`, {
          type: "audio/webm",
        });
        await onUpload(file);
        stream.getTracks().forEach((t) => t.stop());
        setAudioChunks([]);
      };

      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert(t("records.microphoneError"));
      console.error(err);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    setIsRecording(false);
  };

  // ---------- PLAY ----------
  const handlePlay = async (rec: RecordItem) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playingId && playingId !== rec.id) stopAudio();

      setPlayingId(rec.id);
      await onPlay(rec.file_path);

      audio.src = rec.file_path;
      audio.load();

      const playPromise = audio.play();
      if (playPromise) await playPromise.catch(() => setPlayingId(null));
    } catch (err) {
      console.error("Failed to play record:", err);
      stopAudio();
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    setPlayingId(null);
  };

  // ---------- RENDER ----------
  return (
    <Card className="border-yellow-400 bg-white">
      <CardContent className="p-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-6 text-yellow-600">
            <Loader2 className="animate-spin mr-2" /> {t("records.loading")}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            {t("records.empty")}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-yellow-200 text-yellow-700">
                <th className="text-left py-2">
                  {t("records.columns.date")}
                </th>
                <th className="text-left py-2">
                  {t("records.columns.type")}
                </th>
                <th className="text-left py-2">
                  {t("records.columns.prediction")}
                </th>
                <th className="text-left py-2">
                  {t("records.columns.comment")}
                </th>
                <th className="text-center py-2">
                  {t("records.columns.listen")}
                </th>
              </tr>
            </thead>

            <tbody>
              {records.map((rec) => {
                const prediction = rec.diagnosis_probabilities
                  ? Object.entries(rec.diagnosis_probabilities)
                    .filter(([, v]) => typeof v === "number")
                    .sort((a, b) => b[1] - a[1])[0]?.[0]
                  : null;

                return (
                  <tr
                    key={rec.id}
                    className="border-b border-yellow-100 hover:bg-yellow-50"
                  >
                    <td className="py-2">
                      {new Date(rec.uploaded_at).toLocaleString(locale, {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td>{t("records.typeAudio")}</td>
                    <td>
                      {prediction
                        ? t(`diagnosis.${prediction}`, { defaultValue: prediction })
                        : "—"}
                    </td>
                    <td>—</td>

                    <td className="text-center">
                      {playingId === rec.id ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={stopAudio}
                        >
                          <StopCircle className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-yellow-600"
                          onClick={() => handlePlay(rec)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Upload panel */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={uploading}
            className={`${isRecording ? "bg-red-500" : "bg-yellow-500"
              } text-white flex items-center gap-2`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" /> {t("records.stop")}
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> {t("records.record")}
              </>
            )}
          </Button>

          <Button
            onClick={handleFilePick}
            disabled={uploading}
            className="bg-yellow-500 text-white flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("common.uploading")}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> {t("common.addFile")}
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
