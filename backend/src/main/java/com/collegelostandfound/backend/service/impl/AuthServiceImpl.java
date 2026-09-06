package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.request.LoginRequest;
import com.collegelostandfound.backend.dto.request.RegisterRequest;
import com.collegelostandfound.backend.dto.response.LoginResponse;
import com.collegelostandfound.backend.dto.response.RegisterResponse;
import com.collegelostandfound.backend.dto.response.UserResponse;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.DuplicateResourceException;
import com.collegelostandfound.backend.exception.InvalidCredentialsException;
import com.collegelostandfound.backend.repository.UserRepository;
import com.collegelostandfound.backend.security.JwtService;
import com.collegelostandfound.backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

/**
 * Registration and login.
 *
 * - Passwords are hashed with BCrypt and never stored, returned or logged.
 * - Every new account gets the STUDENT role; ADMIN accounts are only created
 *   through the bootstrap initializer, never through registration.
 * - The same login endpoint serves both STUDENT and ADMIN users; the role is
 *   read from the database and embedded in the JWT.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        if (userRepository.existsByRollNumber(request.getRollNumber().trim())) {
            throw new DuplicateResourceException("An account with this roll number already exists");
        }

        User user = new User();
        user.setStudentName(request.getStudentName().trim());
        user.setRollNumber(request.getRollNumber().trim());
        user.setClassName(request.getClassName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return new RegisterResponse("Registration successful");
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}