import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PHONEME_LANGUAGES, PhonemeLanguage } from "@/data/phonemes";
import { analyzePhonemes, submitManualPhonemeScore } from "@/lib/api";
import { PhonemeAnalysis } from "@/types/child";
import {
    LuChevronDown as ChevronDown,
    LuMic as Mic,
    LuRotateCcw as RotateCcw,
    LuSquare as Square,
    LuVolume2 as Volume2,
} from "react-icons/lu";

interface PhonemesTabProps {
    childId?: string;
    onAnalysisSaved?: () => Promise<void> | void;
}

const pickSupportedMimeType = () => {
    if (typeof MediaRecorder === "undefined") {
        return "";
    }

    const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

export function PhonemesTab({ childId, onAnalysisSaved }: PhonemesTabProps) {
    const { t } = useTranslation();

    const [maxScore, setMaxScore] = useState(5);
    const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [expandedLangs, setExpandedLangs] = useState<string[]>([]);
    const [mixedLangError, setMixedLangError] = useState(false);

    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<PhonemeAnalysis | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const [manualDialogOpen, setManualDialogOpen] = useState(false);
    const [manualScores, setManualScores] = useState<Record<string, number>>({});
    const [manualComment, setManualComment] = useState("");
    const [manualSubmitting, setManualSubmitting] = useState(false);
    const [manualError, setManualError] = useState<string | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingError, setRecordingError] = useState<string | null>(null);
    const [recordedAudio, setRecordedAudio] = useState<File | null>(null);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stopStreamTracks = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };

    const clearRecordedAudio = () => {
        setRecordedAudio(null);
        setRecordedAudioUrl((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return null;
        });
    };

    const resetRecorderState = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.ondataavailable = null;
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setIsRecording(false);
        stopStreamTracks();
        clearRecordedAudio();
    };

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            stopStreamTracks();
            if (recordedAudioUrl) {
                URL.revokeObjectURL(recordedAudioUrl);
            }
        };
    }, [recordedAudioUrl]);

    const toggleLang = (langId: string) => {
        setExpandedLangs((prev) =>
            prev.includes(langId)
                ? prev.filter((l) => l !== langId)
                : [...prev, langId]
        );
    };

    const clearTransientFeedback = () => {
        setAnalysisResult(null);
        setAnalysisError(null);
        setRecordingError(null);
    };

    const handleTogglePhoneme = (langId: string, phoneme: string) => {
        if (selectedLanguage && selectedLanguage !== langId) {
            setMixedLangError(true);
            setTimeout(() => setMixedLangError(false), 3000);
            return;
        }

        clearTransientFeedback();

        setSelectedPhonemes((prev) => {
            const next = prev.includes(phoneme)
                ? prev.filter((p) => p !== phoneme)
                : [...prev, phoneme];

            if (next.length === 0) {
                setSelectedLanguage(null);
                clearRecordedAudio();
            } else {
                setSelectedLanguage(langId);
            }

            return next;
        });
    };

    const clearSelection = () => {
        setSelectedPhonemes([]);
        setSelectedLanguage(null);
        setAnalysisResult(null);
        setAnalysisError(null);
        setRecordingError(null);
        setMixedLangError(false);
        resetRecorderState();
    };

    const handleStartRecording = async () => {
        if (isRecording) return;

        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            setRecordingError(
                t("phonemes.recordUnsupported", {
                    defaultValue: "This browser does not support audio recording.",
                })
            );
            return;
        }

        clearTransientFeedback();
        clearRecordedAudio();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = pickSupportedMimeType();
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);

            streamRef.current = stream;
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const fallbackType = mimeType || "audio/webm";
                const blob = new Blob(chunksRef.current, { type: fallbackType });
                const extension = fallbackType.includes("mp4")
                    ? "m4a"
                    : fallbackType.includes("ogg")
                        ? "ogg"
                        : "webm";
                const file = new File(
                    [blob],
                    `phoneme-analysis-${Date.now()}.${extension}`,
                    { type: blob.type || fallbackType }
                );
                const nextUrl = URL.createObjectURL(blob);

                setRecordedAudio(file);
                setRecordedAudioUrl((prev) => {
                    if (prev) {
                        URL.revokeObjectURL(prev);
                    }
                    return nextUrl;
                });
                setIsRecording(false);
                stopStreamTracks();
            };

            recorder.start();
            setIsRecording(true);
        } catch (err: any) {
            stopStreamTracks();
            setIsRecording(false);
            setRecordingError(
                err?.message ??
                t("phonemes.recordPermissionError", {
                    defaultValue: "Could not access the microphone.",
                })
            );
        }
    };

    const handleStopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") {
            return;
        }
        recorder.stop();
    };

    const handlePlayRecording = async () => {
        if (!audioRef.current) return;
        await audioRef.current.play();
    };

    const handleAiAnalysis = async () => {
        if (!childId || !selectedLanguage || selectedPhonemes.length === 0) return;

        if (!recordedAudio) {
            setRecordingError(
                t("phonemes.recordRequired", {
                    defaultValue: "Record audio before starting AI analysis.",
                })
            );
            return;
        }

        setAnalyzing(true);
        setAnalysisError(null);
        setRecordingError(null);
        setAnalysisResult(null);

        try {
            const res = await analyzePhonemes({
                child_uuid: childId,
                language: selectedLanguage,
                phonemes: selectedPhonemes,
                max_score: maxScore,
                record: recordedAudio,
            });
            setAnalysisResult(res.analysis);
            await onAnalysisSaved?.();
        } catch (err: any) {
            setAnalysisError(err?.message ?? t("phonemes.analysisError"));
        } finally {
            setAnalyzing(false);
        }
    };

    const openManualDialog = () => {
        const initial: Record<string, number> = {};
        for (const phoneme of selectedPhonemes) {
            initial[phoneme] = 0;
        }
        setManualScores(initial);
        setManualComment("");
        setManualError(null);
        setManualDialogOpen(true);
    };

    const handleManualSubmit = async () => {
        if (!childId || !selectedLanguage) return;

        setManualSubmitting(true);
        setManualError(null);

        try {
            const res = await submitManualPhonemeScore({
                child_uuid: childId,
                language: selectedLanguage,
                phonemes: selectedPhonemes,
                scores: manualScores,
                max_score: maxScore,
                comment: manualComment || undefined,
            });
            setAnalysisResult(res.analysis);
            setManualDialogOpen(false);
            await onAnalysisSaved?.();
        } catch (err: any) {
            setManualError(err?.message ?? t("phonemes.submitError"));
        } finally {
            setManualSubmitting(false);
        }
    };

    const selectedCount = selectedPhonemes.length;
    const analysisKindLabel = analysisResult?.analysis_type === "manual"
        ? t("phonemes.manualEval")
        : t("phonemes.aiAnalysis");

    return (
        <div className="space-y-5">
            <Card className="border-yellow-400 bg-white">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <label className="font-semibold text-yellow-900">
                            {t("phonemes.maxScore")}
                        </label>
                        <select
                            value={maxScore}
                            onChange={(e) => setMaxScore(Number(e.target.value))}
                            className="rounded-lg border border-yellow-300 bg-white px-3 py-1.5 text-sm text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {mixedLangError && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 animate-in fade-in duration-200">
                    {t("phonemes.mixedLangError")}
                </div>
            )}

            <Card className="border-yellow-400 bg-white">
                <CardContent className="p-4">
                    <h2 className="font-semibold text-lg mb-3 text-yellow-900">
                        {t("phonemes.selectPhonemes")}
                    </h2>

                    {selectedCount > 0 && (
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-yellow-700">
                                {t("phonemes.selected", { count: selectedCount })}
                            </span>
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                            >
                                {t("phonemes.clearSelection")}
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {PHONEME_LANGUAGES.map((lang) => (
                            <PhonemeLanguageSection
                                key={lang.id}
                                lang={lang}
                                expanded={expandedLangs.includes(lang.id)}
                                onToggleExpand={() => toggleLang(lang.id)}
                                selectedPhonemes={selectedPhonemes}
                                selectedLanguage={selectedLanguage}
                                onTogglePhoneme={(phoneme) => handleTogglePhoneme(lang.id, phoneme)}
                                t={t}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {selectedCount > 0 && (
                <Card className="border-yellow-400 bg-white">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h2 className="font-semibold text-lg text-yellow-900">
                                    {t("phonemes.aiAnalysis")}
                                </h2>
                                <p className="text-sm text-yellow-700">
                                    {t("phonemes.recordPrompt", {
                                        defaultValue: "Record a short audio sample and send it for AI phoneme analysis.",
                                    })}
                                </p>
                            </div>
                            {recordedAudio && (
                                <span className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">
                                    {t("phonemes.recordReady", {
                                        defaultValue: "Recording is ready",
                                    })}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <Button
                                type="button"
                                onClick={handleStartRecording}
                                disabled={isRecording || analyzing}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                            >
                                <Mic className="mr-2 h-4 w-4" />
                                {isRecording
                                    ? t("phonemes.recording", { defaultValue: "Recording..." })
                                    : t("phonemes.recordStart", { defaultValue: "Start recording" })}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleStopRecording}
                                disabled={!isRecording}
                                className="border-yellow-400 text-yellow-900 hover:bg-yellow-50 disabled:opacity-50"
                            >
                                <Square className="mr-2 h-4 w-4" />
                                {t("phonemes.recordStop", { defaultValue: "Stop" })}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePlayRecording}
                                disabled={!recordedAudioUrl}
                                className="border-yellow-400 text-yellow-900 hover:bg-yellow-50 disabled:opacity-50"
                            >
                                <Volume2 className="mr-2 h-4 w-4" />
                                {t("phonemes.playRecording", { defaultValue: "Play" })}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearRecordedAudio}
                                disabled={!recordedAudioUrl || isRecording}
                                className="border-yellow-400 text-yellow-900 hover:bg-yellow-50 disabled:opacity-50"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {t("phonemes.recordAgain", { defaultValue: "Re-record" })}
                            </Button>
                        </div>

                        {recordedAudioUrl && (
                            <audio
                                ref={audioRef}
                                controls
                                src={recordedAudioUrl}
                                className="w-full"
                            />
                        )}

                        {recordingError && (
                            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                                {recordingError}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-3 flex-wrap">
                <Button
                    onClick={handleAiAnalysis}
                    disabled={analyzing || isRecording || selectedPhonemes.length === 0 || !recordedAudio}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                >
                    {analyzing ? t("phonemes.analyzing") : t("phonemes.aiAnalysis")}
                </Button>

                <Button
                    onClick={openManualDialog}
                    disabled={selectedPhonemes.length === 0}
                    variant="outline"
                    className="border-yellow-400 text-yellow-900 hover:bg-yellow-50 disabled:opacity-50"
                >
                    {t("phonemes.manualEval")}
                </Button>
            </div>

            {analysisResult && (
                <Card className="border-yellow-400 bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                            <div>
                                <h2 className="font-semibold text-lg text-yellow-900">
                                    {t("phonemes.analysisResult")}
                                </h2>
                                <p className="text-sm text-yellow-700">
                                    {analysisKindLabel}
                                </p>
                            </div>
                            <div className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800">
                                {analysisResult.average_score.toFixed(1)}/{analysisResult.max_score}
                            </div>
                        </div>

                        {analysisResult.summary && (
                            <p className="text-sm text-yellow-800 mb-3 whitespace-pre-wrap">
                                {analysisResult.summary}
                            </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {analysisResult.results.map((item) => (
                                <div
                                    key={`${analysisResult.id}-${item.phoneme}`}
                                    className="rounded-xl border border-yellow-200 bg-yellow-50/60 px-4 py-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <div className="text-lg font-semibold text-yellow-900">
                                                {item.letter}
                                            </div>
                                            <div className="font-mono text-xs text-yellow-700">
                                                {item.phoneme}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-base font-semibold text-yellow-900">
                                                {item.score}/{analysisResult.max_score}
                                            </div>
                                            {typeof item.best_similarity === "number" && (
                                                <div className="text-xs text-yellow-700">
                                                    {(item.best_similarity * 100).toFixed(0)}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {analysisError && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {analysisError}
                </div>
            )}

            <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white border-yellow-200">
                    <DialogHeader>
                        <DialogTitle className="text-yellow-900">{t("phonemes.manualEval")}</DialogTitle>
                        <DialogDescription className="text-yellow-700">
                            {t("phonemes.manualEvalDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 my-2">
                        {selectedPhonemes.map((ph) => (
                            <div key={ph} className="flex items-center gap-3 bg-white">
                                <span className="font-mono text-base font-semibold w-10 text-center text-yellow-900">
                                    {ph}
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    max={maxScore}
                                    value={manualScores[ph] ?? 0}
                                    onChange={(e) => {
                                        const val = Math.min(
                                            maxScore,
                                            Math.max(0, Number(e.target.value))
                                        );
                                        setManualScores((prev) => ({ ...prev, [ph]: val }));
                                    }}
                                    className="w-20 rounded-lg border border-yellow-300 bg-white px-2 py-1 text-sm text-center text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <span className="text-xs text-yellow-600">/ {maxScore}</span>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-yellow-900 block mb-1">
                            {t("phonemes.commentLabel")}
                        </label>
                        <textarea
                            value={manualComment}
                            onChange={(e) => setManualComment(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                            placeholder={t("phonemes.commentPlaceholder")}
                        />
                    </div>

                    {manualError && (
                        <p className="text-xs text-red-500">{manualError}</p>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setManualDialogOpen(false)}
                            className="border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-50"
                        >
                            {t("phonemes.cancel")}
                        </Button>
                        <Button
                            onClick={handleManualSubmit}
                            disabled={manualSubmitting}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                            {manualSubmitting
                                ? t("phonemes.submitting")
                                : t("phonemes.submit")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface PhonemeLanguageSectionProps {
    lang: PhonemeLanguage;
    expanded: boolean;
    onToggleExpand: () => void;
    selectedPhonemes: string[];
    selectedLanguage: string | null;
    onTogglePhoneme: (phoneme: string) => void;
    t: (key: string, options?: any) => string;
}

function PhonemeLanguageSection({
    lang,
    expanded,
    onToggleExpand,
    selectedPhonemes,
    selectedLanguage,
    onTogglePhoneme,
    t,
}: PhonemeLanguageSectionProps) {
    const isDisabled = selectedLanguage !== null && selectedLanguage !== lang.id;
    const selectedInLang = useMemo(
        () =>
            lang.phonemes.filter((p) => selectedPhonemes.includes(p)).length,
        [lang.phonemes, selectedPhonemes]
    );

    return (
        <div
            className={`rounded-xl border transition-colors ${isDisabled
                ? "border-gray-200 bg-gray-50 opacity-60"
                : "border-yellow-200 bg-yellow-50/40"
                }`}
        >
            <button
                type="button"
                onClick={onToggleExpand}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-yellow-900">
                        {t(lang.labelKey)}
                    </span>
                    {selectedInLang > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-yellow-500 text-white text-xs font-bold px-1.5">
                            {selectedInLang}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-yellow-700 transition-transform ${expanded ? "rotate-180" : ""
                        }`}
                />
            </button>

            {expanded && (
                <div className="px-4 pb-4 pt-1">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {lang.phonemes.map((ph) => {
                            const checked = selectedPhonemes.includes(ph);
                            return (
                                <label
                                    key={ph}
                                    className={`flex items-center gap-1.5 cursor-pointer select-none rounded-lg border px-2 py-1.5 text-sm transition-colors ${checked
                                        ? "border-yellow-400 bg-yellow-100"
                                        : "border-yellow-100 hover:bg-yellow-50"
                                        } ${isDisabled ? "pointer-events-none" : ""}`}
                                >
                                    <Checkbox
                                        checked={checked}
                                        disabled={isDisabled}
                                        onCheckedChange={() => onTogglePhoneme(ph)}
                                    />
                                    <span className="font-mono font-medium text-yellow-900">
                                        {ph}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
