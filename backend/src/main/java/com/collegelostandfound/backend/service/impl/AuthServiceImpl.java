package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.request.ForgotPasswordRequest;
import com.collegelostandfound.backend.dto.request.LoginRequest;
import com.collegelostandfound.backend.dto.request.RegisterRequest;
import com.collegelostandfound.backend.dto.request.ResetPasswordRequest;
import com.collegelostandfound.backend.dto.response.LoginResponse;
import com.collegelostandfound.backend.dto.response.MessageResponse;
import com.collegelostandfound.backend.dto.response.RegisterResponse;
import com.collegelostandfound.backend.dto.response.UserResponse;
import com.collegelostandfound.backend.entity.PasswordResetToken;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.DuplicateResourceException;
import com.collegelostandfound.backend.exception.InvalidCredentialsException;
import com.collegelostandfound.backend.repository.PasswordResetTokenRepository;
import com.collegelostandfound.backend.repository.UserRepository;
import com.collegelostandfound.backend.security.JwtService;
import com.collegelostandfound.backend.service.AuthService;
import com.collegelostandfound.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Registration, login, forgot password, and reset password service.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
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

    @Override
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Invalidate any existing active tokens for this user
            passwordResetTokenRepository.deleteByUser(user);

            // Generate secure single-use token (UUID)
            String token = UUID.randomUUID().toString();
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(30);

            PasswordResetToken resetToken = new PasswordResetToken(user, token, expiry);
            passwordResetTokenRepository.save(resetToken);

            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user, token, resetUrl);
            log.info("Generated password reset token for user {} (token omitted from logs for security)", user.getEmail());
        } else {
            log.info("Password reset requested for non-existent email: {}", email);
        }

        // Return uniform success message to prevent user enumeration
        return new MessageResponse("If an account with that email exists, password reset instructions have been sent.");
    }

    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String tokenStr = request.getToken().trim();
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired password reset token"));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new InvalidCredentialsException("This password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new InvalidCredentialsException("Password reset token has expired. Please request a new one");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password successfully reset for user {}", user.getEmail());
        return new MessageResponse("Password has been successfully reset. You may now log in with your new password.");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}