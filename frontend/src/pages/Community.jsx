import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createPost, fetchFeed } from '../api/posts';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/error';

export default function Community() {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

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
      setOpenModal(false);
      loadFeed();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось создать пост'));
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">Сообщество</h1>
        <p className="mt-2 text-sm text-muted">
          Делитесь опытом, новостями и историями о ваших питомцах.
        </p>
      </section>

      {!token && (
        <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted shadow-soft">
          Войдите, чтобы публиковать посты в сообществе.
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

      {token && (
        <>
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-white shadow-soft transition hover:-translate-y-1 hover:bg-[#0b6665]"
            aria-label="Создать пост"
          >
            +
          </button>

          <Modal title="Новый пост" isOpen={openModal} onClose={() => setOpenModal(false)}>
            <form onSubmit={handleCreate} className="space-y-4">
              <textarea
                name="text"
                rows="4"
                placeholder="Расскажите что-то о вашем питомце..."
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
              />
              <input
                name="imageUrl"
                placeholder="Ссылка на изображение (опционально)"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">Пока что принимаем ссылку на картинку.</p>
                <Button type="submit">Опубликовать</Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
