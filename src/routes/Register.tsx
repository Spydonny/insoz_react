import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import RoundedInput from "@/components/ui/RoundedInput";
import { registerUser, loginUser } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      await loginUser({ email: form.username, password: form.password });
      navigate("/");
    } catch (err) {
      alert(t("auth.registerError"));
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
        {t("auth.registerTitle")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <RoundedInput
          lbl={t("form.fullName")}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <RoundedInput
          lbl={t("form.email")}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          type="email"
        />
        <RoundedInput
          lbl={t("form.password")}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          type="password"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all"
        >
          {loading ? t("auth.registerSubmitting") : t("auth.registerButton")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        {t("auth.haveAccountQuestion")}{" "}
        <Link
          to="/login"
          className="underline text-yellow-600 hover:text-yellow-700"
        >
          {t("auth.loginButton")}
        </Link>
      </p>
    </Container>
  );
}
