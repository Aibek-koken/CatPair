package com.Aibek.CatPair.user;

import com.Aibek.CatPair.listing.ListingService;
import com.Aibek.CatPair.listing.dto.ListingSummaryResponse;
import com.Aibek.CatPair.post.PostService;
import com.Aibek.CatPair.post.dto.PostResponse;
import com.Aibek.CatPair.user.dto.UpdateProfileRequest;
import com.Aibek.CatPair.user.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final ListingService listingService;
    private final PostService postService;

    public UserController(UserService userService,
                          ListingService listingService,
                          PostService postService) {
        this.userService = userService;
        this.listingService = listingService;
        this.postService = postService;
    }

    @GetMapping("/me")
    public UserResponse getMe(@AuthenticationPrincipal User currentUser) {
        return userService.getCurrentUser(currentUser);
    }

    @PutMapping("/me")
    public UserResponse updateMe(@AuthenticationPrincipal User currentUser,
                                 @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateCurrentUser(currentUser, request);
    }

    @GetMapping("/{id}/listings")
    public List<ListingSummaryResponse> getUserListings(@PathVariable Long id) {
        return listingService.getListingsByUser(id);
    }

    @GetMapping("/{id}/posts")
    public Page<PostResponse> getUserPosts(@PathVariable Long id,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return postService.getPostsByUser(id, page, size);
    }
}
