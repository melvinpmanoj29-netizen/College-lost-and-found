package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.repository.UserRepository;
import com.collegelostandfound.backend.service.CloudinaryService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LostItemImageUploadIntegrationTests {

    private static final String STUDENT_EMAIL = "upload.student@college.edu";
    private static final String STUDENT_ROLL = "UP-2026-001";
    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    private User student;
    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        cleanup();

        student = new User();
        student.setEmail(STUDENT_EMAIL);
        student.setRollNumber(STUDENT_ROLL);
        student.setStudentName("Upload Student");
        student.setClassName("Computer Science");
        student.setPasswordHash(passwordEncoder.encode(PASSWORD));
        student.setRole("STUDENT");
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());
        student = userRepository.save(student);

        studentToken = obtainToken(STUDENT_EMAIL, PASSWORD);
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        lostItemRepository.deleteAll();
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
    }

    private String obtainToken(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();

        return JsonPath.read(result.getResponse().getContentAsString(), "$.token");
    }

    @Test
    void uploadImage_unauthenticated_returns401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "fake image bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/lost-items/upload-image").file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void uploadImage_validJpeg_returns200AndCloudinaryUrl() throws Exception {
        String expectedUrl = "https://res.cloudinary.com/demo/image/upload/v1/college-lost-and-found/lost-items/sample.jpg";
        when(cloudinaryService.uploadImage(any())).thenReturn(expectedUrl);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.jpg",
                "image/jpeg",
                "valid-jpeg-binary-data".getBytes()
        );

        mockMvc.perform(multipart("/api/lost-items/upload-image")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl", is(expectedUrl)));
    }

    @Test
    void uploadImage_validPng_returns200() throws Exception {
        String expectedUrl = "https://res.cloudinary.com/demo/image/upload/v1/college-lost-and-found/lost-items/sample.png";
        when(cloudinaryService.uploadImage(any())).thenReturn(expectedUrl);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.png",
                "image/png",
                "valid-png-binary-data".getBytes()
        );

        mockMvc.perform(multipart("/api/lost-items/upload-image")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl", is(expectedUrl)));
    }

    @Test
    void uploadImage_validWebp_returns200() throws Exception {
        String expectedUrl = "https://res.cloudinary.com/demo/image/upload/v1/college-lost-and-found/lost-items/sample.webp";
        when(cloudinaryService.uploadImage(any())).thenReturn(expectedUrl);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.webp",
                "image/webp",
                "valid-webp-binary-data".getBytes()
        );

        mockMvc.perform(multipart("/api/lost-items/upload-image")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl", is(expectedUrl)));
    }

    @Test
    void uploadImage_serviceThrowsIllegalArgumentException_returns400() throws Exception {
        when(cloudinaryService.uploadImage(any()))
                .thenThrow(new IllegalArgumentException("Only JPEG, PNG, and WEBP image formats are supported"));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                "pdf content".getBytes()
        );

        mockMvc.perform(multipart("/api/lost-items/upload-image")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Only JPEG, PNG, and WEBP")));
    }

    @Test
    void uploadImage_serviceThrowsOversizedException_returns400() throws Exception {
        when(cloudinaryService.uploadImage(any()))
                .thenThrow(new IllegalArgumentException("Image must be smaller than 5 MB"));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                "oversized-bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/lost-items/upload-image")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Image must be smaller than 5 MB")));
    }

    @Test
    void fullLostItemCreationFlow_withUploadedImageUrl() throws Exception {
        String uploadedUrl = "https://res.cloudinary.com/demo/image/upload/v1/college-lost-and-found/lost-items/wallet.jpg";
        when(cloudinaryService.uploadImage(any())).thenReturn(uploadedUrl);

        // 1. Upload image
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "wallet.jpg",
                "image/jpeg",
                "wallet-image-bytes".getBytes()
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/lost-items/upload-image")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andReturn();

        String receivedImageUrl = JsonPath.read(uploadResult.getResponse().getContentAsString(), "$.imageUrl");

        // 2. Submit lost item using received image URL
        String payload = """
                {
                  "itemName": "Vintage Leather Wallet",
                  "category": "ID Cards & Wallets",
                  "color": "Brown",
                  "lastSeenLocation": "Harrison Library",
                  "description": "Lost brown leather wallet with college ID inside.",
                  "lostDateTime": "2026-09-08T10:30:00",
                  "imageUrl": "%s",
                  "isUrgent": true
                }
                """.formatted(receivedImageUrl);

        MvcResult createResult = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.imageUrl", is(uploadedUrl)))
                .andExpect(jsonPath("$.status", is("LOST")))
                .andReturn();

        int createdId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

        // 3. Fetch item by id and verify imageUrl
        mockMvc.perform(get("/api/lost-items/" + createdId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl", is(uploadedUrl)))
                .andExpect(jsonPath("$.itemName", is("Vintage Leather Wallet")));
    }
}
