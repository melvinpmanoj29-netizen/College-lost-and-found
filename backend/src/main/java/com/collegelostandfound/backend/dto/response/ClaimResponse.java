package com.collegelostandfound.backend.dto.response;

import com.collegelostandfound.backend.entity.Claim;
import java.time.LocalDateTime;

/**
 * Student-facing Claim response DTO.
 *
 * CRITICAL PRIVACY RULE:
 * verificationAnswer is NEVER returned by this endpoint.
 */
public class ClaimResponse {

    private Long id;
    private Long lostItemId;
    private Long foundItemId;
    private String status;
    private LocalDateTime createdAt;

    public ClaimResponse() {
    }

    public static ClaimResponse fromEntity(Claim claim) {
        if (claim == null) {
            return null;
        }
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        response.setLostItemId(claim.getLostItem() != null ? claim.getLostItem().getId() : null);
        response.setFoundItemId(claim.getFoundItem() != null ? claim.getFoundItem().getId() : null);
        response.setStatus(claim.getStatus());
        response.setCreatedAt(claim.getCreatedAt());
        return response;
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
