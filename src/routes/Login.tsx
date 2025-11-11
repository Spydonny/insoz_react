import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import RoundedInput from "@/components/ui/RoundedInput";
import { loginUser } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(form);
      navigate("/");
    } catch {
      alert("Ошибка входа или сервер недоступен");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <h2 className="text-2xl font-bold text-center mb-6">Вход</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <RoundedInput
          lbl="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <RoundedInput
          lbl="Пароль"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all"
        >
          {loading ? "Входим..." : "Войти"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Нет аккаунта?{" "}
        <Link
          to="/register"
          className="underline text-yellow-600 hover:text-yellow-700"
        >
          Зарегистрироваться
        </Link>
      </p>
    </Container>
  );
}
