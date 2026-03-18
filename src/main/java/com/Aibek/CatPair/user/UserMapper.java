package com.Aibek.CatPair.user;

import com.Aibek.CatPair.user.dto.UserResponse;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setContactInfo(user.getContactInfo());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
