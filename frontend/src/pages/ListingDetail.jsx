import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchListing } from '../api/listings';
import { createChat } from '../api/chats';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { useAuthStore } from '../store/authStore';
import { formatDate, formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/error';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchListing(id);
        setListing(data);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Не удалось загрузить объявление'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChat = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const chat = await createChat(listing.id);
      navigate(`/chats?chatId=${chat.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось открыть чат'));
    }
  };

  if (loading) return <Loader label="Загружаем карточку" />;
  if (!listing) return null;

  const photos = listing.photoUrls || [];
  const activePhoto = photos[currentPhoto];
  const imageUrl = activePhoto ? `${API_URL}${activePhoto}` : null;
  const statusLabel = listing.status === 'ACTIVE' ? 'Активно' : 'Неактивно';
  const genderLabel = listing.gender === 'MALE' ? 'Самец' : listing.gender === 'FEMALE' ? 'Самка' : 'Не указан';

  const isOwn = currentUser && listing.ownerId === currentUser.id;

  const ownerAvatarUrl = listing.ownerAvatarUrl
    ? (listing.ownerAvatarUrl.startsWith('http') ? listing.ownerAvatarUrl : `${API_URL}${listing.ownerAvatarUrl}`)
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left column: photos + description */}
      <div className="space-y-4">
        <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
          <div className="overflow-hidden rounded-2xl border border-border">
            {imageUrl ? (
              <img src={imageUrl} alt={listing.name} className="h-80 w-full object-cover" />
            ) : (
              <div className="flex h-80 items-center justify-center bg-gradient-to-br from-accent/10 via-white to-accent2/10 text-sm text-muted">
                Фото пока нет
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  onClick={() => setCurrentPhoto(index)}
                  className={`h-20 w-24 overflow-hidden rounded-2xl border ${
                    currentPhoto === index ? 'border-accent' : 'border-border'
                  }`}
                >
                  <img src={`${API_URL}${photo}`} alt="Миниатюра" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Описание</h2>
          <p className="mt-3 text-sm text-muted">{listing.description || 'Описание не заполнено.'}</p>
        </div>
      </div>

      {/* Right column: info + seller + chat */}
      <div className="space-y-4">
        {/* Pet details card */}
        <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{listing.name}</h1>
              <p className="mt-1 text-sm text-muted">{listing.breedName || 'Порода не указана'}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {statusLabel}
            </span>
          </div>
          <div className="mt-6 grid gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Город</span>
              <span className="font-semibold">{listing.cityName || 'Не указан'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Возраст</span>
              <span className="font-semibold">{listing.age ?? '—'} лет</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Пол</span>
              <span className="font-semibold">{genderLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Вес</span>
              <span className="font-semibold">{listing.weight ?? '—'} кг</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Окрас</span>
              <span className="font-semibold">{listing.color || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Документы</span>
              <span className="font-semibold">{listing.hasDocs ? 'Есть' : 'Нет'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Вакцинация</span>
              <span className="font-semibold">{listing.vaccinated ? 'Да' : 'Нет'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Цена</span>
              <span className="font-semibold text-accent">{formatPrice(listing.priceType, listing.priceValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Создано</span>
              <span className="font-semibold">{formatDate(listing.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Seller card */}
        <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Продавец</h2>
          <div className="flex items-center gap-4">
            {ownerAvatarUrl ? (
              <img
                src={ownerAvatarUrl}
                alt={listing.ownerName}
                className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
                {listing.ownerName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-ink">{listing.ownerName || 'Без имени'}</p>
              {listing.ownerCreatedAt && (
                <p className="mt-0.5 text-xs text-muted">
                  На платформе с {formatDate(listing.ownerCreatedAt)}
                </p>
              )}
            </div>
          </div>

          {!isOwn && (
            <Button className="mt-5 w-full" onClick={handleChat}>
              Написать продавцу
            </Button>
          )}
          {isOwn && (
            <p className="mt-5 rounded-2xl bg-accent/5 px-4 py-3 text-center text-sm text-accent">
              Это ваше объявление
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-white/80 p-6 text-sm text-muted shadow-soft">
          Для общения создается отдельный чат, привязанный к объявлению.
        </div>
      </div>
    </div>
  );
}
