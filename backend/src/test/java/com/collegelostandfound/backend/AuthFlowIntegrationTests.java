package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end authentication flow tests: registration, login, JWT issuance,
 * current-user endpoint and profile update. Run against the local MySQL
 * database; created test accounts are removed after each test.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTests {

    private static final String EMAIL = "test.student@example.com";
    private static final String ROLL_NUMBER = "TEST-2026-001";
    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void cleanup() {
        userRepository.findByEmail(EMAIL).ifPresent(userRepository::delete);
    }

    // ---------- Registration ----------

    @Test
    void registerCreatesStudentAccount() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(EMAIL, ROLL_NUMBER, PASSWORD)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.message").value("Registration successful"))
            .andExpect(content().string(not(containsString("password"))));

        Optional<User> saved = userRepository.findByEmail(EMAIL);
        assumeTrue(saved.isPresent(), "registered user should be saved");
        User user = saved.get();
        // Default role is STUDENT; password is BCrypt-hashed, never plaintext.
        org.assertj.core.api.Assertions.assertThat(user.getRole()).isEqualTo("STUDENT");
        org.assertj.core.api.Assertions.assertThat(user.getPasswordHash()).isNotEqualTo(PASSWORD);
        org.assertj.core.api.Assertions.assertThat(user.getPasswordHash()).startsWith("$2");
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        registerUser();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(EMAIL, "OTHER-2026-999", PASSWORD)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value(containsString("email")));
    }

    @Test
    void registerRejectsDuplicateRollNumber() throws Exception {
        registerUser();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody("another.student@example.com", ROLL_NUMBER, PASSWORD)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value(containsString("roll number")));
    }

    @Test
    void registerRejectsInvalidPayload() throws Exception {
        // Password below the 8-character minimum
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(EMAIL, ROLL_NUMBER, "short")))
            .andExpect(status().isBadRequest());
    }

    // ---------- Login ----------

    @Test
    void loginReturnsTokenAndUser() throws Exception {
        registerUser();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody(EMAIL, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.user.email").value(EMAIL))
            .andExpect(jsonPath("$.user.role").value("STUDENT"))
            .andExpect(jsonPath("$.user.studentName").value("Test Student"))
            .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
            .andExpect(content().string(not(containsString(PASSWORD))));
    }

    @Test
    void loginRejectsWrongPassword() throws Exception {
        registerUser();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody(EMAIL, "wrong-password")))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void loginRejectsUnknownUser() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody("nobody@example.com", PASSWORD)))
            .andExpect(status().isUnauthorized());
    }

    // ---------- Current user ----------

    @Test
    void currentUserWithoutTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/users/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void currentUserWithTokenReturnsProfile() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(EMAIL))
            .andExpect(jsonPath("$.role").value("STUDENT"))
            .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void updateCurrentUserUpdatesOwnProfile() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(put("/api/users/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"studentName":"John Updated","className":"CSE S4","profileImageUrl":"https://example.com/pic.jpg"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.studentName").value("John Updated"))
            .andExpect(jsonPath("$.className").value("CSE S4"))
            .andExpect(jsonPath("$.email").value(EMAIL));
    }

    // ---------- Admin ----------

    @Test
    void adminCanLoginWhenSeeded() throws Exception {
        Optional<User> admin = userRepository.findByEmail("admin@college.edu");
        assumeTrue(admin.isPresent(), "admin account is seeded from app.admin.* properties");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody("admin@college.edu", "Admin@123")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    // ---------- helpers ----------

    private void registerUser() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(EMAIL, ROLL_NUMBER, PASSWORD)))
            .andExpect(status().isCreated());
    }

    private String loginAndGetToken() throws Exception {
        registerUser();
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody(EMAIL, PASSWORD)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token", notNullValue()))
            .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.token");
    }

    private String registerBody(String email, String rollNumber, String password) {
        return """
            {"studentName":"Test Student","rollNumber":"%s","className":"CSE S4","email":"%s","password":"%s"}
            """.formatted(rollNumber, email, password);
    }

    private String loginBody(String email, String password) {
        return """
            {"email":"%s","password":"%s"}
            """.formatted(email, password);
    }
}