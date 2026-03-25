import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import BreedSelect, { OTHER_VALUE } from '../components/BreedSelect';
import { useAuthStore } from '../store/authStore';
import { fetchMe, updateMe } from '../api/users';
import { fetchUserListings, updateListingStatus, createListing } from '../api/listings';
import { fetchUserPosts } from '../api/posts';
import { fetchCities, fetchBreeds } from '../api/dictionaries';
import { getErrorMessage } from '../utils/error';
import { formatDate, formatPrice } from '../utils/format';

export default function Dashboard() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cities, setCities] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [breedValue, setBreedValue] = useState('');
  const [customBreed, setCustomBreed] = useState('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [me, listingsData, postsData, citiesData, breedsData] = await Promise.all([
        fetchMe(),
        fetchUserListings(user.id),
        fetchUserPosts(user.id),
        fetchCities(),
        fetchBreeds(),
      ]);
      updateUser(me);
      setListings(listingsData);
      setPosts(postsData.content || []);
      setCities(citiesData);
      setBreeds(breedsData);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось загрузить профиль'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      avatarUrl: form.avatarUrl.value.trim(),
      contactInfo: form.contactInfo.value.trim(),
    };

    try {
      const data = await updateMe(payload);
      updateUser(data);
      toast.success('Профиль обновлен');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось обновить профиль'));
    }
  };

  const handleStatusChange = async (listingId, status) => {
    try {
      await updateListingStatus(listingId, status);
      toast.success('Статус обновлен');
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось обновить статус'));
    }
  };

  const handleCreateListing = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    const data = {
      name: form.name.value.trim(),
      age: form.age.value ? Number(form.age.value) : null,
      gender: form.gender.value || null,
      color: form.color.value.trim() || null,
      weight: form.weight.value ? Number(form.weight.value) : null,
      description: form.description.value.trim() || null,
      cityId: form.cityId.value ? Number(form.cityId.value) : null,
      priceType: form.priceType.value || null,
      priceValue: form.priceValue.value ? Number(form.priceValue.value) : null,
      hasDocs: form.hasDocs.checked,
      vaccinated: form.vaccinated.checked,
    };

    if (breedValue === OTHER_VALUE) {
      data.breedName = customBreed.trim() || null;
    } else if (breedValue) {
      data.breedId = Number(breedValue);
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const files = form.photos.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => formData.append('photos', file));
    }

    try {
      await createListing(formData);
      toast.success('Объявление создано');
      setOpenModal(false);
      setBreedValue('');
      setCustomBreed('');
      form.reset();
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось создать объявление'));
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Личный кабинет</h1>
            <p className="mt-2 text-sm text-muted">Управляйте профилем и объявлениями</p>
          </div>
          <Button onClick={() => setOpenModal(true)}>Создать объявление</Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Профиль</h2>
          {loading ? (
            <p className="mt-4 text-sm text-muted">Загрузка...</p>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleProfileUpdate}>
              <Input name="name" label="Имя" defaultValue={user?.name || ''} />
              <Input name="avatarUrl" label="Ссылка на аватар" defaultValue={user?.avatarUrl || ''} />
              <Input name="contactInfo" label="Контакты" defaultValue={user?.contactInfo || ''} />
              <Button type="submit">Сохранить</Button>
            </form>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('listings')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === 'listings' ? 'bg-accent text-white' : 'bg-white/70 text-muted'
              }`}
            >
              Мои объявления
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeTab === 'posts' ? 'bg-accent text-white' : 'bg-white/70 text-muted'
              }`}
            >
              Мои посты
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {activeTab === 'listings' ? (
              listings.length === 0 ? (
                <p className="text-sm text-muted">Объявлений пока нет.</p>
              ) : (
                listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-white/70 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{listing.name}</p>
                        <p className="text-xs text-muted">
                          {listing.breedName || 'Порода не указана'} • {listing.cityName || 'Город'}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {listing.status === 'ACTIVE' ? 'Активно' : 'Неактивно'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{formatPrice(listing.priceType, listing.priceValue)}</span>
                      <span>{formatDate(listing.createdAt)}</span>
                    </div>
                    <div className="flex gap-3">
                      {listing.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(listing.id, 'INACTIVE')}
                        >
                          Деактивировать
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStatusChange(listing.id, 'ACTIVE')}
                        >
                          Активировать
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )
            ) : posts.length === 0 ? (
              <p className="text-sm text-muted">Постов пока нет.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-border bg-white/70 p-4">
                  <p className="text-sm text-ink">{post.text}</p>
                  <p className="mt-2 text-xs text-muted">{formatDate(post.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Modal title="Новое объявление" isOpen={openModal} onClose={() => setOpenModal(false)}>
        <form className="space-y-4" onSubmit={handleCreateListing}>
          <Input name="name" label="Имя питомца" placeholder="Котофей" required />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-ink">Город</span>
              <select name="cityId" className="rounded-2xl border border-border bg-white px-3 py-2">
                <option value="">Выберите город</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
            <BreedSelect
              label="Порода"
              breeds={breeds}
              value={breedValue}
              customValue={customBreed}
              onChange={setBreedValue}
              onCustomChange={setCustomBreed}
              placeholder="Выберите породу"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="age" label="Возраст" type="number" min="0" />
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-ink">Пол</span>
              <select name="gender" className="rounded-2xl border border-border bg-white px-3 py-2">
                <option value="">Не указан</option>
                <option value="MALE">Самец</option>
                <option value="FEMALE">Самка</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="color" label="Окрас" />
            <Input name="weight" label="Вес (кг)" type="number" step="0.1" />
          </div>
          <textarea
            name="description"
            rows="4"
            placeholder="Описание"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-ink">Тип цены</span>
              <select name="priceType" className="rounded-2xl border border-border bg-white px-3 py-2">
                <option value="">Не указано</option>
                <option value="NEGOTIABLE">Договорная</option>
                <option value="FIXED">Фиксированная</option>
              </select>
            </label>
            <Input name="priceValue" label="Цена (если фикс.)" type="number" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input name="hasDocs" type="checkbox" />
              Документы
            </label>
            <label className="flex items-center gap-2">
              <input name="vaccinated" type="checkbox" />
              Вакцинация
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-ink">Фото (до 4)</span>
            <input name="photos" type="file" accept="image/*" multiple />
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
              Отмена
            </Button>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
