package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.Match;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.ClaimRepository;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ClaimIntegrationTests {

    private static final String CLAIMANT_EMAIL = "claimant.student@example.com";
    private static final String CLAIMANT_ROLL = "CLAIM-2026-001";
    private static final String OTHER_EMAIL = "other.student@example.com";
    private static final String OTHER_ROLL = "CLAIM-2026-002";
    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ClaimRepository claimRepository;

    private String claimantToken;
    private User claimantUser;
    private String otherToken;
    private User otherUser;

    private LostItem lostItem;
    private FoundItem foundItem;

    @BeforeEach
    void setup() throws Exception {
        claimantToken = registerAndLogin(CLAIMANT_EMAIL, CLAIMANT_ROLL);
        claimantUser = userRepository.findByEmail(CLAIMANT_EMAIL).orElseThrow();

        otherToken = registerAndLogin(OTHER_EMAIL, OTHER_ROLL);
        otherUser = userRepository.findByEmail(OTHER_EMAIL).orElseThrow();

        // Create a LostItem owned by claimant
        lostItem = new LostItem();
        lostItem.setUser(claimantUser);
        lostItem.setItemName("Lost Scientific Calculator");
        lostItem.setDescription("Casio FX-991EX with serial sticker");
        lostItem.setCategory("Electronics");
        lostItem.setColor("Black");
        lostItem.setLostDateTime(LocalDateTime.now().minusDays(1));
        lostItem.setLastSeenLocation("Exam Hall B");
        lostItem.setStatus("LOST");
        lostItem = lostItemRepository.save(lostItem);

        // Create a FoundItem found by other student
        foundItem = new FoundItem();
        foundItem.setUser(otherUser);
        foundItem.setItemName("Found Scientific Calculator");
        foundItem.setDescription("Casio scientific calculator found on desk");
        foundItem.setCategory("Electronics");
        foundItem.setColor("Black");
        foundItem.setFoundDateTime(LocalDateTime.now());
        foundItem.setFoundLocation("Exam Hall B");
        foundItem.setStatus("FOUND");
        foundItem = foundItemRepository.save(foundItem);

        // Create Match
        Match match = new Match();
        match.setLostItem(lostItem);
        match.setFoundItem(foundItem);
        match.setMatchScore(BigDecimal.valueOf(90.00));
        match.setMatchStatus("POSSIBLE");
        matchRepository.save(match);
    }

    @AfterEach
    void cleanup() {
        claimRepository.deleteAll();
        matchRepository.deleteAll();
        foundItemRepository.deleteAll();
        lostItemRepository.deleteAll();
        userRepository.findByEmail(CLAIMANT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(OTHER_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    void createClaimSuccess() throws Exception {
        String body = """
            {
                "lostItemId": %d,
                "foundItemId": %d,
                "verificationAnswer": "Serial number sticker on the back is SN-987654"
            }
            """.formatted(lostItem.getId(), foundItem.getId());

        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.lostItemId").value(lostItem.getId()))
            .andExpect(jsonPath("$.foundItemId").value(foundItem.getId()))
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.createdAt", notNullValue()))
            .andExpect(jsonPath("$.verificationAnswer").doesNotExist())
            .andExpect(jsonPath("$.claimantUserId").doesNotExist());

        // Verify match status was updated to CLAIMED
        Match updatedMatch = matchRepository.findByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId()).orElseThrow();
        assertThat(updatedMatch.getMatchStatus()).isEqualTo("CLAIMED");
    }

    @Test
    void createClaimWithoutAuthIsUnauthorized() throws Exception {
        String body = """
            {
                "lostItemId": %d,
                "foundItemId": %d,
                "verificationAnswer": "My verification details"
            }
            """.formatted(lostItem.getId(), foundItem.getId());

        mockMvc.perform(post("/api/claims")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void createClaimMissingFieldsValidation() throws Exception {
        String body = """
            {
                "lostItemId": %d
            }
            """.formatted(lostItem.getId());

        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void createClaimLostItemNotFound() throws Exception {
        String body = """
            {
                "lostItemId": 999999,
                "foundItemId": %d,
                "verificationAnswer": "My proof"
            }
            """.formatted(foundItem.getId());

        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void createClaimFoundItemNotFound() throws Exception {
        String body = """
            {
                "lostItemId": %d,
                "foundItemId": 999999,
                "verificationAnswer": "My proof"
            }
            """.formatted(lostItem.getId());

        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void createClaimDuplicateConflict() throws Exception {
        String body = """
            {
                "lostItemId": %d,
                "foundItemId": %d,
                "verificationAnswer": "First claim attempt"
            }
            """.formatted(lostItem.getId(), foundItem.getId());

        // First attempt succeeds
        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated());

        // Second attempt fails with 409 Conflict
        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void getMyClaimsReturnsOnlyClaimantClaims() throws Exception {
        // Claimant creates claim
        String body = """
            {
                "lostItemId": %d,
                "foundItemId": %d,
                "verificationAnswer": "Secret sticker"
            }
            """.formatted(lostItem.getId(), foundItem.getId());

        mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated());

        // Claimant gets their claims
        mockMvc.perform(get("/api/claims/my")
                .header("Authorization", "Bearer " + claimantToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].lostItemId").value(lostItem.getId()))
            .andExpect(jsonPath("$[0].verificationAnswer").doesNotExist());

        // Other user gets their claims -> empty
        mockMvc.perform(get("/api/claims/my")
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getClaimByIdOwnerAllowed() throws Exception {
        String body = """
            {
                "lostItemId": %d,
                "foundItemId": %d,
                "verificationAnswer": "Secret sticker"
            }
            """.formatted(lostItem.getId(), foundItem.getId());

        MvcResult result = mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn();

        Number claimId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(get("/api/claims/" + claimId)
                .header("Authorization", "Bearer " + claimantToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(claimId))
            .andExpect(jsonPath("$.verificationAnswer").doesNotExist());
    }

    @Test
    void getClaimByIdOtherUserForbidden() throws Exception {
        String body = """
            {
                "lostItemId": %d,
                "foundItemId": %d,
                "verificationAnswer": "Secret sticker"
            }
            """.formatted(lostItem.getId(), foundItem.getId());

        MvcResult result = mockMvc.perform(post("/api/claims")
                .header("Authorization", "Bearer " + claimantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andReturn();

        Number claimId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");

        // Other user tries to access claimant's claim -> 403
        mockMvc.perform(get("/api/claims/" + claimId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status").value(403));
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
}
