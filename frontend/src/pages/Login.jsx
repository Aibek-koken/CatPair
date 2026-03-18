import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import Input from '../components/Input';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/error';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      email: form.email.value.trim(),
      password: form.password.value,
    };

    setLoading(true);
    try {
      const data = await login(payload);
      setAuth(data.token, data.user);
      toast.success('Вы вошли в систему');
      navigate('/');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось войти'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">С возвращением в CatPair</h1>
        <p className="mt-3 text-sm text-muted">
          Войдите, чтобы управлять объявлениями, писать в чаты и делиться новостями.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input name="email" type="email" label="Email" placeholder="you@example.com" required />
          <Input name="password" type="password" label="Пароль" placeholder="••••••" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-semibold text-accent">
            Зарегистрироваться
          </Link>
        </p>
      </div>
      <div className="hidden flex-col justify-between rounded-3xl border border-border bg-gradient-to-br from-accent/10 via-white to-accent2/10 p-8 md:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">CatPair Insight</p>
          <h2 className="mt-3 text-2xl font-semibold">Найди идеальную пару для кошки</h2>
          <p className="mt-4 text-sm text-muted">
            Собранные анкеты, честные описания и быстрый доступ к владельцам.
          </p>
        </div>
        <div className="rounded-3xl bg-white/80 p-5 shadow-soft">
          <p className="text-sm font-semibold">Совет</p>
          <p className="mt-2 text-sm text-muted">
            Заполните профиль, чтобы получать больше откликов от владельцев.
          </p>
        </div>
      </div>
    </div>
  );
}
