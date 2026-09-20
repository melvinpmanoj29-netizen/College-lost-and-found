package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.PasswordResetToken;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.PasswordResetTokenRepository;
import com.collegelostandfound.backend.repository.UserRepository;
import com.collegelostandfound.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class PasswordResetIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setStudentName("John Doe");
        testUser.setRollNumber("CS2026001");
        testUser.setClassName("Computer Science");
        testUser.setEmail("john.doe@college.edu");
        testUser.setPasswordHash(passwordEncoder.encode("OldPassword@123"));
        testUser.setRole("STUDENT");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        testUser = userRepository.save(testUser);
    }

    @Test
    void forgotPassword_existingEmail_generatesTokenAndReturnsSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"john.doe@college.edu\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account with that email exists, password reset instructions have been sent."));

        assertFalse(passwordResetTokenRepository.findAll().isEmpty());
    }

    @Test
    void forgotPassword_nonExistentEmail_returnsUniformSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"unknown.student@college.edu\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account with that email exists, password reset instructions have been sent."));

        assertTrue(passwordResetTokenRepository.findAll().isEmpty());
    }

    @Test
    void resetPassword_validToken_updatesPassword() throws Exception {
        PasswordResetToken token = new PasswordResetToken(testUser, "valid-token-123", LocalDateTime.now().plusMinutes(30));
        passwordResetTokenRepository.save(token);

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\": \"valid-token-123\", \"newPassword\": \"NewPassword@456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        // Verify login with new password succeeds
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"john.doe@college.edu\", \"password\": \"NewPassword@456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        // Verify old password fails
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"john.doe@college.edu\", \"password\": \"OldPassword@123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changePassword_validCurrentPassword_succeeds() throws Exception {
        String token = jwtService.generateToken(testUser);

        mockMvc.perform(post("/api/users/me/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\": \"OldPassword@123\", \"newPassword\": \"BrandNewPassword@789\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));

        // Login with changed password
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"john.doe@college.edu\", \"password\": \"BrandNewPassword@789\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void changePassword_wrongCurrentPassword_fails() throws Exception {
        String token = jwtService.generateToken(testUser);

        mockMvc.perform(post("/api/users/me/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\": \"WrongPassword!\", \"newPassword\": \"BrandNewPassword@789\"}"))
                .andExpect(status().isUnauthorized());
    }
}
