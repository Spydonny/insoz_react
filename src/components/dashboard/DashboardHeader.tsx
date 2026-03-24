import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LuArrowLeft as ArrowLeft, LuPencil as Edit, LuDownload as Download } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { Child } from "@/types/child";
import { RecordItem } from "@/lib/api";
import { generateAndDownloadTherapyReport } from "@/lib/pdfReport";

interface Props {
    child: Child;
    records: RecordItem[];
    onToggleChat?: () => void;
    chatOpen?: boolean;
}

export function DashboardHeader({ child, records, onToggleChat, chatOpen }: Props) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleDownloadPDF = async () => {
        await generateAndDownloadTherapyReport(child, records, i18n.language, i18n.resolvedLanguage);
    };

    return (
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
            <div className="flex flex-wrap gap-2 items-center">
                {onToggleChat && (
                    <Button
                        variant="outline"
                        className="border-yellow-300 text-yellow-800"
                        onClick={onToggleChat}
                    >
                        {chatOpen
                            ? t("dashboard.assistant.hide")
                            : t("dashboard.assistant.open")}
                    </Button>
                )}

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
}
