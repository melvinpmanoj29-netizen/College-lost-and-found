package com.collegelostandfound.backend.dto.response.admin;

import com.collegelostandfound.backend.entity.Claim;
import java.time.LocalDateTime;

public class AdminClaimReviewResponse extends AdminClaimSummaryResponse {

    private String verificationAnswer;
    private LocalDateTime reviewedAt;
    private Long reviewedBy;

    public AdminClaimReviewResponse() {
    }

    public static AdminClaimReviewResponse fromEntity(Claim claim) {
        if (claim == null) return null;
        AdminClaimReviewResponse res = new AdminClaimReviewResponse();
        res.setId(claim.getId());
        res.setLostItemId(claim.getLostItem() != null ? claim.getLostItem().getId() : null);
        res.setFoundItemId(claim.getFoundItem() != null ? claim.getFoundItem().getId() : null);
        res.setClaimantUserId(claim.getClaimant() != null ? claim.getClaimant().getId() : null);
        res.setStatus(claim.getStatus());
        res.setCreatedAt(claim.getCreatedAt());
        res.setVerificationAnswer(claim.getVerificationAnswer());
        res.setReviewedAt(claim.getReviewedAt());
        res.setReviewedBy(claim.getReviewedBy() != null ? claim.getReviewedBy().getId() : null);
        return res;
    }

    public String getVerificationAnswer() {
        return verificationAnswer;
    }

    public void setVerificationAnswer(String verificationAnswer) {
        this.verificationAnswer = verificationAnswer;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Long getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }
}
