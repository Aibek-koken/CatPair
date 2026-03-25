import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 30_000;

/**
 * Opens a Server-Sent Events connection to /api/sse/subscribe and calls
 * onMessage for every named event received from the server.
 *
 * Connection lifecycle:
 *  - Connects automatically when a JWT token is present.
 *  - Reconnects with exponential back-off on network failures.
 *  - Closes and stops reconnecting when the token is cleared (logout).
 *  - Multiple browser tabs each maintain their own SSE connection (the
 *    backend supports this via CopyOnWriteArrayList per user).
 *
 * @param {(event: {type: string, [key: string]: any}) => void} onMessage
 *   Callback invoked for every incoming SSE event.
 *   The function reference may change between renders; a stable ref is used
 *   internally so the EventSource lifecycle is only restarted on token changes.
 */
export function useSse(onMessage) {
  const token = useAuthStore((s) => s.token);

  // Keep the callback ref stable so we never recreate the EventSource
  // just because the parent component re-rendered.
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!token) return;

    let active = true;
    let es = null;
    let reconnectTimer = null;
    let delay = BASE_DELAY_MS;

    const connect = () => {
      if (!active) return;

      // EventSource cannot set custom headers, so the JWT is passed as a
      // query parameter. The backend JwtAuthenticationFilter reads it from
      // request.getParameter("token") as a fallback.
      es = new EventSource(`/api/sse/subscribe?token=${encodeURIComponent(token)}`);

      es.onopen = () => {
        // Connection (re)established — reset backoff
        delay = BASE_DELAY_MS;
      };

      // Handle named event "NEW_MESSAGE" sent by SseController
      es.addEventListener('NEW_MESSAGE', (e) => {
        try {
          const message = JSON.parse(e.data);
          onMessageRef.current({ type: 'NEW_MESSAGE', message });
        } catch {
          // Malformed payload — ignore
        }
      });

      es.onerror = () => {
        // EventSource fires onerror on any network failure AND on server close.
        // Close the broken connection; we'll open a fresh one after the backoff.
        es.close();
        if (!active) return;
        reconnectTimer = setTimeout(() => {
          delay = Math.min(delay * 2, MAX_DELAY_MS);
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [token]); // Re-run only when the token changes (login / logout)
}
