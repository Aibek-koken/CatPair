package com.Aibek.CatPair.chat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Thread-safe registry that maps userId → active SSE emitters.
 * A user can have multiple concurrent connections (e.g. multiple tabs).
 */
@Component
public class SseEmitterRegistry {

    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> registry =
            new ConcurrentHashMap<>();

    /**
     * Creates and registers a new SSE emitter for the given user.
     * Automatically removes itself on completion, timeout, or error.
     */
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        registry.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> remove(userId, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(t -> cleanup.run());

        // Send an initial comment so the browser confirms the connection
        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException e) {
            cleanup.run();
        }

        return emitter;
    }

    /**
     * Pushes a named SSE event with a JSON payload to every active emitter of userId.
     * Dead emitters are pruned automatically.
     */
    public void sendToUser(Long userId, String eventName, Object payload) {
        List<SseEmitter> emitters = registry.getOrDefault(userId, new CopyOnWriteArrayList<>());
        if (emitters.isEmpty()) return;

        List<SseEmitter> dead = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(
                        SseEmitter.event()
                                .name(eventName)
                                .data(payload, MediaType.APPLICATION_JSON)
                );
            } catch (Exception e) {
                dead.add(emitter);
            }
        }
        emitters.removeAll(dead);
    }

    /** Returns number of active connections (useful for health/debug). */
    public int connectionCount(Long userId) {
        return registry.getOrDefault(userId, new CopyOnWriteArrayList<>()).size();
    }

    private void remove(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = registry.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                registry.remove(userId, list);
            }
        }
    }
}
