package com.Aibek.CatPair.post;

import com.Aibek.CatPair.post.dto.PostResponse;

public final class PostMapper {

    private PostMapper() {
    }

    public static PostResponse toResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setUserId(post.getUser().getId());
        response.setUserName(post.getUser().getName());
        response.setText(post.getText());
        response.setImageUrl(post.getImageUrl());
        response.setCreatedAt(post.getCreatedAt());
        return response;
    }
}
