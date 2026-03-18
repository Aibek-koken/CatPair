import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createPost, fetchFeed } from '../api/posts';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/error';
import { formatDate } from '../utils/format';

const STORAGE_KEY = 'catpair_community_interactions';

const normalizeInteraction = (value = {}) => ({
  likes: Number.isFinite(value.likes) ? value.likes : 0,
  dislikes: Number.isFinite(value.dislikes) ? value.dislikes : 0,
  reaction: value.reaction === 'like' || value.reaction === 'dislike' ? value.reaction : null,
  comments: Array.isArray(value.comments) ? value.comments : [],
  saved: Boolean(value.saved),
});

const loadInteractions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const persistInteractions = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // ignore storage errors
  }
};

export default function Community() {
  const { token, user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [interactions, setInteractions] = useState(() => loadInteractions());
  const [activeTab, setActiveTab] = useState('new');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [commentPanelPostId, setCommentPanelPostId] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [filters, setFilters] = useState({
    query: '',
    withLikes: false,
    withDislikes: false,
    withComments: false,
  });

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

  useEffect(() => {
    setCommentDraft('');
  }, [commentPanelPostId]);

  const updateInteraction = (postId, updater) => {
    setInteractions((prev) => {
      const current = normalizeInteraction(prev[postId]);
      const next = updater(current);
      const updated = { ...prev, [postId]: next };
      persistInteractions(updated);
      return updated;
    });
  };

  const handleReact = (postId, type) => {
    updateInteraction(postId, (current) => {
      let { likes, dislikes, reaction } = current;
      if (reaction === type) {
        reaction = null;
        if (type === 'like') {
          likes = Math.max(0, likes - 1);
        } else {
          dislikes = Math.max(0, dislikes - 1);
        }
      } else {
        if (reaction === 'like') {
          likes = Math.max(0, likes - 1);
        }
        if (reaction === 'dislike') {
          dislikes = Math.max(0, dislikes - 1);
        }
        reaction = type;
        if (type === 'like') {
          likes += 1;
        } else {
          dislikes += 1;
        }
      }
      return { ...current, likes, dislikes, reaction };
    });
  };

  const handleToggleSaved = (postId) => {
    updateInteraction(postId, (current) => ({ ...current, saved: !current.saved }));
  };

  const handleAddComment = (postId, text, author) => {
    updateInteraction(postId, (current) => {
      const newComment = {
        id: `${postId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        author: author || 'Гость',
        createdAt: new Date().toISOString(),
      };
      return { ...current, comments: [...current.comments, newComment] };
    });
  };

  const handleRequireAuth = () => {
    toast.info(
      'Войдите или зарегистрируйтесь, чтобы ставить лайки, дизлайки, писать комментарии и сохранять посты.'
    );
  };

  const handleOpenComments = (postId) => {
    setCommentPanelPostId(postId);
  };

  const handleCloseComments = () => {
    setCommentPanelPostId(null);
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    if (!commentPanelPostId) return;
    if (!token) {
      handleRequireAuth();
      return;
    }
    const text = commentDraft.trim();
    if (!text) return;
    handleAddComment(commentPanelPostId, text, user?.name);
    setCommentDraft('');
  };

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleFilterReset = () => {
    setFilters({ query: '', withLikes: false, withDislikes: false, withComments: false });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setCommentPanelPostId(null);
  };

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

  const normalizedPosts = posts.map((post) => ({
    post,
    interaction: normalizeInteraction(interactions[post.id]),
  }));

  const activeCommentPost = commentPanelPostId
    ? posts.find((post) => post.id === commentPanelPostId)
    : null;
  const activeCommentInteraction = commentPanelPostId
    ? normalizeInteraction(interactions[commentPanelPostId])
    : null;
  const activeComments = activeCommentInteraction?.comments || [];

  const searchQuery = filters.query.trim().toLowerCase();

  const filteredPosts = normalizedPosts
    .filter(({ post, interaction }) => {
      if (activeTab === 'saved' && !interaction.saved) return false;
      if (filters.withLikes && interaction.likes <= 0) return false;
      if (filters.withDislikes && interaction.dislikes <= 0) return false;
      if (filters.withComments && interaction.comments.length === 0) return false;
      if (!searchQuery) return true;
      const text = `${post.text || ''} ${post.userName || ''}`.toLowerCase();
      return text.includes(searchQuery);
    })
    .sort((a, b) => {
      const aDate = a.post.createdAt ? new Date(a.post.createdAt).getTime() : 0;
      const bDate = b.post.createdAt ? new Date(b.post.createdAt).getTime() : 0;
      if (activeTab === 'old') return aDate - bDate;
      if (activeTab === 'popular') {
        if (b.interaction.likes !== a.interaction.likes) {
          return b.interaction.likes - a.interaction.likes;
        }
        return bDate - aDate;
      }
      return bDate - aDate;
    });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">Сообщество</h1>
        <p className="mt-2 text-sm text-muted">
          Делитесь опытом, новостями и историями о ваших питомцах.
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-white/70 p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'new', label: 'Новые' },
            { id: 'popular', label: 'Популярные' },
            { id: 'old', label: 'Старые' },
            { id: 'saved', label: 'Сохраненные' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'border border-border bg-white/80 text-ink hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Фильтры
          </button>
          <span className="ml-auto rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold text-accent">
            Найдено: {filteredPosts.length}
          </span>
        </div>

        {filtersOpen && (
          <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-white/80 p-4 text-sm">
            <label className="flex flex-col gap-2">
              <span className="font-semibold text-ink">Поиск</span>
              <input
                name="query"
                value={filters.query}
                onChange={handleFilterChange}
                className="rounded-2xl border border-border bg-white px-3 py-2"
                placeholder="Ключевые слова или автор"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.withLikes}
                  onChange={() => toggleFilter('withLikes')}
                />
                Только с лайками
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.withDislikes}
                  onChange={() => toggleFilter('withDislikes')}
                />
                Только с дизлайками
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.withComments}
                  onChange={() => toggleFilter('withComments')}
                />
                Только с комментариями
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" onClick={() => setFiltersOpen(false)}>
                Применить
              </Button>
              <Button variant="outline" size="sm" onClick={handleFilterReset}>
                Сбросить
              </Button>
            </div>
          </div>
        )}
      </section>

      {!token && (
        <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted shadow-soft">
          <p className="text-sm text-muted">
            Войдите или зарегистрируйтесь, чтобы ставить лайки, дизлайки, писать комментарии,
            сохранять посты и публиковать свои истории.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b6665]"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10"
            >
              Регистрация
            </Link>
          </div>
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        {loading ? (
          <div className="text-sm text-muted">Загрузка ленты...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted">
            Пока нет постов по выбранным фильтрам.
          </div>
        ) : (
          filteredPosts.map(({ post, interaction }) => (
            <PostCard
              key={post.id}
              post={post}
              interaction={interaction}
              onReact={handleReact}
              onToggleSaved={handleToggleSaved}
              onOpenComments={handleOpenComments}
              canInteract={Boolean(token)}
              onRequireAuth={handleRequireAuth}
            />
          ))
        )}
      </section>

      {token && (
        <>
          <button
            type="button"
            onClick={handleOpenModal}
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
                onFocus={handleCloseComments}
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

      {commentPanelPostId && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/25"
            role="button"
            tabIndex={0}
            onClick={handleCloseComments}
            onKeyDown={(event) => {
              if (event.key === 'Escape') handleCloseComments();
            }}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Комментарии</h2>
                {activeCommentPost && (
                  <p className="mt-1 text-xs text-muted">
                    {activeCommentPost.userName || 'Пользователь'} ·{' '}
                    {formatDate(activeCommentPost.createdAt)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCloseComments}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:bg-black/5"
              >
                Закрыть
              </button>
            </div>

            {activeCommentPost && (
              <div className="mt-4 rounded-2xl border border-border bg-white/70 p-4 text-sm text-ink">
                {activeCommentPost.text}
              </div>
            )}

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
              {activeComments.length === 0 ? (
                <p className="text-sm text-muted">Пока нет комментариев.</p>
              ) : (
                activeComments.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-white/80 p-3">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>{item.author || 'Пользователь'}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink">{item.text}</p>
                  </div>
                ))
              )}
            </div>

            {token ? (
              <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
                <textarea
                  rows="3"
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Напишите комментарий"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                />
                <Button type="submit">Отправить</Button>
              </form>
            ) : (
              <div className="mt-4 rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                <p>Войдите или зарегистрируйтесь, чтобы оставлять комментарии.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    to="/login"
                    className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b6665]"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10"
                  >
                    Регистрация
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
