import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ListingCard({ listing }) {
  const photo = listing.photoUrls?.[0];
  const imageUrl = photo ? `${API_URL}${photo}` : null;

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-white/80 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 via-white to-accent2/10 text-sm text-muted">
            Фото пока нет
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink">
          {listing.cityName || 'Город не указан'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">{listing.name}</h3>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
            listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {listing.status === 'ACTIVE' ? 'Активно' : 'Неактивно'}
          </span>
        </div>
        <p className="text-sm text-muted">
          {listing.breedName || 'Порода не указана'} • {listing.age ?? '—'} лет
        </p>
        <p className="text-sm font-semibold text-accent">{formatPrice(listing.priceType, listing.priceValue)}</p>
      </div>
    </Link>
  );
}
