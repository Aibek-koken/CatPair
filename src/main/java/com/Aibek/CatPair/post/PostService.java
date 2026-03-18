package com.Aibek.CatPair.post;

import com.Aibek.CatPair.common.ApiException;
import com.Aibek.CatPair.post.dto.CreatePostRequest;
import com.Aibek.CatPair.post.dto.PostResponse;
import com.Aibek.CatPair.user.User;
import com.Aibek.CatPair.user.UserRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PostMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByUser(Long userId, int page, int size) {
        if (!userRepository.existsById(userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User not found");
        }
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(PostMapper::toResponse);
    }

    @Transactional
    public PostResponse createPost(User user, CreatePostRequest request) {
        Post post = new Post();
        post.setUser(user);
        post.setText(request.getText().trim());
        if (request.getImageUrl() != null) {
            post.setImageUrl(request.getImageUrl().trim());
        }
        Post saved = postRepository.save(post);
        return PostMapper.toResponse(saved);
    }
}
