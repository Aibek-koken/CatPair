package com.Aibek.CatPair.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React SPA for direct URL hits (React Router). Static assets under
 * {@code /assets/**} are resolved first; API and {@code /uploads/**} use more specific mappings.
 */
@Controller
public class SpaController {

    @GetMapping(value = {
            "/",
            "/{path:[^\\.]*}",
            "/listing/**",
            "/**/{path:[^\\.]*}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
