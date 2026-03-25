import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createPost, fetchFeed } from '../api/posts';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/error';
import { formatDate } from '../utils/format';

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'catpair_community_interactions';

/** Normalise a single comment, handling legacy entries that lack likes data. */
const normalizeComment = (c = {}) => ({
  id: c.id || '',
  text: c.text || '',
  author: c.author || 'Гость',
  createdAt: c.createdAt || new Date().toISOString(),
  likes: Number.isFinite(c.likes) ? c.likes : 0,
  likedBy: Array.isArray(c.likedBy) ? c.likedBy : [],
});

const normalizeInteraction = (value = {}) => ({
  likes: Number.isFinite(value.likes) ? value.likes : 0,
  dislikes: Number.isFinite(value.dislikes) ? value.dislikes : 0,
  reaction: value.reaction === 'like' || value.reaction === 'dislike' ? value.reaction : null,
  comments: Array.isArray(value.comments) ? value.comments.map(normalizeComment) : [],
  saved: Boolean(value.saved),
});

const loadInteractions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const persistInteractions = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function HeartIcon({ filled }) {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
      />
    </svg>
  );
}

// ─── Comment sort options ─────────────────────────────────────────────────────
const COMMENT_SORT_OPTIONS = [
  { id: 'top', label: ' Лучшие' },
  { id: 'new', label: ' Новые'  },
  { id: 'old', label: ' Старые' },
];

