package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LostItemFlowIntegrationTests {

    private static final String STUDENT_1_EMAIL = "student1.lost@college.edu";
    private static final String STUDENT_1_ROLL = "LOST-2026-001";
    private static final String STUDENT_2_EMAIL = "student2.lost@college.edu";
    private static final String STUDENT_2_ROLL = "LOST-2026-002";
    private static final String ADMIN_EMAIL = "admin.lost@college.edu";
    private static final String ADMIN_ROLL = "ADMIN-LOST-001";
    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User student1;
    private User student2;
    private User admin;
    private String student1Token;
    private String student2Token;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        cleanup();

        student1 = createUser(STUDENT_1_EMAIL, STUDENT_1_ROLL, "Student One", "STUDENT");
        student2 = createUser(STUDENT_2_EMAIL, STUDENT_2_ROLL, "Student Two", "STUDENT");
        admin = createUser(ADMIN_EMAIL, ADMIN_ROLL, "Admin User", "ADMIN");

        student1Token = obtainToken(STUDENT_1_EMAIL, PASSWORD);
        student2Token = obtainToken(STUDENT_2_EMAIL, PASSWORD);
        adminToken = obtainToken(ADMIN_EMAIL, PASSWORD);
    }

    @AfterEach
    void tearDown() {
        cleanup();
    }

    private void cleanup() {
        lostItemRepository.deleteAll();
        userRepository.findByEmail(STUDENT_1_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_2_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
    }

    private User createUser(String email, String rollNumber, String name, String role) {
        User user = new User();
        user.setEmail(email);
        user.setRollNumber(rollNumber);
        user.setStudentName(name);
        user.setClassName("Computer Science");
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
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

    // ---------- CREATE LOST ITEM ----------

    @Test
    void createLostItemRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/lost-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLostItemJson("Blue Backpack", false)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createLostItemSuccessWithAuthenticatedUser() throws Exception {
        mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLostItemJson("Blue Backpack", true)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.userId").value(student1.getId()))
                .andExpect(jsonPath("$.itemName").value("Blue Backpack"))
                .andExpect(jsonPath("$.status").value("LOST"))
                .andExpect(jsonPath("$.isUrgent").value(true))
                .andExpect(jsonPath("$.isArchived").value(false))
                .andExpect(jsonPath("$.category").value("Bags"))
                .andExpect(jsonPath("$.lastSeenLocation").value("Harrison Library"));
    }

    @Test
    void createLostItemRejectsInvalidInput() throws Exception {
        // Missing item name and description
        mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "category": "Bags",
                                  "lostDateTime": "2026-09-01T10:00:00",
                                  "lastSeenLocation": "Library"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // ---------- GET ALL LOST ITEMS ----------

    @Test
    void getAllLostItemsReturnsAllActiveReports() throws Exception {
        createTestLostItem(student1, "Item 1", false);
        createTestLostItem(student2, "Item 2", true);

        mockMvc.perform(get("/api/lost-items")
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].itemName", containsInAnyOrder("Item 1", "Item 2")));
    }

    // ---------- GET SINGLE LOST ITEM ----------

    @Test
    void getLostItemByIdSuccess() throws Exception {
        LostItem item = createTestLostItem(student1, "Scientific Calculator", false);

        mockMvc.perform(get("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + student2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(item.getId()))
                .andExpect(jsonPath("$.itemName").value("Scientific Calculator"))
                .andExpect(jsonPath("$.userId").value(student1.getId()));
    }

    @Test
    void getLostItemByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/lost-items/999999")
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ---------- UPDATE LOST ITEM ----------

    @Test
    void updateOwnLostItemSuccess() throws Exception {
        LostItem item = createTestLostItem(student1, "Old Title", false);

        mockMvc.perform(put("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLostItemJson("Updated Title", true)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(item.getId()))
                .andExpect(jsonPath("$.itemName").value("Updated Title"))
                .andExpect(jsonPath("$.isUrgent").value(true));
    }

    @Test
    void updateLostItemForbiddenForOtherStudent() throws Exception {
        LostItem item = createTestLostItem(student1, "Student 1 Item", false);

        // Student 2 tries to update Student 1's item
        mockMvc.perform(put("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + student2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLostItemJson("Hacked Title", false)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void adminCanUpdateAnyLostItem() throws Exception {
        LostItem item = createTestLostItem(student1, "Original Title", false);

        mockMvc.perform(put("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLostItemJson("Admin Modified Title", false)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("Admin Modified Title"));
    }

    // ---------- DELETE LOST ITEM ----------

    @Test
    void deleteLostItemForbiddenForOtherStudent() throws Exception {
        LostItem item = createTestLostItem(student1, "Student 1 Item", false);

        // Student 2 tries to delete Student 1's item
        mockMvc.perform(delete("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + student2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void deleteOwnLostItemSuccess() throws Exception {
        LostItem item = createTestLostItem(student1, "To Be Deleted", false);

        mockMvc.perform(delete("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isNoContent());

        Optional<LostItem> deleted = lostItemRepository.findById(item.getId());
        org.assertj.core.api.Assertions.assertThat(deleted).isEmpty();
    }

    @Test
    void adminCanDeleteAnyLostItem() throws Exception {
        LostItem item = createTestLostItem(student1, "Fake Report Item", false);

        mockMvc.perform(delete("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        Optional<LostItem> deleted = lostItemRepository.findById(item.getId());
        org.assertj.core.api.Assertions.assertThat(deleted).isEmpty();
    }

    // ---------- GET MY LOST ITEMS ----------

    @Test
    void getMyLostItemsReturnsOnlyAuthenticatedUsersItems() throws Exception {
        createTestLostItem(student1, "Student 1 Item A", false);
        createTestLostItem(student1, "Student 1 Item B", true);
        createTestLostItem(student2, "Student 2 Item X", false);

        mockMvc.perform(get("/api/lost-items/my")
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].itemName", containsInAnyOrder("Student 1 Item A", "Student 1 Item B")))
                .andExpect(jsonPath("$[*].userId", everyItem(is(student1.getId().intValue()))));
    }

    // ---------- AUTO EXPIRY & ARCHIVING ----------

    @Test
    void expiredLostItemIsArchivedOnQuery() throws Exception {
        LostItem expiredItem = new LostItem();
        expiredItem.setUser(student1);
        expiredItem.setItemName("Expired Keys");
        expiredItem.setDescription("Keychain with 3 keys");
        expiredItem.setCategory("Keys");
        expiredItem.setLostDateTime(LocalDateTime.now().minusDays(40));
        expiredItem.setLastSeenLocation("North Gym");
        expiredItem.setStatus("LOST");
        expiredItem.setIsUrgent(false);
        expiredItem.setExpiryDate(LocalDateTime.now().minusDays(10));
        expiredItem.setIsArchived(false);
        expiredItem.setCreatedAt(LocalDateTime.now().minusDays(40));
        expiredItem.setUpdatedAt(LocalDateTime.now().minusDays(40));
        LostItem saved = lostItemRepository.save(expiredItem);

        mockMvc.perform(get("/api/lost-items/" + saved.getId())
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"))
                .andExpect(jsonPath("$.isArchived").value(true));
    }

    @Test
    void frontendCannotSpoofUserIdOnCreation() throws Exception {
        mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 9999,
                                  "itemName": "Spoofed User Wallet",
                                  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                                  "description": "Attempting to spoof user id ownership",
                                  "category": "Wallets",
                                  "lostDateTime": "2026-09-01T10:00:00",
                                  "lastSeenLocation": "Library"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(student1.getId()))
                .andExpect(jsonPath("$.userId").value(not(9999)));
    }

    @Test
    void backendControlledStatusCannotBeSpoofedOnCreationOrUpdate() throws Exception {
        // Attempt spoofing status on creation
        MvcResult result = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "RETURNED",
                                  "itemName": "Spoofed Status Item",
                                  "description": "Attempting to set RETURNED status on creation",
                                  "category": "Electronics",
                                  "lostDateTime": "2026-09-01T10:00:00",
                                  "lastSeenLocation": "Library"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("LOST"))
                .andReturn();

        Integer createdId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");

        // Attempt spoofing status on update
        mockMvc.perform(put("/api/lost-items/" + createdId)
                        .header("Authorization", "Bearer " + student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "RETURNED",
                                  "itemName": "Updated Item",
                                  "description": "Attempting to set RETURNED status on update",
                                  "category": "Electronics",
                                  "lostDateTime": "2026-09-01T10:00:00",
                                  "lastSeenLocation": "Library"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("LOST"));
    }

    @Test
    void isArchivedCannotBeArbitrarilyControlledByFrontend() throws Exception {
        mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "isArchived": true,
                                  "itemName": "Archived Spoof Test",
                                  "description": "Testing isArchived safety",
                                  "category": "Keys",
                                  "lostDateTime": "2026-09-01T10:00:00",
                                  "lastSeenLocation": "Hostel"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isArchived").value(false));
    }

    @Test
    void privateInformationNotExposedInResponses() throws Exception {
        LostItem item = createTestLostItem(student1, "Private Info Check Item", false);

        mockMvc.perform(get("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + student2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.verificationAnswer").doesNotExist())
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    void cannotDeleteReturnedLostItem() throws Exception {
        LostItem item = createTestLostItem(student1, "Returned Item", false);
        item.setStatus("RETURNED");
        lostItemRepository.save(item);

        mockMvc.perform(delete("/api/lost-items/" + item.getId())
                        .header("Authorization", "Bearer " + student1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot delete an item that has already been returned"));
    }

    // ---------- helpers ----------

    private LostItem createTestLostItem(User owner, String itemName, boolean isUrgent) {
        LostItem item = new LostItem();
        item.setUser(owner);
        item.setItemName(itemName);
        item.setImageUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg");
        item.setDescription("Description for " + itemName);
        item.setCategory("Bags");
        item.setColor("Blue");
        item.setLostDateTime(LocalDateTime.now().minusDays(1));
        item.setLastSeenLocation("Harrison Library");
        item.setStatus("LOST");
        item.setIsUrgent(isUrgent);
        item.setIsArchived(false);
        item.setExpiryDate(LocalDateTime.now().plusDays(30));
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return lostItemRepository.save(item);
    }

    private String validLostItemJson(String itemName, boolean isUrgent) {
        return """
                {
                  "itemName": "%s",
                  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                  "description": "Lost near the front desk with all contents inside.",
                  "category": "Bags",
                  "color": "Blue",
                  "lostDateTime": "2026-09-01T10:00:00",
                  "lastSeenLocation": "Harrison Library",
                  "isUrgent": %b,
                  "expiryDate": "2026-10-01T10:00:00"
                }
                """.formatted(itemName, isUrgent);
    }
}
