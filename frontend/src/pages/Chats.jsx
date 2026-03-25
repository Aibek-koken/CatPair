import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchChats, fetchMessages, sendMessage } from '../api/chats';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/error';

const SEEN_KEY = 'catpair_chat_seen';

function loadSeenTimes() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSeenTimes(data) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// A chat is considered unread if its lastMessageAt is newer than when we last saw it.
function isChatUnread(chat, seenTimes) {
  if (!chat.lastMessageAt) return false;
  const seenAt = seenTimes[String(chat.id)];
  if (!seenAt) return true;
  return new Date(chat.lastMessageAt) > new Date(seenAt);
}

export default function Chats() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialChatId = query.get('chatId');
  const { user } = useAuthStore();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  // seenTimes: { [chatId: string]: ISO timestamp } — last time we opened this chat
  const [seenTimes, setSeenTimes] = useState(() => loadSeenTimes());

  const markAsRead = (chatId) => {
    setSeenTimes((prev) => {
      const next = { ...prev, [String(chatId)]: new Date().toISOString() };
      saveSeenTimes(next);
      return next;
    });
  };

  const loadChats = async () => {
    try {
      const data = await fetchChats();
      setChats(data);
      if (initialChatId) {
        const found = data.find((chat) => String(chat.id) === String(initialChatId));
        if (found) {
          setSelectedChat(found);
          markAsRead(found.id);
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось загрузить чаты'));
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const data = await fetchMessages(chatId);
      setMessages(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось загрузить сообщения'));
    }
  };

  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  const handleSelect = (chat) => {
    setSelectedChat(chat);
    markAsRead(chat.id);
  };

  const handleSend = async (text) => {
    if (!selectedChat) return;
    try {
      await sendMessage(selectedChat.id, text);
      // Reload messages and mark as read (we sent it, so obviously seen)
      const data = await fetchMessages(selectedChat.id);
      setMessages(data);
      markAsRead(selectedChat.id);
      // Update the chat list so lastMessageAt / lastMessageText reflect the new message
      loadChats();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не удалось отправить сообщение'));
    }
  };

  const unreadIds = useMemo(
    () => new Set(chats.filter((c) => isChatUnread(c, seenTimes)).map((c) => c.id)),
    [chats, seenTimes]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
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
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
      <div className="h-[70vh] rounded-3xl border border-border bg-white/80 p-6 shadow-soft">
        <ChatWindow chat={selectedChat} messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
}
