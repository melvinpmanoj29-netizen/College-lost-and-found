package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.request.ChangePasswordRequest;
import com.collegelostandfound.backend.dto.request.UpdateProfileRequest;
import com.collegelostandfound.backend.dto.response.MessageResponse;
import com.collegelostandfound.backend.dto.response.UserResponse;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.InvalidCredentialsException;
import com.collegelostandfound.backend.repository.UserRepository;
import com.collegelostandfound.backend.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

    @Override
    @Transactional
    public MessageResponse changePassword(Authentication authentication, ChangePasswordRequest request) {
        User user = getAuthenticatedUser(authentication);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as your current password");
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return new MessageResponse("Password changed successfully");
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new InvalidCredentialsException("Authentication required");
        }
        return user;
    }
}