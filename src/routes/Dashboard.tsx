import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getChildById,
  fetchChildRecords,
  uploadChildRecord,
  playChildRecord,
  RecordItem,
} from "@/lib/api";

import { Child } from "@/types/child";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { ArrowLeft, Edit, Download, User } from "lucide-react";
import RecordsTab from "@/components/dachboard/RecordsTab";
import { OverviewTab } from "@/components/dachboard/OverviewTab";
import { ProgressTab } from "@/components/dachboard/ProgressTab";
import { ExercisesTab } from "@/components/dachboard/ExercisesTab";
import { ReportGenerator } from "@/components/dachboard/ReportGenerator";

import "@/fonts/Roboto-Regular-normal";
import { useTranslation } from "react-i18next";

import { PDFDocument, rgb } from "pdf-lib";

import fontkit from "@pdf-lib/fontkit";
import { Skeleton } from "@/components/ui/skeleton";


export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "kk" ? "kk-KZ" : "ru-RU";

  // state
  const [child, setChild] = useState<Child | null>(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ------ LOAD CHILD ------
  useEffect(() => {
    if (!id) return;

    const loadChild = async () => {
      try {
        setLoading(true);
        const data = await getChildById(id);
        setChild(data);
      } catch (err) {
        console.error("Failed to load child:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChild();
  }, [id]);

  // ------ LOAD RECORDS ------
  const loadRecords = useCallback(async () => {
    if (!id) return;
    try {
      setRecordsLoading(true);
      const list = await fetchChildRecords(id);
      setRecords(list);
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setRecordsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ------ UPLOAD ------
  const handleUploadRecord = async (file: File) => {
    if (!id) return;
    try {
      setUploading(true);
      await uploadChildRecord(id, file);
      await loadRecords();
    } catch (err) {
      console.error("Failed to upload record:", err);
    } finally {
      setUploading(false);
    }
  };

  // ------ PLAY ------
  const handlePlayRecord = async (path: string) => {
    try {
      await playChildRecord(path);
    } catch (err) {
      console.error("Failed to play record:", err);
    }
  };

  // ------ PDF ------
  const handleDownloadPDF = async () => {
    if (!child) return;

    // ==============================
    // INIT
    // ==============================
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await fetch("/Roboto/static/Roboto-Regular.ttf").then(r => r.arrayBuffer());
    const boldBytes = await fetch("/Roboto/static/Roboto-Bold.ttf").then(r => r.arrayBuffer());

    const font = await pdfDoc.embedFont(fontBytes);
    const bold = await pdfDoc.embedFont(boldBytes);

    const locale = i18n.language === "kk" ? "kk-KZ" : "ru-RU";

    // ==============================
    // 🌍 TRANSLATIONS
    // ==============================
    const dict = {
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

    console.log(i18n.language);

    const lang = i18n.resolvedLanguage?.slice(0, 2) || "ru";
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

    row(
      [tr.date, `${tr.normal}%`, `${tr.risk}%`, tr.top],
      widths,
      true
    );

    sorted.forEach(r => {
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

      row(
        [
          date,
          normal.toFixed(1),
          risk.toFixed(1),
          top || "-"
        ],
        widths
      );
    });

    // =====================================================
    // ✅ THERAPY TIME ANALYSIS
    // =====================================================
    y -= 25;
    text(tr.progress, 14, true);

    const timeWidths = [80, 70, 70, 70, 50];

    row(
      [tr.date, tr.normal, tr.improvement, tr.risk, tr.trend],
      timeWidths,
      true
    );

    let prev: number | null = null;

    sorted.forEach(r => {
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
          trend
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

    sorted.forEach(r => {
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
  };




  if (loading) {
    return (
      <div className="min-h-screen bg-white text-yellow-900 p-6">
        {/* Header Skeleton */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded bg-yellow-200/50" />
            <Skeleton className="h-8 w-64 bg-yellow-200/50" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
            <Skeleton className="h-10 w-32 rounded bg-yellow-200/50" />
          </div>
        </header>

        {/* Child Card Skeleton */}
        <Card className="mb-6 border-yellow-400 bg-white shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="w-20 h-20 rounded-full bg-yellow-200/50" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 bg-yellow-200/50" />
              <Skeleton className="h-4 w-24 bg-yellow-200/50" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-2 border border-yellow-200 rounded-lg p-1 bg-white w-fit shadow-sm">
            <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
            <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
            <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
            <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white border-yellow-200 shadow-md">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-1/2 bg-yellow-200/50" />
                  <Skeleton className="h-32 w-full bg-yellow-200/50" />
                </CardContent>
              </Card>
              <Card className="bg-white border-yellow-200 shadow-md">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-1/2 bg-yellow-200/50" />
                  <Skeleton className="h-32 w-full bg-yellow-200/50" />
                </CardContent>
              </Card>
            </div>
            <Card className="bg-white border-yellow-200 shadow-md">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-1/3 bg-yellow-200/50" />
                <Skeleton className="h-48 w-full bg-yellow-200/50" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  if (!child) return <div className="p-6">{t("dashboard.missingChild")}</div>;

  // ------ UI Components ------
  const Header = () => (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <h1 className="text-2xl font-bold">
          {child.name}
          {child.age != null && `, ${child.age}`}
          {" — "}
          <span className="text-yellow-700">
            {t("child.status.activeTreatment")}
          </span>
        </h1>
      </div>

      {/* Right side */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="border-yellow-300 text-yellow-800">
          <Edit className="mr-2 w-4 h-4" /> {t("dashboard.actions.edit")}
        </Button>

        <Button
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={handleDownloadPDF}
        >
          <Download className="mr-2 w-4 h-4" /> {t("dashboard.actions.downloadPdf")}
        </Button>
      </div>
    </header>
  );


  const ChildCard = () => (
    <Card className="mb-6 border-yellow-400 bg-white">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center">
          <User className="w-10 h-10 text-yellow-700" />
        </div>
        <div>
          <p className="font-semibold text-lg">{child.name}</p>
          <p className="text-sm text-yellow-800">
            {child.diagnosis?.length
              ? child.diagnosis.join(", ")
              : t("diagnosis.normal")}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white text-yellow-900 p-6">
      <Header />
      <ChildCard />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border border-yellow-200 mb-4">
          <TabsTrigger value="overview">
            {t("dashboard.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="records">
            {t("dashboard.tabs.records")}
          </TabsTrigger>
          <TabsTrigger value="progress">
            {t("dashboard.tabs.progress")}
          </TabsTrigger>
          <TabsTrigger value="exercises">
            {t("dashboard.tabs.exercises")}
          </TabsTrigger>
          <TabsTrigger value="ai-report">
            AI отчёт
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab records={records} child={child} />
        </TabsContent>

        <TabsContent value="records">
          <RecordsTab
            records={records}
            loading={recordsLoading}
            uploading={uploading}
            onUpload={handleUploadRecord}
            onPlay={handlePlayRecord}
          />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressTab records={records} />
        </TabsContent>

        <TabsContent value="exercises">
          <ExercisesTab />
        </TabsContent>

        <TabsContent value="ai-report">
          <ReportGenerator child={child} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
