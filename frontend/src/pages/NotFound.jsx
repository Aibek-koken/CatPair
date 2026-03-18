import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-white/70 p-10 text-center shadow-soft">
      <h1 className="text-3xl font-semibold">Страница не найдена</h1>
      <p className="text-sm text-muted">Похоже, вы попали не туда.</p>
      <Link to="/">
        <Button className="mt-2">Вернуться на главную</Button>
      </Link>
    </div>
  );
}
