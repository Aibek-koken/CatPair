package com.Aibek.CatPair.post;

import com.Aibek.CatPair.post.dto.CreatePostRequest;
import com.Aibek.CatPair.post.dto.PostResponse;
import com.Aibek.CatPair.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public Page<PostResponse> getFeed(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        return postService.getFeed(page, size);
    }

    @PostMapping
    public PostResponse createPost(@AuthenticationPrincipal User currentUser,
                                   @Valid @RequestBody CreatePostRequest request) {
        return postService.createPost(currentUser, request);
    }
}
