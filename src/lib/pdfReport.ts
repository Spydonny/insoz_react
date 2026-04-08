import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { RecordItem } from "@/lib/api";
import { Child } from "@/types/child";

interface LocaleDict {
    [key: string]: {
        title: string;
        child: string;
        nn: string;
        progress: string;
        details: string;
        date: string;
        normal: string;
        risk: string;
        improvement: string;
        trend: string;
        top: string;
    };
}

const dict: LocaleDict = {
    en: {
        title: "Speech Therapy Report",
        child: "Child Information",
        nn: "Neural Network Summary",
        progress: "Therapy Progress",
        details: "Detailed Analysis",
        date: "Date",
        normal: "Normal",
        risk: "Risk",
        improvement: "Δ",
        trend: "Trend",
        top: "Top diagnoses",
    },
    ru: {
        title: "Speech Therapy Report",
        child: "Child Information",
        nn: "Neural Network Summary",
        progress: "Therapy Progress",
        details: "Detailed Analysis",
        date: "Date",
        normal: "Normal",
        risk: "Risk",
        improvement: "Δ",
        trend: "Trend",
        top: "Top diagnoses",
    },
    kk: {
        title: "Сөйлеу терапиясының есебі",
        child: "Бала туралы ақпарат",
        nn: "Нейрожелі қорытындысы",
        progress: "Терапия динамикасы",
        details: "Толық талдау",
        date: "Күні",
        normal: "Қалыпты",
        risk: "Қауіп",
        improvement: "Δ",
        trend: "Бағыт",
        top: "Негізгі диагноздар",
    }
};

