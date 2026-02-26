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
        title: "Отчёт по логопедической терапии",
        child: "Информация о ребёнке",
        nn: "Сводка нейросети",
        progress: "Динамика терапии",
        details: "Подробный анализ",
        date: "Дата",
        normal: "Норма",
        risk: "Риск",
        improvement: "Δ",
        trend: "Тренд",
        top: "Основные диагнозы",
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
    // ✅ COMPACT NN TABLE (красивый)
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
    // ✅ DETAILS (вертикально — читабельно)
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
