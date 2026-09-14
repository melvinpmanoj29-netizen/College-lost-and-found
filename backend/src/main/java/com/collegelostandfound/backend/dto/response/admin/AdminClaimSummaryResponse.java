package com.collegelostandfound.backend.dto.response.admin;

import com.collegelostandfound.backend.entity.Claim;
import java.time.LocalDateTime;

public class AdminClaimSummaryResponse {

    private Long id;
    private Long lostItemId;
    private Long foundItemId;
    private Long claimantUserId;
    private String status;
    private LocalDateTime createdAt;

    public AdminClaimSummaryResponse() {
    }

    public static AdminClaimSummaryResponse fromEntity(Claim claim) {
        if (claim == null) return null;
        AdminClaimSummaryResponse res = new AdminClaimSummaryResponse();
        res.setId(claim.getId());
        res.setLostItemId(claim.getLostItem() != null ? claim.getLostItem().getId() : null);
        res.setFoundItemId(claim.getFoundItem() != null ? claim.getFoundItem().getId() : null);
        res.setClaimantUserId(claim.getClaimant() != null ? claim.getClaimant().getId() : null);
        res.setStatus(claim.getStatus());
        res.setCreatedAt(claim.getCreatedAt());
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(Long lostItemId) {
        this.lostItemId = lostItemId;
    }

    public Long getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(Long foundItemId) {
        this.foundItemId = foundItemId;
    }

    public Long getClaimantUserId() {
        return claimantUserId;
    }

    public void setClaimantUserId(Long claimantUserId) {
        this.claimantUserId = claimantUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
