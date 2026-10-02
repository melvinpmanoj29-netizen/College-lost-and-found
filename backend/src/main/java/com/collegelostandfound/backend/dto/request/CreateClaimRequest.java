package com.collegelostandfound.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateClaimRequest {

    @NotNull(message = "Lost item ID is required")
    private Long lostItemId;

    @NotNull(message = "Found item ID is required")
    private Long foundItemId;

    @NotBlank(message = "Verification answer is required")
    @Size(max = 1000, message = "Verification answer must not exceed 1000 characters")
    private String verificationAnswer;

    public CreateClaimRequest() {
    }

    public CreateClaimRequest(Long lostItemId, Long foundItemId, String verificationAnswer) {
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
        this.verificationAnswer = verificationAnswer;
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

    public String getVerificationAnswer() {
        return verificationAnswer;
    }

    public void setVerificationAnswer(String verificationAnswer) {
        this.verificationAnswer = verificationAnswer;
    }
}