export async function generateAndDownloadTherapyReport(
    child: Child,
    records: RecordItem[],
    language: string,
    resolvedLanguage: string | undefined
) {
    // ==============================
    // INIT
    // ==============================
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await fetch("/Roboto/static/Roboto-Regular.ttf").then((r) => r.arrayBuffer());
    const boldBytes = await fetch("/Roboto/static/Roboto-Bold.ttf").then((r) => r.arrayBuffer());

    const font = await pdfDoc.embedFont(fontBytes);
    const bold = await pdfDoc.embedFont(boldBytes);

    const locale = language === "kk" ? "kk-KZ" : "ru-RU";
    const lang = resolvedLanguage?.slice(0, 2) || "ru";
    const tr = dict[lang as keyof typeof dict] ?? dict.en;

    // ==============================
    // PAGE HELPERS
    // ==============================
    let page = pdfDoc.addPage([595, 842]);
    const margin = 40;
    const line = 16;
    let y = 800;

    const newPage = () => {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
    };

    const checkPage = () => {
        if (y < 60) newPage();
    };

    const text = (t: string, size = 11, isBold = false, x = margin) => {
        page.drawText(t, { x, y, size, font: isBold ? bold : font });
        y -= line;
        checkPage();
    };

    const row = (cols: string[], widths: number[], isBold = false) => {
        let x = margin;
        cols.forEach((c, i) => {
            page.drawText(c, { x, y, size: 9, font: isBold ? bold : font });
            x += widths[i];
        });
        y -= line;
        checkPage();
    };

    // ==============================
    // SORT RECORDS
    // ==============================
    const sorted = [...records].sort(
        (a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
    );

    // ==============================
    // TITLE
    // ==============================
    text(tr.title, 18, true);
    y -= 10;

    // ==============================
    // CHILD INFO
    // ==============================
    text(tr.child, 14, true);
    text(`Name: ${child.name}`);
    text(`Age: ${child.age ?? "-"}`);
    text(`Diagnosis: ${child.diagnosis?.join(", ") || "Normal"}`);
    y -= 20;

    // =====================================================
    // ✅ COMPACT NN TABLE (clean layout)
    // =====================================================
    text(tr.nn, 14, true);

    const widths = [80, 70, 70, 220];

    row([tr.date, `${tr.normal}%`, `${tr.risk}%`, tr.top], widths, true);

    sorted.forEach((r) => {
        const probs = r.diagnosis_probabilities || {};
        const date = new Date(r.uploaded_at).toLocaleDateString(locale);

        const normal = (probs.normal ?? 0) * 100;
        const risk = 100 - normal;

        const top = Object.entries(probs)
            .filter(([k]) => k !== "normal")
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .slice(0, 2)
            .map(([k, v]) => `${k}: ${(v! * 100).toFixed(1)}%`)
            .join(", ");

        row([date, normal.toFixed(1), risk.toFixed(1), top || "-"], widths);
    });

    // =====================================================
    // ✅ THERAPY TIME ANALYSIS
    // =====================================================
    y -= 25;
    text(tr.progress, 14, true);

    const timeWidths = [80, 70, 70, 70, 50];

    row([tr.date, tr.normal, tr.improvement, tr.risk, tr.trend], timeWidths, true);

    let prev: number | null = null;

    sorted.forEach((r) => {
        const normal = (r.diagnosis_probabilities?.normal ?? 0) * 100;
        const risk = 100 - normal;

        let diff = 0;
        let trend = "→";

        if (prev !== null) {
            diff = normal - prev;
            if (diff > 1) trend = "↑";
            else if (diff < -1) trend = "↓";
        }

        const date = new Date(r.uploaded_at).toLocaleDateString(locale);

        row(
            [
                date,
                `${normal.toFixed(1)}%`,
                `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`,
                `${risk.toFixed(1)}%`,
                trend,
            ],
            timeWidths
        );

        prev = normal;
    });

    // =====================================================
    // ✅ PHONEME ANALYSIS (добавленный блок)
    // =====================================================
    y -= 25;
    text("Phoneme Analysis", 14, true);

    const analyses = child.phoneme_analyses || [];

    if (!analyses.length) {
        text("No phoneme data available");
    } else {
        const sortedAnalyses = [...analyses].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // ==============================
        // AVERAGE SCORE TREND
        // ==============================
        text("Average Score Progress", 12, true);

        const avgWidths = [90, 90, 90, 60];
        row(["Date", "Avg Score", "Change", "Trend"], avgWidths, true);

        let prevScore: number | null = null;

        sortedAnalyses.forEach((a) => {
            const score = a.average_score;
            const date = new Date(a.created_at).toLocaleDateString(locale);

            let diff = 0;
            let trend = "→";

            if (prevScore !== null) {
                diff = score - prevScore;
                if (diff > 0.5) trend = "↑";
                else if (diff < -0.5) trend = "↓";
            }

            row(
                [
                    date,
                    score.toFixed(2),
                    `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`,
                    trend,
                ],
                avgWidths
            );

            prevScore = score;
        });

        y -= 15;

        // ==============================
        // DETAILS PER ANALYSIS
        // ==============================
        const threshold = 0.6;

        sortedAnalyses.forEach((a) => {
            const date = new Date(a.created_at).toLocaleDateString(locale);

            text(`${date} (${a.analysis_type})`, 12, true);
            text(`Avg score: ${a.average_score.toFixed(2)} / ${a.max_score}`);

            if (a.summary) text(`Summary: ${a.summary}`, 10);
            if (a.comment) text(`Comment: ${a.comment}`, 10);

            // слабые фонемы
            const weak = a.results
                .filter((p) => p.score < threshold)
                .sort((a, b) => a.score - b.score)
                .slice(0, 5);

            if (weak.length) {
                text("Weak phonemes:", 11, true);

                weak.forEach((p) => {
                    text(`   ${p.phoneme} (${p.letter}): ${p.score.toFixed(2)}`, 10);
                });
            } else {
                text("No critical phoneme issues", 10);
            }

            y -= 10;
            checkPage();
        });
    }


    // =====================================================
    // ✅ DETAILS (vertical and easier to read)
    // =====================================================
    y -= 25;
    text(tr.details, 14, true);

    sorted.forEach((r) => {
        const date = new Date(r.uploaded_at).toLocaleDateString(locale);
        text(date, 12, true);

        Object.entries(r.diagnosis_probabilities || {}).forEach(([k, v]) => {
            text(`   ${k}: ${(v! * 100).toFixed(1)}%`, 10);
        });

        y -= 4;
        checkPage();
    });

    // =====================================================
    // SAVE (TS SAFE)
    // =====================================================
    const bytes = await pdfDoc.save();

    const blob = new Blob([bytes.slice()], {
        type: "application/pdf",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${child.name}_therapy_report.pdf`;
    link.click();

    URL.revokeObjectURL(link.href);
}

export async function generateAndDownloadRecommendationsPdf(
    markdown: string,
    childName: string,
) {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await fetch("/Roboto/static/Roboto-Regular.ttf").then((r) => r.arrayBuffer());
    const boldBytes = await fetch("/Roboto/static/Roboto-Bold.ttf").then((r) => r.arrayBuffer());

    const font = await pdfDoc.embedFont(fontBytes);
    const bold = await pdfDoc.embedFont(boldBytes);

    let page = pdfDoc.addPage([595, 842]);
    const margin = 40;
    const maxWidth = 595 - margin * 2;
    const lineHeight = 16;
    let y = 800;

    const newPage = () => {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
    };

    const checkPage = (needed = lineHeight) => {
        if (y < 60 + needed) newPage();
    };

    // Word-wrap helper
    const wrapText = (text: string, size: number, usedFont: typeof font, indent = 0): string[] => {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let current = "";
        const available = maxWidth - indent;

        for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            const w = usedFont.widthOfTextAtSize(test, size);
            if (w > available && current) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        }
        if (current) lines.push(current);
        return lines;
    };

    const drawWrapped = (text: string, size: number, isBold: boolean, indent = 0) => {
        const usedFont = isBold ? bold : font;
        const lines = wrapText(text, size, usedFont, indent);
        for (const l of lines) {
            checkPage();
            page.drawText(l, { x: margin + indent, y, size, font: usedFont });
            y -= lineHeight;
        }
    };

    // Parse and render markdown lines
    const lines = markdown.split("\n");

    for (const raw of lines) {
        const trimmed = raw.trim();
        if (!trimmed) {
            y -= 8; // blank line spacing
            continue;
        }

        // Headings
        if (trimmed.startsWith("### ")) {
            y -= 6;
            drawWrapped(trimmed.slice(4), 12, true);
            y -= 2;
        } else if (trimmed.startsWith("## ")) {
            y -= 8;
            drawWrapped(trimmed.slice(3), 14, true);
            y -= 4;
        } else if (trimmed.startsWith("# ")) {
            y -= 10;
            drawWrapped(trimmed.slice(2), 16, true);
            y -= 6;
        }
        // Bullet points
        else if (/^[-*•]\s/.test(trimmed)) {
            const content = trimmed.slice(2).replace(/\*\*/g, "");
            checkPage();
            page.drawText("•", { x: margin + 8, y, size: 11, font });
            drawWrapped(content, 11, false, 22);
        }
        // Numbered lists
        else if (/^\d+[.)]\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+[.)]\s)/);
            const prefix = match?.[1] ?? "";
            const content = trimmed.slice(prefix.length).replace(/\*\*/g, "");
            checkPage();
            page.drawText(prefix, { x: margin, y, size: 11, font: bold });
            drawWrapped(content, 11, false, 22);
        }
        // Regular paragraph
        else {
            const cleaned = trimmed.replace(/\*\*/g, "");
            drawWrapped(cleaned, 11, false);
        }
    }

    // Save
    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes.slice()], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${childName}_recommendations.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
}
