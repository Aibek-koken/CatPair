import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

const API_URL = import.meta.env.VITE_API_URL ?? '';

const GENDER_LABEL = { MALE: '♂ Самец', FEMALE: '♀ Самка' };

function HealthBadge({ children, color }) {
  const palettes = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${palettes[color]}`}>
      {children}
    </span>
  );
}

export default function ListingCard({ listing }) {
  const photo = listing.photoUrls?.[0];
  const imageUrl = photo ? `${API_URL}${photo}` : null;

  const hasHealthInfo = listing.vaccinated || listing.hasDocs;
  const description = listing.description?.trim();

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-white/80 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
    >
      {/* Photo */}
      <div className="relative h-48 shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={listing.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 via-white to-accent2/10 text-sm text-muted">
            Фото пока нет
          </div>
        )}
        {/* City badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur-sm">
          {listing.cityName || 'Город не указан'}
        </span>
        {/* Status badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {listing.status === 'ACTIVE' ? 'Активно' : 'Неактивно'}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-ink leading-snug">{listing.name}</h3>
          <p className="shrink-0 text-sm font-bold text-accent">
            {formatPrice(listing.priceType, listing.priceValue)}
          </p>
        </div>

        {/* Breed + age + gender */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {listing.breedName && <span>{listing.breedName}</span>}
          {listing.age != null && (
            <>
              {listing.breedName && <span className="text-border">·</span>}
              <span>{listing.age} лет</span>
            </>
          )}
          {listing.gender && GENDER_LABEL[listing.gender] && (
            <>
              {(listing.breedName || listing.age != null) && (
                <span className="text-border">·</span>
              )}
              <span>{GENDER_LABEL[listing.gender]}</span>
            </>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="line-clamp-2 text-xs text-muted leading-relaxed">{description}</p>
        )}

        {/* Health badges */}
        {hasHealthInfo && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {listing.vaccinated && <HealthBadge color="green">Вакцинирован</HealthBadge>}
            {listing.hasDocs && <HealthBadge color="blue">Документы</HealthBadge>}
          </div>
        )}
      </div>
    </Link>
  );
}
