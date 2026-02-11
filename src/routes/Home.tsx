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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

import { useTranslation } from "react-i18next";

export default function Home() {
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const { t, i18n } = useTranslation();

  useEffect(() => {
    setChildrenLoading(true);
    fetchChildren()
      .then(setChildren)
      .finally(() => setChildrenLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded" />
            <Skeleton className="w-32 h-8" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-32 h-10 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {[...Array(8)].map((_, i) => (
            <Card
              key={i}
              className="bg-white border border-yellow-200 shadow-md"
            >
              <CardContent className="flex flex-col items-center p-4 space-y-3">
                <Skeleton className="w-24 h-24 rounded-full bg-yellow-200/50" />
                <Skeleton className="h-5 w-3/4 bg-yellow-200/50" />
                <Skeleton className="h-4 w-1/2 bg-yellow-200/50" />
                <Skeleton className="h-3 w-2/3 bg-yellow-200/50" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img
            src="/logo_insoz.png"
            alt="InSoz.ai logo"
            className="w-10 h-10"
          />
          <h1 className="text-2xl font-bold text-yellow-400">
            InSoz.ai
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <div className="flex border border-yellow-400 rounded-xl overflow-hidden">
            <button
              onClick={() => i18n.changeLanguage("ru")}
              className={`px-3 py-1 text-sm font-medium transition ${i18n.language === "ru"
                ? "bg-yellow-500 text-black"
                : "text-yellow-500 hover:bg-yellow-600 hover:text-black"
                }`}
            >
              RU
            </button>
            <button
              onClick={() => i18n.changeLanguage("en")}
              className={`px-3 py-1 text-sm font-medium transition ${i18n.language === "en"
                ? "bg-yellow-500 text-black"
                : "text-yellow-500 hover:bg-yellow-600 hover:text-black"
                }`}
            >
              EN
            </button>
            <button
              onClick={() => i18n.changeLanguage("kk")}
              className={`px-3 py-1 text-sm font-medium transition ${i18n.language === "kk"
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
                  onClick={
                    () => {
                      logout();
                      navigate("/login");
                    }
                  }
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
        {childrenLoading ? (
          <>
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="bg-white border border-yellow-200 shadow-md"
              >
                <CardContent className="flex flex-col items-center p-4 space-y-3">
                  <Skeleton className="w-24 h-24 rounded-full bg-yellow-200/50" />
                  <Skeleton className="h-5 w-3/4 bg-yellow-200/50" />
                  <Skeleton className="h-4 w-1/2 bg-yellow-200/50" />
                  <Skeleton className="h-3 w-2/3 bg-yellow-200/50" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {children.map((child) => (
              <ChildCard key={child.uuid} child={child} />
            ))}
            <AddChildDialog
              onAdd={(newChild) => setChildren((prev) => [...prev, newChild])}
            />
          </>
        )}
      </div>
    </div>
  );
}
