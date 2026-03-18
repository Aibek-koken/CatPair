import { useEffect, useRef } from 'react';
import Button from './Button';
import { formatDate } from '../utils/format';
import { useAuthStore } from '../store/authStore';

export default function ChatWindow({ chat, messages, onSend }) {
  const endRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-sm text-muted">
        Выберите чат слева
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border pb-3">
        <h3 className="text-lg font-semibold">{chat.listingName}</h3>
        <p className="text-xs text-muted">Чат с владельцем объявления</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4 pr-2 scrollbar-hide">
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
                  className={`flex items-center justify-between text-xs ${
                    isMine ? 'text-white/80' : 'text-muted'
                  }`}
                >
                  <span>{message.senderName}</span>
                  <span>{formatDate(message.createdAt)}</span>
                </div>
                <p className={`mt-2 text-sm ${isMine ? 'text-white' : 'text-ink'}`}>
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const value = form.message.value.trim();
          if (!value) return;
          onSend(value);
          form.reset();
        }}
        className="flex items-center gap-3 border-t border-border pt-4"
      >
        <input
          name="message"
          className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
          placeholder="Напишите сообщение"
        />
        <Button type="submit" variant="primary">
          Отправить
        </Button>
      </form>
    </div>
  );
}
