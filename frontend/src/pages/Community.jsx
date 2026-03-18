import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createPost, fetchFeed } from '../api/posts';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/error';

export default function Community() {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await fetchFeed();
      setPosts(data.content || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось загрузить ленту'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      text: form.text.value.trim(),
      imageUrl: form.imageUrl.value.trim() || null,
    };

    if (!payload.text) {
      toast.error('Добавьте текст поста');
      return;
    }

    try {
      await createPost(payload);
      toast.success('Пост опубликован');
      form.reset();
      loadFeed();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось создать пост'));
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">Community Hub</h1>
        <p className="mt-2 text-sm text-muted">
          Делитесь опытом, новостями и историями о ваших питомцах.
        </p>
      </section>

      {token ? (
        <form
          onSubmit={handleCreate}
          className="rounded-3xl border border-border bg-white/80 p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold">Создать пост</h2>
          <textarea
            name="text"
            rows="4"
            placeholder="Расскажите что-то о вашем питомце..."
            className="mt-4 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <input
            name="imageUrl"
            placeholder="Ссылка на изображение (опционально)"
            className="mt-3 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted">Пока что принимаем URL картинки.</p>
            <Button type="submit">Опубликовать</Button>
          </div>
        </form>
      ) : (
        <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted shadow-soft">
          Войдите, чтобы публиковать посты в комьюнити.
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        {loading ? (
          <div className="text-sm text-muted">Загрузка ленты...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted">
            Пока нет постов.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </div>
  );
}
