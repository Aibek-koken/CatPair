import { NavLink, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuthStore } from '../store/authStore';

const navClass = ({ isActive }) =>
  `text-sm font-semibold transition ${isActive ? 'text-accent' : 'text-ink/80 hover:text-ink'}`;

export default function Header() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-accent/15 grid place-items-center text-accent font-bold">
            CP
          </div>
          <div>
            <p className="text-lg font-semibold">CatPair</p>
            <p className="text-xs text-muted">Платформа для вязки в Казахстане</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navClass}>
            Каталог
          </NavLink>
          <NavLink to="/community" className={navClass}>
            Сообщество
          </NavLink>
          {token && (
            <>
              <NavLink to="/chats" className={navClass}>
                Чаты
              </NavLink>
              <NavLink to="/dashboard" className={navClass}>
                Профиль
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {token && user ? (
            <>
              <span className="hidden text-sm text-muted md:inline">Привет, {user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Вход
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
