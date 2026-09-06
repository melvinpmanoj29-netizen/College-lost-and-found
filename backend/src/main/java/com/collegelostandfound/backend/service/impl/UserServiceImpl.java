package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.request.UpdateProfileRequest;
import com.collegelostandfound.backend.dto.response.UserResponse;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.InvalidCredentialsException;
import com.collegelostandfound.backend.repository.UserRepository;
import com.collegelostandfound.backend.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Current-user operations. The user identity always comes from the
 * authenticated JWT (Spring Security principal), never from the client.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse getCurrentUser(Authentication authentication) {
        return UserResponse.from(getAuthenticatedUser(authentication));
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(Authentication authentication, UpdateProfileRequest request) {
        User user = getAuthenticatedUser(authentication);
        user.setStudentName(request.getStudentName().trim());
        user.setClassName(request.getClassName().trim());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return UserResponse.from(user);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new InvalidCredentialsException("Authentication required");
        }
        return user;
    }
}