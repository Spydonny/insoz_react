import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDashboardData } from "@/hooks/useDashboardData";

import RecordsTab from "@/components/dashboard/RecordsTab";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ProgressTab } from "@/components/dashboard/ProgressTab";
import { ExercisesTab } from "@/components/dashboard/ExercisesTab";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ChildOverviewCard } from "@/components/dashboard/ChildOverviewCard";

export default function Dashboard() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [tab, setTab] = useState("overview");

  const {
    child,
    loading,
    records,
    recordsLoading,
    uploading,
    handleUploadRecord,
    handlePlayRecord,
  } = useDashboardData(id);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!child) return <div className="p-6">{t("dashboard.missingChild")}</div>;

  return (
    <div className="min-h-screen bg-white text-yellow-900 p-6">
      <DashboardHeader child={child} records={records} />
      <ChildOverviewCard child={child} />

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
