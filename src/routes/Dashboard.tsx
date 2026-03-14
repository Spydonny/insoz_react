import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ragTherapyAnswer } from "@/lib/api";

import RecordsTab from "@/components/dashboard/RecordsTab";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ProgressTab } from "@/components/dashboard/ProgressTab";
import { ExercisesTab } from "@/components/dashboard/ExercisesTab";
import { PhonemesTab } from "@/components/dashboard/PhonemesTab";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ChildOverviewCard } from "@/components/dashboard/ChildOverviewCard";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export default function Dashboard() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [tab, setTab] = useState("overview");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const {
    child,
    loading,
    records,
    recordsLoading,
    uploading,
    handleUploadRecord,
    handlePlayRecord,
  } = useDashboardData(id);

  const handleSendChat = async () => {
    if (!id || !chatInput.trim()) return;
    const question = chatInput.trim();

    const nextId = chatMessages.length
      ? chatMessages[chatMessages.length - 1].id + 1
      : 1;

    setChatMessages((prev) => [
      ...prev,
      { id: nextId, role: "user", text: question },
    ]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await ragTherapyAnswer({
        child_uuid: id,
        question,
        k_total: 4,
        include_context: false,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: nextId + 1,
          role: "assistant",
          text: response.answer,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: nextId + 1,
          role: "assistant",
          text:
            err?.message ?? t("dashboard.assistant.error"),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!child) return <div className="p-6">{t("dashboard.missingChild")}</div>;

  return (
    <div className="min-h-screen bg-white text-yellow-900 p-6 flex gap-4">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <DashboardHeader
            child={child}
            records={records}
            onToggleChat={() => setChatOpen((prev) => !prev)}
            chatOpen={chatOpen}
          />
        </div>

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
            <TabsTrigger value="phonemes">
              {t("dashboard.tabs.phonemes")}
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

          <TabsContent value="phonemes">
            <PhonemesTab childId={id} />
          </TabsContent>
        </Tabs>
      </div>

      {chatOpen && (
        <aside className="hidden lg:flex w-96 flex-col border-l border-yellow-200 pl-4 h-[calc(100vh-3rem)] sticky top-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-yellow-900">
              {t("dashboard.assistant.title")}
            </h2>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="text-xs text-yellow-700 hover:underline"
            >
              {t("dashboard.assistant.close")}
            </button>
          </div>

          <div className="flex-1 min-h-0 rounded-xl border border-yellow-100 bg-yellow-50/40 p-3 overflow-y-auto space-y-2 text-sm">
            {chatMessages.length === 0 && (
              <p className="text-yellow-700">
                {t("dashboard.assistant.empty")}
              </p>
            )}

            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg px-3 py-2 whitespace-pre-wrap ${m.role === "user"
                  ? "bg-yellow-500 text-black self-end ml-8"
                  : "bg-white text-yellow-900 mr-8 border border-yellow-100"
                  }`}
              >
                {m.text}
              </div>
            ))}

            {chatLoading && (
              <p className="text-xs text-yellow-700">
                {t("dashboard.assistant.thinking")}
              </p>
            )}
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatLoading) {
                handleSendChat();
              }
            }}
          >
            <textarea
              className="flex-1 resize-none rounded-xl border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={2}
              placeholder={t("dashboard.assistant.placeholder")}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="self-end px-3 py-2 rounded-xl bg-yellow-500 text-black text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-yellow-600"
            >
              {t("records.record")}
            </button>
          </form>
        </aside>
      )}

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 lg:hidden px-4 py-2 rounded-full shadow-md bg-yellow-500 text-black text-sm font-semibold"
      >
        {chatOpen
          ? t("dashboard.assistant.mobileClose")
          : t("dashboard.assistant.mobileOpen")}
      </button>
    </div>
  );
}
