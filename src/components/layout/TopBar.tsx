import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const PAGE_TITLES: Record<string, { key: string; fallback: string }> = {
  "/": { key: "sidebar.clients", fallback: "Clients" },
  "/network": { key: "sidebar.feed", fallback: "Feed" },
  "/network/profile": { key: "sidebar.profile", fallback: "Profile" },
};

function getPageTitle(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/exercises")) {
    return PAGE_TITLES["/"];
  }
  if (pathname.startsWith("/network/profile")) {
    return PAGE_TITLES["/network/profile"];
  }
  if (pathname.startsWith("/network")) {
    return PAGE_TITLES["/network"];
  }
  return { key: "app.name", fallback: "InSoz.ai" };
}

export function TopBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="h-14 border-b border-yellow-100 px-8 flex items-center justify-between bg-white sticky top-0 z-10">
      <h2 className="text-base font-semibold text-gray-700">
        {t(title.key, title.fallback)}
      </h2>
      <LanguageSwitcher />
    </header>
  );
}
