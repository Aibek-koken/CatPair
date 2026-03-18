import { formatDate } from '../utils/format';

const iconBase = 'h-4 w-4';

function LikeIcon() {
  return (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M7.5 21h9.75a3.75 3.75 0 003.75-3.75V8.25a3.75 3.75 0 00-3.75-3.75H14.25a.75.75 0 01-.75-.75V3a2.25 2.25 0 00-4.5 0v6.75a.75.75 0 01-.75.75H4.5A2.25 2.25 0 002.25 12v7.5A1.5 1.5 0 003.75 21H7.5z"
      />
    </svg>
  );
}

function DislikeIcon() {
  return (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M7.5 3h9.75A3.75 3.75 0 0121 6.75v7.5A3.75 3.75 0 0117.25 18H14.25a.75.75 0 00-.75.75V21a2.25 2.25 0 01-4.5 0v-6.75a.75.75 0 00-.75-.75H4.5A2.25 2.25 0 012.25 11.25v-6A1.5 1.5 0 013.75 3H7.5z"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M2.25 12.75A4.5 4.5 0 006.75 17.25h6.82l3.68 3.68a.75.75 0 001.28-.53V17.25A4.5 4.5 0 0021.75 12.75v-6A4.5 4.5 0 0017.25 2.25H6.75A4.5 4.5 0 002.25 6.75v6z"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg
      className={iconBase}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M6.75 3A2.25 2.25 0 004.5 5.25v15l7.5-3.75 7.5 3.75v-15A2.25 2.25 0 0017.25 3H6.75z"
      />
    </svg>
  );
}

export default function PostCard({
  post,
  interaction,
  onReact,
  onToggleSaved,
  onOpenComments,
  canInteract = true,
  onRequireAuth,
}) {
  const likes = interaction?.likes ?? 0;
  const dislikes = interaction?.dislikes ?? 0;
  const comments = Array.isArray(interaction?.comments) ? interaction.comments : [];
  const reaction = interaction?.reaction ?? null;
  const saved = Boolean(interaction?.saved);
  const isGuest = !canInteract;
  const guestTitle = 'Войдите, чтобы ставить реакции и сохранять посты';

  const guardAction = (action) => {
    if (isGuest) {
      onRequireAuth?.();
      return;
    }
    action?.();
  };

  return (
    <article className="rounded-3xl border border-border bg-white/80 p-5 shadow-soft">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{post.userName || 'Пользователь'}</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink">{post.text}</p>
      {post.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <img src={post.imageUrl} alt="Пост" className="h-64 w-full object-cover" />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => guardAction(() => onReact?.(post.id, 'like'))}
          aria-pressed={reaction === 'like'}
          aria-disabled={isGuest}
          title={isGuest ? guestTitle : 'Лайк'}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold transition ${
            reaction === 'like'
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border bg-white/80 text-muted hover:bg-black/5'
          } ${isGuest ? 'opacity-60' : ''}`}
        >
          <LikeIcon />
          <span>{likes}</span>
        </button>
        <button
          type="button"
          onClick={() => guardAction(() => onReact?.(post.id, 'dislike'))}
          aria-pressed={reaction === 'dislike'}
          aria-disabled={isGuest}
          title={isGuest ? guestTitle : 'Дизлайк'}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold transition ${
            reaction === 'dislike'
              ? 'border-accent2 bg-accent2/10 text-accent2'
              : 'border-border bg-white/80 text-muted hover:bg-black/5'
          } ${isGuest ? 'opacity-60' : ''}`}
        >
          <DislikeIcon />
          <span>{dislikes}</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenComments?.(post.id)}
          title="Комментарии"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-white/80 px-3 py-1 font-semibold text-muted transition hover:bg-black/5"
        >
          <CommentIcon />
          <span>{comments.length}</span>
        </button>
        <button
          type="button"
          onClick={() => guardAction(() => onToggleSaved?.(post.id))}
          aria-pressed={saved}
          aria-disabled={isGuest}
          title={isGuest ? guestTitle : saved ? 'Сохранено' : 'Сохранить'}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold transition ${
            saved
              ? 'border-ink bg-ink text-white'
              : 'border-border bg-white/80 text-muted hover:bg-black/5'
          } ${isGuest ? 'opacity-60' : ''}`}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>
    </article>
  );
}
