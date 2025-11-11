import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import RoundedInput from "@/components/ui/RoundedInput";
import { registerUser, loginUser } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      await loginUser({ email: form.username, password: form.password });
      navigate("/");
    } catch (err) {
      alert("Ошибка регистрации или сервер недоступен");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <h2 className="text-2xl font-bold text-center mb-6">Регистрация</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <RoundedInput
          lbl="Полное имя"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <RoundedInput
          lbl="Email"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          type="email"
        />
        <RoundedInput
          lbl="Пароль"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          type="password"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all"
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Уже есть аккаунт?{" "}
        <Link
          to="/login"
          className="underline text-yellow-600 hover:text-yellow-700"
        >
          Войти
        </Link>
      </p>
    </Container>
  );
}
