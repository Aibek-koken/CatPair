import { useEffect, useState } from 'react';
import { fetchListings } from '../api/listings';
import { fetchCities } from '../api/dictionaries';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { getErrorMessage } from '../utils/error';
import { toast } from 'react-toastify';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cityId: '',
    breed: '',
    age: '',
  });

  const loadListings = async (params = {}) => {
    setLoading(true);
    try {
      const data = await fetchListings({ status: 'ACTIVE', ...params });
      setListings(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось загрузить объявления'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const citiesData = await fetchCities();
        setCities(citiesData);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Не удалось загрузить справочники'));
      }
    };
    loadFilters();
    loadListings();
  }, []);

  const handleChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleApply = () => {
    const params = {
      cityId: filters.cityId || undefined,
      breed: filters.breed || undefined,
      age: filters.age || undefined,
    };
    loadListings(params);
  };

  const handleReset = () => {
    setFilters({ cityId: '', breed: '', age: '' });
    loadListings();
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Marketplace</p>
            <h1 className="text-3xl font-semibold">Каталог анкет</h1>
            <p className="mt-2 text-sm text-muted">
              Фильтруйте по городу, породе и возрасту, чтобы найти идеальную пару.
            </p>
          </div>
          <div className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent">
            Найдено: {listings.length}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <div className="mt-4 space-y-4 text-sm">
            <label className="flex flex-col gap-2">
              <span className="font-semibold text-ink">Город</span>
              <select
                name="cityId"
                value={filters.cityId}
                onChange={handleChange}
                className="rounded-2xl border border-border bg-white px-3 py-2"
              >
                <option value="">Все города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-semibold text-ink">Порода</span>
              <input
                name="breed"
                value={filters.breed}
                onChange={handleChange}
                className="rounded-2xl border border-border bg-white px-3 py-2"
                placeholder="Например, Британская"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-semibold text-ink">Возраст</span>
              <input
                name="age"
                type="number"
                min="0"
                value={filters.age}
                onChange={handleChange}
                className="rounded-2xl border border-border bg-white px-3 py-2"
                placeholder="Например, 2"
              />
            </label>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={handleApply}>Применить</Button>
            <Button variant="outline" onClick={handleReset}>
              Сбросить
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Loader label="Загружаем объявления" />
          ) : listings.length === 0 ? (
            <div className="rounded-3xl border border-border bg-white/80 p-8 text-center text-sm text-muted">
              Пока нет объявлений по выбранным фильтрам.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
