export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-white/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">CatPair</p>
          <p className="text-xs text-muted">MVP для поиска партнеров по вязке</p>
        </div>
        <div className="text-xs text-muted">
          Сделано для комьюнити владельцев кошек Казахстана
        </div>
      </div>
    </footer>
  );
}
