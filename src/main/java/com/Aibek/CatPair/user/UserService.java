package com.Aibek.CatPair.user;

import com.Aibek.CatPair.common.ApiException;
import com.Aibek.CatPair.user.dto.UpdateProfileRequest;
import com.Aibek.CatPair.user.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getCurrentUser(User currentUser) {
        return UserMapper.toResponse(currentUser);
    }

    public UserResponse updateCurrentUser(User currentUser, UpdateProfileRequest request) {
        if (request.getName() != null) {
            currentUser.setName(request.getName().trim());
        }
        if (request.getAvatarUrl() != null) {
            currentUser.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getContactInfo() != null) {
            currentUser.setContactInfo(request.getContactInfo().trim());
        }
        userRepository.save(currentUser);
        return UserMapper.toResponse(currentUser);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
