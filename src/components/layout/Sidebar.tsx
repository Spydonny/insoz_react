import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { FiUsers, FiRss, FiUser } from "react-icons/fi";
import { IconType } from "react-icons";

interface NavItem {
  icon: IconType;
  labelKey: string;
  labelFallback: string;
  path: string;
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: FiUsers,
    labelKey: "sidebar.clients",
    labelFallback: "Clients",
    path: "/",
    matchPrefix: "/",
  },
  {
    icon: FiRss,
    labelKey: "sidebar.feed",
    labelFallback: "Feed",
    path: "/network",
    matchPrefix: "/network",
  },
  {
    icon: FiUser,
    labelKey: "sidebar.profile",
    labelFallback: "Profile",
    path: "__profile__",
    matchPrefix: "/network/profile",
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const getPath = (item: NavItem) => {
    if (item.path === "__profile__") {
      return user ? `/network/profile/${user.uuid}` : "/login";
    }
    return item.path;
  };

  const isActive = (item: NavItem) => {
    if (item.matchPrefix === "/") {
      return (
        location.pathname === "/" ||
        location.pathname.startsWith("/dashboard") ||
        location.pathname.startsWith("/exercises")
      );
    }
    if (item.matchPrefix === "/network/profile") {
      return location.pathname.startsWith("/network/profile");
    }
    if (item.matchPrefix === "/network") {
      return (
        location.pathname === "/network" ||
        (location.pathname.startsWith("/network") &&
          !location.pathname.startsWith("/network/profile"))
      );
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-yellow-50 border-r border-yellow-100 flex flex-col z-20">
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 py-5 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <img src="/logo_insoz.png" alt="InSoz.ai" className="w-9 h-9" />
        <span className="text-xl font-bold text-yellow-500">InSoz.ai</span>
      </div>

      <div className="h-px bg-yellow-100 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <button
              key={item.labelKey}
              onClick={() => navigate(getPath(item))}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-yellow-400 text-white shadow-sm"
                  : "text-gray-600 hover:bg-yellow-100 hover:text-yellow-700"
              }`}
            >
              <Icon className="text-lg" />
              <span>{t(item.labelKey, item.labelFallback)}</span>
            </button>
          );
        })}
      </nav>

      {/* User block at bottom */}
      {user && (
        <div className="px-4 py-4 border-t border-yellow-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-sm font-bold text-yellow-800 shrink-0">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg py-1.5 transition-colors"
          >
            {t("auth.logout", "Logout")}
          </button>
        </div>
      )}
    </aside>
  );
}
