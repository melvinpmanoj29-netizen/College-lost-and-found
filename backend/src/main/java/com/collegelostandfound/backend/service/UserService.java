package com.collegelostandfound.backend.service;

import com.collegelostandfound.backend.dto.request.ChangePasswordRequest;
import com.collegelostandfound.backend.dto.request.UpdateProfileRequest;
import com.collegelostandfound.backend.dto.response.MessageResponse;
import com.collegelostandfound.backend.dto.response.UserResponse;
import org.springframework.security.core.Authentication;

public interface UserService {

    UserResponse getCurrentUser(Authentication authentication);

    UserResponse updateCurrentUser(Authentication authentication, UpdateProfileRequest request);

    MessageResponse changePassword(Authentication authentication, ChangePasswordRequest request);
}