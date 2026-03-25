import { create } from 'zustand';

// ─── localStorage helpers ────────────────────────────────────────────────────
const SEEN_KEY = 'catpair_chat_seen';

function loadSeenTimes() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
}

function persistSeenTimes(data) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useChatStore = create((set, get) => ({
  /** Full ChatResponse list for the logged-in user */
  chats: [],

  /**
   * Per-chat message arrays.
   * Key: String(chatId), Value: MessageResponse[]
   */
  messagesByChat: {},

  /**
   * Tracks when the user last opened each chat.
   * Key: String(chatId), Value: ISO timestamp string
   */
  seenTimes: loadSeenTimes(),

  /**
   * Chat ID the user is currently viewing (null = not on chats page / no chat open).
   * Used by the global SSE handler to decide whether to show a toast.
   */
  activeChatId: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  setChats(chats) {
    set({ chats });
  },

  /** Called when the user opens a chat thread. */
  setActiveChatId(id) {
    set({ activeChatId: id });
  },

  /** Replace the full message list for a chat (on initial load / re-fetch). */
  setMessages(chatId, messages) {
    set((s) => ({
      messagesByChat: {
        ...s.messagesByChat,
        [String(chatId)]: messages,
      },
    }));
  },

  /**
   * Append a single incoming message.
   *  - Deduplicates by message ID so the sender never sees a double render.
   *  - Updates the chat's lastMessageAt / lastMessageText for list previews.
   */
  appendMessage(message) {
    set((s) => {
      const key = String(message.chatId);
      const existing = s.messagesByChat[key] ?? [];

      // Deduplication: skip if already present (e.g. optimistic append + SSE echo)
      if (existing.some((m) => m.id === message.id)) return s;

      return {
        messagesByChat: {
          ...s.messagesByChat,
          [key]: [...existing, message],
        },
        chats: s.chats.map((c) =>
          c.id === message.chatId
            ? { ...c, lastMessageAt: message.createdAt, lastMessageText: message.text }
            : c
        ),
      };
    });
  },

  /**
   * Mark a chat as read by recording the current timestamp.
   * A chat is unread when its lastMessageAt > seenTimes[chatId].
   */
  markAsRead(chatId) {
    const now = new Date().toISOString();
    const next = { ...get().seenTimes, [String(chatId)]: now };
    persistSeenTimes(next);
    set({ seenTimes: next });
  },
}));

// ─── Derived helper (used outside the store) ─────────────────────────────────
export function isChatUnread(chat, seenTimes) {
  if (!chat.lastMessageAt) return false;
  const seen = seenTimes[String(chat.id)];
  if (!seen) return true;
  return new Date(chat.lastMessageAt) > new Date(seen);
}
