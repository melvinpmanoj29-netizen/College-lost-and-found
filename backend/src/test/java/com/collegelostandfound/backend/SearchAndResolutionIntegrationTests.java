package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.Claim;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.*;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SearchAndResolutionIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User student1;
    private User student2;
    private User admin;
    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        claimRepository.deleteAll();
        matchRepository.deleteAll();
        lostItemRepository.deleteAll();
        foundItemRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();

        student1 = new User();
        student1.setStudentName("Alice Student");
        student1.setRollNumber("ROLL101");
        student1.setClassName("IT");
        student1.setEmail("alice@college.edu");
        student1.setPasswordHash(passwordEncoder.encode("Pass@123"));
        student1.setRole("STUDENT");
        student1.setCreatedAt(LocalDateTime.now());
        student1.setUpdatedAt(LocalDateTime.now());
        student1 = userRepository.save(student1);

        student2 = new User();
        student2.setStudentName("Bob Finder");
        student2.setRollNumber("ROLL102");
        student2.setClassName("IT");
        student2.setEmail("bob@college.edu");
        student2.setPasswordHash(passwordEncoder.encode("Pass@123"));
        student2.setRole("STUDENT");
        student2.setCreatedAt(LocalDateTime.now());
        student2.setUpdatedAt(LocalDateTime.now());
        student2 = userRepository.save(student2);

        admin = new User();
        admin.setStudentName("Admin User");
        admin.setRollNumber("ADMIN001");
        admin.setClassName("Administration");
        admin.setEmail("admin@college.edu");
        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        admin.setRole("ADMIN");
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        admin = userRepository.save(admin);

        studentToken = jwtService.generateToken(student1);
        adminToken = jwtService.generateToken(admin);
    }

    @Test
    void searchMultiWord_findsMatchingItemAcrossMultipleFields() throws Exception {
        LostItem laptop = new LostItem();
        laptop.setUser(student1);
        laptop.setItemName("Laptop");
        laptop.setDescription("Black HP laptop with sticker");
        laptop.setCategory("Electronics");
        laptop.setColor("Black");
        laptop.setLastSeenLocation("College Library");
        laptop.setLostDateTime(LocalDateTime.now());
        laptop.setStatus("LOST");
        laptop.setIsUrgent(false);
        laptop.setIsArchived(false);
        laptop.setCreatedAt(LocalDateTime.now());
        laptop.setUpdatedAt(LocalDateTime.now());
        lostItemRepository.save(laptop);

        // Search: "black hp laptop"
        mockMvc.perform(get("/api/search?q=black hp laptop")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lostItems", hasSize(1)))
                .andExpect(jsonPath("$.lostItems[0].itemName").value("Laptop"));
    }

    @Test
    void activeListing_excludesReturnedAndResolvedItems() throws Exception {
        LostItem activeItem = new LostItem();
        activeItem.setUser(student1);
        activeItem.setItemName("Blue Water Bottle");
        activeItem.setDescription("Milton flask");
        activeItem.setCategory("Personal Items");
        activeItem.setColor("Blue");
        activeItem.setLastSeenLocation("Cafeteria");
        activeItem.setLostDateTime(LocalDateTime.now());
        activeItem.setStatus("LOST");
        activeItem.setIsUrgent(false);
        activeItem.setIsArchived(false);
        activeItem.setCreatedAt(LocalDateTime.now());
        activeItem.setUpdatedAt(LocalDateTime.now());
        lostItemRepository.save(activeItem);

        LostItem returnedItem = new LostItem();
        returnedItem.setUser(student1);
        returnedItem.setItemName("Leather Wallet");
        returnedItem.setDescription("Brown wallet");
        returnedItem.setCategory("Wallets");
        returnedItem.setColor("Brown");
        returnedItem.setLastSeenLocation("Auditorium");
        returnedItem.setLostDateTime(LocalDateTime.now());
        returnedItem.setStatus("RETURNED");
        returnedItem.setIsUrgent(false);
        returnedItem.setIsArchived(false);
        returnedItem.setCreatedAt(LocalDateTime.now());
        returnedItem.setUpdatedAt(LocalDateTime.now());
        lostItemRepository.save(returnedItem);

        // Student lost listing should only return activeItem
        mockMvc.perform(get("/api/lost-items")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].itemName").value("Blue Water Bottle"));

        // General search should also exclude returned items
        mockMvc.perform(get("/api/search")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lostItems", hasSize(1)))
                .andExpect(jsonPath("$.lostItems[0].itemName").value("Blue Water Bottle"));
    }

    @Test
    void adminHistory_returnsResolvedItemWithTimeline() throws Exception {
        LostItem lost = new LostItem();
        lost.setUser(student1);
        lost.setItemName("Scientific Calculator");
        lost.setDescription("Casio fx-991EX");
        lost.setCategory("Electronics");
        lost.setColor("Black");
        lost.setLastSeenLocation("Room 204");
        lost.setLostDateTime(LocalDateTime.now().minusDays(2));
        lost.setStatus("RETURNED");
        lost.setIsUrgent(false);
        lost.setIsArchived(false);
        lost.setCreatedAt(LocalDateTime.now().minusDays(2));
        lost.setUpdatedAt(LocalDateTime.now());
        lost = lostItemRepository.save(lost);

        FoundItem found = new FoundItem();
        found.setUser(student2);
        found.setItemName("Casio Calculator");
        found.setDescription("Found on desk in 204");
        found.setCategory("Electronics");
        found.setColor("Black");
        found.setFoundLocation("Room 204");
        found.setFoundDateTime(LocalDateTime.now().minusDays(1));
        found.setStatus("RETURNED");
        found.setCreatedAt(LocalDateTime.now().minusDays(1));
        found.setUpdatedAt(LocalDateTime.now());
        found = foundItemRepository.save(found);

        Claim claim = new Claim();
        claim.setLostItem(lost);
        claim.setFoundItem(found);
        claim.setClaimant(student1);
        claim.setVerificationAnswer("Has my initials AM on the battery cover");
        claim.setStatus("APPROVED");
        claim.setCreatedAt(LocalDateTime.now().minusHours(12));
        claim.setReviewedAt(LocalDateTime.now().minusHours(2));
        claim.setReviewedBy(admin);
        claim = claimRepository.save(claim);

        // Admin history list
        mockMvc.perform(get("/api/admin/history")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].itemName").value("Scientific Calculator"))
                .andExpect(jsonPath("$[0].status").value("RESOLVED"))
                .andExpect(jsonPath("$[0].timeline", hasSize(5)));

        // Admin history detail by claim ID
        mockMvc.perform(get("/api/admin/history/" + claim.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimId").value(claim.getId()))
                .andExpect(jsonPath("$.claimant.name").value("Alice Student"))
                .andExpect(jsonPath("$.claimDetail.verificationAnswer").value("Has my initials AM on the battery cover"))
                .andExpect(jsonPath("$.timeline[0].title").value("Lost Report Filed"))
                .andExpect(jsonPath("$.timeline[4].title").value("Item Resolved & Reunited"));
    }

    @Test
    void cannotClaimResolvedItem() throws Exception {
        LostItem lost = new LostItem();
        lost.setUser(student1);
        lost.setItemName("Resolved Wallet");
        lost.setDescription("Brown wallet");
        lost.setCategory("Wallets");
        lost.setLastSeenLocation("Cafeteria");
        lost.setLostDateTime(LocalDateTime.now());
        lost.setStatus("RETURNED");
        lost.setIsUrgent(false);
        lost.setIsArchived(false);
        lost.setCreatedAt(LocalDateTime.now());
        lost.setUpdatedAt(LocalDateTime.now());
        lost = lostItemRepository.save(lost);

        FoundItem found = new FoundItem();
        found.setUser(student2);
        found.setItemName("Resolved Wallet");
        found.setDescription("Brown wallet");
        found.setCategory("Wallets");
        found.setFoundLocation("Cafeteria");
        found.setFoundDateTime(LocalDateTime.now());
        found.setStatus("RETURNED");
        found.setCreatedAt(LocalDateTime.now());
        found.setUpdatedAt(LocalDateTime.now());
        found = foundItemRepository.save(found);

        mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lostItemId\": " + lost.getId() + ", \"foundItemId\": " + found.getId() + ", \"verificationAnswer\": \"Proof\"}"))
                .andExpect(status().isBadRequest());
    }
}
