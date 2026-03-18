import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import Input from '../components/Input';
import { register } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/error';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
    };

    setLoading(true);
    try {
      const data = await register(payload);
      setAuth(data.token, data.user);
      toast.success('Аккаунт создан');
      navigate('/');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось зарегистрироваться'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
      <div className="hidden flex-col justify-between rounded-3xl border border-border bg-gradient-to-br from-accent2/10 via-white to-accent/10 p-8 md:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">CatPair Start</p>
          <h2 className="mt-3 text-2xl font-semibold">Создайте профиль за минуту</h2>
          <p className="mt-4 text-sm text-muted">
            Получите доступ к объявлениям, чату и комьюнити.
          </p>
        </div>
        <div className="rounded-3xl bg-white/80 p-5 shadow-soft">
          <p className="text-sm font-semibold">Подсказка</p>
          <p className="mt-2 text-sm text-muted">
            Используйте актуальный email, чтобы не пропускать сообщения.
          </p>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">Регистрация</h1>
        <p className="mt-3 text-sm text-muted">Начните подбор пары уже сегодня.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input name="name" label="Имя" placeholder="Айбек" required />
          <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
          <Input name="password" type="password" label="Пароль" placeholder="Минимум 6 символов" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Создаем...' : 'Создать аккаунт'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Уже зарегистрированы?{' '}
          <Link to="/login" className="font-semibold text-accent">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
