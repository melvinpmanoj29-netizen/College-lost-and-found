package com.collegelostandfound.backend.service.impl;

import com.collegelostandfound.backend.dto.response.FoundItemResponse;
import com.collegelostandfound.backend.dto.response.LostItemResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminClaimReviewResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminClaimSummaryResponse;
import com.collegelostandfound.backend.dto.response.admin.AdminItemHistoryDetailResponse;
import com.collegelostandfound.backend.dto.response.admin.DashboardStatsResponse;
import com.collegelostandfound.backend.dto.response.admin.LocationStatResponse;
import com.collegelostandfound.backend.dto.response.admin.ReturnHistoryStatsResponse;
import com.collegelostandfound.backend.entity.Claim;
import com.collegelostandfound.backend.entity.FoundItem;
import com.collegelostandfound.backend.entity.LostItem;
import com.collegelostandfound.backend.entity.User;
import com.collegelostandfound.backend.exception.InvalidCredentialsException;
import com.collegelostandfound.backend.exception.ResourceNotFoundException;
import com.collegelostandfound.backend.repository.ClaimRepository;
import com.collegelostandfound.backend.repository.FoundItemRepository;
import com.collegelostandfound.backend.repository.LostItemRepository;
import com.collegelostandfound.backend.service.AdminService;
import com.collegelostandfound.backend.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ClaimRepository claimRepository;
    private final NotificationService notificationService;

    public AdminServiceImpl(
            LostItemRepository lostItemRepository,
            FoundItemRepository foundItemRepository,
            ClaimRepository claimRepository,
            NotificationService notificationService
    ) {
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.claimRepository = claimRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        List<LostItem> lostItems = lostItemRepository.findAll();
        List<FoundItem> foundItems = foundItemRepository.findAll();
        List<Claim> claims = claimRepository.findAll();

        long totalLost = lostItems.size();
        long totalFound = foundItems.size();
        long returned = lostItems.stream().filter(i -> "RETURNED".equalsIgnoreCase(i.getStatus()) || "RESOLVED".equalsIgnoreCase(i.getStatus())).count()
                + foundItems.stream().filter(i -> "RETURNED".equalsIgnoreCase(i.getStatus()) || "RESOLVED".equalsIgnoreCase(i.getStatus())).count();
        long pending = claims.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();

        Map<String, Long> locationCounts = new HashMap<>();
        for (LostItem item : lostItems) {
            if (item.getLastSeenLocation() != null && !item.getLastSeenLocation().isBlank()) {
                locationCounts.merge(item.getLastSeenLocation().trim(), 1L, Long::sum);
            }
        }
        for (FoundItem item : foundItems) {
            if (item.getFoundLocation() != null && !item.getFoundLocation().isBlank()) {
                locationCounts.merge(item.getFoundLocation().trim(), 1L, Long::sum);
            }
        }

        List<LocationStatResponse> topLocations = locationCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> new LocationStatResponse(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return new DashboardStatsResponse(totalLost, totalFound, returned, pending, topLocations);
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnHistoryStatsResponse getReturnHistoryStats() {
        List<LostItem> returnedLost = lostItemRepository.findAll().stream()
                .filter(i -> "RETURNED".equalsIgnoreCase(i.getStatus()) || "RESOLVED".equalsIgnoreCase(i.getStatus()))
                .toList();

        long bags = 0, phones = 0, idCards = 0, wallets = 0, keys = 0, docs = 0, others = 0;
        for (LostItem item : returnedLost) {
            String cat = (item.getCategory() != null ? item.getCategory() : "").toLowerCase();
            if (cat.contains("bag") || cat.contains("backpack")) bags++;
            else if (cat.contains("phone") || cat.contains("electronic")) phones++;
            else if (cat.contains("id") || cat.contains("card")) idCards++;
            else if (cat.contains("wallet")) wallets++;
            else if (cat.contains("key")) keys++;
            else if (cat.contains("doc") || cat.contains("book")) docs++;
            else others++;
        }

        return new ReturnHistoryStatsResponse(bags, phones, idCards, wallets, keys, docs, others);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LostItemResponse> getAllLostItems() {
        return lostItemRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(LostItemResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void deleteLostItem(Long id) {
        if (!lostItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lost item not found with id: " + id);
        }
        lostItemRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoundItemResponse> getAllFoundItems() {
        return foundItemRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(FoundItemResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void deleteFoundItem(Long id) {
        if (!foundItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Found item not found with id: " + id);
        }
        foundItemRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminClaimSummaryResponse> getAllClaims() {
        return claimRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(AdminClaimSummaryResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminClaimReviewResponse getClaimDetail(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));
        return AdminClaimReviewResponse.fromEntity(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminItemHistoryDetailResponse getItemHistoryDetail(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim record not found with id: " + claimId));
        return buildHistoryDetail(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminItemHistoryDetailResponse> getAllItemHistory() {
        return claimRepository.findAll().stream()
                .filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus()) || "RESOLVED".equalsIgnoreCase(c.getStatus()))
                .sorted((a, b) -> {
                    LocalDateTime tA = a.getReviewedAt() != null ? a.getReviewedAt() : a.getCreatedAt();
                    LocalDateTime tB = b.getReviewedAt() != null ? b.getReviewedAt() : b.getCreatedAt();
                    return tB.compareTo(tA);
                })
                .map(this::buildHistoryDetail)
                .toList();
    }

    @Override
    @Transactional
    public AdminClaimSummaryResponse approveClaim(Long id, Authentication authentication) {
        User admin = getAuthenticatedUser(authentication);
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        claim.setStatus("APPROVED");
        claim.setReviewedAt(LocalDateTime.now());
        claim.setReviewedBy(admin);

        if (claim.getLostItem() != null) {
            claim.getLostItem().setStatus("RETURNED");
            lostItemRepository.save(claim.getLostItem());
        }
        if (claim.getFoundItem() != null) {
            claim.getFoundItem().setStatus("RETURNED");
            foundItemRepository.save(claim.getFoundItem());
        }

        Claim saved = claimRepository.save(claim);

        if (claim.getClaimant() != null) {
            notificationService.createNotification(
                    claim.getClaimant(),
                    "Your claim for '" + (claim.getFoundItem() != null ? claim.getFoundItem().getItemName() : "item") + "' has been approved by admin!",
                    "CLAIM_APPROVED"
            );
        }

        return AdminClaimSummaryResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public AdminClaimSummaryResponse rejectClaim(Long id, Authentication authentication) {
        User admin = getAuthenticatedUser(authentication);
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        claim.setStatus("REJECTED");
        claim.setReviewedAt(LocalDateTime.now());
        claim.setReviewedBy(admin);

        Claim saved = claimRepository.save(claim);

        if (claim.getClaimant() != null) {
            notificationService.createNotification(
                    claim.getClaimant(),
                    "Your claim for '" + (claim.getFoundItem() != null ? claim.getFoundItem().getItemName() : "item") + "' was reviewed and rejected.",
                    "CLAIM_REJECTED"
            );
        }

        return AdminClaimSummaryResponse.fromEntity(saved);
    }

    private AdminItemHistoryDetailResponse buildHistoryDetail(Claim claim) {
        AdminItemHistoryDetailResponse res = new AdminItemHistoryDetailResponse();
        res.setClaimId(claim.getId());

        LostItem lost = claim.getLostItem();
        FoundItem found = claim.getFoundItem();
        User claimant = claim.getClaimant();
        User reviewer = claim.getReviewedBy();

        String itemName = (lost != null && lost.getItemName() != null) ? lost.getItemName()
                : (found != null && found.getItemName() != null ? found.getItemName() : "Unnamed Item");
        String category = (lost != null && lost.getCategory() != null) ? lost.getCategory()
                : (found != null && found.getCategory() != null ? found.getCategory() : "General");

        res.setItemName(itemName);
        res.setCategory(category);
        res.setStatus("RESOLVED");
        res.setResolvedAt(claim.getReviewedAt() != null ? claim.getReviewedAt() : claim.getCreatedAt());

        if (claimant != null) {
            res.setClaimant(new AdminItemHistoryDetailResponse.UserSummary(
                    claimant.getId(), claimant.getStudentName(), claimant.getEmail(),
                    claimant.getRollNumber(), claimant.getClassName(), claimant.getRole()
            ));
        }

        if (reviewer != null) {
            res.setReviewer(new AdminItemHistoryDetailResponse.UserSummary(
                    reviewer.getId(), reviewer.getStudentName(), reviewer.getEmail(),
                    reviewer.getRollNumber(), reviewer.getClassName(), reviewer.getRole()
            ));
        }

        if (lost != null) {
            if (lost.getUser() != null) {
                res.setLostReporter(new AdminItemHistoryDetailResponse.UserSummary(
                        lost.getUser().getId(), lost.getUser().getStudentName(), lost.getUser().getEmail(),
                        lost.getUser().getRollNumber(), lost.getUser().getClassName(), lost.getUser().getRole()
                ));
            }
            AdminItemHistoryDetailResponse.LostReportDetail lrd = new AdminItemHistoryDetailResponse.LostReportDetail();
            lrd.setId(lost.getId());
            lrd.setItemName(lost.getItemName());
            lrd.setDescription(lost.getDescription());
            lrd.setCategory(lost.getCategory());
            lrd.setColor(lost.getColor());
            lrd.setLocation(lost.getLastSeenLocation());
            lrd.setLostDateTime(lost.getLostDateTime());
            lrd.setImageUrl(lost.getImageUrl());
            lrd.setStatus(lost.getStatus());
            lrd.setCreatedAt(lost.getCreatedAt());
            res.setLostReport(lrd);
        }

        if (found != null) {
            if (found.getUser() != null) {
                res.setFoundReporter(new AdminItemHistoryDetailResponse.UserSummary(
                        found.getUser().getId(), found.getUser().getStudentName(), found.getUser().getEmail(),
                        found.getUser().getRollNumber(), found.getUser().getClassName(), found.getUser().getRole()
                ));
            }
            AdminItemHistoryDetailResponse.FoundReportDetail frd = new AdminItemHistoryDetailResponse.FoundReportDetail();
            frd.setId(found.getId());
            frd.setItemName(found.getItemName());
            frd.setDescription(found.getDescription());
            frd.setCategory(found.getCategory());
            frd.setColor(found.getColor());
            frd.setLocation(found.getFoundLocation());
            frd.setFoundDateTime(found.getFoundDateTime());
            frd.setImageUrl(found.getImageUrl());
            frd.setStatus(found.getStatus());
            frd.setCreatedAt(found.getCreatedAt());
            res.setFoundReport(frd);
        }

        AdminItemHistoryDetailResponse.ClaimDetail cd = new AdminItemHistoryDetailResponse.ClaimDetail();
        cd.setId(claim.getId());
        cd.setVerificationAnswer(claim.getVerificationAnswer());
        cd.setStatus(claim.getStatus());
        cd.setCreatedAt(claim.getCreatedAt());
        cd.setReviewedAt(claim.getReviewedAt());
        res.setClaimDetail(cd);

        // Build Chronological Timeline Events
        List<AdminItemHistoryDetailResponse.TimelineEvent> timeline = new ArrayList<>();

        if (lost != null && lost.getCreatedAt() != null) {
            String reporter = lost.getUser() != null ? lost.getUser().getStudentName() : "Student";
            timeline.add(new AdminItemHistoryDetailResponse.TimelineEvent(
                    "Lost Report Filed",
                    "Lost report for '" + lost.getItemName() + "' logged at location: " + lost.getLastSeenLocation(),
                    lost.getCreatedAt(),
                    reporter,
                    "Student Reporter",
                    "LOST_REPORT"
            ));
        }

        if (found != null && found.getCreatedAt() != null) {
            String finder = found.getUser() != null ? found.getUser().getStudentName() : "Finder";
            timeline.add(new AdminItemHistoryDetailResponse.TimelineEvent(
                    "Found Report Filed",
                    "Found report for '" + found.getItemName() + "' logged at location: " + found.getFoundLocation(),
                    found.getCreatedAt(),
                    finder,
                    "Finder",
                    "FOUND_REPORT"
            ));
        }

        if (claim.getCreatedAt() != null) {
            String claimantName = claimant != null ? claimant.getStudentName() : "Claimant";
            timeline.add(new AdminItemHistoryDetailResponse.TimelineEvent(
                    "Ownership Claim Submitted",
                    "Claimant provided ownership proof: \"" + (claim.getVerificationAnswer() != null ? claim.getVerificationAnswer() : "") + "\"",
                    claim.getCreatedAt(),
                    claimantName,
                    "Claimant",
                    "CLAIM_SUBMITTED"
            ));
        }

        if (claim.getReviewedAt() != null) {
            String adminName = reviewer != null ? reviewer.getStudentName() : "Administrator";
            timeline.add(new AdminItemHistoryDetailResponse.TimelineEvent(
                    "Claim Approved & Verified",
                    "Administrative verification passed. Ownership validated and handover authorized.",
                    claim.getReviewedAt(),
                    adminName,
                    "Administrator",
                    "CLAIM_APPROVED"
            ));

            timeline.add(new AdminItemHistoryDetailResponse.TimelineEvent(
                    "Item Resolved & Reunited",
                    "Item marked RESOLVED. Listing archived from active student view and recorded in permanent history.",
                    claim.getReviewedAt(),
                    "System / Admin",
                    "System",
                    "RESOLVED"
            ));
        }

        timeline.sort(Comparator.comparing(AdminItemHistoryDetailResponse.TimelineEvent::getTimestamp, Comparator.nullsLast(Comparator.naturalOrder())));
        res.setTimeline(timeline);

        return res;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new InvalidCredentialsException("Authentication required");
        }
        return user;
    }
}
