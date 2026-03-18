export default function Footer() {
  return (
    <div className="mt-20">
      <footer className="border-t border-border bg-white/30">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold">Отзывы</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs text-muted shadow-soft">
                <p className="text-sm font-semibold text-ink">Алина • ★★★★★</p>
                <p className="mt-2">«Нашли пару за неделю, все прозрачно и удобно.»</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs text-muted shadow-soft">
                <p className="text-sm font-semibold text-ink">Дамир • ★★★★☆</p>
                <p className="mt-2">«Понравились фильтры и быстрый чат с владельцами.»</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs text-muted shadow-soft">
                <p className="text-sm font-semibold text-ink">Айгуль • ★★★★★</p>
                <p className="mt-2">«Отличная платформа, спасибо за поддержку.»</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs text-muted shadow-soft">
                <p className="text-sm font-semibold text-ink">Ерлан • ★★★☆☆</p>
                <p className="mt-2">«Всё понятно, хотелось бы больше пород в справочнике.»</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs text-muted shadow-soft">
                <p className="text-sm font-semibold text-ink">Мария • ★★★★★</p>
                <p className="mt-2">«Удобно и быстро, нашли владельцев в нашем городе.»</p>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4 text-xs text-muted shadow-soft">
                <p className="text-sm font-semibold text-ink">Тимур • ★★★★☆</p>
                <p className="mt-2">«Интерфейс аккуратный, всё работает без сбоев.»</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <footer className="border-t border-border bg-white/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <p className="text-sm font-semibold">CatPair</p>
              <p className="mt-2 text-xs text-muted">
                Платформа для поиска партнеров по вязке и общения владельцев кошек.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">О компании</p>
              <p className="mt-2 text-xs text-muted">
                Мы помогаем находить надежных партнеров, проверять анкеты и договариваться напрямую.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">Контакты</p>
              <p className="mt-2 text-xs text-muted">Телефон: +7 (700) 000-00-00</p>
              <p className="text-xs text-muted">Эл. почта: поддержка@catpair.kz</p>
              <p className="text-xs text-muted">Адрес: г. Алматы, пр. Абая, 12</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
