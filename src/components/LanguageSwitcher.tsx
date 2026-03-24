import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const getButtonClass = (lang: string) =>
        `px-3 py-1 text-sm font-medium transition ${i18n.language === lang
            ? "bg-yellow-500 text-black"
            : "text-yellow-500 hover:bg-yellow-600 hover:text-black"
        }`;

    return (
        <div className="flex h-10 items-stretch border border-yellow-400 rounded-xl overflow-hidden">
            <button onClick={() => handleLanguageChange("ru")} className={getButtonClass("ru")}>
                RU
            </button>
            <button onClick={() => handleLanguageChange("en")} className={getButtonClass("en")}>
                EN
            </button>
            <button onClick={() => handleLanguageChange("kk")} className={getButtonClass("kk")}>
                KZ
            </button>
            <button onClick={() => handleLanguageChange("tr")} className={getButtonClass("tr")}>
                TR
            </button>
        </div>
    );
}
