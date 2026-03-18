package com.Aibek.CatPair.auth.dto;

import com.Aibek.CatPair.user.dto.UserResponse;

public class AuthResponse {

    private String token;
    private String tokenType;
    private UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String token, String tokenType, UserResponse user) {
        this.token = token;
        this.tokenType = tokenType;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
