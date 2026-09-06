package com.collegelostandfound.backend.controller;

import com.collegelostandfound.backend.dto.request.UpdateProfileRequest;
import com.collegelostandfound.backend.dto.response.UserResponse;
import com.collegelostandfound.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Current-user endpoints (authentication required):
 *   GET /api/users/me
 *   PUT /api/users/me
 *
 * The user id always comes from the authenticated JWT; the client can never
 * update or read another user's profile.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request,
                                                          Authentication authentication) {
        return ResponseEntity.ok(userService.updateCurrentUser(authentication, request));
    }
}