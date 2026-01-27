import { useEffect, useState } from "react";
import { fetchChildren } from "@/lib/api";
import { Child } from "@/types/child";
import { ChildCard } from "@/components/ChildCard";
import { AddChildDialog } from "@/components/AddChildDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { useTranslation } from "react-i18next";

export default function Home() {
  const [children, setChildren] = useState<Child[]>([]);
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchChildren().then(setChildren);
  }, []);

  if (loading) return <div className="p-6">{t("common.loading")}</div>;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-500">InSoz.ai</h1>

        <div className="flex items-center gap-4">
        {/* Language switcher */}
        <div className="flex border border-yellow-400 rounded-xl overflow-hidden">
          <button
            onClick={() => i18n.changeLanguage("ru")}
            className={`px-3 py-1 text-sm font-medium transition ${
              i18n.language === "ru"
                ? "bg-yellow-500 text-black"
                : "text-yellow-500 hover:bg-yellow-600 hover:text-black"
            }`}
          >
            RU
          </button>
          <button
            onClick={() => i18n.changeLanguage("en")}
            className={`px-3 py-1 text-sm font-medium transition ${
              i18n.language === "en"
                ? "bg-yellow-500 text-black"
                : "text-yellow-500 hover:bg-yellow-600 hover:text-black"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage("kk")}
            className={`px-3 py-1 text-sm font-medium transition ${
              i18n.language === "kk"
                ? "bg-yellow-500 text-black"
                : "text-yellow-500 hover:bg-yellow-600 hover:text-black"
            }`}
          >
            KZ
          </button>
        </div>
      </div>


        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Avatar className="cursor-pointer" onClick={user ? undefined : () => navigate("/login")}>
              <AvatarImage src="/user.jpg" alt="User avatar" />
              <AvatarFallback className="bg-yellow-200 text-gray-900">
                {user?.full_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </HoverCardTrigger>

          <HoverCardContent className="w-64">
            {user ? (
              <div className="flex flex-col space-y-2">
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.username}
                </p>
                <div className="border-t my-2" />
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:underline"
                >
                  {t("auth.logout")}
                </button>
              </div>
            ) : (
              <div>
                <p>{t("auth.unauthorized")}</p>
                <button
                  onClick={() => navigate("/login")}
                  className="text-yellow-600 underline"
                >
                  {t("auth.login")}
                </button>
              </div>
            )}
          </HoverCardContent>
        </HoverCard>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
        {children.map((child) => (
          <ChildCard key={child.uuid} child={child} />
        ))}
        <AddChildDialog 
          onAdd={(newChild) => setChildren((prev) => [...prev, newChild])}
        />
      </div>
    </div>
  );
}
