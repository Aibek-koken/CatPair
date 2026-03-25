import { useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import MainLayout from './layouts/MainLayout';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chats from './pages/Chats';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { useSse } from './hooks/useSse';

/**
 * Mounts the SSE connection for the duration of the app session.
 * Lives inside <BrowserRouter> so it can call useLocation.
 */
function RealTimeProvider() {
  const user = useAuthStore((s) => s.user);
  const appendMessage = useChatStore((s) => s.appendMessage);
  // Use a ref for activeChatId so the SSE callback never becomes stale
  // without restarting the EventSource connection.
  const activeChatIdRef = useRef(null);
  activeChatIdRef.current = useChatStore((s) => s.activeChatId);
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  useSse(({ type, message }) => {
    if (type !== 'NEW_MESSAGE') return;

    // 1. Always update global store (deduplication is handled inside appendMessage)
    appendMessage(message);

    // 2. Don't notify the sender about their own messages
    if (String(message.senderId) === String(user?.id)) return;

    // 3. If the user is already looking at this chat, no toast needed
    const isViewingThisChat =
      locationRef.current.pathname === '/chats' &&
      String(activeChatIdRef.current) === String(message.chatId);
    if (isViewingThisChat) return;

    // 4. Show a non-intrusive notification
    const preview =
      message.text.length > 60
        ? `${message.text.slice(0, 60)}…`
        : message.text;

    toast.info(
      `💬 ${message.senderName || 'Новое сообщение'}: ${preview}`,
      {
        toastId: `msg-${message.id}`, // prevents duplicate toasts for same message
        autoClose: 5000,
        onClick: () => {
          // Clicking the toast navigates to the chats page
          // (works because react-toastify runs onClick in the React tree)
          window.location.href = `/chats?chatId=${message.chatId}`;
        },
      }
    );
  });

  return null;
}

export default function App() {
  return (
    <>
      <RealTimeProvider />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
    </>
  );
}
