import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
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
import {
  ArrowLeft,
  Edit,
  Download,
  User,
} from "lucide-react";
import RecordsTab from "@/components/dachboard/RecordsTab";
import "@/fonts/Roboto-Regular-normal";
import { OverviewTab } from "@/components/dachboard/OverviewTab";
import { ProgressTab } from "@/components/dachboard/ProgressTab";

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ===== Состояние =====
  const [child, setChild] = useState<Child | null>(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // для записей
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);


  // ===== Загрузка данных о ребёнке =====
  useEffect(() => {
    if (!id) return;
    const loadChild = async () => {
      try {
        setLoading(true);
        const data = await getChildById(id);
        setChild(data);
      } catch (err) {
        console.error("Ошибка загрузки ребёнка:", err);
      } finally {
        setLoading(false);
      }
    };
    loadChild();
  }, [id]);

  // ===== Загрузка записей =====
  useEffect(() => {
    if (!id) return;
    const loadRecords = async () => {
      try {
        setRecordsLoading(true);
        const data = await fetchChildRecords(id);
        setRecords(data);
      } catch (err) {
        console.error("Ошибка загрузки записей:", err);
      } finally {
        setRecordsLoading(false);
      }
    };
    loadRecords();
  }, [id]);

  // ===== Загрузка аудиофайла =====
  const handleUploadRecord = async (file: File) => {
    if (!id) return;
    try {
      setUploading(true);
      await uploadChildRecord(id, file);
      const updated = await fetchChildRecords(id);
      setRecords(updated);
    } catch (err) {
      console.error("Ошибка загрузки записи:", err);
    } finally {
      setUploading(false);
    }
  };

  // ===== Воспроизведение =====
  const handlePlayRecord = async (path: string) => {
    try {
      await playChildRecord(path);
    } catch (err) {
      console.error("Ошибка воспроизведения:", err);
    }
  };

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (!child) return <div className="p-6">Пациент не найден.</div>;

  // --- Моковые данные для графиков ---
  const progressData = [
    { date: "01.11", normal: 0.2 },
    { date: "03.11", normal: 0.45 },
    { date: "06.11", normal: 0.68 },
    { date: "09.11", normal: 0.82 },
  ];

  // ===== Генерация PDF =====
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Устанавливаем наш шрифт
    doc.setFont("Roboto-Regular", "normal");

    doc.setFontSize(14);
    doc.text("Отчёт о пациенте", 20, 20);

    doc.text(`Имя: ${child.name}`, 20, 35);
    doc.text(`Возраст: ${child.age} лет`, 20, 45);
    doc.text(`Статус: активное лечение`, 20, 55);
    doc.text("Прогресс:", 20, 70);

    progressData.forEach((p, i) => {
      doc.text(`${p.date}: ${(p.normal * 100).toFixed(0)}% норма`, 30, 80 + i * 10);
    });

    doc.save(`Отчёт_${child.name}.pdf`);
  };


  // ===== UI-компоненты =====
  const Header = () => (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold">
        {child.name}, {child.age}{" "}
        {child?.age % 10 === 1 && child?.age % 100 !== 11
          ? "год"
          : child?.age % 10 >= 2 && child?.age % 10 <= 4 &&
            (child?.age % 100 < 10 || child?.age % 100 >= 20)
          ? "года"
          : "лет"}{" "}
        — <span className="text-yellow-700">активное лечение</span>
      </h1>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Назад
        </Button>

        <Button
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
        >
          <Edit className="mr-2 w-4 h-4" /> Редактировать
        </Button>

        <Button
          variant="outline"
          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          onClick={handleDownloadPDF}
        >
          <Download className="mr-2 w-4 h-4" /> Скачать PDF
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
            {child.diagnosis?.join(", ") || "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // ===== Основной возврат =====
  return (
    <div className="min-h-screen bg-white text-yellow-900 p-6">
      <Header />
      <ChildCard />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border border-yellow-200 mb-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="records">Записи</TabsTrigger>
          <TabsTrigger value="progress">Прогресс</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab records={records} child={child!} />
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
      </Tabs>
    </div>
  );
}
