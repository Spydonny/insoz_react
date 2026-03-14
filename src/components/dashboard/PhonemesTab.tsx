import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { PHONEME_LANGUAGES, PhonemeLanguage } from "@/data/phonemes";
import { analyzePhonemes, submitManualPhonemeScore } from "@/lib/api";
import { ChevronDown } from "lucide-react";

interface PhonemesTabProps {
    childId?: string;
}

export function PhonemesTab({ childId }: PhonemesTabProps) {
    const { t } = useTranslation();

    // ---- state ----
    const [maxScore, setMaxScore] = useState(5);
    const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [expandedLangs, setExpandedLangs] = useState<string[]>([]);
    const [mixedLangError, setMixedLangError] = useState(false);

    // AI analysis
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{
        scores: Record<string, number>;
        summary: string;
    } | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Manual evaluation dialog
    const [manualDialogOpen, setManualDialogOpen] = useState(false);
    const [manualScores, setManualScores] = useState<Record<string, number>>({});
    const [manualComment, setManualComment] = useState("");
    const [manualSubmitting, setManualSubmitting] = useState(false);
    const [manualError, setManualError] = useState<string | null>(null);

    // ---- helpers ----
    const toggleLang = (langId: string) => {
        setExpandedLangs((prev) =>
            prev.includes(langId)
                ? prev.filter((l) => l !== langId)
                : [...prev, langId]
        );
    };

    const handleTogglePhoneme = (langId: string, phoneme: string) => {
        // If a different language already has selections — block
        if (selectedLanguage && selectedLanguage !== langId) {
            setMixedLangError(true);
            setTimeout(() => setMixedLangError(false), 3000);
            return;
        }

        setSelectedPhonemes((prev) => {
            const next = prev.includes(phoneme)
                ? prev.filter((p) => p !== phoneme)
                : [...prev, phoneme];

            // Update selected language
            if (next.length === 0) {
                setSelectedLanguage(null);
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
    };

    // ---- AI Analysis ----
    const handleAiAnalysis = async () => {
        if (!childId || !selectedLanguage || selectedPhonemes.length === 0) return;
        setAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        try {
            const res = await analyzePhonemes({
                child_uuid: childId,
                language: selectedLanguage,
                phonemes: selectedPhonemes,
                max_score: maxScore,
            });
            setAnalysisResult(res);
        } catch (err: any) {
            setAnalysisError(err?.message ?? t("phonemes.analysisError"));
        } finally {
            setAnalyzing(false);
        }
    };

    // ---- Manual Evaluation ----
    const openManualDialog = () => {
        // Pre-fill scores at 0
        const initial: Record<string, number> = {};
        for (const p of selectedPhonemes) {
            initial[p] = 0;
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
            await submitManualPhonemeScore({
                child_uuid: childId,
                language: selectedLanguage,
                phonemes: selectedPhonemes,
                scores: manualScores,
                max_score: maxScore,
                comment: manualComment || undefined,
            });
            setManualDialogOpen(false);
        } catch (err: any) {
            setManualError(err?.message ?? t("phonemes.submitError"));
        } finally {
            setManualSubmitting(false);
        }
    };

    // Count selected per language (for badge display)
    const selectedCount = selectedPhonemes.length;

    return (
        <div className="space-y-5">
            {/* ===== MAX SCORE SELECTOR ===== */}
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

            {/* ===== MIXED LANGUAGE WARNING ===== */}
            {mixedLangError && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 animate-in fade-in duration-200">
                    ⚠️ {t("phonemes.mixedLangError")}
                </div>
            )}

            {/* ===== PHONEME LANGUAGE SECTIONS ===== */}
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
                                onTogglePhoneme={(phoneme) =>
                                    handleTogglePhoneme(lang.id, phoneme)
                                }
                                t={t}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ===== ACTION BUTTONS ===== */}
            <div className="flex gap-3 flex-wrap">
                <Button
                    onClick={handleAiAnalysis}
                    disabled={analyzing || selectedPhonemes.length === 0}
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

            {/* ===== AI ANALYSIS RESULT ===== */}
            {analysisResult && (
                <Card className="border-yellow-400 bg-white">
                    <CardContent className="p-4">
                        <h2 className="font-semibold text-lg mb-3 text-yellow-900">
                            {t("phonemes.analysisResult")}
                        </h2>
                        <p className="text-sm text-yellow-800 mb-3 whitespace-pre-wrap">
                            {analysisResult.summary}
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {Object.entries(analysisResult.scores).map(([ph, score]) => (
                                <div
                                    key={ph}
                                    className="flex items-center gap-2 rounded-lg border border-yellow-200 px-3 py-1.5 text-sm"
                                >
                                    <span className="font-mono font-semibold text-yellow-900">
                                        {ph}
                                    </span>
                                    <span className="text-yellow-700">
                                        {score}/{maxScore}
                                    </span>
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

            {/* ===== MANUAL EVALUATION DIALOG ===== */}
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

// ===== Collapsible language section sub-component =====

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
