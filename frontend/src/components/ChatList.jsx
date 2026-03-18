export default function ChatList({ chats, selectedId, onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelect(chat)}
          className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition ${
            selectedId === chat.id
              ? 'border-accent bg-accent/10'
              : 'border-border bg-white/70 hover:border-accent/50'
          }`}
        >
          <span className="text-sm font-semibold text-ink">{chat.listingName}</span>
          <span className="text-xs text-muted">Чат #{chat.id}</span>
        </button>
      ))}
    </div>
  );
}
