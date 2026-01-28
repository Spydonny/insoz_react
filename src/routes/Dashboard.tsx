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

import "@/fonts/Roboto-Regular-normal";
import { useTranslation } from "react-i18next";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import fontkit from "@pdf-lib/fontkit";


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

  const pdfDoc = await PDFDocument.create();

  // 👇 ОБЯЗАТЕЛЬНО
  pdfDoc.registerFontkit(fontkit);

  // загрузка ttf
  const fontBytes = await fetch("/Roboto/static/Roboto-Regular.ttf").then(r => r.arrayBuffer());
  const boldBytes = await fetch("/Roboto/static/Roboto-Bold.ttf").then(r => r.arrayBuffer());

  const font = await pdfDoc.embedFont(fontBytes);
  const boldFont = await pdfDoc.embedFont(boldBytes);
  let page = pdfDoc.addPage([595, 842]); // A4
  let y = 800;
  const marginX = 40;

  const addPageIfNeeded = () => {
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
  };

  const drawText = (text: string, size = 11, bold = false, offsetX = 0) => {
    page.drawText(text, {
      x: marginX + offsetX,
      y,
      size,
      font: bold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
    y -= size + 6;
    addPageIfNeeded();
  };

  drawText(t("dashboard.pdf.title"), 16, true);
  y -= 10;

  drawText(
    t("dashboard.pdf.name", { name: child.name }),
    12
  );

  if (child.age != null) {
    drawText(
      t("dashboard.pdf.age", {
        age: child.age,
        unit: t("child.ageYears", { count: child.age }),
      }),
      12
    );
  } else {
    drawText(t("dashboard.pdf.ageUnknown"), 12);
  }

  y -= 20;

  drawText(t("dashboard.pdf.progressTitle"), 14, true);
  y -= 6;

  if (records.length === 0) {
    drawText(t("dashboard.pdf.noData"), 11, false, 10);
  } else {
    records.forEach((record, index) => {
      const date = new Date(record.uploaded_at).toLocaleDateString(locale);

      drawText(
        t("dashboard.pdf.recordLine", {
          index: index + 1,
          date,
        }),
        11,
        true
      );

      const probs = record.diagnosis_probabilities;

      if (probs) {
        Object.entries(probs).forEach(([key, val]) => {
          if (val != null) {
            drawText(
              `• ${key}: ${(val * 100).toFixed(1)}%`,
              11,
              false,
              15
            );
          }
        });
      } else {
        drawText(
          t("dashboard.pdf.noRecordData"),
          11,
          false,
          15
        );
      }

      y -= 6;
      addPageIfNeeded();
    });
  }

  y -= 10;
  drawText(t("dashboard.pdf.summaryTitle"), 14, true);

  const avgNormal =
    records.length > 0
      ? records.reduce(
          (s, r) =>
            s + (r.diagnosis_probabilities?.normal ?? 0),
          0
        ) / records.length
      : 0;

  drawText(
    t("dashboard.pdf.avgNormal", {
      value: (avgNormal * 100).toFixed(1),
    }),
    12,
    false,
    10
  );

  // —————————————
  // Generate bytes
  const bytes = await pdfDoc.save();

  // Make blob
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  // Format filename
  const reportDate = new Date()
    .toLocaleDateString(locale)
    .replace(/\./g, "-");
  const filename = `${t("dashboard.pdf.filename", {
    name: child.name,
    date: reportDate,
  })}.pdf`;

  // Create link and force download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // Cleanup URL object
  URL.revokeObjectURL(link.href);
};


  if (loading) return <div className="p-6">{t("common.loading")}</div>;
  if (!child) return <div className="p-6">{t("dashboard.missingChild")}</div>;

  // ------ UI Components ------
  const Header = () => (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold">
        {child.name}
        {child.age != null && `, ${child.age}`}
        {" — "}
        <span className="text-yellow-700">
          {t("child.status.activeTreatment")}
        </span>
      </h1>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> {t("common.back")}
        </Button>

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
      </Tabs>
    </div>
  );
}
