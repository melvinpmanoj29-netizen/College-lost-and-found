package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.Match;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.ClaimRepository;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.repository.MatchRepository;
import com.collegelostandfound.backend.repository.NotificationRepository;
import com.collegelostandfound.backend.repository.UserRepository;
import com.collegelostandfound.backend.service.SmartMatchingService;
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
class SmartMatchingIntegrationTests {

    private static final String STUDENT_EMAIL = "matcher.student@example.com";
    private static final String STUDENT_ROLL = "MATCH-2026-001";
    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SmartMatchingService smartMatchingService;

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

    @Autowired
    private NotificationRepository notificationRepository;

    private String studentToken;
    private User studentUser;

    @BeforeEach
    void setup() throws Exception {
        claimRepository.deleteAll();
        matchRepository.deleteAll();
        foundItemRepository.deleteAll();
        lostItemRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"studentName":"Matcher Test","rollNumber":"%s","className":"CS","email":"%s","password":"%s"}
                    """.formatted(STUDENT_ROLL, STUDENT_EMAIL, PASSWORD)))
            .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"%s","password":"%s"}
                    """.formatted(STUDENT_EMAIL, PASSWORD)))
            .andExpect(status().isOk())
            .andReturn();

        studentToken = JsonPath.read(result.getResponse().getContentAsString(), "$.token");
        studentUser = userRepository.findByEmail(STUDENT_EMAIL).orElseThrow();
    }

    @AfterEach
    void cleanup() {
        claimRepository.deleteAll();
        matchRepository.deleteAll();
        foundItemRepository.deleteAll();
        lostItemRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    void testRuleBasedScoringCalculation() {
        LostItem lost = new LostItem();
        lost.setCategory("Electronics");
        lost.setColor("Matte Black");
        lost.setLastSeenLocation("Central Library 2nd Floor");
        lost.setLostDateTime(LocalDateTime.of(2026, 8, 20, 10, 0));
        lost.setDescription("Lost my black Sony noise cancelling wireless headphones");

        FoundItem foundExact = new FoundItem();
        foundExact.setCategory("Electronics");
        foundExact.setColor("Black");
        foundExact.setFoundLocation("Central Library");
        foundExact.setFoundDateTime(LocalDateTime.of(2026, 8, 20, 14, 0));
        foundExact.setDescription("Found black Sony wireless headphones near 2nd floor desk");

        BigDecimal score = smartMatchingService.calculateScore(lost, foundExact);
        assertThat(score).isGreaterThanOrEqualTo(BigDecimal.valueOf(70.00));
        assertThat(score).isLessThanOrEqualTo(BigDecimal.valueOf(100.00));
    }

    @Test
    void testScoringMismatchProducesZeroOrLowScore() {
        LostItem lost = new LostItem();
        lost.setCategory("Jewelry");
        lost.setColor("Gold");
        lost.setLastSeenLocation("Gymnasium");
        lost.setLostDateTime(LocalDateTime.of(2026, 8, 1, 10, 0));
        lost.setDescription("Gold ring with small diamond");

        FoundItem found = new FoundItem();
        found.setCategory("Books");
        found.setColor("Blue");
        found.setFoundLocation("Cafeteria");
        found.setFoundDateTime(LocalDateTime.of(2026, 8, 20, 14, 0));
        found.setDescription("Calculus textbook hardcover edition");

        BigDecimal score = smartMatchingService.calculateScore(lost, found);
        assertThat(score).isLessThan(BigDecimal.valueOf(25.00));
    }

    @Test
    void automaticMatchGenerationOnFoundItemCreation() throws Exception {
        // 1. Create an active Lost Item in DB
        LostItem lost = new LostItem();
        lost.setUser(studentUser);
        lost.setItemName("Lost Leather Wallet");
        lost.setDescription("Brown leather wallet containing college ID card");
        lost.setCategory("Wallet");
        lost.setColor("Brown");
        lost.setLostDateTime(LocalDateTime.of(2026, 8, 22, 9, 0));
        lost.setLastSeenLocation("Main Canteen");
        lost.setStatus("LOST");
        lost.setIsUrgent(false);
        lost.setIsArchived(false);
        lost = lostItemRepository.save(lost);

        // 2. Post a matching Found Item through the REST API
        String foundJson = """
            {
                "itemName": "Found Brown Wallet",
                "description": "Found a brown leather wallet on canteen table",
                "category": "Wallet",
                "color": "Brown",
                "foundDateTime": "2026-08-22T12:00:00",
                "foundLocation": "Main Canteen"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/found-items")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(foundJson))
            .andExpect(status().isCreated())
            .andReturn();

        Number foundId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");

        // 3. Query GET /api/matches/found/{foundItemId}
        mockMvc.perform(get("/api/matches/found/" + foundId)
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].lostItemId").value(lost.getId()))
            .andExpect(jsonPath("$[0].foundItemId").value(foundId))
            .andExpect(jsonPath("$[0].matchStatus").value("POSSIBLE"))
            .andExpect(jsonPath("$[0].matchScore", greaterThan(70.0)));

        // 4. Query GET /api/matches/lost/{lostItemId}
        mockMvc.perform(get("/api/matches/lost/" + lost.getId())
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].matchStatus").value("POSSIBLE"));
    }

    @Test
    void getMatchByIdEndpoint() throws Exception {
        LostItem lost = new LostItem();
        lost.setUser(studentUser);
        lost.setItemName("Lost Umbrella");
        lost.setDescription("Black folding umbrella");
        lost.setCategory("Accessories");
        lost.setLostDateTime(LocalDateTime.now());
        lost.setLastSeenLocation("Gate 1");
        lost.setStatus("LOST");
        lost = lostItemRepository.save(lost);

        FoundItem found = new FoundItem();
        found.setUser(studentUser);
        found.setItemName("Found Umbrella");
        found.setDescription("Black folding umbrella near gate 1");
        found.setCategory("Accessories");
        found.setColor("Black");
        found.setFoundDateTime(LocalDateTime.now());
        found.setFoundLocation("Gate 1");
        found.setStatus("FOUND");
        found = foundItemRepository.save(found);

        Match match = new Match();
        match.setLostItem(lost);
        match.setFoundItem(found);
        match.setMatchScore(BigDecimal.valueOf(85.00));
        match.setMatchStatus("POSSIBLE");
        match = matchRepository.save(match);

        mockMvc.perform(get("/api/matches/" + match.getId())
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(match.getId()))
            .andExpect(jsonPath("$.lostItemId").value(lost.getId()))
            .andExpect(jsonPath("$.foundItemId").value(found.getId()))
            .andExpect(jsonPath("$.matchScore").value(85.0))
            .andExpect(jsonPath("$.matchStatus").value("POSSIBLE"))
            .andExpect(jsonPath("$.verificationAnswer").doesNotExist());
    }
}
