import { formatDate } from '../utils/format';

function getPartnerName(chat, currentUserId) {
  return String(chat.initiatorId) === String(currentUserId)
    ? (chat.ownerName || 'Пользователь')
    : (chat.initiatorName || 'Пользователь');
}

function AvatarCircle({ name }) {
  const letter = (name || '?')[0].toUpperCase();
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
      {letter}
    </span>
  );
}

export default function ChatList({ chats, selectedId, unreadIds = new Set(), currentUserId, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      {chats.map((chat) => {
        const isSelected = selectedId === chat.id;
        const isUnread = unreadIds.has(chat.id);
        const partnerName = getPartnerName(chat, currentUserId);

        return (
          <button
            key={chat.id}
            type="button"
            onClick={() => onSelect(chat)}
            className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
              isSelected
                ? 'border-accent bg-accent/10'
                : 'border-border bg-white/70 hover:border-accent/40 hover:bg-white/90'
            }`}
          >
            {/* Avatar */}
            <AvatarCircle name={partnerName} />

            {/* Text content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`truncate text-sm leading-tight ${
                    isUnread ? 'font-bold text-ink' : 'font-semibold text-ink/80'
                  }`}
                >
                  {partnerName}
                </span>
                {chat.lastMessageAt && (
                  <span className="shrink-0 text-[10px] text-muted">
                    {formatDate(chat.lastMessageAt)}
                  </span>
                )}
              </div>

              {/* Last message preview */}
              {chat.lastMessageText ? (
                <p
                  className={`mt-1 truncate text-xs ${
                    isUnread ? 'font-semibold text-ink' : 'text-muted'
                  }`}
                >
                  {chat.lastMessageText}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted/60 italic">Нет сообщений</p>
              )}
            </div>

            {/* Unread indicator dot */}
            {isUnread && (
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Новое сообщение" />
            )}
          </button>
        );
      })}
    </div>
  );
}
