import { useEffect, useRef } from 'react';
import Button from './Button';
import { formatDate } from '../utils/format';
import { useAuthStore } from '../store/authStore';

function getPartnerName(chat, currentUserId) {
  if (!chat) return '';
  return String(chat.initiatorId) === String(currentUserId)
    ? (chat.ownerName || 'Пользователь')
    : (chat.initiatorName || 'Пользователь');
}

export default function ChatWindow({ chat, messages, onSend }) {
  const messagesRef = useRef(null);
  const { user } = useAuthStore();

  // Scroll to the bottom of the messages container only — not the whole page.
  // Using container.scrollTop keeps scroll isolated inside the chat panel.
  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-sm text-muted">
        Выберите чат слева
      </div>
    );
  }

  const partnerName = getPartnerName(chat, user?.id);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
            {partnerName[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink leading-tight">{partnerName}</h3>
            <p className="text-[11px] text-muted leading-tight">
              Объявление: {chat.listingName}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 space-y-3 overflow-y-auto py-4 pr-2 scrollbar-hide"
      >
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted">Сообщений пока нет. Напишите первым!</p>
        )}
        {messages.map((message) => {
          const isMine = user && String(message.senderId) === String(user.id);
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl border p-3 shadow-sm ${
                  isMine
                    ? 'rounded-br-md border-accent/30 bg-accent text-white'
                    : 'rounded-bl-md border-border bg-white/80 text-ink'
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-4 text-xs ${
                    isMine ? 'text-white/70' : 'text-muted'
                  }`}
                >
                  <span className="font-semibold">{message.senderName}</span>
                  <span className="shrink-0">{formatDate(message.createdAt)}</span>
                </div>
                <p className={`mt-1.5 text-sm ${isMine ? 'text-white' : 'text-ink'}`}>
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const value = form.message.value.trim();
          if (!value) return;
          onSend(value);
          form.reset();
        }}
        className="shrink-0 flex items-center gap-3 border-t border-border pt-4"
      >
        <input
          name="message"
          className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
          placeholder="Напишите сообщение…"
          autoComplete="off"
        />
        <Button type="submit" variant="primary">
          Отправить
        </Button>
      </form>
    </div>
  );
}
