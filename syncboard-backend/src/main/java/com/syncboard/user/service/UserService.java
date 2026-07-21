package com.syncboard.user.service;

import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.user.dto.UserResponse;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .presenceStatus(user.getPresenceStatus())
                .build();
    }
}
