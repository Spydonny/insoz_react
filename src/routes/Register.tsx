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
  const { t } = useTranslation();

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
