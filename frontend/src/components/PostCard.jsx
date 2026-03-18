import { formatDate } from '../utils/format';

export default function PostCard({ post }) {
  return (
    <article className="rounded-3xl border border-border bg-white/80 p-5 shadow-soft">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{post.userName || 'Пользователь'}</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink">{post.text}</p>
      {post.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <img src={post.imageUrl} alt="post" className="h-64 w-full object-cover" />
        </div>
      )}
    </article>
  );
}
