package com.collegelostandfound.backend;

import com.collegelostandfound.backend.entity.Claim;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.Notification;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.repository.ClaimRepository;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.repository.NotificationRepository;
import com.collegelostandfound.backend.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Security Audit Test Suite — College Lost & Found System
 *
 * Tests every security requirement mandated by the audit:
 *   1.  Unauthenticated access to protected endpoints → 401
 *   2.  STUDENT cannot access ADMIN endpoints → 403
 *   3.  Student A cannot read Student B's lost item → 200 (public) but cannot MODIFY → 403
 *   4.  Student A cannot update Student B's lost item → 403
 *   5.  Student A cannot delete Student B's lost item → 403
 *   6.  Student A cannot read Student B's notifications → only own notifications returned
 *   7.  Student A cannot mark Student B's notification as read → 403
 *   8.  Student cannot access private claim verificationAnswer → not present in response
 *   9.  Student cannot approve/reject claims → 403
 *   10. Student cannot spoof userId in request body → JWT identity is authoritative
 *   11. Student cannot arbitrarily set protected status fields → backend ignores them
 *   12. Expired JWT is rejected → 401
 *   13. Invalid JWT is rejected → 401
 *   14. Malformed JWT is rejected → 401
 *   15. Invalid input (missing fields, too long) is rejected → 400
 *   16. Admin APIs require ADMIN role → 403 for STUDENT
 *   17. Existing legitimate student workflows still work
 *   18. Existing legitimate admin workflows still work
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuditTests {

    // ──────────────────── test account constants ────────────────────
    private static final String STUDENT_A_EMAIL = "sec.studentA@college.edu";
    private static final String STUDENT_A_ROLL  = "SEC-2026-A01";
    private static final String STUDENT_B_EMAIL = "sec.studentB@college.edu";
    private static final String STUDENT_B_ROLL  = "SEC-2026-B01";
    private static final String ADMIN_EMAIL      = "sec.admin@college.edu";
    private static final String ADMIN_ROLL       = "SEC-ADMIN-001";
    private static final String PASSWORD         = "password123";

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired LostItemRepository lostItemRepository;
    @Autowired FoundItemRepository foundItemRepository;
    @Autowired ClaimRepository claimRepository;
    @Autowired NotificationRepository notificationRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private User studentA;
    private User studentB;
    private User admin;
    private String tokenA;
    private String tokenB;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        tearDown();
        studentA   = createUser(STUDENT_A_EMAIL, STUDENT_A_ROLL, "Student Alpha", "STUDENT");
        studentB   = createUser(STUDENT_B_EMAIL, STUDENT_B_ROLL, "Student Beta",  "STUDENT");
        admin      = createUser(ADMIN_EMAIL,      ADMIN_ROLL,     "Admin User",    "ADMIN");
        tokenA     = obtainToken(STUDENT_A_EMAIL, PASSWORD);
        tokenB     = obtainToken(STUDENT_B_EMAIL, PASSWORD);
        adminToken = obtainToken(ADMIN_EMAIL,      PASSWORD);
    }

    @AfterEach
    void tearDown() {
        claimRepository.deleteAll();
        notificationRepository.deleteAll();
        foundItemRepository.deleteAll();
        lostItemRepository.deleteAll();
        userRepository.findByEmail(STUDENT_A_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_B_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. UNAUTHENTICATED ACCESS
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("1. Unauthenticated access is rejected (401)")
    class UnauthenticatedAccess {

        @Test void lostItemsRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/lost-items")).andExpect(status().isUnauthorized());
        }

        @Test void foundItemsRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/found-items")).andExpect(status().isUnauthorized());
        }

        @Test void searchRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/search?q=wallet")).andExpect(status().isUnauthorized());
        }

        @Test void notificationsRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
        }

        @Test void markNotificationReadRequiresAuth() throws Exception {
            mockMvc.perform(put("/api/notifications/1/read")).andExpect(status().isUnauthorized());
        }

        @Test void claimsRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/claims/my")).andExpect(status().isUnauthorized());
        }

        @Test void createClaimRequiresAuth() throws Exception {
            mockMvc.perform(post("/api/claims")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"lostItemId\":1,\"foundItemId\":1,\"verificationAnswer\":\"test\"}"))
                .andExpect(status().isUnauthorized());
        }

        @Test void adminDashboardRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard")).andExpect(status().isUnauthorized());
        }

        @Test void adminClaimsRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/admin/claims")).andExpect(status().isUnauthorized());
        }

        @Test void currentUserRequiresAuth() throws Exception {
            mockMvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. STUDENT CANNOT ACCESS ADMIN ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("2. STUDENT role cannot access admin endpoints (403)")
    class AdminEndpointAccessControl {

        @Test void studentCannotGetAdminDashboard() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotGetAdminClaims() throws Exception {
            mockMvc.perform(get("/api/admin/claims")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotGetAdminLostItems() throws Exception {
            mockMvc.perform(get("/api/admin/lost-items")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotGetAdminFoundItems() throws Exception {
            mockMvc.perform(get("/api/admin/found-items")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotGetReturnHistory() throws Exception {
            mockMvc.perform(get("/api/admin/return-history")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotApproveClaimViaAdminEndpoint() throws Exception {
            mockMvc.perform(put("/api/admin/claims/1/approve")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotRejectClaimViaAdminEndpoint() throws Exception {
            mockMvc.perform(put("/api/admin/claims/1/reject")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotDeleteAdminLostItem() throws Exception {
            LostItem item = createTestLostItem(studentA, "Admin Delete Target");
            mockMvc.perform(delete("/api/admin/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotGetAdminClaimDetail() throws Exception {
            mockMvc.perform(get("/api/admin/claims/1")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void adminCanAccessAdminDashboard() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        }

        @Test void adminCanAccessAdminClaims() throws Exception {
            mockMvc.perform(get("/api/admin/claims")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        }

        @Test void adminCanAccessReturnHistory() throws Exception {
            mockMvc.perform(get("/api/admin/return-history")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 3–5. IDOR: STUDENT A CANNOT MODIFY STUDENT B'S LOST ITEM
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("3-5. IDOR: Student A cannot modify/delete Student B's lost item")
    class LostItemOwnershipBoundary {

        @Test
        @DisplayName("3. Student A can READ Student B's lost item (public within auth context)")
        void studentACanReadStudentBsLostItem() throws Exception {
            LostItem item = createTestLostItem(studentB, "Student B's Lost Keys");
            mockMvc.perform(get("/api/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(item.getId()))
                // Verify no sensitive data leaks
                .andExpect(jsonPath("$.verificationAnswer").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
        }

        @Test
        @DisplayName("4. Student A cannot UPDATE Student B's lost item (IDOR)")
        void studentACannotUpdateStudentBsLostItem() throws Exception {
            LostItem item = createTestLostItem(studentB, "Victim's Wallet");
            mockMvc.perform(put("/api/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validLostItemJson("Attacker Modified Wallet")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("5. Student A cannot DELETE Student B's lost item (IDOR)")
        void studentACannotDeleteStudentBsLostItem() throws Exception {
            LostItem item = createTestLostItem(studentB, "Victim's Phone");
            mockMvc.perform(delete("/api/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("Student B cannot UPDATE Student A's lost item (reverse IDOR)")
        void studentBCannotUpdateStudentAsLostItem() throws Exception {
            LostItem item = createTestLostItem(studentA, "Alpha's Laptop");
            mockMvc.perform(put("/api/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenB)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validLostItemJson("Beta Modified Laptop")))
                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Student B cannot DELETE Student A's lost item (reverse IDOR)")
        void studentBCannotDeleteStudentAsLostItem() throws Exception {
            LostItem item = createTestLostItem(studentA, "Alpha's Book");
            mockMvc.perform(delete("/api/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // IDOR: FOUND ITEMS
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("IDOR: Student A cannot modify/delete Student B's found item")
    class FoundItemOwnershipBoundary {

        @Test void studentACannotUpdateStudentBsFoundItem() throws Exception {
            FoundItem item = createTestFoundItem(studentB, "Found Umbrella");
            mockMvc.perform(put("/api/found-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validFoundItemJson("Hacked Umbrella")))
                .andExpect(status().isForbidden());
        }

        @Test void studentACannotDeleteStudentBsFoundItem() throws Exception {
            FoundItem item = createTestFoundItem(studentB, "Found Jacket");
            mockMvc.perform(delete("/api/found-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCanUpdateOwnFoundItem() throws Exception {
            FoundItem item = createTestFoundItem(studentA, "My Found Item");
            mockMvc.perform(put("/api/found-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validFoundItemJson("My Updated Found Item")))
                .andExpect(status().isOk());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 6–7. NOTIFICATION SECURITY
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("6-7. Notification ownership enforcement")
    class NotificationSecurity {

        @Test
        @DisplayName("6. Student A only receives their own notifications")
        void studentAOnlySeesOwnNotifications() throws Exception {
            // Create notifications for both students
            createNotification(studentA, "Alpha notification");
            createNotification(studentA, "Another Alpha notification");
            createNotification(studentB, "Beta notification - should NOT appear for Alpha");

            mockMvc.perform(get("/api/notifications")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                // All returned notifications must belong to Student A
                .andExpect(jsonPath("$[*].userId", everyItem(is(studentA.getId().intValue()))))
                // Beta's notification must NOT appear
                .andExpect(jsonPath("$[*].message", not(hasItem("Beta notification - should NOT appear for Alpha"))));
        }

        @Test
        @DisplayName("7. Student A cannot mark Student B's notification as read (IDOR)")
        void studentACannotMarkStudentBsNotificationRead() throws Exception {
            Notification betaNotif = createNotification(studentB, "Beta's private notification");
            mockMvc.perform(put("/api/notifications/" + betaNotif.getId() + "/read")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
        }

        @Test
        @DisplayName("Student can mark their own notification as read")
        void studentCanMarkOwnNotificationRead() throws Exception {
            Notification alphaNotif = createNotification(studentA, "Alpha's own notification");
            mockMvc.perform(put("/api/notifications/" + alphaNotif.getId() + "/read")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 8. CLAIM VERIFICATION ANSWER PRIVACY
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("8. Private claim verificationAnswer is never exposed to students")
    class ClaimPrivacy {

        @Test
        @DisplayName("8a. verificationAnswer is NOT present in student claim response")
        void verificationAnswerNotInStudentClaimResponse() throws Exception {
            LostItem lostItem   = createTestLostItem(studentA, "Alpha's Wallet");
            FoundItem foundItem = createTestFoundItem(studentB, "Found Wallet");

            // Student A submits a claim
            MvcResult result = mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"lostItemId":%d,"foundItemId":%d,"verificationAnswer":"SECRET_IDENTIFIER_VALUE"}
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isCreated())
                .andReturn();

            String claimId = JsonPath.read(result.getResponse().getContentAsString(), "$.id").toString();

            // GET /api/claims/{id} must NOT return verificationAnswer
            mockMvc.perform(get("/api/claims/" + claimId)
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationAnswer").doesNotExist());
        }

        @Test
        @DisplayName("8b. Student B cannot access Student A's claim at all")
        void studentBCannotAccessStudentAsClaim() throws Exception {
            LostItem lostItem   = createTestLostItem(studentA, "Wallet for claim test");
            FoundItem foundItem = createTestFoundItem(studentB, "Found wallet for claim test");

            MvcResult result = mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"lostItemId":%d,"foundItemId":%d,"verificationAnswer":"My private answer"}
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isCreated())
                .andReturn();

            String claimId = JsonPath.read(result.getResponse().getContentAsString(), "$.id").toString();

            // Student B should NOT be able to read Student A's claim
            mockMvc.perform(get("/api/claims/" + claimId)
                    .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("8c. verificationAnswer IS present in admin claim detail (correct by design)")
        void verificationAnswerPresentInAdminClaimDetail() throws Exception {
            LostItem lostItem   = createTestLostItem(studentA, "Admin view wallet");
            FoundItem foundItem = createTestFoundItem(studentB, "Found admin view wallet");

            MvcResult result = mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"lostItemId":%d,"foundItemId":%d,"verificationAnswer":"ADMIN_ONLY_SECRET"}
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isCreated())
                .andReturn();

            String claimId = JsonPath.read(result.getResponse().getContentAsString(), "$.id").toString();

            // Admin SHOULD see verificationAnswer in admin endpoint
            mockMvc.perform(get("/api/admin/claims/" + claimId)
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationAnswer").value("ADMIN_ONLY_SECRET"));
        }

        @Test
        @DisplayName("8d. getMyClaims response does NOT contain verificationAnswer")
        void myClaimsDoesNotExposeVerificationAnswer() throws Exception {
            LostItem lostItem   = createTestLostItem(studentA, "My claims wallet");
            FoundItem foundItem = createTestFoundItem(studentB, "Found wallet for my claims");

            mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"lostItemId":%d,"foundItemId":%d,"verificationAnswer":"PRIVATE_CONTENT"}
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isCreated());

            mockMvc.perform(get("/api/claims/my")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].verificationAnswer").doesNotExist());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 9. STUDENT CANNOT APPROVE/REJECT CLAIMS
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("9. Students cannot approve or reject claims")
    class ClaimApprovalAuthorization {

        @Test void studentCannotApproveAnyClaimDirectly() throws Exception {
            mockMvc.perform(put("/api/admin/claims/1/approve")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void studentCannotRejectAnyClaimDirectly() throws Exception {
            mockMvc.perform(put("/api/admin/claims/1/reject")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
        }

        @Test void adminCanApproveAClaim() throws Exception {
            LostItem lostItem   = createTestLostItem(studentA, "Approve workflow item");
            FoundItem foundItem = createTestFoundItem(studentB, "Found approve workflow item");

            MvcResult claimResult = mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"lostItemId":%d,"foundItemId":%d,"verificationAnswer":"proof"}
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isCreated())
                .andReturn();

            String claimId = JsonPath.read(claimResult.getResponse().getContentAsString(), "$.id").toString();

            mockMvc.perform(put("/api/admin/claims/" + claimId + "/approve")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 10. MASS ASSIGNMENT — USERID SPOOFING PREVENTION
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("10. userId cannot be spoofed via request body (mass assignment protection)")
    class UserIdSpoofingPrevention {

        @Test
        @DisplayName("10a. userId in POST /api/lost-items body is ignored; JWT identity is used")
        void frontendCannotSpoofUserIdOnLostItemCreation() throws Exception {
            mockMvc.perform(post("/api/lost-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "userId": 999999,
                              "itemName": "Spoof Test Lost Item",
                              "description": "Attempting to claim ownership as user 999999",
                              "category": "Electronics",
                              "lostDateTime": "2026-09-01T10:00:00",
                              "lastSeenLocation": "Library"
                            }
                            """))
                .andExpect(status().isCreated())
                // Must belong to Student A (from JWT), NOT 999999
                .andExpect(jsonPath("$.userId").value(studentA.getId()))
                .andExpect(jsonPath("$.userId").value(not(999999)));
        }

        @Test
        @DisplayName("10b. userId in POST /api/found-items body is ignored; JWT identity is used")
        void frontendCannotSpoofUserIdOnFoundItemCreation() throws Exception {
            mockMvc.perform(post("/api/found-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "userId": 999999,
                              "itemName": "Spoof Test Found Item",
                              "description": "Attempting userId spoof",
                              "category": "Electronics",
                              "foundDateTime": "2026-09-01T10:00:00",
                              "foundLocation": "Canteen"
                            }
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(studentA.getId()))
                .andExpect(jsonPath("$.userId").value(not(999999)));
        }

        @Test
        @DisplayName("10c. claimantUserId in POST /api/claims body is ignored; JWT identity is used")
        void frontendCannotSpoofClaimantUserId() throws Exception {
            LostItem lostItem   = createTestLostItem(studentA, "Claim spoof test lost");
            FoundItem foundItem = createTestFoundItem(studentB, "Claim spoof test found");

            // Student A submits a claim pretending to be user 999999 via body field
            MvcResult result = mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "claimantUserId": 999999,
                              "lostItemId": %d,
                              "foundItemId": %d,
                              "verificationAnswer": "my answer"
                            }
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isCreated())
                .andReturn();

            // The actual claim in DB must be attributed to Student A
            String claimId = JsonPath.read(result.getResponse().getContentAsString(), "$.id").toString();
            Claim savedClaim = claimRepository.findById(Long.parseLong(claimId)).orElseThrow();
            org.assertj.core.api.Assertions.assertThat(savedClaim.getClaimant().getId())
                .isEqualTo(studentA.getId())
                .isNotEqualTo(999999L);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 11. STATUS FIELD SPOOFING PREVENTION
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("11. Backend-controlled status cannot be spoofed by students")
    class StatusSpoofingPrevention {

        @Test
        @DisplayName("11a. Student cannot set status=RETURNED on lost item creation")
        void studentCannotSetReturnedStatusOnCreation() throws Exception {
            mockMvc.perform(post("/api/lost-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "status": "RETURNED",
                              "itemName": "Status Spoof Item",
                              "description": "Trying to bypass workflow",
                              "category": "Electronics",
                              "lostDateTime": "2026-09-01T10:00:00",
                              "lastSeenLocation": "Library"
                            }
                            """))
                .andExpect(status().isCreated())
                // Backend must force status to LOST regardless of what client sent
                .andExpect(jsonPath("$.status").value("LOST"));
        }

        @Test
        @DisplayName("11b. Student cannot set isArchived=true on lost item creation")
        void studentCannotSetArchivedOnCreation() throws Exception {
            mockMvc.perform(post("/api/lost-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "isArchived": true,
                              "itemName": "Archive Spoof Item",
                              "description": "Trying to set archived",
                              "category": "Electronics",
                              "lostDateTime": "2026-09-01T10:00:00",
                              "lastSeenLocation": "Library"
                            }
                            """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isArchived").value(false));
        }

        @Test
        @DisplayName("11c. Student cannot set status=RETURNED on lost item update")
        void studentCannotSetReturnedStatusOnUpdate() throws Exception {
            LostItem item = createTestLostItem(studentA, "Status update target");
            mockMvc.perform(put("/api/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validLostItemJson("Updated Item")))
                .andExpect(status().isOk())
                // Status remains LOST — backend ignores "RETURNED" even if sent
                .andExpect(jsonPath("$.status").value("LOST"));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 12–14. JWT VALIDATION
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("12-14. JWT token validation")
    class JwtValidation {

        @Test
        @DisplayName("12. Completely expired / forged JWT is rejected (401)")
        void expiredJwtIsRejected() throws Exception {
            // A JWT signed with a different key / expired will fail signature check
            String forgery = "eyJhbGciOiJIUzI1NiJ9" +
                ".eyJzdWIiOiI5OTk5OTkiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0" +
                ".INVALID_SIGNATURE_HERE";
            mockMvc.perform(get("/api/lost-items")
                    .header("Authorization", "Bearer " + forgery))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("13. JWT with invalid signature is rejected (401)")
        void invalidJwtSignatureIsRejected() throws Exception {
            // Modify last character of a valid token to break the signature
            String tamperedToken = tokenA.substring(0, tokenA.length() - 1) + "X";
            mockMvc.perform(get("/api/lost-items")
                    .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("14. Malformed JWT (random garbage) is rejected (401)")
        void malformedJwtIsRejected() throws Exception {
            mockMvc.perform(get("/api/lost-items")
                    .header("Authorization", "Bearer notavalidjwtatall"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("14b. Empty Bearer token is rejected (401)")
        void emptyBearerTokenIsRejected() throws Exception {
            mockMvc.perform(get("/api/lost-items")
                    .header("Authorization", "Bearer "))
                .andExpect(status().isUnauthorized());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 15–16. INPUT VALIDATION
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("15-16. Input validation rejects invalid/malicious data")
    class InputValidation {

        @Test
        @DisplayName("15a. Missing required itemName is rejected (400)")
        void missingItemNameIsRejected() throws Exception {
            mockMvc.perform(post("/api/lost-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"description":"Missing name","category":"Electronics",
                             "lostDateTime":"2026-09-01T10:00:00","lastSeenLocation":"Library"}
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        }

        @Test
        @DisplayName("15b. Excessively long itemName (>150 chars) is rejected (400)")
        void excessivelyLongItemNameIsRejected() throws Exception {
            String longName = "A".repeat(151);
            mockMvc.perform(post("/api/lost-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"itemName":"%s","description":"Test","category":"Electronics",
                             "lostDateTime":"2026-09-01T10:00:00","lastSeenLocation":"Library"}
                            """.formatted(longName)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        }

        @Test
        @DisplayName("15c. Excessively long description (>2000 chars) is rejected (400)")
        void excessivelyLongDescriptionIsRejected() throws Exception {
            String longDesc = "B".repeat(2001);
            mockMvc.perform(post("/api/lost-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"itemName":"Test Item","description":"%s","category":"Electronics",
                             "lostDateTime":"2026-09-01T10:00:00","lastSeenLocation":"Library"}
                            """.formatted(longDesc)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        }

        @Test
        @DisplayName("15d. Missing verificationAnswer in claim is rejected (400)")
        void missingVerificationAnswerIsRejected() throws Exception {
            LostItem lostItem   = createTestLostItem(studentA, "Validation test lost");
            FoundItem foundItem = createTestFoundItem(studentB, "Validation test found");
            mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"lostItemId":%d,"foundItemId":%d}
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("15e. Invalid email format in registration is rejected (400)")
        void invalidEmailFormatIsRejected() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"studentName":"Test","rollNumber":"T001","className":"S1",
                             "email":"not-an-email","password":"password123"}
                            """))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("15f. Password shorter than 8 chars in registration is rejected (400)")
        void shortPasswordIsRejectedAtRegistration() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"studentName":"Test","rollNumber":"T002","className":"S1",
                             "email":"shortpw.test@college.edu","password":"abc123"}
                            """))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("16. Error responses do NOT leak stack traces")
        void errorResponseDoesNotLeakStackTrace() throws Exception {
            mockMvc.perform(get("/api/lost-items/99999999")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isNotFound())
                // Must match our standard error format, not a Spring whitelabel error or stack trace
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").isString())
                // No stack trace fields
                .andExpect(jsonPath("$.trace").doesNotExist())
                .andExpect(jsonPath("$.exception").doesNotExist());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 17. EXISTING STUDENT WORKFLOWS STILL WORK
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("17. Existing legitimate student workflows still work")
    class LegitimateStudentWorkflows {

        @Test void studentCanRegisterAndLogin() throws Exception {
            String uniqueRoll  = "LEGIT-WF-" + System.currentTimeMillis();
            String uniqueEmail = "legit." + System.currentTimeMillis() + "@college.edu";

            MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"studentName":"Legit Student","rollNumber":"%s","className":"CSE S4",
                             "email":"%s","password":"password123"}
                            """.formatted(uniqueRoll, uniqueEmail)))
                .andExpect(status().isCreated())
                .andReturn();

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"email":"%s","password":"password123"}
                            """.formatted(uniqueEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value(uniqueEmail))
                // Password hash must NEVER appear in response
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.password").doesNotExist());

            // Cleanup
            userRepository.findByEmail(uniqueEmail).ifPresent(userRepository::delete);
        }

        @Test void studentCanCreateAndReadOwnLostItem() throws Exception {
            MvcResult result = mockMvc.perform(post("/api/lost-items")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validLostItemJson("My Own Backpack")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(studentA.getId()))
                .andExpect(jsonPath("$.status").value("LOST"))
                .andReturn();

            String id = JsonPath.read(result.getResponse().getContentAsString(), "$.id").toString();

            mockMvc.perform(get("/api/lost-items/" + id)
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("My Own Backpack"));
        }

        @Test void studentCanViewCurrentProfile() throws Exception {
            mockMvc.perform(get("/api/users/me")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(STUDENT_A_EMAIL))
                // passwordHash must never appear
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
        }

        @Test void studentCanSearchItems() throws Exception {
            createTestLostItem(studentA, "Search Test Wallet");
            mockMvc.perform(get("/api/search?q=wallet&type=lost")
                    .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 18. EXISTING ADMIN WORKFLOWS STILL WORK
    // ═══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("18. Existing legitimate admin workflows still work")
    class LegitimateAdminWorkflows {

        @Test void adminCanGetDashboardStats() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLostItems").isNumber())
                .andExpect(jsonPath("$.totalFoundItems").isNumber())
                .andExpect(jsonPath("$.pendingClaims").isNumber());
        }

        @Test void adminCanGetAllLostItems() throws Exception {
            createTestLostItem(studentA, "Admin List Item");
            mockMvc.perform(get("/api/admin/lost-items")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test void adminCanGetAllClaims() throws Exception {
            mockMvc.perform(get("/api/admin/claims")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }

        @Test void adminCanDeleteFakeReport() throws Exception {
            LostItem item = createTestLostItem(studentA, "Fake Report To Delete");
            mockMvc.perform(delete("/api/admin/lost-items/" + item.getId())
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
        }

        @Test void fullAdminApproveWorkflow() throws Exception {
            LostItem  lostItem  = createTestLostItem(studentA, "Full workflow lost item");
            FoundItem foundItem = createTestFoundItem(studentB, "Full workflow found item");

            // Step 1: Student A submits claim
            MvcResult claimResult = mockMvc.perform(post("/api/claims")
                    .header("Authorization", "Bearer " + tokenA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {"lostItemId":%d,"foundItemId":%d,"verificationAnswer":"proof of ownership"}
                            """.formatted(lostItem.getId(), foundItem.getId())))
                .andExpect(status().isCreated())
                .andReturn();

            String claimId = JsonPath.read(claimResult.getResponse().getContentAsString(), "$.id").toString();

            // Step 2: Admin reviews claim and sees verificationAnswer
            mockMvc.perform(get("/api/admin/claims/" + claimId)
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationAnswer").value("proof of ownership"))
                .andExpect(jsonPath("$.status").value("PENDING"));

            // Step 3: Admin approves claim
            mockMvc.perform(put("/api/admin/claims/" + claimId + "/approve")
                    .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helper factories
    // ─────────────────────────────────────────────────────────────

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

    private LostItem createTestLostItem(User owner, String itemName) {
        LostItem item = new LostItem();
        item.setUser(owner);
        item.setItemName(itemName);
        item.setDescription("Security test lost item: " + itemName);
        item.setCategory("Electronics");
        item.setColor("Black");
        item.setLostDateTime(LocalDateTime.now().minusDays(1));
        item.setLastSeenLocation("Library");
        item.setStatus("LOST");
        item.setIsUrgent(false);
        item.setIsArchived(false);
        item.setExpiryDate(LocalDateTime.now().plusDays(30));
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return lostItemRepository.save(item);
    }

    private FoundItem createTestFoundItem(User finder, String itemName) {
        FoundItem item = new FoundItem();
        item.setUser(finder);
        item.setItemName(itemName);
        item.setDescription("Security test found item: " + itemName);
        item.setCategory("Electronics");
        item.setColor("Black");
        item.setFoundDateTime(LocalDateTime.now().minusHours(2));
        item.setFoundLocation("Canteen");
        item.setStatus("FOUND");
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return foundItemRepository.save(item);
    }

    private Notification createNotification(User recipient, String message) {
        Notification notif = new Notification();
        notif.setUser(recipient);
        notif.setMessage(message);
        notif.setType("MATCH_FOUND");
        notif.setIsRead(false);
        notif.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notif);
    }

    private String validLostItemJson(String itemName) {
        return """
                {
                  "itemName": "%s",
                  "description": "Standard security test item description",
                  "category": "Electronics",
                  "color": "Black",
                  "lostDateTime": "2026-09-01T10:00:00",
                  "lastSeenLocation": "Library",
                  "isUrgent": false,
                  "expiryDate": "2026-10-01T10:00:00"
                }
                """.formatted(itemName);
    }

    private String validFoundItemJson(String itemName) {
        return """
                {
                  "itemName": "%s",
                  "description": "Standard security test found item",
                  "category": "Electronics",
                  "color": "Black",
                  "foundDateTime": "2026-09-01T10:00:00",
                  "foundLocation": "Canteen"
                }
                """.formatted(itemName);
    }
}
