import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import RoundedInput from "@/components/ui/RoundedInput";
import { loginUser } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(form);
      navigate("/");
    } catch {
      alert(t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <div className="flex items-center gap-4 justify-center">
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
          <button
            onClick={() => i18n.changeLanguage("tr")}
            className={`px-3 py-1 text-sm font-medium transition ${i18n.language === "tr"
              ? "bg-yellow-500 text-black"
              : "text-yellow-500 hover:bg-yellow-600 hover:text-black"
              }`}
          >
            TR
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">
        {t("auth.loginTitle")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <RoundedInput
          lbl={t("form.email")}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <RoundedInput
          lbl={t("form.password")}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all"
        >
          {loading ? t("auth.loginSubmitting") : t("auth.loginButton")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        {t("auth.noAccountQuestion")}{" "}
        <Link
          to="/register"
          className="underline text-yellow-600 hover:text-yellow-700"
        >
          {t("auth.registerLink")}
        </Link>
      </p>
    </Container>
  );
}
