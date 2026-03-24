import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

export function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
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
                <LanguageSwitcher />

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
                                    onClick={handleLogout}
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
            </div>
        </header>
    );
}
