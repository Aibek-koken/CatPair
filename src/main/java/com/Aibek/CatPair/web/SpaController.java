package com.Aibek.CatPair.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React SPA for direct URL hits (React Router).
 * <p>
 * Uses only path patterns compatible with Spring {@code PathPatternParser} (no {@code **}
 * in the middle of a pattern). Static files under {@code /assets/**} are not matched here.
 */
@Controller
public class SpaController {

    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/community",
            "/dashboard",
            "/chats",
            "/listing/**",
            "/{path:[^\\.]*}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