// ─── Component ────────────────────────────────────────────────────────────────
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
  // Default sort: 'top' for logged-in users, 'new' for guests
  const [commentSort, setCommentSort] = useState(() => (token ? 'top' : 'new'));
  const [filters, setFilters] = useState({
    query: '',
    withLikes: false,
    withDislikes: false,
    withComments: false,
  });

  // ── Data loading ────────────────────────────────────────────────────────────
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

  useEffect(() => { loadFeed(); }, []);

  // Reset draft, refresh random seed, and apply default sort when panel opens
  useEffect(() => {
    if (commentPanelPostId) {
      setCommentDraft('');
      setCommentSort(token ? 'top' : 'new');
    }
  }, [commentPanelPostId, token]);

  // Body scroll lock
  useEffect(() => {
    if (commentPanelPostId) {
      const w = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${w}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [commentPanelPostId]);

  // ── Interaction helpers ─────────────────────────────────────────────────────
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
    updateInteraction(postId, (cur) => {
      let { likes, dislikes, reaction } = cur;
      if (reaction === type) {
        reaction = null;
        if (type === 'like') likes = Math.max(0, likes - 1);
        else dislikes = Math.max(0, dislikes - 1);
      } else {
        if (reaction === 'like') likes = Math.max(0, likes - 1);
        if (reaction === 'dislike') dislikes = Math.max(0, dislikes - 1);
        reaction = type;
        if (type === 'like') likes += 1;
        else dislikes += 1;
      }
      return { ...cur, likes, dislikes, reaction };
    });
  };

  const handleToggleSaved = (postId) => {
    updateInteraction(postId, (cur) => ({ ...cur, saved: !cur.saved }));
  };

  const handleAddComment = (postId, text, author) => {
    updateInteraction(postId, (cur) => {
      const newComment = normalizeComment({
        id: `${postId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        author: author || 'Гость',
        createdAt: new Date().toISOString(),
      });
      return { ...cur, comments: [...cur.comments, newComment] };
    });
  };

  /** Toggle like on a specific comment. Guests are prompted to log in. */
  const handleLikeComment = (postId, commentId) => {
    if (!token) {
      toast.info('Войдите, чтобы ставить лайки на комментарии.');
      return;
    }
    const userId = String(user.id);
    updateInteraction(postId, (cur) => ({
      ...cur,
      comments: cur.comments.map((c) => {
        if (c.id !== commentId) return c;
        const liked = c.likedBy.includes(userId);
        return {
          ...c,
          likes: liked ? Math.max(0, c.likes - 1) : c.likes + 1,
          likedBy: liked
            ? c.likedBy.filter((id) => id !== userId)
            : [...c.likedBy, userId],
        };
      }),
    }));
  };

  // ── Comment panel data ──────────────────────────────────────────────────────
  const handleRequireAuth = () => {
    toast.info('Войдите или зарегистрируйтесь, чтобы взаимодействовать с постами.');
  };
  const handleOpenComments  = (postId) => setCommentPanelPostId(postId);
  const handleCloseComments = () => setCommentPanelPostId(null);

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    if (!commentPanelPostId) return;
    if (!token) { handleRequireAuth(); return; }
    const text = commentDraft.trim();
    if (!text) return;
    handleAddComment(commentPanelPostId, text, user?.name);
    setCommentDraft('');
  };

  const activeCommentPost = commentPanelPostId
    ? posts.find((p) => p.id === commentPanelPostId)
    : null;

  const activeComments = useMemo(
    () => normalizeInteraction(interactions[commentPanelPostId] ?? {}).comments,
    [interactions, commentPanelPostId]
  );

  /** Comments sorted according to the selected sort mode. */
  const sortedComments = useMemo(() => {
    if (commentSort === 'top') {
      return [...activeComments].sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    if (commentSort === 'old') {
      // oldest first
      return [...activeComments].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    // 'new' — newest first
    return [...activeComments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [activeComments, commentSort]);

  // ── Post feed filters ───────────────────────────────────────────────────────
  const toggleFilter = (key) => setFilters((p) => ({ ...p, [key]: !p[key] }));
  const handleFilterChange = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleFilterReset = () =>
    setFilters({ query: '', withLikes: false, withDislikes: false, withComments: false });

  const handleOpenModal = () => { setOpenModal(true); setCommentPanelPostId(null); };

  const handleCreate = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = { text: form.text.value.trim(), imageUrl: form.imageUrl.value.trim() || null };
    if (!payload.text) { toast.error('Добавьте текст поста'); return; }
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

  const searchQuery = filters.query.trim().toLowerCase();
  const filteredPosts = normalizedPosts
    .filter(({ post, interaction }) => {
      if (activeTab === 'saved' && !interaction.saved) return false;
      if (filters.withLikes && interaction.likes <= 0) return false;
      if (filters.withDislikes && interaction.dislikes <= 0) return false;
      if (filters.withComments && interaction.comments.length === 0) return false;
      if (!searchQuery) return true;
      return `${post.text || ''} ${post.userName || ''}`.toLowerCase().includes(searchQuery);
    })
    .sort((a, b) => {
      const aDate = a.post.createdAt ? new Date(a.post.createdAt).getTime() : 0;
      const bDate = b.post.createdAt ? new Date(b.post.createdAt).getTime() : 0;
      if (activeTab === 'old') return aDate - bDate;
      if (activeTab === 'popular') {
        if (b.interaction.likes !== a.interaction.likes) return b.interaction.likes - a.interaction.likes;
        return bDate - aDate;
      }
      return bDate - aDate;
    });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Page header */}
      <section className="rounded-3xl border border-border bg-white/70 p-8 shadow-soft">
        <h1 className="text-3xl font-semibold">Сообщество</h1>
        <p className="mt-2 text-sm text-muted">Делитесь опытом, новостями и историями о ваших питомцах.</p>
      </section>

      {/* Feed tabs + filters */}
      <section className="rounded-3xl border border-border bg-white/70 p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'new',     label: 'Новые'       },
            { id: 'popular', label: 'Популярные'  },
            { id: 'old',     label: 'Старые'      },
            { id: 'saved',   label: 'Сохраненные' },
          ].map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'border border-border bg-white/80 text-ink hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button type="button" onClick={() => setFiltersOpen((p) => !p)}
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
              <input name="query" value={filters.query} onChange={handleFilterChange}
                className="rounded-2xl border border-border bg-white px-3 py-2"
                placeholder="Ключевые слова или автор"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {[
                { key: 'withLikes',    label: 'Только с лайками'        },
                { key: 'withDislikes', label: 'Только с дизлайками'     },
                { key: 'withComments', label: 'Только с комментариями'  },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={filters[key]} onChange={() => toggleFilter(key)} />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" onClick={() => setFiltersOpen(false)}>Применить</Button>
              <Button variant="outline" size="sm" onClick={handleFilterReset}>Сбросить</Button>
            </div>
          </div>
        )}
      </section>

      {/* Guest banner */}
      {!token && (
        <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted shadow-soft">
          <p>Войдите или зарегистрируйтесь, чтобы ставить лайки, писать комментарии и публиковать посты.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/login" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b6665]">Войти</Link>
            <Link to="/register" className="rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10">Регистрация</Link>
          </div>
        </div>
      )}

      {/* Post grid */}
      <section className="grid gap-5 md:grid-cols-2">
        {loading ? (
          <div className="text-sm text-muted">Загрузка ленты...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white/70 p-6 text-sm text-muted">
            Пока нет постов по выбранным фильтрам.
          </div>
        ) : (
          filteredPosts.map(({ post, interaction }) => (
            <PostCard key={post.id} post={post} interaction={interaction}
              onReact={handleReact} onToggleSaved={handleToggleSaved}
              onOpenComments={handleOpenComments}
              canInteract={Boolean(token)} onRequireAuth={handleRequireAuth}
            />
          ))
        )}
      </section>

      {/* FAB + new-post modal */}
      {token && (
        <>
          <button type="button" onClick={handleOpenModal}
            className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-white shadow-soft transition hover:-translate-y-1 hover:bg-[#0b6665]"
            aria-label="Создать пост"
          >
            +
          </button>
          <Modal title="Новый пост" isOpen={openModal} onClose={() => setOpenModal(false)}>
            <form onSubmit={handleCreate} className="space-y-4">
              <textarea name="text" rows="4" placeholder="Расскажите что-то о вашем питомце..."
                onFocus={handleCloseComments}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
              />
              <input name="imageUrl" placeholder="Ссылка на изображение (опционально)"
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

      {/* ── Comment drawer ───────────────────────────────────────────────────── */}
      {commentPanelPostId &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              role="button"
              aria-label="Закрыть комментарии"
              tabIndex={0}
              onClick={handleCloseComments}
              onKeyDown={(e) => { if (e.key === 'Escape') handleCloseComments(); }}
            />

            {/* Panel */}
            <aside className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-2xl">

              {/* Panel header */}
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Комментарии</h2>
                  {activeCommentPost && (
                    <p className="mt-0.5 text-xs text-muted">
                      {activeCommentPost.userName || 'Пользователь'} · {formatDate(activeCommentPost.createdAt)}
                    </p>
                  )}
                </div>
                <button type="button" onClick={handleCloseComments}
                  className="mt-0.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:bg-black/5"
                >
                  Закрыть
                </button>
              </div>

              {/* Post preview */}
              {activeCommentPost && (
                <div className="mx-6 mt-4 shrink-0 rounded-2xl border border-border bg-base/40 p-4 text-sm text-ink leading-relaxed">
                  {activeCommentPost.text}
                </div>
              )}

              {/* ── Comment sort bar ─────────────────────────────────────────── */}
              <div className="mx-6 mt-4 shrink-0">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-base/30 px-3 py-2">
                  <span className="shrink-0 text-[11px] font-semibold text-muted">Сортировка:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMENT_SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCommentSort(opt.id)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                          commentSort === opt.id
                            ? 'bg-accent text-white'
                            : 'border border-border bg-white/80 text-muted hover:bg-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment list */}
              <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto px-6 pb-2">
                {sortedComments.length === 0 ? (
                  <p className="text-sm text-muted">Пока нет комментариев. Будьте первым!</p>
                ) : (
                  sortedComments.map((item) => {
                    const isLiked = Boolean(token && item.likedBy.includes(String(user?.id)));
                    return (
                      <div key={item.id} className="rounded-2xl border border-border bg-white/80 p-3">
                        {/* Author + date */}
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span className="font-semibold text-ink/70">{item.author || 'Гость'}</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>

                        {/* Text */}
                        <p className="mt-1.5 text-sm text-ink">{item.text}</p>

                        {/* Like button */}
                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleLikeComment(commentPanelPostId, item.id)}
                            title={token ? (isLiked ? 'Убрать лайк' : 'Нравится') : 'Войдите чтобы ставить лайки'}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                              isLiked
                                ? 'border-accent2/50 bg-accent2/10 text-accent2'
                                : 'border-border bg-white/60 text-muted hover:border-accent2/40 hover:bg-accent2/5 hover:text-accent2'
                            } ${!token ? 'cursor-not-allowed opacity-60' : ''}`}
                          >
                            <HeartIcon filled={isLiked} />
                            <span>{item.likes > 0 ? item.likes : ''}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment form / login prompt */}
              <div className="shrink-0 border-t border-border px-6 py-4">
                {token ? (
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <textarea rows="3" value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Напишите комментарий…"
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                    />
                    <Button type="submit">Отправить</Button>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-border bg-base/40 p-4 text-sm text-muted">
                    <p>Войдите или зарегистрируйтесь, чтобы оставлять комментарии.</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link to="/login" onClick={handleCloseComments}
                        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b6665]"
                      >
                        Войти
                      </Link>
                      <Link to="/register" onClick={handleCloseComments}
                        className="rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10"
                      >
                        Регистрация
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
