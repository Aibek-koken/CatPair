import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchChats, fetchMessages, sendMessage } from '../api/chats';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useAuthStore } from '../store/authStore';
import { useChatStore, isChatUnread } from '../store/chatStore';
import { getErrorMessage } from '../utils/error';

export default function Chats() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialChatId = query.get('chatId');
  const { user } = useAuthStore();

  // ── Global store ────────────────────────────────────────────────────────────
  const chats = useChatStore((s) => s.chats);
  const messagesByChat = useChatStore((s) => s.messagesByChat);
  const seenTimes = useChatStore((s) => s.seenTimes);
  const setChats = useChatStore((s) => s.setChats);
  const setMessages = useChatStore((s) => s.setMessages);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const markAsRead = useChatStore((s) => s.markAsRead);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  // ── Local UI state ──────────────────────────────────────────────────────────
  // selectedChat is kept local — it's a UI concern, not a shared concern.
  const [selectedChat, setSelectedChatLocal] = useState(null);

  // Messages for the currently open chat come from the store.
  const messages = messagesByChat[String(selectedChat?.id)] ?? [];

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const selectChat = (chat) => {
    setSelectedChatLocal(chat);
    setActiveChatId(chat?.id ?? null);
    if (chat) markAsRead(chat.id);
  };

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadChats = async () => {
    try {
      const data = await fetchChats();
      setChats(data);
      // If we arrived with ?chatId=... (e.g. from a listing), auto-open that chat
      if (initialChatId) {
        const found = data.find((c) => String(c.id) === String(initialChatId));
        if (found) selectChat(found);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось загрузить чаты'));
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const data = await fetchMessages(chatId);
      setMessages(chatId, data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось загрузить сообщения'));
    }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadChats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear activeChatId when the user leaves the chats page
  useEffect(() => {
    return () => setActiveChatId(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load messages when a chat is selected (only if not already cached)
  useEffect(() => {
    if (!selectedChat) return;
    const cached = messagesByChat[String(selectedChat.id)];
    // Skip if already loaded — SSE will append any new ones in real-time
    if (!cached) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    if (!selectedChat) return;
    try {
      const sent = await sendMessage(selectedChat.id, text);
      // Optimistic append: add our own message immediately from the API response.
      // The SSE echo will arrive shortly and be deduplicated by message ID.
      appendMessage(sent);
      markAsRead(selectedChat.id);
      // Also refresh the chat list so lastMessageAt order updates in the sidebar.
      loadChats();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось отправить сообщение'));
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────────
  const unreadIds = useMemo(
    () => new Set(chats.filter((c) => isChatUnread(c, seenTimes)).map((c) => c.id)),
    [chats, seenTimes]
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <div className="rounded-3xl border border-border bg-white/80 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ваши чаты</h2>
          {unreadIds.size > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
              {unreadIds.size}
            </span>
          )}
        </div>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
          {chats.length === 0 ? (
            <p className="text-sm text-muted">Чатов пока нет.</p>
          ) : (
            <ChatList
              chats={chats}
              selectedId={selectedChat?.id}
              unreadIds={unreadIds}
              currentUserId={user?.id}
              onSelect={selectChat}
            />
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="h-[70vh] rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
        <ChatWindow chat={selectedChat} messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
}
