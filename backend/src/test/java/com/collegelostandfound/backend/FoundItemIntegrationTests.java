package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.ClaimRepository;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.MatchRepository;
import com.collegelostandfound.backend.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class FoundItemIntegrationTests {

    private static final String USER1_EMAIL = "found.student1@example.com";
    private static final String USER1_ROLL = "FOUND-2026-001";
    private static final String USER2_EMAIL = "found.student2@example.com";
    private static final String USER2_ROLL = "FOUND-2026-002";
    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ClaimRepository claimRepository;

    private String user1Token;
    private Long user1Id;
    private String user2Token;
    private Long user2Id;

    @BeforeEach
    void setup() throws Exception {
        user1Token = registerAndLogin(USER1_EMAIL, USER1_ROLL);
        user1Id = userRepository.findByEmail(USER1_EMAIL).orElseThrow().getId();

        user2Token = registerAndLogin(USER2_EMAIL, USER2_ROLL);
        user2Id = userRepository.findByEmail(USER2_EMAIL).orElseThrow().getId();
    }

    @AfterEach
    void cleanup() {
        claimRepository.deleteAll();
        matchRepository.deleteAll();
        foundItemRepository.deleteAll();
        userRepository.findByEmail(USER1_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(USER2_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    void createFoundItemSuccess() throws Exception {
        String body = """
            {
                "itemName": "Blue Backpack",
                "description": "Found near library counter",
                "category": "Bags",
                "color": "Blue",
                "foundDateTime": "2026-08-22T10:30:00",
                "foundLocation": "Central Library"
            }
            """;

        mockMvc.perform(post("/api/found-items")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.itemName").value("Blue Backpack"))
            .andExpect(jsonPath("$.userId").value(user1Id))
            .andExpect(jsonPath("$.status").value("FOUND"))
            .andExpect(jsonPath("$.category").value("Bags"))
            .andExpect(jsonPath("$.color").value("Blue"));
    }

    @Test
    void createFoundItemRequiresAuth() throws Exception {
        String body = """
            {
                "itemName": "Blue Backpack",
                "description": "Found near library",
                "category": "Bags",
                "foundDateTime": "2026-08-22T10:30:00",
                "foundLocation": "Library"
            }
            """;

        mockMvc.perform(post("/api/found-items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void createFoundItemValidationFailure() throws Exception {
        // Missing required itemName and description
        String body = """
            {
                "category": "Bags",
                "foundDateTime": "2026-08-22T10:30:00",
                "foundLocation": "Library"
            }
            """;

        mockMvc.perform(post("/api/found-items")
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void getAllFoundItems() throws Exception {
        createItemForUser(user1Token, "Item A");
        createItemForUser(user2Token, "Item B");

        mockMvc.perform(get("/api/found-items")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    void getMyFoundItems() throws Exception {
        createItemForUser(user1Token, "My Item");
        createItemForUser(user2Token, "Other Item");

        mockMvc.perform(get("/api/found-items/my")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].itemName").value("My Item"))
            .andExpect(jsonPath("$[0].userId").value(user1Id));
    }

    @Test
    void getFoundItemById() throws Exception {
        Long itemId = createItemForUser(user1Token, "Specific Item");

        mockMvc.perform(get("/api/found-items/" + itemId)
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(itemId))
            .andExpect(jsonPath("$.itemName").value("Specific Item"));
    }

    @Test
    void getFoundItemByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/found-items/999999")
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void updateFoundItemOwnerAllowed() throws Exception {
        Long itemId = createItemForUser(user1Token, "Original Name");

        String updateBody = """
            {
                "itemName": "Updated Name",
                "description": "Updated Description",
                "category": "Bags",
                "color": "Red",
                "foundDateTime": "2026-08-22T10:30:00",
                "foundLocation": "Canteen"
            }
            """;

        mockMvc.perform(put("/api/found-items/" + itemId)
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.itemName").value("Updated Name"))
            .andExpect(jsonPath("$.color").value("Red"))
            .andExpect(jsonPath("$.foundLocation").value("Canteen"));
    }

    @Test
    void updateFoundItemOtherUserForbidden() throws Exception {
        Long itemId = createItemForUser(user1Token, "User1 Item");

        String updateBody = """
            {
                "itemName": "Hacked Name",
                "description": "Updated Description",
                "category": "Bags",
                "foundDateTime": "2026-08-22T10:30:00",
                "foundLocation": "Canteen"
            }
            """;

        mockMvc.perform(put("/api/found-items/" + itemId)
                .header("Authorization", "Bearer " + user2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateBody))
            .andExpect(status().isForbidden());
    }

    @Test
    void deleteFoundItemOwnerAllowed() throws Exception {
        Long itemId = createItemForUser(user1Token, "To Be Deleted");

        mockMvc.perform(delete("/api/found-items/" + itemId)
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/found-items/" + itemId)
                .header("Authorization", "Bearer " + user1Token))
            .andExpect(status().isNotFound());
    }

    @Test
    void deleteFoundItemOtherUserForbidden() throws Exception {
        Long itemId = createItemForUser(user1Token, "User1 Item");

        mockMvc.perform(delete("/api/found-items/" + itemId)
                .header("Authorization", "Bearer " + user2Token))
            .andExpect(status().isForbidden());
    }

    // ---------- helpers ----------

    private String registerAndLogin(String email, String roll) throws Exception {
        userRepository.findByEmail(email).ifPresent(userRepository::delete);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"studentName":"Test","rollNumber":"%s","className":"CS","email":"%s","password":"%s"}
                    """.formatted(roll, email, PASSWORD)))
            .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"%s","password":"%s"}
                    """.formatted(email, PASSWORD)))
            .andExpect(status().isOk())
            .andReturn();

        return JsonPath.read(result.getResponse().getContentAsString(), "$.token");
    }

    private Long createItemForUser(String token, String name) throws Exception {
        String body = """
            {
                "itemName": "%s",
                "description": "Item description",
                "category": "General",
                "color": "Black",
                "foundDateTime": "2026-08-22T10:00:00",
                "foundLocation": "Main Hall"
            }
            """.formatted(name);

        MvcResult result = mockMvc.perform(post("/api/found-items")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn();

        Number id = JsonPath.read(result.getResponse().getContentAsString(), "$.id");
        return id.longValue();
    }
}
