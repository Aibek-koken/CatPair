package com.Aibek.CatPair.chat;

import com.Aibek.CatPair.user.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
public class SseController {

    private final SseEmitterRegistry registry;

    public SseController(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    /**
     * Subscribe to real-time events for the authenticated user.
     *
     * The JWT is accepted both via the Authorization header and via the
     * {@code ?token=} query parameter (needed because the browser's
     * {@code EventSource} API cannot set custom headers).
     *
     * Example: GET /api/sse/subscribe?token=eyJ...
     */
    @GetMapping("/subscribe")
    public SseEmitter subscribe(@AuthenticationPrincipal User currentUser) {
        return registry.subscribe(currentUser.getId());
    }
}
